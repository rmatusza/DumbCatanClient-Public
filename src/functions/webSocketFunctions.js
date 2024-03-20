import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { checkForOSCP, scrollToHalfHeight } from './utilFunctions';
import { saveUserData } from './userFunctions';
const lod = require('lodash');

export const onMessageReceived = (payload) => {
  //console.log(payload);
}

export const onGameInviteReceived = (payload) => {
  //console.log('GAME INVITE RECEIVED: ', payload)
}

export const testWs = async (payload) => {
  //console.log(payload)
}

export const onConnected = (stompClient, sock, username, onSetStompConnected, onSetSock, onSetStompClient) => {
  //console.log('CONNECTED TO SERVER WEBSOCKET');
  onSetStompClient(stompClient);
  onSetSock(sock);
  onSetStompConnected(true);
}

export const subscribeToGameInvites = async(stompClient, username, refetchGameInvites) => {
  if (stompClient.subscriptions && !stompClient.subscriptions[`/topic/gameInvites/${username}`]) {
    await stompClient.subscribe(`/topic/gameInvites/${username}`, refetchGameInvites, { id: `/topic/gameInvites/${username}` });
  }
}

export const subscribeToPlayerListUpdates_GameSpace = async (game, stompClient, refetchGame) => {
  if (stompClient.subscriptions && !stompClient.subscriptions[`/topic/game/${game.gameId}/player-list-update/game-space-page`]) {
    await stompClient.subscribe(`/topic/game/${game.gameId}/player-list-update/game-space-page`, refetchGame, { id: `/topic/game/${game.gameId}/player-list-update/game-space-page` });
    //console.log(`SUBSCRIBED TO RECIEVE PLAYER LIST UPDATES FOR GAME ${game.gameId}`);
  }
}

export const subscribeToTradeRequests = async (stompClient, userId, gameId, refetchTrades, onSetSubscribedToTradeRequests) => {
  if (!stompClient.subscriptions[`/topic/game/${gameId}/trades/requests/to/${userId}`]) {
    await stompClient.subscribe(`/topic/game/${gameId}/trades/requests/to/${userId}`, refetchTrades, { id: `/topic/game/${gameId}/trades/requests/to/${userId}` });
    //console.log('SUBSCRIBED TO RECIEVE TRADE REQUEST UPDATES');
  }
}


export const subscribeToTradeAcceptance = async (stompClient, userId, gameId, refetchAcceptedTrades, onSetSubscribedToTradeUpdates) => {
  if (!stompClient.subscriptions[`/topic/game/${gameId}/trades/requests/from/${userId}/accepted`]) {
    await stompClient.subscribe(`/topic/game/${gameId}/trades/requests/from/${userId}/accepted`, refetchAcceptedTrades, { id: `/topic/game/${gameId}/trades/requests/from/${userId}/accepted` });
    //console.log('SUBSCRIBED TO RECIEVE TRADE ACCEPTANCE UPDATES');
  }
}


export const subscribeToGameUpdates = async (stompclient, gameId, refetchGame) => {
  if (!stompclient.subscriptions[`/topic/game/${gameId}/update`]) {
    await stompclient.subscribe(`/topic/game/${gameId}/update`, refetchGame, { id: `/topic/game/${gameId}/update` });
    //console.log(`SUBSCRIBED TO RECEIVE BOARD UPDATES FOR GAME ${gameId}`);
  }
}

export const subscribeToGamePhaseUpdates = async (stompclient, gameId, refetchGame) => {
  if (!stompclient.subscriptions[`/topic/game/${gameId}/gamePhase-updates`]) {
    await stompclient.subscribe(`/topic/game/${gameId}/gamePhase-updates`, refetchGame, { id: `/topic/game/${gameId}/gamePhase-updates` });
    //console.log(`SUBSCRIBED TO RECEIVE GAME PHASE UPDATES FOR GAME ${gameId}`);
  }
}

export const subscribeToPlayerDataUpdates = async (stompclient, userId, gameId, refetchPlayerData) => {
  if (!stompclient.subscriptions[`/topic/user/${userId}/dataUpdate/for/game/${gameId}`]) {
    await stompclient.subscribe(`/topic/user/${userId}/dataUpdate/for/game/${gameId}`, refetchPlayerData, { id: `/topic/user/${userId}/dataUpdate/for/game/${gameId}` });
    //console.log(`SUBSCRIBED TO RECEIVE PLAYER DATA UPDATES`);
  }
}

