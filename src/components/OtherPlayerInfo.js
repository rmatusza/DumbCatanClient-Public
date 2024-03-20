import { useState, useEffect, useContext } from 'react';
import { getObjectValueSum, getPlayerList } from '../functions/utilFunctions';
import { getPlayerDevCardsCopy, getLockedPlayerDevCardsCopy, getUserData } from '../functions/userFunctions';
// import { TbClipboardList } from 'react-icons/tb';
import ModalStateContext from '../store/modal-context';
import './css/OtherPlayerInfo.css';
import { retryFetchData } from '../functions/RecoveryFunctions';

const OtherPlayerInfo = (props) => {
  const [otherPlayersData, setOtherPlayersData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadAttemptCount, setReloadAttemptCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);
  const [localQueryString, setLocalQueryString] = useState(null);
  const ctx = useContext(ModalStateContext);
  // let queryString = null;

  useEffect(async () => {
    //console.log('OTHER PLAYER INFO UE');
    let queryString;
    setIsLoading(true);
    //console.log(props.playerList)
    props.playerList.forEach(player => {
      if (player.id !== ctx.userId) {
        if (queryString) {
          queryString += `,${player.id}`
        }
        else {
          queryString = `${player.id}`
        }
      }
    });

    const [otherUserData, getUserDataErrorMsg] = await getUserData(queryString, ctx.currentGame.gameId, false, true, ctx.userId);

    if (getUserDataErrorMsg) {
      setErrorMessage(getUserDataErrorMsg);
      setReloadAttemptCount(() => reloadAttemptCount + 1);
      return
    };

    setIsLoading(false);
    setOtherPlayersData(otherUserData);
  }, []);

  useEffect(() => {
    //console.log(reloadAttemptCount)
    if (reloadAttemptCount === 0) {
      return
    }

    setTimeout(async () => {
      const [otherUserData, getUserDataErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryFetchData(getUserData, [localQueryString, ctx.currentGame.gameId, false, true, ctx.userId], ctx, true, errorMessage, reloadAttemptCount, 12, false);

      if (reachedAttemptLimit) {
        setIsLoading(false);
        setAttemptLimitReached(true);
        return
      };

      if (getUserDataErrorMsg) {
        setReloadAttemptCount(updatedReloadAttemptCount);
        return
      }

      setOtherPlayersData(otherUserData);
      setIsLoading(false);
    }, 5000);

  }, [reloadAttemptCount]);

  return (
    <div className='other-player-info-content'>
      {
        isLoading
        &&
        <h3>Loading...</h3>
      }
      {
        attemptLimitReached
        &&
        <h4>An error occurred when retrieving other player's info. Please wait some time and try again. </h4>
      }
      {
        otherPlayersData
        &&
        <div className='other-player-data-container'>
          {
            otherPlayersData.map((otherPlayerData, i) => {
              let playerInfo = otherPlayerData.playerInfo
              let resourceCardAmount = Object.values(playerInfo.hand['resource_cards']).reduce((total, value) => total + value)
              let devCardAmount =
                getObjectValueSum(getPlayerDevCardsCopy(otherPlayerData, 'OTHER PLAYER INFO'))
                +
                getObjectValueSum(getLockedPlayerDevCardsCopy(otherPlayerData, 'OTHER PLAYER INFO'))
              let points = playerInfo.points;
              let username = playerInfo.username;
              let activeKnights = playerInfo.hand.activeKnights;
              let color = playerInfo.color;
              return (
                <div key={i} className='other-player-data'>
                  <h3>{username}</h3>
                  <p>Color: {color}</p>
                  <p>Points: {points}</p>
                  <p>Resource Cards: {resourceCardAmount}</p>
                  <p>Dev Cards: {devCardAmount}</p>
                  <p>Active Knights: {activeKnights}</p>
                </div>
              )
            })
          }
        </div>
      }
    </div>
  )
}

export default OtherPlayerInfo;