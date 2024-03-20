import { useState, useContext, useEffect } from 'react';
import { getPlayerDevCardsCopy, saveUserData } from '../functions/userFunctions';
import { getObjectValueSum, getDevCardCount, scrollToHalfHeight, unlockDevCards } from '../functions/utilFunctions';
import { finishTurn } from '../functions/gameFunctions';
import { finishTurnTransaction } from '../functions/transactionalFunctions';
import getWindowDimensions from '../utils/get-window-dimensions';
import ModalStateContext from '../store/modal-context';
import './css/BuildingPhase.css';
const lod = require('lodash');

const BuildingPhase = () => {
  const [robberPlacementMode, setRobberPlacementMode] = useState(false);
  const [robberPlaced, setRobberPlaced] = useState(false);
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('BUILDING PHASE UE')
    setRobberPlacementMode(ctx.robberPlacementMode);
    setRobberPlaced(ctx.robberPlaced)
  }, [ctx.robberPlacementMode, ctx.robberPlaced]);

  const actionsHandler = async (type) => {
    switch (type) {
      
      case 'Settlement':
        {
          if (ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) {
            ctx.onSetInfoModalMessage("You Must Finish Your Current Move Before Building a Settlement");
            ctx.onModifyModalState('info');
            return;
          }
          ctx.onSetTradeModalData({
            'type': type,
          })
          ctx.onModifyModalState('buildConfirmation');
        }
        break

      case 'City':
        {
          if (ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) {
            ctx.onSetInfoModalMessage("You Must Finish Your Current Move Before Building a City");
            ctx.onModifyModalState('info');
            return;
          }
          ctx.onSetTradeModalData({
            'type': type,
          })
          ctx.onModifyModalState('buildConfirmation');
        }
        break

      case 'Road':
        {
          if (ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) {
            ctx.onSetInfoModalMessage("You Must Finish Your Current Move Before Building a Road");
            ctx.onModifyModalState('info');
            return;
          }
          ctx.onSetTradeModalData({
            'type': type,
          })
          ctx.onModifyModalState('buildConfirmation');
        }
        break

      case 'devCard':
        {
          const playerDevCards = getPlayerDevCardsCopy(ctx.playerData, 'BUILDING PHASE');
          if (getDevCardCount(playerDevCards) === 0) {
            scrollToHalfHeight(window);
            ctx.onSetInfoModalTextColor('black');
            ctx.onSetInfoModalMessage(`You don't have any playable dev cards \n\n Note that you can't play a dev card on the same turn that you purchased it, and that victory points are automatically applied`);
            ctx.onModifyModalState('info');
            return
          };

          ctx.onModifyModalState('playDevCard');
          if (ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) {
            ctx.onSetInfoModalMessage("You Must Finish Your Current Move Before Playing a Development Card");
            ctx.onModifyModalState('info');
            return;
          }
          if (!getObjectValueSum(playerDevCards)) {
            return
          }
          ctx.onModifyModalState('playDevCard');
        }
        break

      case 'finishTurn':
        {
          if (ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) {
            ctx.onSetInfoModalMessage("You Must Finish Your Current Move Before Concluding Your Turn");
            ctx.onModifyModalState('info');
            return;
          }
          const updatedUserData = unlockDevCards(ctx);
          updatedUserData.turnPhaseIdx = 0;

          const [resultData, finishTurnErrorMessage] = await finishTurnTransaction(ctx.currentGame.gameId, updatedUserData);
          if(finishTurnErrorMessage){
            ctx.onSetRecoveryModalData({
              type: 'finishTurn',
              recoveryFunctions: [finishTurnTransaction, ctx.onSetCurrentGame, ctx.onSetPlayerData],
              recoveryFunctionArgs: [
                [
                 ctx.currentGame.gameId,
                 updatedUserData
                ]
              ],
              message: finishTurnErrorMessage,
              textColor: 'black'
            });
            ctx.onModifyModalState('recovery');
            return
          }

          ctx.onSetCurrentGame(resultData.savedGame);
          ctx.onSetPlayerData(resultData.savedPlayerInfo);
          ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
        }
        break
    }
  }
  
  const cancelRoadPlacementHandler = () => {
    if (ctx.roadPlacementMode) {
      ctx.onSetStartAndEndNodes([]);
      ctx.onSetRoadPlacementMode(false);
    }
    if (ctx.structurePlacementMode) {
      ctx.onSetStructurePlacementMode(false);
    }
  }

  // NOTE: make sure to disable other modes so that multiple aren't on
  // simultaneously which can break things (ex. enabling road building and then a knight card)
  const getPlayerInstructions = () => {
    if (ctx.roadPlacementMode) {
      return 'Place a Road by Clicking on the Desired Starting and Ending Position of the Road';
    }
    if (ctx.structurePlacementMode) {
      return 'Place a City or Settlement by Clicking a Valid Location on the Board';
    }
    if (robberPlacementMode && !robberPlaced) {
      return 'Place the Robber by Clicking on One of the Game Tiles';
    }
    return '';
  }

  const getButtonText = () => {
    if (ctx.roadPlacementMode) {
      return 'Cancel Road Placement';
    }
    if (ctx.structurePlacementMode) {
      return 'Cancel Structure Placement';
    }
  }

  return (
    <div className='building-phase-container'>

      <div className='building-phase-actions'>

        <div className='pass-action'>
          <button className={`${(ctx.roadPlacementMode || ctx.structurePlacementMode || robberPlacementMode) ? 'finish-turn-button__not-allowed' : 'finish-turn-button'}`} onClick={() => actionsHandler('finishTurn')}>Finish Turn</button>
          {
            (ctx.roadPlacementMode || ctx.structurePlacementMode)
            &&
            <button className='cancel-road-placement-button' onClick={cancelRoadPlacementHandler}>{getButtonText()}</button>
          }
        </div>

        <div className='player-instructions'>
          {getPlayerInstructions()}
        </div>

        <div className='main-actions'>
          <button onClick={() => actionsHandler('Settlement')}>Build Settlement</button>
          <button onClick={() => actionsHandler('City')}>Build City</button>
          <button onClick={() => actionsHandler('Road')}>Build Road</button>
          <button onClick={() => actionsHandler('devCard')}>Play Dev Card</button>
        </div>

      </div>

    </div>
  )
}

export default BuildingPhase;