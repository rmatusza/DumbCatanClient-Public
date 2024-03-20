import { useContext, useEffect } from "react";
import {
  prepareTradeModalData,
  getPathName,
  refetchPlayerDataCallback,
  parseTradeRequestData,
  applyAcceptedTradeResultToPlayerData,
  createAvailableColorsMap
} from '../functions/utilFunctions';
import {
  fetchGame,
  fetchReceivedTradeRequests,
  getGameBoard
} from '../functions/gameFunctions';
import {
  acceptTradeTransactionalSender,
  fetchGameAndUserData
} from '../functions/transactionalFunctions';
import {
  subscribeToPlayerListUpdates_GameSpace,
  subscribeToGameUpdates,
  subscribeToPlayerDataUpdates,
  subscribeToDiceUpdates,
  subscribeToGameBoardUpdates,
  updateLocalStateWithDiceRollData,
  checkSubscriptions,
  subscribeToTradeRequests,
  subscribeToTradeAcceptance,
  subscribeToGameInvites,
} from '../functions/webSocketFunctions';
import ModalStateContext from "../store/modal-context";
import { getUserData } from "../functions/userFunctions";
const lod = require('lodash');

// NOTE: SERVES AS A FUNCTIONAL COMPONENT (NO UI) 
// -> NEEDED TO CREATE A REACT COMPONENT B/C NEEDS ACCESS TO CONTEXT 

// NOTE: PURPOSE OF COMPONENT IS TO MANAGE WS SUBSCRIPTIONS AND CALLBACKS TO NOT CLUTTER UP GAME SPACE

