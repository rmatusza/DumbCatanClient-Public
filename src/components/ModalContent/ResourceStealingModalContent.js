import { useState, useContext } from 'react';
import { stealResources, saveGame } from '../../functions/gameFunctions';
import { saveUserData } from '../../functions/userFunctions';
import ModalStateContext from '../../store/modal-context';
import './css/ResourceStealingModalContent.css';
import { robberPlacementTransactional } from '../../functions/transactionalFunctions';
const lod = require('lodash');

// - valid resources doesn't contain all valid resources
// - need to add error message if no user is selected when button is pressed
const ResourceStealingModalContent = () => {
  const ctx = useContext(ModalStateContext);
  const [selectedUserIdx, setSelectedUserIdx] = useState(null);
  const [stolenResource, setStolenResource] = useState(null);
  const [isError, setIsError] = useState(false);
  const data = ctx.tradeModalData;

  const userSelectionHandler = (i) => {
    setSelectedUserIdx(i);
  }

  const stealResourcesHandler = async () => {
    const playerDataCpy = lod.cloneDeep(ctx.playerData);

    if (selectedUserIdx === null) {
      setIsError(true);
      return;
    }

    const selectedUser = data.validUsers[selectedUserIdx];
    const validResources = data.validUserResources[selectedUserIdx];
    const gameBoard = data.gameBoard;

    const [updatedPlayerDatas, stolenResource] = stealResources(selectedUser, playerDataCpy, validResources);

    let targetPlayerId;
    let targetUsername;
    updatedPlayerDatas.forEach((player, i) => {
      if (player.playerInfoUserId !== ctx.userId) {
        targetPlayerId = player.playerInfoUserId;
        targetUsername = player.playerInfo.username;
      }
    });

    const [responseData, robberPlacementTransactionalErrorMsg] = await robberPlacementTransactional(updatedPlayerDatas, gameBoard, ctx.userId);
    if (robberPlacementTransactionalErrorMsg) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(robberPlacementTransactionalErrorMsg);
      ctx.onModifyModalState('info');
      return
    }

    const savedPlayerData = responseData.playerInfo;
    const savedBoard = responseData.gameBoard;
    ctx.onSetPlayerData(savedPlayerData);
    ctx.onSetGameBoard(savedBoard);

    ctx.onSetRobberPlaced(true);
    ctx.onSetRobberPlacementMode(false);

    setStolenResource(stolenResource);
    setIsError(false);

    ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    ctx.stompClient.send(`/ws/user/${targetPlayerId}/dataUpdate/for/game/${ctx.currentGame.gameId}`, {}, JSON.stringify({ senderId: ctx.userId, gameId: ctx.currentGame.gameId, stolenResources: { 'senderUsername': ctx.playerData.playerInfo.username, 'targetUsername': targetUsername, 'resourceType': stolenResource, 'resourceAmount': 1 } }));
  };

  const closeModalHandler = () => {
    ctx.onModifyModalState('resourceStealing');
  };

  const isDisabled = () => {
    if (stolenResource) {
      return true
    }
    return false;
  };

  return (
    <div className='resource-stealing-modal-content-container'>
      <div className='resource-stealing-modal__title'>
        <h2>You May Choose to Steal From One of the Below Users</h2>
      </div>

      <div className='robber-choices-container'>
        {data.validUsers.map((user, i) => {
          return (
            <h2
              className={`${selectedUserIdx === i ? 'selected-user' : ''}`}
              onClick={() => userSelectionHandler(i)}
              key={i}
            >
              {user.playerInfo.username}
            </h2>
          )
        })}
      </div>
      <div className='resource-stealing-robber-result'>
        {
          stolenResource
          &&
          <h3>
            {`You Stole a ${stolenResource} From ${data.validUsers[selectedUserIdx].playerInfo.username}`}
          </h3>
        }
      </div>
      <div className='resource-stealing-modal-error-container'>
        {
          isError
          &&
          <h3 style={{ 'color': 'red' }}>Select a User to Steal From</h3>
        }
      </div>
      <div className='resource-stealing-modal__actions'>
        <button onClick={stealResourcesHandler} disabled={isDisabled()} style={{ 'cursor': isDisabled() ? 'not-allowed' : 'pointer' }}>Steal Resources</button>
        {
          stolenResource
          &&
          <button onClick={closeModalHandler}>Close</button>
        }
      </div>
    </div>
  )
}

export default ResourceStealingModalContent