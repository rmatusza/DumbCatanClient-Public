import { useContext, useState, useEffect } from 'react';
import { fetchInvites } from '../functions/gameFunctions';
import { createAvailableColorsMap, fetchGameLimitStatus, generateUserGameData } from '../functions/utilFunctions';
import { generatePlayerInfoData } from '../functions/userFunctions';
import { retryFetchData } from '../functions/RecoveryFunctions';
import { subscribeToGameInvites } from '../functions/webSocketFunctions';
import ModalStateContext from '../store/modal-context';
import Card from '../UI/Card';
import './css/InvitesList.css';
const lod = require('lodash');

// CHANGE GAMES TO INVITES IN USE STATE
const InvitesList = (props) => {
  const [invites, setInvites] = useState([]);
  const [availableColorsMap, setAvailableColorsMap] = useState(null);
  const [reloadAttemptCount, setReloadAttemptCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const ctx = useContext(ModalStateContext);

  const availableColorsMapHandler = (passedInvites) => {
    const availableColorsMap = createAvailableColorsMap(passedInvites);
    setAvailableColorsMap(availableColorsMap);
  }

  const refetchGameInvites = async (msg) => {
    //console.log(ctx.userId)
    const [invites, fetchInvitesErrorMsg] = await fetchInvites(ctx.userId);
    //console.log(invites)
    setLoading(true);
    if (fetchInvitesErrorMsg) {
      ctx.onSetInfoModalMessage("There was an error when attempting to retrieve incoming game invite. Please wait a moment and then reload the application.");
      ctx.onModifyModalState('info');
      return;
    };

    if(invites.length > 0){
      availableColorsMapHandler(invites);
    }
    setInvites(invites);
  }

  useEffect(async() => {
    const path = localStorage.getItem('path');
    if (path !== '/your-invites') {
      return
    }
    if(ctx.username){
      await subscribeToGameInvites(ctx.stompClient, ctx.username, refetchGameInvites);
    }
  }, [ctx.username]);

  useEffect(async () => {
    //console.log('INVITES LIST UE');

    const path = localStorage.getItem('path');
    if (path !== '/your-invites' || !ctx.userId) {
      return
    }

    const [invites, fetchInvitesErrorMsg] = await fetchInvites(ctx.userId);
    setInitialFetchComplete(true);
    if (fetchInvitesErrorMsg) {
      setErrorMessage(fetchInvitesErrorMsg);
      setReloadAttemptCount(() => reloadAttemptCount + 1);
      return
    };

    if(invites.length > 0){
      availableColorsMapHandler(invites);
    }

    setInvites(invites);
    setLoading(false);
  }, []);

  useEffect(() => {
    const path = localStorage.getItem('path');
    if (path !== '/your-invites') {
      return
    }

    if (reloadAttemptCount === 0) {
      return
    }

    setTimeout(async () => {
      const [invites, fetchInvitesErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryFetchData(fetchInvites, [ctx.userId], ctx, true, errorMessage, reloadAttemptCount);

      if (reachedAttemptLimit) {
        setLoading(false);
        setAttemptLimitReached(true);
        return
      }

      if (fetchInvitesErrorMsg) {
        setReloadAttemptCount(updatedReloadAttemptCount);
        return
      }

      const availableColorsMap = createAvailableColorsMap(invites);
      setAvailableColorsMap(availableColorsMap);

      setLoading(false);
      setInvites(invites);
      setReloadAttemptCount(0);
    }, 5000);

  }, [reloadAttemptCount]);

  // REFACTOR NOTE: accepting a game invite - game specific = GAME FUNCTION
  const acceptGameInviteHandler = async (idx, gameId) => {
    if (availableColorsMap[gameId].selected === '') {
      const availableColorsMapCpy = lod.cloneDeep(availableColorsMap);
      availableColorsMapCpy[gameId].isError = true;
      setAvailableColorsMap(availableColorsMapCpy);
      return
    }

    const [gameLimitStatus, gameLimitStatusErrorMessage] = await fetchGameLimitStatus(ctx.userId);
    if (gameLimitStatusErrorMessage) {
      ctx.onSetInfoModalMessage(gameLimitStatusErrorMessage);
      ctx.onSetInfoModalTextColor('black');
      ctx.onModifyModalState('info');
      return
    }

    const selectedGameCpy = lod.cloneDeep(invites[idx]);
    const playerList = JSON.parse(selectedGameCpy.players);

    const currPlayer = { 'id': ctx.userId, 'username': ctx.username, 'color': availableColorsMap[gameId].selected }
    const playersCpy = [...playerList];

    playersCpy.push(currPlayer);
    selectedGameCpy.players = JSON.stringify(playersCpy);

    const bodyData = {
      'players': JSON.stringify(playersCpy)
    }

    let inviteAcceptRes;
    // const inviteAcceptRes = {
    //   status: 500
    // }

    // updates the player list and size fields of the game record
    const inviteAcceptReq = await fetch(`http://localhost:8080/api/invites/for/game/${gameId}/to/user/${ctx.userId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })

    if (inviteAcceptReq.status !== 200) {
      inviteAcceptRes = {
        status: inviteAcceptReq.status
      };
    }
    else {
      inviteAcceptRes = await inviteAcceptReq.json();
    }


    if (inviteAcceptRes.status !== 200) {
      ctx.onSetInfoModalMessage(`Invitation acceptance failed. Please close the modal and try once more.`);
      ctx.onModifyModalState('info');
      return
    }
    else {
      setLoading(false)
      ctx.onSetCurrentGame(selectedGameCpy);
      const invitesCpy = [...invites];
      invitesCpy.splice(idx, 1);
      setInvites(invitesCpy);
    }


    // creates an entry in the join table between users and games
    const createUserGameRecordReq = await generateUserGameData(ctx.userId, selectedGameCpy.gameId);
    // const createUserGameRecordReq = null

    if (createUserGameRecordReq === null) {
      ctx.onSetRecoveryModalData({
        type: 'userGame',
        recoveryFunctions: [generateUserGameData],
        recoveryFunctionArgs: [[ctx.userId, ctx.currentGame.gameId]],
        message: 'UserGame data was not created successfully. Click generate data to fix this issue.',
        textColor: 'black'
      })
      ctx.onModifyModalState('recovery');
      return
    }

    // creates a player info record for the new player to store their player-specific game data
    // NOTE: don't need to error handle this one b/c if it fails and they try to open the game they'll be prompted at that time
    await generatePlayerInfoData(selectedGameCpy.gameId, ctx.username, ctx.userId, availableColorsMap[gameId].selected);

    // ctx.stompClient.send(`/ws/invite/${game.gameId}/games-list/accept`, {}, JSON.stringify({'gameId': game.gameId, 'senderId': ctx.userId}));
    ctx.stompClient.send(`/ws/invite/${selectedGameCpy.gameId}/game-space/accept`, {}, JSON.stringify({ 'gameId': selectedGameCpy.gameId, 'senderId': ctx.userId }));
  }

  const declineInviteHandler = async (idx, gameId) => {
    const res = await fetch(`http://localhost:8080/api/invites/decline?recipientId=${ctx.userId}&gameId=${gameId}`, {
      method: 'DELETE'
    })
    const invitesCpy = [...invites];
    invitesCpy.splice(idx, 1);
    //console.log(invitesCpy);
    setInvites(invitesCpy);
  }

  const colorSelectionHandler = (gameId, color) => {
    const availableColorsMapCpy = lod.cloneDeep(availableColorsMap);
    availableColorsMapCpy[gameId].selected = color;
    setAvailableColorsMap(availableColorsMapCpy);
  }

  return (
    <div className='your-games-page'>
      {
        invites.length === 0 ?

          <div id='invites-info-messages_container'>
            {
              loading
              &&
              <h2>Loading...</h2>
            }
            {
              !loading
              &&
              <h2>No invites found</h2>
            }
          </div>

          :

          <div className='invite-cards-container'>
            {
              invites.map((invite, i) => {
                let players = JSON.parse(invite.players)
                let availableColorsObj = availableColorsMap[invite.gameId];
                let colors = Object.keys(availableColorsObj);
                return (
                  <div key={i}>
                    <Card styles={'game-invite-card'}>
                      <div className='game-card__inner-content'>
                        <h3 style={{ textDecoration: 'underline' }}>Game {invite.gameId}</h3>
                        <h3>Last Updated:</h3>
                        <p>{invite.lastUpdated}</p>
                        <h3>Players:</h3>
                        <ul key={`playerList-${i}`}>
                          {
                            players.map((player, i) => {
                              return (
                                <li key={`player-${i}`}>{player.username}</li>
                              )
                            })
                          }
                        </ul>
                        <div className='color-selection-message__invites-list'>
                          <h3>Choose a Color</h3>
                        </div>
                        <div className='invites-color-selection'>
                          {
                            colors.map((color, i) => {
                              //console.log(color)
                              //console.log(availableColorsObj)
                              //console.log(availableColorsObj[color])
                              const selectedColor = availableColorsObj.selected;
                              if (color !== 'selected' && color !== 'isError' && availableColorsObj[color] !== false) {
                                return (
                                  <div
                                    onClick={() => colorSelectionHandler(invite.gameId, color)}
                                    className={`${color} invite-color ${selectedColor === color ? 'selected' : ''}`}
                                    key={`game-invite-${invite.gameId}-color-option-${i}`}
                                  >
                                  </div>
                                )
                              }
                            })
                          }
                        </div>
                        {
                          availableColorsObj.isError
                          &&
                          <p style={{ color: 'red', textAlign: 'center' }}>Please Select a Color</p>
                        }
                        <div className='game-invite-options'>
                          <button onClick={() => acceptGameInviteHandler(i, invite.gameId)}>Accept</button>
                          <button onClick={() => declineInviteHandler(i, invite.gameId)}>Decline</button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })
            }
          </div>
      }
    </div>
  )
}

export default InvitesList;