export const subscribeToDiceUpdates = async (stompclient, gameId, allocateResourcesToPlayerData) => {
  if (!stompclient.subscriptions[`/topic/game/${gameId}/diceRoll`]) {
    await stompclient.subscribe(`/topic/game/${gameId}/diceRoll`, allocateResourcesToPlayerData, { id: `/topic/game/${gameId}/diceRoll` });
    //console.log(`SUBSCRIBED TO RECEIVE DICE ROLL UPDATES FOR GAME ${gameId}`);
  }
}

export const subscribeToGameBoardUpdates = async (stompClient, gameId, refetchGameBoard) => {
  if (!stompClient.subscriptions[`/topic/game/${gameId}/gameBoard`]) {
    await stompClient.subscribe(`/topic/game/${gameId}/gameBoard`, refetchGameBoard, { id: `/topic/game/${gameId}/gameBoard` });
    //console.log(`SUBSCRIBED TO RECEIVE GAME BOARD UPDATES FOR GAME ${gameId}`);
  }
}


// REFACTOR NOTE: look into a bulk unsubscribe method to avoid so many network requests
export const unsubscribeFromPreviousGame = async (stompClient, prevGameId, newGameId, userId) => {

  if (prevGameId === newGameId) {
    return
  }
  //console.log('UNSUBSCRIBING FROM OLD SUBSCRIPTIONS')
  if(stompClient.subscriptions[`/topic/game/${prevGameId}/update`]) {
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/trades/requests/from/${userId}/accepted`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/trades/requests/to/${userId}`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/gamePhase-updates`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/diceRoll`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/update`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/player-list-update/game-space-page`);
    await stompClient.unsubscribe(`/topic/game/${prevGameId}/gameBoard`);
  }
}

export const checkSubscriptions = (stompClient, currGameId) => {
  //console.log(stompClient)
  let needToSubscribe;

  if(stompClient.subscriptions[`/topic/game/${currGameId}/update`]) {
    needToSubscribe = false;
  }
  needToSubscribe = true;

  return needToSubscribe;
}

export const updateLocalStateWithDiceRollData = async (passedPlayerData, passedGameData, passedDiceValue, isRecovery, ctx) => {

  const setState = (playerData, game, diceResult) => {
    ctx.onSetPlayerData(playerData);
    ctx.onSetCurrentGame(game);
    ctx.onSetDiceResult(diceResult, game.gameId);
  }

  if (passedDiceValue === 7) {
    const [OSCP, totalCards] = checkForOSCP(passedPlayerData);

    if (OSCP) {
      // if in recovery modal need to close it so we can open the OSCP modal
      if(isRecovery){
        ctx.onModifyModalState('recovery');
      }
      scrollToHalfHeight(window);
      let cardsToReturn = Math.floor(totalCards / 2);
      // REFACTOR NOTE: need to come up with a generic data object for modals b/c this has nothing to do with trades
      ctx.onSetTradeModalData({
        'numberOfCardsToReturn': cardsToReturn,
        'submissionHandler': saveUserData
      })
      ctx.onModifyModalState('overSevenCardPenalty');
      return
    }

    const playerDataCpy = lod.cloneDeep(passedPlayerData);
    // NOTE: playerDataCpy.overSevenCardPenalty was being set to 1 - changed to 0 b/c player passed the OSCP check and should have already been 0
    // when the dice roller rolled a 7
    playerDataCpy.overSevenCardPenalty = 0;

    // REFACTOR NOTE: consider having the roller selectively setting this to avoid this extra call
    const [savedPlayerData, errorMessage] = await saveUserData([playerDataCpy], ctx.userId);

    if(errorMessage){
      ctx.onSetRecoveryModalData({
        type: 'saveUserDataDiceRollWebsocketCallback',
        recoveryFunctions: [saveUserData, setState],
        recoveryFunctionArgs: [[[playerDataCpy], ctx.userId], [playerDataCpy, passedGameData, passedDiceValue]],
        message: errorMessage,
        textColor: 'black'
      });
      // Might already be in recovery modal so don't need to try and turn it on otherwise needs to be opened
      if(!isRecovery){
        ctx.onModifyModalState('recovery');
      }
     return
    }

    setState(savedPlayerData, passedGameData, passedDiceValue);
    return
  };

  setState(passedPlayerData, passedGameData, passedDiceValue);
}

export const onError = () => {
  //console.log('ERROR');
}

export const connectToWebsocket = async (username, onSetStompConnected, onSetSock, onSetStompClient) => {
  const sock = await new SockJS('http://localhost:8080/gs-guide-websocket');
  const stompClient = await over(sock);
  await stompClient.connect({}, () => onConnected(stompClient, sock, username, onSetStompConnected, onSetSock, onSetStompClient), onError);
}