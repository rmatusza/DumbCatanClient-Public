import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGameBoard } from '../functions/gameFunctions';
import { generatePlayerInfoData, getUserData } from '../functions/userFunctions';
import { fetchGameList, getPlayerColorFromPlayerList } from '../functions/utilFunctions';
import { unsubscribeFromPreviousGame } from '../functions/webSocketFunctions';
import { retryFetchData } from '../functions/RecoveryFunctions';
import ModalStateContext from '../store/modal-context';
import Card from '../UI/Card';
import './css/GamesList.css';
// import gameBoard from '../utils/game-board';

const GamesList = () => {
  const [gameList, setGameList] = useState([]);
  const [reloadAttemptCount, setReloadAttemptCount] = useState(0);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);
  const ctx = useContext(ModalStateContext);
  const navigate = useNavigate();

  useEffect(async () => {

    if (ctx.userId === null) {
      return
    }

    const path = localStorage.getItem('path');
    if (path !== '/your-games') {
      return
    }

    const [games, fetchGameListErrorMsg] = await fetchGameList(ctx.userId);
    setInitialFetchComplete(true);
    if (fetchGameListErrorMsg) {
      setErrorMessage(fetchGameListErrorMsg)
      setReloadAttemptCount(() => reloadAttemptCount + 1);
      return
    };

    setLoading(false);
    setGameList(games);

  }, []);

  useEffect(() => {
    if (reloadAttemptCount === 0) {
      return
    }

    setTimeout(async () => {
      const [games, fetchGameListErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryFetchData(fetchGameList, [ctx.userId], ctx, true, errorMessage, reloadAttemptCount);

      if (reachedAttemptLimit) {
        setLoading(false);
        setAttemptLimitReached(true);
        return
      }

      if (fetchGameListErrorMsg) {
        setReloadAttemptCount(updatedReloadAttemptCount);
        return
      }

      setLoading(false);
      setInvites(games);
    }, 5000);

  }, [reloadAttemptCount])

  const gameSelectionHandler = async (i) => {
    const FETCHING_ONE_PLAYER = true;
    const selectedGame = gameList[i];
    const gameId = ctx.currentGame.gameId;

    if (gameId !== null) {
      try {
        await unsubscribeFromPreviousGame(ctx.stompClient, gameId, selectedGame.gameId, ctx.userId);
        //console.log(ctx.stompClient);
      } catch (e) {
        // REFACTOR NOTE: need to add logic to alert box to refresh page to purge all subscriptions
        alert(`Error encountered when attempting to unsubscribe from a topic:\n`, e)
      }
    }

    const [gameBoard, gameBoardErrorMessage] = await getGameBoard(selectedGame.gameId);
    if (gameBoardErrorMessage) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(gameBoardErrorMessage);
      ctx.onModifyModalState('info');
      return
    }

    const [fetchedPlayerData, errorMessage] = await getUserData(ctx.userId, selectedGame.gameId, FETCHING_ONE_PLAYER);
    // NOTE: Why are we only checking for specific errors - shouldn't any error stop us from continuing?
    if (errorMessage && (errorMessage.includes('network error') || errorMessage.includes('server error'))) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
      return
    }

    // NOTE: when no player info records are found then fetchedPlayerData will be an empty array 
    // regardless of whether or not you're expecting a single object or an array of objects
    // -> if player info record is found IN THIS COMPONENT then fetched player data will be a parsed object 
    //    that is NOT in an array
    if (typeof fetchedPlayerData == 'array') {
      const colorSelection = getPlayerColorFromPlayerList(selectedGame.players, ctx.username);
      ctx.onSetRecoveryModalData({
        type: 'playerInfo',
        recoveryFunctions: [generatePlayerInfoData],
        recoveryFunctionArgs: [[selectedGame.gameId, ctx.username, ctx.userId, colorSelection]],
        message: `PlayerInfo data was not correctly generated for game ${selectedGame.gameId}. Click generate data to fix this issue.`,
        textColor: 'black'
      })
      ctx.onModifyModalState('recovery');
    }

    ctx.onSetCurrentGame(selectedGame);
    ctx.onSetGameBoard(gameBoard.gameBoard);
    ctx.onSetPlayerData(fetchedPlayerData);

    navigate(`/game-space/${selectedGame.gameId}`);
  }

  const deleteGameHandler = (e) => {
    e.stopPropagation();
    ctx.onSetConfirmationModalData(
      {
        'type': 'DELETE_GAME',
        'gameList': gameList,
        'setGameList': setGameList,
        'gameId': e.target.id
      }
    );
    ctx.onModifyModalState('confirmation');
  }

  return (
    <div className='your-games-page'>
      {
        gameList.length === 0 ?

          <div id='game-list-info-messages_container'>
            {
              loading
              &&
              <div>
                <h2>Loading...</h2>
              </div>
            }
            {
              !loading
              &&
             
                <h2>No games found</h2>
             
            }
          </div>

          :

          <div className='game-cards-container'>
            {
              gameList.map((game, i) => {
                return (
                  <div className='game-card-container' key={i}>
                    <Card styles={'game-card'}>
                      <div className='game-card__inner-content' onClick={() => gameSelectionHandler(i)}>
                        <h3 className='game-number'>Game {game.gameId}</h3>
                        <h3 className='last-updated-heading'>Last Updated:</h3>
                        <p className='last-updated-text'>{game.lastUpdated}</p>
                        <h3 className='players-heading'>Players:</h3>
                        <ul className='game-card-player-list'>
                          {
                            game.players.map((player, i) => {
                              return (
                                <li key={i}>{player.username}</li>
                              )
                            })
                          }
                        </ul>
                        <div className='game-card-actions'>
                          {
                            game.ownerId == ctx.userId
                            &&
                            <button id={game.gameId} onClick={deleteGameHandler}>Delete</button>
                          }
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

export default GamesList;