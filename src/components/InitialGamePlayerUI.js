import { useState, useEffect, useContext } from 'react';
import { checkFinishedInitialGameSetup, getIsYourTurnInitialGame, checkCompletedItemPlacements, getInitialGameInfo } from '../functions/utilFunctions';
import { getInitialGameInstructions, startMainGamePhase, updateInitialGameInstructions } from '../functions/gameFunctions';
import { retryHandleData } from '../functions/RecoveryFunctions';
import ModalStateContext from '../store/modal-context';
import './css/InitialGamePlayerUI.css';

// COMPONENT INFO:
// this component is responsible for:
// 1. managing the flow of the initial game phase
// 2. determining what action the player must take (placing settlement or road) and 
//    displaying instructions to aid player in advancing the game
// 3. handling updating and saving the initial game instructions to be used by subsequent players
// 4. handling transitioning from the initial game phase into the main game phase after all players have 
//    made the required initial item placements (2 settlements and 2 roads)
const InitialGamePlayerUI = () => {
  const [playerInstructions, setPlayerInstructions] = useState(null);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadAttemptCount, setReloadAttemptCount] = useState(0);
  const [reloadAttemptLimitReached, setReloadAttemptLimitReached] = useState(false);
  const ctx = useContext(ModalStateContext);

  useEffect(async () => {
    //console.log('INITIAL GAME PLAYER UI UE');
    const [numberOfSettlements, numberOfRoads, requiredFinalState, initialGameInstructions, index, isYourTurn] = getInitialGameInfo(ctx);
    
    if (!isYourTurn) {
      return
    }

    const itemPlacementsCompleted = checkCompletedItemPlacements(numberOfSettlements, numberOfRoads, requiredFinalState);
    
    if (itemPlacementsCompleted) {
      const initialGameSetupFinished = checkFinishedInitialGameSetup(initialGameInstructions, index);

      setLoading(true);

      let initialGamePhaseUpdateHandler;

      if(initialGameSetupFinished){
        initialGamePhaseUpdateHandler = startMainGamePhase;
      }
      else{
        initialGamePhaseUpdateHandler = updateInitialGameInstructions;
      }

      const args = initialGameSetupFinished ? [ctx] : [ctx, initialGameInstructions];

      const [updatedGame, initialGameTransitionErrorMsg] = await initialGamePhaseUpdateHandler(...args);

      if (initialGameTransitionErrorMsg) {
        setInitialFetchComplete(true);
        setErrorMessage(initialGameTransitionErrorMsg);
        setReloadAttemptCount(() => reloadAttemptCount + 1);
        return
      }
      
      setLoading(false);

      ctx.onSetCurrentGame(updatedGame);

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
      
      return
    }

    if (numberOfSettlements === numberOfRoads) {
      ctx.onSetStructurePlacementMode(true);
      setPlayerInstructions('Place a Settlement');
      return
    }

    ctx.onSetRoadPlacementMode(true);
    setPlayerInstructions('Place a Road');

  }, [ctx.currentGame, ctx.playerData]);

  useEffect(async () => {
    //console.log('RETRYING: ', reloadAttemptCount)
    setTimeout(async () => {
      
      if (!initialFetchComplete || !errorMessage || reloadAttemptCount === 0) {
        return
      }
  
      const [numberOfSettlements, numberOfRoads, requiredFinalState, initialGameInstructions, index, isYourTurn] = getInitialGameInfo(ctx);
  
      if(!isYourTurn){
        return
      }
  
      if (reloadAttemptLimitReached) {
        return
      }
  
      const itemPlacementsCompleted = checkCompletedItemPlacements(numberOfSettlements, numberOfRoads, requiredFinalState);
  
      if (itemPlacementsCompleted) {
        const initialGameSetupFinished = checkFinishedInitialGameSetup(initialGameInstructions, index);
  
        let initialGamePhaseUpdateHandler;
  
        if(initialGameSetupFinished){
          initialGamePhaseUpdateHandler = startMainGamePhase;
        }
        else{
          initialGamePhaseUpdateHandler = updateInitialGameInstructions;
        }
  
        const args = initialGameSetupFinished ? [ctx] : [ctx, initialGameInstructions];
  
        const [updatedGame, initialGameFlowErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryHandleData(initialGamePhaseUpdateHandler, args, ctx, true, errorMessage, reloadAttemptCount);
  
        if (reachedAttemptLimit) {
          setLoading(false);
          setReloadAttemptLimitReached(true);
          return
        }
    
        if (initialGameFlowErrorMsg) {
          if(errorMessage !== initialGameFlowErrorMsg){
            setErrorMessage(initialGameFlowErrorMsg);
          }
          setReloadAttemptCount(updatedReloadAttemptCount);
          return
        }
        
        setLoading(false);
    
        setInitialFetchComplete(false);
        setErrorMessage(null);
        
        ctx.onSetCurrentGame(updatedGame);
        
        setReloadAttemptCount(0);
        
        ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
        
        return
      }
    }, [5000])
  }, [reloadAttemptCount]);

  return (
    <div className='pre-game-ui-container'>
      {
        getIsYourTurnInitialGame(getInitialGameInstructions(ctx.currentGame), ctx.userId) ?

          <h3>{playerInstructions}</h3>
          :
          <h2>Waiting For Other Players to Finish Turn</h2>
      }
    </div>
  )
}

export default InitialGamePlayerUI;