const WebsocketHandler = (props) => {
  const ctx = useContext(ModalStateContext);

  const refetchGame = async (msg) => {
    const parsedMsg = JSON.parse(msg.body)
    if (parsedMsg.senderId === ctx.userId) {
      return
    }
    const [updatedGame, errorMessage] = await fetchGame(ctx.currentGame.gameId);
    if (errorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'fetchGame',
        recoveryFunctions: [fetchGame, ctx.onSetCurrentGame],
        recoveryFunctionArgs: [[ctx.currentGame.gameId]],
        message: `PlayerInfo data was not correctly generated for game ${selectedGame.gameId}. Click generate data to fix this issue.`,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
    }
    ctx.onSetCurrentGame(updatedGame);
  }

  const refetchGameBoard = async (msg) => {
    const parsedMsg = JSON.parse(msg.body);

    if (parsedMsg.senderId === ctx.userId) {
      return
    }

    const [updatedBoard, getGameBoardErrorMsg] = await getGameBoard(ctx.currentGame.gameId);
    //console.log('FETCHED GAME BOARD: ', updatedBoard)
    ctx.onSetGameBoard(updatedBoard.gameBoard);
  }

  const refetchGame_PlayerList = async (msg) => {
    if (!getPathName(window).split('/').includes('game-space')) {
      return
    }
    const parsedMsg = JSON.parse(msg.body)
    if (parsedMsg.senderId === ctx.userId) {
      return
    }
    const [updatedGame, errorMessage] = await fetchGame(ctx.currentGame.gameId);

    if (errorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'fetchGame',
        recoveryFunctions: [fetchGame, ctx.onSetCurrentGame],
        recoveryFunctionArgs: [[ctx.currentGame.gameId]],
        message: `PlayerInfo data was not correctly generated for game ${selectedGame.gameId}. Click generate data to fix this issue.`,
        textColor: 'black'
      });

      ctx.onModifyModalState('recovery');
    }
    ctx.onSetCurrentGame(updatedGame);
  }

  const refetchPlayerData = async (msg) => {
    const parsedMsg = JSON.parse(msg.body)
    if (parsedMsg.senderId === ctx.userId) {
      //console.log('ignoring own message');
      return
    }

    const [userData, errorMessage] = await refetchPlayerDataCallback(ctx.userId, parsedMsg.gameId, parsedMsg, ctx);

    if (errorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'refetchPlayerData',
        recoveryFunctions: [refetchPlayerDataCallback],
        recoveryFunctionArgs: [
          [
            ctx.userId,
            ctx.currentGame.gameId
          ]
        ],
        message: errorMessage,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    };

    ctx.onSetPlayerData(userData);
  };

  const diceRollUpdateHandler = async (msg) => {
    const parsedMsg = JSON.parse(msg.body)
    const diceValue = parsedMsg.diceValue;
    const IS_RECOVERY = false;

    if (parsedMsg.senderId === ctx.userId) {
      //console.log('IGNORING OWN MESSAGE')
      return
    }

    const [fetchedData, errorMessage] = await fetchGameAndUserData(ctx);

    if (errorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'refetchPlayerInfoAndGameData',
        recoveryFunctions: [fetchGameAndUserData, updateLocalStateWithDiceRollData],
        recoveryFunctionArgs: [[ctx], [diceValue, !IS_RECOVERY, ctx]],
        message: errorMessage,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    }

    const { fetchedPlayerData, fetchedGame } = fetchedData;

    // Does the following:
    // 1. handles rolled 7 
    // a. check for OSCP, if not found then we clear the flag
    // -> if one is found then modal opens facilitating the returning of cards
    // 2. handles NON-7 roll
    // a. in this case, this user's data was already updated and saved by the user who rolled the dice and no modifications are needed
    // 3. in either case, the fetched (and potentially modified and saved) data is set locally
    // REFACTOR NOTE: need to break up the below method into several methods - doing too much 
    await updateLocalStateWithDiceRollData(fetchedPlayerData, fetchedGame, diceValue, IS_RECOVERY, ctx);
  }

  const refetchTradeRequests = async () => {
    const REQUEST_TYPE = 'RECEIVE';

    const [tradeData, fetchReceivedTradeRequestsErrorMsg] = await fetchReceivedTradeRequests(ctx);

    if (fetchReceivedTradeRequestsErrorMsg) {
      ctx.onSetRecoveryModalData({
        type: 'refetchTradeRequestsWebsocketCallback',
        recoveryFunctions: [fetchReceivedTradeRequests, prepareTradeModalData],
        recoveryFunctionArgs: [
          [],
          [REQUEST_TYPE]
        ],
        message: fetchReceivedTradeRequestsErrorMsg,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    };

    prepareTradeModalData(REQUEST_TYPE, tradeData, ctx);

    ctx.onModifyModalState('trade');
  };

  const refetchAcceptedTradeAndApplyResult = async (msg) => {
    // FUNCTION DOES THE FOLLOWING:
    // 1. triggered when someone accepts your trade request
    // 2. extracts the accepted trade record from WS message
    // 3. transactional uses trade record to update player data
    // 4. saves player data
    // 5. deletes trade record
    const TRADER_TYPE = 'SENDER';

    let parsedMsg = JSON.parse(msg.body);
    let tradeRecord = JSON.parse(parsedMsg.tradeRecord);

    const { desiredResources, offeredResources } = parseTradeRequestData(tradeRecord);
    const [playerData, getUserDataErrorMsg] = await getUserData(tradeRecord.tradesSenderId, tradeRecord.tradesGameId, true, false, null);
    if (getUserDataErrorMsg) {
      ctx.onSetInfoModalMessage(getUserDataErrorMsg);
      ctx.onModifyModalState('info');
      return;
    }
    const updatedPlayerData = applyAcceptedTradeResultToPlayerData(lod.cloneDeep(playerData), TRADER_TYPE, desiredResources, offeredResources);

    const [savedPlayerData, acceptTradeTransactionalSenderErrorMsg] = await acceptTradeTransactionalSender(tradeRecord, updatedPlayerData);

    if (acceptTradeTransactionalSenderErrorMsg) {
      ctx.onSetRecoveryModalData({
        type: 'acceptTradeTransactional_Sender',
        recoveryFunctions: [acceptTradeTransactionalSender],
        recoveryFunctionArgs: [
          [
            desiredResources,
            offeredResources,
            TRADER_TYPE,
            acceptedTradeData.tradeId
          ],
        ],
        message: acceptTradeTransactionalSenderErrorMsg,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    }

    ctx.onSetPlayerData(savedPlayerData);
  }

  // const refetchGameInvites = async (ctx) => {
  //   const [invites, fetchInvitesErrorMsg] = await fetchInvites(ctx.userId);

  //   setLoading(true);
  //   if (fetchInvitesErrorMsg) {
  //     ctx.onSetInfoModalMessage("There was an error when attempting to retrieve incoming game invite. Please wait a moment and then reload the application.");
  //     ctx.onModifyModalState('info');
  //     return;
  //   };

  //   ctx.onSetGameInvites(invites);
  // }

  useEffect(async () => {
    if (!props.currentGame.playerSize) {
      return
    }

    const needToSubscribe = checkSubscriptions(ctx.stompClient, ctx.currentGame.gameId);

    if (needToSubscribe) {
      await subscribeToTradeAcceptance(ctx.stompClient, ctx.userId, ctx.currentGame.gameId, refetchAcceptedTradeAndApplyResult);
      await subscribeToTradeRequests(ctx.stompClient, ctx.userId, ctx.currentGame.gameId, refetchTradeRequests);
      await subscribeToGameUpdates(ctx.stompClient, ctx.currentGame.gameId, refetchGame);
      await subscribeToPlayerDataUpdates(ctx.stompClient, ctx.userId, ctx.currentGame.gameId, refetchPlayerData);
      await subscribeToDiceUpdates(ctx.stompClient, ctx.currentGame.gameId, diceRollUpdateHandler);
      await subscribeToPlayerListUpdates_GameSpace(ctx.currentGame, ctx.stompClient, refetchGame_PlayerList);
      await subscribeToGameBoardUpdates(ctx.stompClient, ctx.currentGame.gameId, refetchGameBoard);
    }
  }, [props.currentGame]);

  // useEffect(async() => {
  //   if(props.userId){
  //     await subscribeToGameInvites(ctx.stompClient, props.userId, refetchGameInvites);
  //   }
  // }, [props.userId]);

  return null
}

export default WebsocketHandler;