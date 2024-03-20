import { useContext, useState, useEffect } from 'react';
import ModalStateContext from '../../store/modal-context';
import './css/InfoModalContent.css';

const RecoveryModalContent = () => {
  const [recoveryModalMessage, setRecoveryModalMessage] = useState("Loading...")
  const [recoveryModalTextColor, setRecoveryModalTextColor] = useState('black');
  const [selectedColor, setSelectedColor] = useState(null);
  const [retryFailed, setRetryFailed] = useState(false);
  const [retrySuccessful, setRetrySuccessful] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [type, setType] = useState(null);
  const ctx = useContext(ModalStateContext);

  useEffect(async () => {
    setRecoveryModalMessage(ctx.recoveryModalData.message);
    setRecoveryModalTextColor(ctx.recoveryModalData.textColor);
    setType(ctx.recoveryModalData.type);

  }, [ctx.currentGame, ctx.recoveryModalData]);

  const closeModalHandler = () => {
    ctx.onModifyModalState('recovery');
  }

  const recoveryFailureHandler = () => {
    if(!retryFailed){
      setRetryFailed(true);
      setRetryMessage('Recovery attempt failed. Please try again.');
    }
  }

  const generateDataHandler = async () => {
    if(retrySuccessful){
      return
    }
    let recoveryFunctions = ctx.recoveryModalData.recoveryFunctions;
    let functionArgs = ctx.recoveryModalData.recoveryFunctionArgs;
    let type = ctx.recoveryModalData.type;

    // can have named type then generic 1 function, generic 2 function, etc. or some other combination to reduce repetition
    if(type === 'diceRollNonSeven'){
      const getOtherPlayerData = recoveryFunctions[0];
      const updateAndSaveAllPlayersDataWithGainedResources = recoveryFunctions[1];
      const [otherPlayerData, otherPlayerDataErrorMessage] = await getOtherPlayerData(...functionArgs[0]);
      
      if(otherPlayerDataErrorMessage){
        recoveryFailureHandler();
        return
      }

      const updateDataArgs = [otherPlayerData, ...functionArgs[1]];
      const [updateDataRes, updateDataErrorMessage] = await updateAndSaveAllPlayersDataWithGainedResources(...updateDataArgs);

      if(updateDataErrorMessage){
        recoveryFailureHandler();
        return
      }
    }

    else if(type === 'fetchGame'){
      const fetchGame = recoveryFunctions[0];
      const setGameInContext = recoveryFunctions[1];

      const [updatedGame, errorMessage] = await fetchGame(...functionArgs[0]);
      if(errorMessage){
        recoveryFailureHandler();
        return
      }

      setGameInContext(updatedGame);
    }

    else if(type === 'refetchPlayerInfoAndGameData'){
      const fetchGameAndUserData = recoveryFunctions[0];
      const setLocalState = recoveryFunctions[1];

      const [updateDataRes, updateDataErrorMessage] = await fetchGameAndUserData(...functionArgs[0]);

      if(updateDataErrorMessage){
        recoveryFailureHandler();
        return
      }

      const updatedPlayerData = updateDataRes[0];
      const updatedGame = updateDataRes[1];

      setLocalState(updatedPlayerData, updatedGame, ...functionArgs[1]);
    }

    else if(type === 'saveUserDataDiceRollWebsocketCallback'){
      const saveUserData = recoveryFunctions[0];
      const setLocalState = recoveryFunctions[1];

      const [savedPlayerData, updateDataErrorMessage] = await saveUserData(...functionArgs[0]);

      if(updateDataErrorMessage){
        recoveryFailureHandler();
        return
      }

      setLocalState(savedPlayerData);
    }

    else if(type === 'refetchTradeRequestsWebsocketCallback'){
      const fetchReceivedTradeRequests = recoveryFunctions[0];
      const prepareTradeModalData = recoveryFunctions[1];

      const [tradeData, fetchReceivedTradeRequestsErrorMsg] = await fetchReceivedTradeRequests(ctx);

      if(fetchReceivedTradeRequestsErrorMsg){
        recoveryFailureHandler();
        return
      }

      prepareTradeModalData(...functionArgs[1], tradeData, ctx);
    }

    else if(type === 'saveUserDataAfterTradeAcceptance'){
      const saveUserData = recoveryFunctions[0];
      const updatedPlayerData = functionArgs[0][0];

      const [savedPlayerData, saveUserDataErrorMessage] = await saveUserData([updatedPlayerData], updatedPlayerData.playerInfoUserId);

      if(saveUserDataErrorMessage){
        recoveryFailureHandler();
        return
      };

      ctx.onSetPlayerData(savedPlayerData);
      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/trade/request/from/${senderId}/to/${ctx.userId}/accepted`, {}, JSON.stringify({ senderId: ctx.userId, senderData: ctx.tradeModalData.senderData }));
    }

    else if(type === 'saveGame_WonGame'){
      const saveGame = recoveryFunctions[0];
      const updateWinCount = recoveryFunctions[1];

      const [savedGame, saveGameErrorMessage] = await saveGame(...functionArgs[0]); 
      if(saveGameErrorMessage){
        recoveryFailureHandler();
        return
      };
    }

    else if(type === 'saveGame_WonGame'){
      const saveGameAndBoardTransactional = recoveryFunctions[0];

      const savedPlayerData = functionArgs[1];

      const [responseData, saveGameAndBoardErrorMessage] = await saveGameAndBoardTransactional(...functionArgs[0]); 
      if(saveGameAndBoardErrorMessage){
        recoveryFailureHandler();
        return
      };

      ctx.onSetWinnerUsername(ctx.username);
      ctx.onSetCurrentGame(responseData.savedGame);
      ctx.onSetGameBoard(responseData.savedBoard);
      ctx.onSetPlayerData(savedPlayerData); 
      ctx.onSetStructurePlacementMode(false);
      ctx.onModifyModalState('gameOver');
      
      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    }

    else if(type === 'saveGameBoard'){
      const saveBoard = recoveryFunctions[0];

      const savedPlayerData = functionArgs[1];

      const [savedBoard, saveBoardErrorMessage] = await saveBoard(...functionArgs[0]); 
      if(saveBoardErrorMessage){
        recoveryFailureHandler();
        return
      };

      ctx.onSetPlayerData(savedPlayerData);
      ctx.onSetGameBoard(savedBoard);
      ctx.onSetStructurePlacementMode(false);

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    }

    else if(type === 'refetchAcceptedRequestsAndApplyResult'){
      const fetchAccpetedTradeRequests = recoveryFunctions[0];
      const acceptTradeTransactionalSender = recoveryFunctions[1];

      const [acceptedTradeData, fetchAccpetedTradeRequestsErrorMsg] = await fetchAccpetedTradeRequests(...functionArgs[0]);

      if(fetchAccpetedTradeRequestsErrorMsg){
        recoveryFailureHandler();
        return
      }

      const parsedDesiredResources = JSON.parse(acceptedTradeData.desiredResources);
      const parsedOfferedResources = JSON.parse(acceptedTradeData.offeredResources);

      const [savedPlayerData, acceptTradeTransactionalSenderErrorMsg] = await acceptTradeTransactionalSender(parsedDesiredResources, parsedOfferedResources, ...functionArgs[1], ctx, acceptedTradeData.tradeId);
      if(acceptTradeTransactionalSenderErrorMsg){
        ctx.onSetRecoveryModalData({
          type: 'acceptTradeRequestSender',
          recoveryFunctions: [acceptTradeTransactionalSender],
          recoveryFunctionArgs: [
            [
              parsedDesiredResources, 
              parsedOfferedResources, 
              ...functionArgs[1],
              ctx,
              acceptedTradeData.tradeId
            ],
          ],
          message: acceptTradeTransactionalSenderErrorMsg,
          textColor: 'black'
        });
        return
      }

      ctx.onSetPlayerData(savedPlayerData);
    }

    else if(type === 'acceptTradeTransactional_Sender'){
      const acceptTradeTransactionalSender = recoveryFunctions[0];
     
      const [savedPlayerData, acceptTradeTransactionalSenderErrorMsg] = await acceptTradeTransactionalSender(...functionArgs[0]);

      if(acceptTradeTransactionalSenderErrorMsg){
        recoveryFailureHandler();
        return
      }

      ctx.onSetPlayerData(savedPlayerData);
    }

    else if(type === 'acceptTradeTransactional_Recipient'){
      const acceptTradeTransactionalRecipient = recoveryFunctions[0];

      const updatedPlayerData = functionArgs[0][0];
      const tradeData = functionArgs[0][1];

      const [savedPlayerData, acceptTradeTransactionalRecipientErrorMsg] = await acceptTradeTransactionalRecipient(updatedPlayerData, tradeData.tradeObject);
      if(acceptTradeTransactionalRecipientErrorMsg){
        recoveryFailureHandler();
        return
      }

      ctx.onSetPlayerData(savedPlayerData);
      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/trade/request/from/${tradeData.tradeSenderId}/to/${ctx.userId}/accepted`, {}, JSON.stringify({ recipientId: ctx.userId, senderData: tradeData.senderData }));
    }

    else if(type === 'turnPhaseTransition'){
      const updateTurnPhase = recoveryFunctions[0];
      const setLocalState = recoveryFunctions[1];

      const currGameId = functionArgs[0];

      const [updatedGame, updateTurnPhaseErrorMessage] = await updateTurnPhase(currGameId);

      if(updateTurnPhaseErrorMessage){
        recoveryFailureHandler();
        return
      }

      setLocalState(updatedGame);
      ctx.stompClient.send(`/ws/game/${updatedGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    }

    else if(type === 'finishTurn'){
      const finishTurnTransaction = recoveryFunctions[0];
      const setSavedGame = recoveryFunctions[1];
      const setSavedPlayerData = recoveryFunctions[2];

      const [resultData, finishTurnTransactionErrorMessage] = await finishTurnTransaction(...functionArgs[0]);

      if(finishTurnTransactionErrorMessage){
        recoveryFailureHandler();
        return
      }

      setSavedGame(resultData.savedGame);
      setSavedPlayerData(resultData.savedPlayerInfo);
      ctx.stompClient.send(`/ws/game/${resultData.savedGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    }

    else if(type === 'fetchGames'){
      const fetchGames = recoveryFunctions[0];
      const setGameList = recoveryFunctions[1];

      const [games, fetchGamesErrorMsg] = await fetchGames(...functionArgs[0]);
      if(fetchGamesErrorMsg){
        recoveryFailureHandler();
        return
      };

      setRetrySuccessful(true);
      setRetryMessage("Games fetched! You can close this modal.");

      ctx.onSetGameList(games);
      setGameList(games);
    }

    else if(type === 'fetchInvites'){
      const setReloadAttempts = recoveryFunctions[0];
      const reloadAttemptCount = functionArgs[0][0];

      if(reloadAttemptCount === 0){
        setReloadAttempts(1);
      }
      else{
        setReloadAttempts(0);
      }
     
      closeModalHandler();
    }

    else{
      const [res, errorMessage] = await recoveryFunctions[0](...functionArgs);
      if (errorMessage) {
        recoveryFailureHandler();
        return
      };
    }

    ctx.onModifyModalState('recovery');
  }

  return (
    <div className='info-modal-container'>

      <div className='info-modal-message-container' style={{ color: recoveryModalTextColor }}>
        <h2 style={{ whiteSpace: "pre-wrap" }}>{(retryFailed || retrySuccessful) ? retryMessage : recoveryModalMessage}</h2>
      </div>

      <div className='info-modal-actions'>
        {
          type !== 'userGame'
          &&
          <button onClick={closeModalHandler}>Close</button>
        }
        {
          type !== 'newGame'
          &&
          <button onClick={generateDataHandler}>Retry</button>
        }
      </div>

    </div>
  )
}

export default RecoveryModalContent;