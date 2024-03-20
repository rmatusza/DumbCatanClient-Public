import { useState, useContext, useEffect } from 'react';
import ModalStateContext from '../../store/modal-context';
import { saveUserData } from '../../functions/userFunctions';
import './css/MonopolyModalContent.css';
import { parsePlayerList } from '../../functions/utilFunctions';
const resourceCards = require.context('../../../public/images/resource_cards', true);
const lod = require('lodash');

const MonopolyModalContent = () => {
  const ctx = useContext(ModalStateContext);
  const [isError, setIsError] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [stealAttemptMade, setStealAttemptMade] = useState(false);
  const [monopolyFinalResult, setMonopolyFinalResult] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    //console.log('MONOPOLY MC UE');

    const playerDataCpy = lod.cloneDeep(ctx.playerData);

    setPlayerData(playerDataCpy);

  }, [ctx.playerData]);
  
  const resourceSelectionHandler = (resource) => {
    if(stealAttemptMade === true){
      return
    }
    setSelectedResource(resource);
  }

  const closeModalHandler = () => {
    ctx.onModifyModalState('monopoly');
  }

  const completeSelectionHandler = async () => {
    if(stealAttemptMade === true){
      return
    }
    const userDataCpy = lod.cloneDeep(ctx.playerData);
    const userResourceCards = userDataCpy.playerInfo.hand['resource_cards'];
    const userId = ctx.userId;
    const gameId = ctx.currentGame.gameId;
    let queryString = null;

    if (selectedResource) {
      const parsedPlayers = parsePlayerList(ctx.currentGame.players);
      
      parsedPlayers.forEach(player => {
        if (player.id !== userId) {
          if (queryString) {
            queryString += `,${player.id}`
          }
          else {
            queryString = `${player.id}`
          }
        }
      });

      const req = await fetch(`http://localhost:8080/api/player_info?gameId=${gameId}&userIds=${queryString}`);
      const playerData = await req.json();
      let players = [];
      let totalGainedResources = 0;
      let monopolyResult = {};
      playerData.forEach(player => {
        let playerCpy = lod.cloneDeep(player);
        playerCpy.playerInfo = JSON.parse(playerCpy.playerInfo);
        let desiredResourceAmount = playerCpy.playerInfo.hand['resource_cards'][selectedResource];
        totalGainedResources += desiredResourceAmount;
        monopolyResult[playerCpy.playerInfo.username] = desiredResourceAmount;
        playerCpy.playerInfo.hand['resource_cards'][selectedResource] = 0;
        players.push(playerCpy);
      });
      
      userResourceCards[selectedResource] += totalGainedResources;
      userDataCpy.monopolyActive = 0;
      userDataCpy.playerInfo.hand['resource_cards'] = userResourceCards;
      players.push(userDataCpy);
      const [savedPlayerData, saveUserDataErrorMsg] = await saveUserData(players, ctx.userId);
      ctx.onSetPlayerData(savedPlayerData);
      setMonopolyFinalResult(monopolyResult);
      setStealAttemptMade(true);
      ctx.onSetSpecialGameMode('monopoly', false);
      //console.log(players)
      //console.log(monopolyResult)
      players.forEach(player => {
        //console.log(player.playerInfoUserId)
        if(player.playerInfoUserId !== ctx.userId){
          ctx.stompClient.send(`/ws/user/${player.playerInfoUserId}/dataUpdate/for/game/${ctx.currentGame.gameId}`, {}, JSON.stringify({ senderId: ctx.userId, gameId: ctx.currentGame.gameId, stolenResources: {'senderUsername': ctx.playerData.playerInfo.username, 'targetUsername': player.playerInfo.username, 'resourceType': selectedResource, 'resourceAmount': monopolyResult[player.playerInfo.username], 'monopoly': 'Y'} }));
        }
      })
      return
    }
    setIsError(true);
  }

  const getResultContent = () => {
    if(monopolyFinalResult){
      return (
        <>
          <h4 className='monopoly-result-title'>You Stole the Following Resources:</h4>
          <div className='monopoly-result-container'>
            {
              monopolyFinalResult
              &&
              Object.keys(monopolyFinalResult).map((player, i) => {
                let amountStolen = monopolyFinalResult[player];
                return (
                  <div className='monopoly-result'>
                    <h4>{player}:</h4>
                    <h4>{selectedResource} x{amountStolen}</h4>
                  </div>
                )
              })
            }
          </div>
        </>
      )
    }
    if(!monopolyFinalResult && stealAttemptMade){
      return (
        <h3 className='monopoly-no-result-title'>No Players Had the Desired Resource</h3>
      )
    }
  }

  // REFACTOR NOTE: need to redesign the monopoly result section
  return (
    playerData ? 
      
      <div className='monopoly-modal-content-container'>
        <div className='monopoly-modal-title'>
          <h2>
            Pick One Resource to Steal From the Other Players
          </h2>
        </div>
        <div className='monopoly-error-message'>
          {
            isError
            &&
            <h3>Make Sure That You Have Selected a Resource</h3>
          }
        </div>
        <div className='monopoly-resources-container'>
          {
            Object.keys(playerData.playerInfo.hand['resource_cards']).map((resource, i) => {
              if (selectedResource === resource) {
                return (
                  <div className='monopoly-resource'>
                    <img
                      key={i}
                      onClick={() => resourceSelectionHandler(resource)}
                      className='hay-card' src={resourceCards(`./${resource}_card.png`)}
                      style={{ border: '3px solid blue' }}
                    />
                  </div>
                )
              }
              else {
                return (
                  <div className='monopoly-resource'>
                    <img key={i} onClick={() => resourceSelectionHandler(resource, 'add')} className='hay-card' src={resourceCards(`./${resource}_card.png`)} />
                  </div>
                )
              }
            })
          }
        </div>
        <>
          { getResultContent() }
        </>
        <div className='monopoly-modal-actions'>
          <button onClick={completeSelectionHandler}>Steal Resources</button>
          {
            stealAttemptMade
            &&
            <button onClick={closeModalHandler}>Close</button>
          }
        </div>
      </div>
    :
   <></>
  )
}

export default MonopolyModalContent;