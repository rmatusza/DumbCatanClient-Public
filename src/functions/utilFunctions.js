import { getGamePhase, getInitialGameInstructions, saveGame, checkForWinHandler, startRobberModeHandler, updateTurnPhase, fetchReceivedTradeRequests, fetchAccpetedTradeRequests, fetchGames, fetchInvites } from "./gameFunctions";
import { saveUserData, updateWinCount, allocateResourcesToPlayerData } from "./userFunctions";
import { acceptTradeTransactionalSender, rolledNonSevenTransaction, rolledSevenTransaction } from "./transactionalFunctions";
import { portTradeConditions } from "../utils/port-trade-conditions-map";
import { getUserData } from "./userFunctions";
import fetchGainedResources from "../utils/fetch-gained-resources";
import { connectToWebsocket } from "./webSocketFunctions";
import getWindowDimensions from "../utils/get-window-dimensions";
const lod = require('lodash');

// FILE CRITERIA:
// functions that are focused on data manipulation or convenience methods
// these functions are independent of current game 
// can also include fetching data for a specific user or a specific game
// -> as an exception to the previous rule of being independent 

// ex. sorting, formatting, performing a non modifying calculation, 
// modifying the UI, fetching data

export const getPathName = (window) => {
  return window.location.pathname;
}

export const getTurnPhaseFromIdx = (turnPhaseIdx) => {
  let turnPhases = ['diceRoll', 'trading', 'building'];
  return turnPhases[turnPhaseIdx];
}

export const getPendingSpecialGameMode = (playerData) => {
  if (playerData.yearOfPlentyActive === 1) {
    return "yearOfPlenty";
  }
  else if (playerData.monopolyActive === 1) {
    return "monopoly";
  }
  else if (playerData.roadBuildingActive === 1) {
    return "roadBuilding"
  }
  else {
    return false;
  }
}

export const getDesiredPortResourceData = (desiredResources) => {
  const desiredResourcesCpy = lod.cloneDeep(desiredResources)
  const resourceTypes = Object.keys(desiredResourcesCpy);
  const resourceArr = [];

  resourceTypes.forEach(type => {
    let resourceAmount = desiredResources[type]
    if (resourceAmount > 0) {
      resourceArr.push(type)
      resourceArr.push(resourceAmount);
    }
  });

  return resourceArr;
}

export const validatePortTrade = (sendTradeData, playerData) => {
  let isValid = true;
  const offeredResourcesObj = sendTradeData.offeredResources;
  const desiredResourcesObj = sendTradeData.desiredResources;

  const offeredResourceTypes = Object.keys(offeredResourcesObj);

  const totalOfferedResourceAmount = getObjectValueSum(offeredResourcesObj);
  const totalDesiredResourcesCount = getObjectValueSum(desiredResourcesObj);

  const portType = sendTradeData.tradeRecipient;
  const playerHand = playerData.playerInfo.hand['resource_cards'];

  // IN ALL CASES:
  // -need to receive something from the port - have to choose an item to receive
  // -> checked and handled in trading phase before modal opens
  // -must have the amount of resources that you're offering
  offeredResourceTypes.forEach(type => {
    let availableAmount = playerHand[type];
    let offeredAmount = offeredResourceTypes[type];

    if (offeredAmount > availableAmount) {
      isValid = false;
    }
  });

  if (isValid === false) {
    return false;
  }

  // FOR MISC PORT:
  // -every resource needs to be a multiple of three
  // -the number of requested resources needs to be equal to
  //  the number of offered resources divided by 3
  if (portType === 'Misc. Port') {
    // offered resource amount needs to be a multiple of 3 i.e. evenly divisible by 3
    // at a misc port you must receive exactly 3x less the number of resources being offered i.e. amount desired = [amount offered / 3]
    if (totalOfferedResourceAmount % 3 !== 0 || (totalOfferedResourceAmount / 3) !== totalDesiredResourcesCount) {
      return false
    };
    return true;
  };

  // ALL OTHER PORTS:
  // -no other resources than the required resources can be a part of trade
  // -required resource needs to be a multiple of 2
  // -requested resources needs to be equal to offered resources
  //  divided by 2
  const requiredResourceType = portTradeConditions[portType].requiredResource;
  const numberOfRequiredResourcesOffered = offeredResourceTypes[requiredResourceType];

  if (numberOfRequiredResourcesOffered % 2 !== 0 || (numberOfRequiredResourcesOffered / 2) !== totalDesiredResourcesCount) {
    // offered resource amount needs to be a multiple of 2 i.e. evenly divisible by 2
    // at a misc port you must receive exactly half the number of resources being offered 
    return false;
  }

  return true;
};

export const validateNonPortTrade = (sendTradeData, playerData) => {
  let isValid = true;
  const playerHand = playerData.playerInfo.hand['resource_cards'];

  const offeredResourcesObj = sendTradeData.offeredResources;
  const offeredResourceTypes = Object.keys(offeredResourcesObj);

  offeredResourceTypes.forEach(type => {
    let availableAmount = playerHand[type];
    let offeredAmount = offeredResourcesObj[type];

    if (offeredAmount > availableAmount) {
      isValid = false;
    }
  });

  return isValid;
};

export const validateAcceptedTrade = (sendTradeData, playerData) => {
  let isValid = true;

  //console.log(sendTradeData)
  //console.log(playerData)

  const playerHand = playerData.playerInfo.hand['resource_cards'];

  const requestedResourcesObj = sendTradeData.desiredResources;
  const requestedResourceTypes = Object.keys(requestedResourcesObj);

  requestedResourceTypes.forEach(type => {
    let availableAmount = playerHand[type];
    let requestedAmount = requestedResourcesObj[type];

    if (requestedAmount > availableAmount) {
      isValid = false
    }
  });

  return isValid;
}

export const prepareTradeRequestData = (ctx) => {

  const recipientArrIdx = ctx.tradeModalData.tradeRecipientIdx;
  const playerList = getPlayerList(ctx.currentGame.players, 'trade modal content');

  const tradeRecipientId = playerList[recipientArrIdx].id;

  const requestData = {
    'tradesGameId': ctx.currentGame.gameId,
    'tradesSenderId': ctx.userId,
    'tradesRecipientId': tradeRecipientId,
    'offeredResources': JSON.stringify(ctx.tradeModalData.offeredResources),
    'desiredResources': JSON.stringify(ctx.tradeModalData.desiredResources),
    'senderData': JSON.stringify(ctx.playerData.playerInfo.hand)
  };

  return requestData;
}

export const getResourceTypeAmount = (resourceObj) => {
  const resourceTypes = Object.keys(resourceObj);
  let numberOfResourceTypes = 0;

  resourceTypes.forEach(type => {
    if (resourceObj[type] > 0) {
      numberOfResourceTypes++;
    }
  });

  return numberOfResourceTypes;
}

// fetching/helper = util
export const getPlayerList = (playerList, caller) => {
  let parsedPlayerList = playerList
  if (typeof playerList === 'string') {
    parsedPlayerList = JSON.parse(playerList);
  }
  return parsedPlayerList;
}

// fetching/helper = util
const isTradingWithPlayer = (value, portNameMap) => {
  if (portNameMap[value]) {
    return false;
  }
  return true;
}

// fetching/helper = util
export const getIsYourTurn = (currentGame, userId, caller) => {
  //console.log('CALLER: ', caller)
  //console.log(currentGame)
  const currPlayerIdx = currentGame.currentPlayerIdx;
  const playerList = getPlayerList(currentGame.players);
  const currPlayerData = playerList[currPlayerIdx];
  return currPlayerData.id === userId;
}

// fetching/helper = util
export const getIsYourTurnInitialGame = (instructions, userId) => {
  const instructionIdx = instructions.index;
  return instructions[instructionIdx].playerId === userId
}

// fetching/helper = util
export const getPlayerColor = (currentGame, userId) => {
  const playerList = getPlayerList(currentGame.players);
  let playerColor;
  playerList.forEach((player, i) => {
    if (player.id == userId) {
      playerColor = player.color;
      return
    }
  })
  return playerColor
}

// calculation/helper = util
export const getIsGameOwner = (ownerId, userId) => {
  return ownerId === userId;
}


// calculation/helper = util
export const setFirstAndLastPlayer = (playerList, onSetIsFirstPlayer, onSetIsLastPlayer, userId) => {
  let firstPlayer = playerList[0].id === userId;
  let lastPlayer = playerList[playerList.length - 1].id === userId;
  if (firstPlayer) {
    onSetIsFirstPlayer(true);
  }
  if (lastPlayer) {
    onSetIsLastPlayer(true);
  }
}

// helper = util
export const removeGameBoardFromGameObject = (game) => {
  const gameCpy = lod.cloneDeep(game);
  delete gameCpy.boardStructures;
  return gameCpy;
}

// calculation/helper = util
export const getIsFirstPlayer = (currentGame, userId) => {
  const playerList = getPlayerList(currentGame.players);
  return playerList[0].id === userId;
}

// calculation/helper = util
export const getIsLastPlayer = (currentGame, userId) => {
  const playerList = getPlayerList(currentGame.players);
  return playerList[playerList.length - 1].id === userId;
}

// fetching/helper = util
export const getPorts = (ports) => {
  const parsedPorts = JSON.parse(ports);
  return parsedPorts;
}

// calculation/helper = util
export const getCurrentPlayerName = (currentGame) => {
  const playerList = getPlayerList(currentGame.players);
  const gamePhase = getGamePhase(currentGame);
  if (gamePhase === 'PRE') {
    return "Game Not Started";
  }
  if (gamePhase === 'INITIAL') {
    const initialGameInstructions = getInitialGameInstructions(currentGame);
    const index = initialGameInstructions.index;
    const currentPlayerId = initialGameInstructions[index].playerId;
    let currUsername;
    playerList.forEach(player => {
      if (player.id === currentPlayerId) {
        currUsername = player.username;
      }
    })
    return currUsername;
  }
  return playerList[currentGame.currentPlayerIdx].username;
}

// FUNCTION DOES THE FOLLOWING:
// 1. is a WS callback which refetches player data after an update
// 2. handles multiple situations:
// a. if we are refetching data after a resource was stolen, then that is indicated in the WS message and a modal 
//    indicating the stolen resource appears
// b. if we are refetching data for some other reason then message won't be present, modal won't appear, and 
//    user data will just be fetched and returned
export const refetchPlayerDataCallback = async (userId, gameId, parsedMsg, ctx) => {
  const [userData, errorMessage] = await getUserData([userId], gameId);

  if (errorMessage) {
    return [userData, errorMessage];
  };

  if (parsedMsg.stolenResources && parsedMsg.stolenResources.targetUsername === userData[0].playerInfo.username) {
    parsedMsg.stolenResources['target'] = true;
    ctx.onSetStolenResourceUpdateData(parsedMsg.stolenResources);
    ctx.onModifyModalState('stolenResourceUpdate');
  };

  return [userData.shift(), errorMessage];
};

// DOES THE FOLLOWING:
// 1. Updates curr player's data to mark the placing robber flag as 1 and checks for OSCP and updates flag accordingly
// 2. calls the rolledSevenTransaction function which saves curr player's data, updates other players' data with 
//    a 1 for the OSCP flag that they will have to clear, and saves the game (updated curr dice roll field)
// 3. updates local state with the curr user's updated data
// 4. turns on robber placement mode
export const rolledSevenTransactionHandler = async (passedPlayerDataCpy, players, userId, gameId, ctx, wasRoller) => {
  const message = {
    senderId: null,
    diceValue: null,
    tiles: null
  };

  passedPlayerDataCpy.placingRobber = 1;

  const [isOSCP, totalCards] = checkForOSCP(passedPlayerDataCpy);

  if (isOSCP) {
    passedPlayerDataCpy.overSevenCardPenalty = 1;
  };

  const [transactionRes, transactionErrorMessage] = await rolledSevenTransaction(passedPlayerDataCpy, players, userId, gameId);

  if (transactionErrorMessage) {
    return [transactionRes, transactionErrorMessage];
  };

  message.senderId = userId;
  message.diceValue = 7;

  startRobberModeHandler(ctx, wasRoller, isOSCP, totalCards);

  return [transactionRes, null];
}


export const rolledNonSevenTransactionHandler = async (passedPlayerDataCpy, diceResult, ctx, passedGameCpy) => {
  // DOES THE FOLLOWING:
  // 1. fetches other player's data from db
  // 1. updates all players' data with gained resources
  // 2. saves updated game (b/c curr dice value has been updated) and save updated player data (b/c of gained resources)

  const allPlayerIds = getOtherPlayerIds(passedGameCpy.players, ctx.userId);

  const [otherPlayerData, getUserDataErrorMsg] = await getUserData(allPlayerIds, passedGameCpy.gameId);

  if (getUserDataErrorMsg) {
    return [null, getUserDataErrorMsg];
  }

  const allPlayerData = [...otherPlayerData, passedPlayerDataCpy];

  const [updatedPlayerDataArr, currPlayerDataUpdated] = updateResourceCards(allPlayerData, ctx.gameBoard, diceResult, ctx.userId);


  const [nonSevenDiceRollUpdateRes, nonSevenDiceRollUpdateErrorMessage] = await rolledNonSevenTransaction(updatedPlayerDataArr, ctx.currentGame.gameId, ctx.userId, diceResult, currPlayerDataUpdated);

  if (nonSevenDiceRollUpdateErrorMessage) {
    return [null, nonSevenDiceRollUpdateErrorMessage];
  }

  return [nonSevenDiceRollUpdateRes, null];
}

export const updateResourceCards = (allPlayerData, gameBoard, diceResult, userId) => {
  let updatedCurrPlayerData = null;
  let currPlayerDataUpdated = false;

  const playerDataWithGainedResources = [];

  allPlayerData.forEach((playerData) => {

    let gainedResources = fetchGainedResources(gameBoard.tiles, playerData.playerInfo.structures, diceResult, playerData.playerInfo.username);
    let gainedResourcesTotal = getObjectValueSum(gainedResources);

    if (gainedResourcesTotal > 0) {
      let modifiedPlayerData = allocateResourcesToPlayerData(lod.cloneDeep(playerData), gainedResources);

      playerDataWithGainedResources.push(modifiedPlayerData);

      if (modifiedPlayerData.playerInfoUserId === userId) {
        updatedCurrPlayerData = modifiedPlayerData;
        currPlayerDataUpdated = true;
      };
    };
  });

  return [playerDataWithGainedResources, currPlayerDataUpdated];
}

export const checkForOSCP = (playerDataCpy, bulk) => {
  const resourceCards = playerDataCpy.playerInfo.hand['resource_cards'];
  const resourceCardAmounts = Object.values(resourceCards);
  let totalCards = 0;
  resourceCardAmounts.forEach(amount => {
    totalCards += amount;
  })

  if (totalCards > 7) {
    return [true, totalCards];
  }

  return [false, null];
}

export const checkForPendingOSCP = (playerData) => {
  let isOSCP = false;
  playerData.forEach(data => {
    if (data.overSevenCardPenalty === 1) {
      isOSCP = true;
    }
  })

  return isOSCP;
}

export const checkForPendingTrades = async (userIds, gameId) => {

  let blockedByPendingTradeOrError;

  let ids = null;
  userIds.forEach(id => {
    if (ids) {
      ids += `,${id}`
    }
    else {
      ids = `${id}`
    }
  });

  const pendingTradesReq = await fetch(`http://localhost:8080/api/trade/is/pending?userIds=${ids}&gameId=${gameId}`);

  if (pendingTradesReq.status >= 500 && pendingTradesReq.status < 600) {
    blockedByPendingTradeOrError = true;
    return [blockedByPendingTradeOrError, "There was a server error when attempting to check for pending trades. Please try again."];
  }
  if (pendingTradesReq.status >= 400 && pendingTradesReq.status < 500) {
    blockedByPendingTradeOrError = true;
    return [blockedByPendingTradeOrError, "There was a network error when attempting to check for pending trades. Please try again."];
  }

  const pendingTradesRes = await pendingTradesReq.json();
  const pendingTrade = pendingTradesRes.pop();

  if (pendingTrade.status === 200 || pendingTrade.status === 500) {
    // NOTE: if status is 200 there is an active pending trade - can't continue till trade is resolved
    // NOTE: if status is 500 there was some error - can't continue with an error
    blockedByPendingTradeOrError = true;
    return [blockedByPendingTradeOrError, "Another User Has Either Not Accepted or Not Declined a Trade Offer From You. This Must Be Completed Before Playing the Monopoly Card"];
  }

  blockedByPendingTradeOrError = false;
  return [blockedByPendingTradeOrError, null];
}

export const parsePlayerList = (playerList) => {
  if(typeof playerList === 'string'){
    playerList = JSON.parse(playerList);
  };

  playerList.forEach(player => {
    if(typeof player === 'string'){
      JSON.parse(player);
    }
  });

  return playerList;
}


export const activateAndDiscardPlayedDevCard = (playerDataCpy, devCard) => {

  playerDataCpy.playerInfo.hand['dev_cards'][devCard] -= 1;

  if (devCard === 'year_of_plenty') {
    playerDataCpy.yearOfPlentyActive = 1;
  }
  else if (devCard === 'monopoly') {
    playerDataCpy.monopolyActive = 1;
  }
  else if (devCard === 'road_building') {
    playerDataCpy.roadBuildingActive = 1;
  }
  else if (devCard === 'knight') {
    playerDataCpy.playerInfo.hand.activeKnights += 1;
    playerDataCpy.placingRobber = 1;
  }

  return playerDataCpy;
}

// formatting/helper = util
// NOTE: by default function is expecting an array of 1+ playerData objects
export const parsePlayerInfoField = (playerData, parsingSingleObject = false) => {
  
  if(Array.isArray(playerData)){
    playerData.forEach(PD => {
      if (typeof PD.playerInfo == 'string') {
        PD.playerInfo = JSON.parse(PD.playerInfo);
      }
    })
  }
  else{
    if (typeof playerData.playerInfo === 'string') {
      playerData.playerInfo = JSON.parse(playerData.playerInfo);
    }
  }

  return playerData;
}

// formatting/helper = util
export const stringifyPlayerInfoField = (passedPlayerData, singleObj = false) => {

  if(Array.isArray(passedPlayerData)){
    passedPlayerData.forEach((playerData, i) => {
      if (typeof playerData.playerInfo !== 'string') {
        playerData.playerInfo = JSON.stringify(playerData.playerInfo);
      }
    });
  }
  else{
    passedPlayerData.playerInfo = JSON.stringify(passedPlayerData.playerInfo);
    return passedPlayerData;
  }

  return passedPlayerData;
}

// formatting/helper = util
export const parseGameBoard = (gameBoardData) => {
  if (typeof gameBoardData.gameBoard === 'string') {
    gameBoardData.gameBoard = JSON.parse(gameBoardData.gameBoard);
    return gameBoardData;
  }

  return gameBoardData;
}

export const stringifyGameDataInnerFields = (game) => {
  game.players = JSON.stringify(game.players);
  game.ports = JSON.stringify(game.ports);
  game.devCards = JSON.stringify(game.devCards);
  game.awards = JSON.stringify(game.awards);
  return game;
}

export const parseGameDataInnerFields = (passedGame, areMultipleObjects = false) => {
  // if areMultipleObjects is true then game will be an array
  // -> this is why we do const games = game just so that the language is logical
  const fields = ['players', 'ports', 'devCards', 'awards'];

  if (areMultipleObjects === true) {
    const games = passedGame;
    games.forEach(game => {
      fields.forEach(field => {
        let gameField = game[field];
        if (typeof gameField === 'string') {
          game[field] = JSON.parse(gameField);
        }
      });
    });
    return games;
  }
  else {
    fields.forEach(field => {
      let gameField = passedGame[field];
      if (typeof gameField === 'string') {
        passedGame[field] = JSON.parse(gameField);
      }
    });

    return passedGame;
  };
}

export const constructNewGameData = (player, generatedPorts, userId, devCards) => {
  const newGameData = {
    'players': [player],
    'ports': generatedPorts,
    'currentPlayerIdx': 0,
    'ownerId': userId,
    'playerSize': 1,
    'devCards': devCards,
    'awards': {
      'longestRoad': { 'username': null, 'userId': null, 'roadLength': 0 },
      'largestArmy': { 'username': null, 'userId': null, 'armySize': 0 }
    }
  }

  return newGameData;
}

export const constructNewPlayerData = (userId, username, colorSelection) => {
  const playerInfo = {
    'playerInfoGameId': null,
    'playerInfoUserId': userId,
    'playerInfo': {
      'initialGameSetupIteration': 0,
      'overSevenCardPenalty': false,
      'username': username,
      'id': userId,
      'color': colorSelection,
      'points': 0,
      'hand': {
        'resource_cards': { 'wood': 0, 'brick': 0, 'stone': 0, 'hay': 0, 'sheep': 0 },
        'dev_cards': { 'knight': 0, 'road_building': 0, 'year_of_plenty': 0, 'monopoly': 0, 'victory_point': 0 },
        'locked_dev_cards': { 'knight': 0, 'road_building': 0, 'year_of_plenty': 0, 'monopoly': 0 },
        'activeKnights': 0
      },
      'structures': {
        'settlements': [],
        'cities': [],
        'roads': [],
      }
    }
  }

  return playerInfo;
}

const authenticationRequestHandler = async (token, navigate, ctx, authenticationTimeout) => {

  const authenticationReq = await fetch("http://localhost:8080/api/authenticate", {
    headers: { 'token': token }
  });
  // const authenticationReq = {
  //   status: 400
  // }

  // IF USER WAS NOT ON THEIR 10TH ATTEMPT IN 5 MINUTES THEN WE TRY TO REAUTHENTICATE 
  if (authenticationReq.status === 400) {
    authenticate(token, navigate, ctx, false);
  }

  // IF AUTHENTICATION FAILED FOR SOME OTHER REASON THEN USER NEEDS TO SIGN IN AGAIN FROM HOME PAGE
  if (authenticationReq.status !== 200) {
    if (authenticationTimeout) {
      clearTimeout(authenticationTimeout);
    };
    navigate("/authentication");
    return
  };

  // IF AUTHENTICATION WAS SUCCESSFUL THEN USER CAN BE NAVIGATED TO THE HOME PAGE
  const { username, id, avatar_url, role } = await authenticationReq.json();
  await connectToWebsocket(username, ctx.onSetStompConnected, ctx.onSetSock, ctx.onSetStompClient);
  ctx.onSetUserCredentials(username, id, avatar_url);
  ctx.onSetRole(() => role);

  clearAttemptsCounter();
  if (authenticationTimeout) {
    clearTimeout(authenticationTimeout);
  };

  ctx.onSetAuthenticated(true);
  ctx.onSetAuthenticating(false);
  navigate("/home");
};

export const authenticate = async (token, navigate, ctx, initialAttempt) => {
  // FUNCTION DOES THE FOLLOWING:
  // 1. first checks to see if token is available
  // 2. if token is available checks to see whether or not the authentication attempts have been exceeded
  // 3. if attempts have not been exceeded, try to authenticate with token
  // 4. handle response by either retrying to authenticate, sending user to sign in page, or signing in user and 
  //    navigating them to the home page

  //console.log(initialAttempt ? 'AUTHENTICATING...' : 'RE-AUTHENTICATING...');

  // IF THERE IS NO TOKEN THEN THERE'S NOTHING TO AUTHENTICATE SO NEED TO SEND USER TO SIGN IN PAGE
  if (!token) {
    navigate("/authentication");
    return
  }

  const canAttemptToAuthenticate = verifyAndUpdateAttemptCounter();

  if (!canAttemptToAuthenticate) {
    //console.log("EXCEEDED ATTEMPTS - HASN'T YET BEEN 10 MINUTES");
    ctx.onSetAuthenticating(false);
    navigate("/authentication");
    return
  }

  if (!ctx.authenticating) {
    ctx.onSetAuthenticating(true);
  }

  if (initialAttempt) {
    await authenticationRequestHandler(token, navigate, ctx, null);
  }
  else {
    const authenticationTimeout = setTimeout(async () => {
      await authenticationRequestHandler(token, navigate, ctx, authenticationTimeout);
    }, 5000);
  }
};

// REFACTOR NOTE: don't need attempt count - can just use size of attempts array
export const verifyAndUpdateAttemptCounter = () => {
  // FUNCTION DOES THE FOLLOWING:
  // 1. checks local storage for an attempt counter array and creates one if necessary
  // 2. checks status and handles based on below rule:
  //    a. if 10 attempts have been made to authenticate which resulted in a 400 error and 5 minutes have not passed since the 10th
  //       attempt, then we stop attempting so as to not infinitely reload the app and infinitely send requests
  //       -> if 10 attempts have been made and 5 minutes has passed since last attempt, we clear the array and start process over
  //       -> if 10 attempts have not been made, we add a new entry with a new time stamp and retry authentication once more
  // 3. when 10 attempts and less than 5 minutes condition occurs we return false (indicates to caller that we cannot try to authenticate again)
  //    otherwise we return true (indicates to caller that we can try again to authenticate)
  // NOTE: this functionality ties into the auto authenticate process in which app tries to use jwt to authenticate user rather than requiring 
  //       user to sign in manually each time - specifically it's related to the window.reload() call when status is 400 which handles a defect 
  //       that was occurring in which if user refreshes when in game space, the first request was resulting in 400 error and was sending user to  
  //       authentication page (likely request in app UE was dependent on code that wasn't yet loaded in) - when user refreshed 2nd time, app would 
  //       then take them to home page
  //       -> however, it's possible that the request repeatedly results in a 400 error so this functionality, as described above, prevents an infinite 
  //          loop from occurring 
  const currentTime = new Date().getTime();
  let attemptsArr = localStorage.getItem('attemptsCounter');
  
  let parsedAttemptsArr;
  let lastAttempt;

  if (!attemptsArr) {
    parsedAttemptsArr = [];
  }
  else {
    parsedAttemptsArr = JSON.parse(attemptsArr);
    lastAttempt = parsedAttemptsArr[parsedAttemptsArr.length - 1];
  }

  if (lastAttempt && lastAttempt.attemptNumber < 10) {
    const newAttempt = {
      attemptNumber: lastAttempt.attemptNumber + 1,
      timestamp: currentTime
    };

    parsedAttemptsArr.push(newAttempt);
    localStorage.setItem('attemptsCounter', JSON.stringify(parsedAttemptsArr));
    return true;
  }
  else if (lastAttempt && lastAttempt.attemptNumber >= 10) {
    const TEN_MINUTES = 600000;
    // if less than 10 minutes has passed since the 10th attempt then we stop trying to authenticate 
    // until at least 10 minutes has passed
    if (currentTime - lastAttempt.timestamp < TEN_MINUTES) {
      return false;
    }
    else {
      // if we maxed out the attempts but 10+ minutes has passed since last attempt then we clear out 
      // the attempt array and begin process again
      localStorage.setItem('attemptsCounter', JSON.stringify([{ attemptNumber: 1, timestamp: currentTime }]));
      return true;
    }
  }
  else {
    // in the event that there's no attempt counter array in local storage, we create one, intialize it, and set it
    const firstAttempt = {
      attemptNumber: 1,
      timestamp: currentTime
    }

    parsedAttemptsArr.push(firstAttempt);

    localStorage.setItem('attemptsCounter', JSON.stringify(parsedAttemptsArr));
    return true;
  }
}

export const clearAttemptsCounter = () => {
  if (localStorage.getItem('attemptsCounter')) {
    localStorage.removeItem('attemptsCounter');
  }
}

// calculation/helper = util
export const tradeRecipientHandler = (e, setIsPortTrade, setTradeRecipient, setTradeRecipientIdx, portNameMap, playerList) => {
  if (isTradingWithPlayer(e.target.value, portNameMap)) {
    //console.log(playerList[e.target.value].username);
    setIsPortTrade(false);
    setTradeRecipient(playerList[e.target.value].username);
    setTradeRecipientIdx(e.target.value);
    return
  }
  setIsPortTrade(true);
  setTradeRecipient(portNameMap[e.target.value]);
}

// calculation/helper = util
export const offeredResourceHandler = (resource, clearResource, setOfferedResources, offeredResources) => {
  const offeredResourcesCpy = lod.cloneDeep(offeredResources);
  if (clearResource === true) {
    if (offeredResources[resource] === 0) {
      return
    }
    offeredResourcesCpy[resource] -= 1;
    setOfferedResources(offeredResourcesCpy);
    return
  }
  offeredResourcesCpy[resource] += 1;
  setOfferedResources(offeredResourcesCpy);
}

// calculation/helper = util
export const desiredResourceHandler = (resource, clearResource, setDesiredResources, desiredResources) => {
  if (clearResource === true) {
    if (desiredResources[resource] === 0) {
      return
    }
    const desiredResourcesCpy = { ...desiredResources };
    desiredResourcesCpy[resource] -= 1;
    setDesiredResources(desiredResourcesCpy);
    return
  }
  const desiredResourcesCpy = { ...desiredResources };
  desiredResourcesCpy[resource] += 1;
  setDesiredResources(desiredResourcesCpy);
}

export const getSenderUsername = (senderId, playerList) => {
  let username;
  playerList.forEach((player, i) => {
    if (player.id === senderId) {
      username = player.username
      return
    }
  })
  return username;
}

export const prepareTradeModalData = (REQUEST_TYPE, tradeData, ctx) => {
  const playerData = ctx.playerInfo;

  const {
    desiredResources,
    offeredResources,
    tradeId,
    tradesSenderId,
    senderData,
    senderUsername
  } = tradeData;

  ctx.onSetTradeModalData({
    'offeredResources': JSON.parse(offeredResources),
    'desiredResources': JSON.parse(desiredResources),
    'tradeSender': senderUsername,
    'tradeSenderId': tradesSenderId,
    'playerData': playerData,
    'senderData': senderData,
    'tradeId': tradeId,
    'tradeObject': tradeData,
    'mode': REQUEST_TYPE
  });
}

// FUNCTION DOES THE FOLLOWING:
// 1. updates the passed player data object's hand field according to the trade criteria
export const applyAcceptedTradeResultToPlayerData = (playerData, traderType, desiredResources, offeredResources, calledFromWebsocketHandler = false, tradeRecord=null) => {
  // NOTE: playerData.playerInfo is showing as a string in console but this is not the case
  // might go away after stopping and restarting the app - double check this
  // used the typeof operator to verify that it is in fact an object
  
  let updatedPlayerData;

  //console.log(playerData)
  //console.log(tradeRecord)

  // WHEN BEING CALLED FROM WEBSOCKET HANDLER HAVE TO DYNAMICALLY GET PLAYER DATA B/C OTHERWISE
  // THE DATA WILL BE STALE AND NOT UP TO DATE
  if (calledFromWebsocketHandler) {
    playerData.playerInfo.hand['resource_cards'] = JSON.parse(tradeRecord.senderData)['resource_cards'];
  }

  //console.log(playerData)

  let playerHand = playerData.playerInfo.hand['resource_cards'];
  let desiredResourceType = Object.keys(desiredResources);
  let offeredResourceType = Object.keys(offeredResources);

  desiredResourceType.forEach((resourceType) => {
    if (desiredResources[resourceType] > 0) {
      // RECIPIENT OF TRADE REQUEST GIVES UP SENDER'S DESIRED RESOURCES
      if (traderType === 'RECIPIENT') {
        playerHand[resourceType] -= desiredResources[resourceType];
      }
      // SENDER OF TRADE REQUEST GETS THEIR DESIRED RESOURCES
      else {
        playerHand[resourceType] += desiredResources[resourceType];
      }
    }
  });

  offeredResourceType.forEach((resourceType) => {
    if (offeredResources[resourceType] > 0) {
      // RECIPIENT OF TRADE REQUEST RECEIVES THE SENDER'S OFFERED RESOURCES
      if (traderType === 'RECIPIENT') {
        playerHand[resourceType] += offeredResources[resourceType];
      }
      // SENDER OF TRADE REQUEST GIVES UP THE RESOURCES THAT THEY OFFERED
      else {
        playerHand[resourceType] -= offeredResources[resourceType];
      }
    }
  });

  updatedPlayerData = playerData;
  return updatedPlayerData;
}

export const applyPortTradeResultToPlayerData = (playerData, desiredResources, offeredResources) => {
  let playerHand = playerData.playerInfo.hand['resource_cards'];
  let desiredResourceType = Object.keys(desiredResources)
  let offeredResourceType = Object.keys(offeredResources);

  // NOTE: recipient = person recieving trade offer
  desiredResourceType.forEach((resourceType) => {
    if (desiredResources[resourceType] > 0) {
      if (traderType === 'RECIPIENT') {
        playerHand[resourceType] -= desiredResources[resourceType];
      }
      else {
        playerHand[resourceType] += desiredResources[resourceType];
      }
    }
  })

  offeredResourceType.forEach((resourceType) => {
    if (offeredResources[resourceType] > 0) {
      if (traderType === 'RECIPIENT') {
        playerHand[resourceType] += offeredResources[resourceType];
      }
      else {
        playerHand[resourceType] -= offeredResources[resourceType];
      }
    }
  })

  return playerData;
}

// FUNCTION DOES THE FOLLOWING:
// 1. check for a still active special game mode and then set that flag locally if needed
// 2. only happens when app first loads - either via refresh or first time log in
export const checkAndSetSpecialGameMode_InitialLoad = (ctx) => {
  const specialGameMode = getPendingSpecialGameMode(ctx.playerData);

  if (specialGameMode) {
    //console.log('SPECIAL GAME MODE: ', specialGameMode);

    ctx.onSetSpecialGameMode(specialGameMode, true);

    if (specialGameMode === 'roadBuilding') {
      // NOTE: road building dev card requires that: 
      // 1. this 'game mode' or game state is turned on - to allow for and keep track of two free road placements
      // 2. board is unlocked and is made clickable so that roads can be placed - this is why this additional update 
      //    needs to be made in the case of road building
      ctx.onSetRoadPlacementMode(true);
    }
    else {
      // NOTE: all special dev card activated game modes EXCEPT road building require additonal input from user 
      // requiring game mode specific modal to be opened to gather further input from user
      ctx.onModifyModalState(specialGameMode);
    }
  }
}

// FUNCTION DOES THE FOLLOWING:
// 1. when 7 is rolled, every other player has a 1 set in the OSCP column which they need to check and clear
// 2. this function runs once automatically when user connects - checks for OSCP and handles accordingly - see below function comments
export const handleOSCPAndRobberPlacement_InitialLoad = (OSCP_Flag, placingRobber, ctx) => {

  let updatedPlayerData = null;

  if (OSCP_Flag === 1) {

    const [verifiedOSCP, totalCards] = checkForOSCP(ctx.playerData);

    // IF OSCP IS VERIFIED (i.e. flag is 1 AND OSCP found) THEN NEED TO OPEN MODAL TO RETURN CARDS OTHERWISE NEED TO CORRECT PLAYER DATA OSCP FLAG TO BE 0
    if (verifiedOSCP) {
      scrollToHalfHeight(window);

      if (!ctx.overSevenCardPenaltyModalActive) {
        ctx.onModifyModalState('overSevenCardPenalty');
      }
    }
    else {
      const playerDataCpy = lod.cloneDeep(ctx.playerData);
      playerDataCpy.overSevenCardPenalty = 0;

      updatedPlayerData = playerDataCpy;
    }
  }

  // OCCURS WHEN OSCP IS 0 AND PLACING ROBBER IS 1 - HAPPENS WHEN PLAYER WHO ROLLED 7 EITHER DIDN'T HAVE OSCP, OR DID AND CLEARED IT, BUT STILL HASN'T PLACED THE ROBBER YET
  if (placingRobber === 1) {
    if (!ctx.robberPlacementMode) {
      ctx.onSetSpecialGameMode('robber', true);
    }
  }
  else {
    if (ctx.robberPlacementMode) {
      ctx.onSetSpecialGameMode('robber', false);
    }
  }

  return updatedPlayerData;
}

const receivedTradeRequestHelper = (tradeData, ctx) => {

  if (tradeData) {
    const {
      desiredResources,
      offeredResources,
      tradeId,
      tradesGameId,
      tradesRecipientId,
      tradesSenderId,
      senderData,
      senderUsername
    } = tradeData;

    ctx.onSetTradeModalData({
      'offeredResources': JSON.parse(offeredResources),
      'desiredResources': JSON.parse(desiredResources),
      'tradeSender': senderUsername,
      'tradeSenderId': tradesSenderId,
      'playerData': playerData,
      'senderData': senderData,
      'tradeId': tradeId,
      'tradeObject': tradeData,
      'mode': 'RECEIVE'
    });

    return [true, null];
  }

  return [false, null];
}

// FUCTION DOES THE FOLLOWING:
// 1. checks for trade requests sent to curr user that were missed
// -> happens if user is not connected at the time the trade was sent
// 2. because this check can fail - as http is needed - and occurs behind the scenes automatically 
//    there is built-in functionality to retry every 5 seconds for 1 minute (12 retries)
// -> If after 12 retries http is still unsuccessful, caller will display a non-closeable modal telling user to reload application
export const fetchMissedTradeRequests = async (ctx, initial = true, reloadAttempts = 0, errorMessage = null) => {

  if (reloadAttempts === 12) {
    return [false, errorMessage];
  }

  if (initial) {
    const [tradeDataRes, fetchReceivedTradeRequestsErrorMsg] = await fetchReceivedTradeRequests(ctx);

    if (fetchReceivedTradeRequestsErrorMsg) {
      reloadAttempts += 1;
      return await fetchMissedTradeRequests(ctx, false, reloadAttempts, fetchReceivedTradeRequestsErrorMsg);
    }

    return receivedTradeRequestHelper(tradeDataRes);
  }
  else {
    setTimeout(async () => {
      const [tradeDataRes, fetchReceivedTradeRequestsErrorMsg] = await fetchReceivedTradeRequests(ctx);

      if (fetchReceivedTradeRequestsErrorMsg) {
        reloadAttempts += 1;
        return await fetchMissedTradeRequests(ctx, false, reloadAttempts, fetchReceivedTradeRequestsErrorMsg);
      }

      return receivedTradeRequestHelper(tradeDataRes);
    }, 5000)
  }
}

// FUCTION DOES THE FOLLOWING:
// 1. checks for trade requests sent by curr user that were accepted by recipient user
// -> situation occurs when curr user is not connected at the time the trade was accepted
// 2. because this check can fail - as http is needed - and occurs behind the scenes automatically 
//    there is built-in functionality to retry every 5 seconds for 1 minute (12 retries)
// -> If after 12 retries http is still unsuccessful, caller will display a non-closeable modal telling user to reload application
export const fetchMissedAcceptedTradeRequests = async (ctx, initial = true, reloadAttempts = 0, errorMessage = null) => {

  if (reloadAttempts === 12) {
    return [false, errorMessage];
  };

  if (initial) {
    const [acceptedTradeData, fetchAccpetedTradeRequestsErrorMsg] = await fetchAccpetedTradeRequests(ctx.currentGame.gameId, ctx.userId);

    if (fetchAccpetedTradeRequestsErrorMsg) {
      reloadAttempts += 1;
      return await fetchAccpetedTradeRequests(ctx, false, reloadAttempts, fetchAccpetedTradeRequestsErrorMsg);
    }

    return [acceptedTradeData, null];
  }
  else {
    const timeout = setTimeout(async () => {
      const [acceptedTradeData, fetchAccpetedTradeRequestsErrorMsg] = await fetchAccpetedTradeRequests(ctx.currentGame.gameId, ctx.userId);

      if (fetchAccpetedTradeRequestsErrorMsg) {
        reloadAttempts += 1;
        return await fetchAccpetedTradeRequests(ctx, false, reloadAttempts, fetchAccpetedTradeRequestsErrorMsg);
      }

      clearTimeout(timeout);
      return [acceptedTradeData, null];
    }, 5000)
  }
}

// FUNCTION DOES THE FOLLOWING:
// 1. handles the updating of resource cards of the trade sender whose trade was accepted while they were not connected
// 2. makes use of the acceptTradeTransactionalSender which updates the player's data according to the trade parameters, saves the user's data, and then
//    deletes the trade in the db in a transactional manner
// 3. since this function occurrs automatically via useEffect and has the potential to fail - due to network/server/db error - automatic retry functionality is built in
//    -> can retry 12 times in 1 mintue before caller displays a non-closeable modal alerting user that there was an issue and that they will need to reload the application 
//       in order to try once more - in the hopes that the connection issue will be worked out by then 
export const handleAcceptedTrade = async (desiredResources, offeredResources, tradeId, ctx, initial = true, reloadAttempts = 0, errorMessage = null) => {

  if (reloadAttempts === 12) {
    return [null, errorMessage];
  }

  if (initial) {
    const [savedUserData, saveUserDataErrorMsg] = await acceptTradeTransactionalSender(desiredResources, offeredResources, 'SENDER', ctx, tradeId);

    if (saveUserDataErrorMsg) {
      reloadAttempts += 1;
      return await handleAcceptedTrade(desiredResources, offeredResources, tradeId, ctx, false, reloadAttempts, saveUserDataErrorMsg);
    }

    return [savedUserData, null];
  }
  else {
    const timeout = setTimeout(async () => {
      const [savedUserData, saveUserDataErrorMsg] = acceptTradeTransactionalSender(desiredResources, offeredResources, 'SENDER', ctx, tradeId);

      if (saveUserDataErrorMsg) {
        reloadAttempts += 1;
        return await handleAcceptedTrade(desiredResources, offeredResources, tradeId, ctx, false, reloadAttempts, saveUserDataErrorMsg);
      }

      clearTimeout(timeout);
      return [savedUserData, null];
    }, 5000);
  }
}

export const fetchGameList = async (userId, initial = true, reloadAttempts = 0, errorMessage = null) => {
  // return [null, 'error'];
  if (reloadAttempts === 12) {
    return [null, errorMessage];
  }

  if (initial) {
    const [games, fetchGamesErrorMsg] = await fetchGames(userId);

    if (fetchGamesErrorMsg) {
      reloadAttempts += 1;
      return await fetchGameList(userId, false, reloadAttempts, fetchGamesErrorMsg);
    }

    return [games, null];
  }

  const timeout = setTimeout(async () => {
    const [games, fetchGamesErrorMsg] = await fetchGames(userId);

    if (fetchGamesErrorMsg) {
      reloadAttempts += 1;
      return await fetchGameList(userId, false, reloadAttempts, fetchGamesErrorMsg);
    }

    clearTimeout(timeout);
    return [games, null];
  }, 5000)
}

export const checkCompletedItemPlacements = (settlements, roads, requiredFinalState) => {
  if (
    settlements === requiredFinalState.settlements
    &&
    roads === requiredFinalState.roads
  ) {
    return true;
  }

  return false;
}

export const getInitialGameInfo = (ctx) => {
  const initialGameInstructions = getInitialGameInstructions(ctx.currentGame);
  const index = initialGameInstructions.index;
  const currentPlayerId = initialGameInstructions[index].playerId;
  const isYourTurn = ctx.userId === currentPlayerId;
  const requiredFinalState = initialGameInstructions[index].requiredFinalState;
  const numberOfSettlements = ctx.playerData.playerInfo.structures.settlements.length;
  const numberOfRoads = ctx.playerData.playerInfo.structures.roads.length;

  return [numberOfSettlements, numberOfRoads, requiredFinalState, initialGameInstructions, index, isYourTurn];
}

export const checkFinishedInitialGameSetup = (initialGameInstructions, index) => {
  if (initialGameInstructions[index].incrementDirection === 'none') {
    return true
  };

  return false
}

// calculation/helper = util
// takes an array of numbers and returns the sum of all of those numbers
const additionReducer = (total, num) => {
  return (total + num);
}

// calculation/helper = util
// creates an array composed of all the value fields of the passed object, then finds the sum of the values in that array
export const getObjectValueSum = (obj) => {
  const objCpy = lod.cloneDeep(obj);
  const values = Object.values(objCpy);

  if (values.length === 0) {
    return null
  }

  const res = values.reduce(additionReducer);
  return res;
}

export const getDevCardCount = (devCards) => {
  let count = 0;
  const cardType = Object.keys(devCards)
  cardType.forEach((card, i) => {
    
    if (card !== 'victory_point') {
      count += devCards[card];
    }
  })
  return count;
}

export const getPlayerColorFromPlayerList = (playerList, username) => {
  //console.log(playerList)
  const players = JSON.parse(playerList);
  let playerColor;
  players.forEach(data => {
    if (data.username === username) {
      playerColor = data.color;
    }
  })

  return playerColor;
}

export const unlockDevCards = (ctx) => {
  let unlockedCards = false;
  const playerDataCpy = lod.cloneDeep(ctx.playerData);
  const lockedDevCards = playerDataCpy.playerInfo.hand['locked_dev_cards'];
  const devCards = playerDataCpy.playerInfo.hand['dev_cards'];
  for (let devCardType in lockedDevCards) {
    let lockedDevCardAmount = lockedDevCards[devCardType];
    if (lockedDevCardAmount > 0) {
      unlockedCards = true;
      devCards[devCardType] += lockedDevCardAmount;
      lockedDevCards[devCardType] = 0;
    }
  }
  return playerDataCpy;
}

export const fetchAvailableColors = (playerInfos) => {
  const availableColors =
  {
    'red': true,
    'blue': true,
    'orange': true,
    'white': true
  };

  playerInfos.forEach(playerInfo => {
    availableColors[playerInfo.color] = false;
  });

  return availableColors;
};

export const createAvailableColorsMap = (games) => {
  const availableColorsMap = {};
  games.forEach((game) => {
    const defaultColorMap = {
      'isError': false,
      'selected': '',
      'red': true,
      'white': true,
      'orange': true,
      'blue': true
    };
    const gameId = game.gameId;
    const players = JSON.parse(game.players);
    availableColorsMap[gameId] = defaultColorMap;
    players.forEach(playerData => {
      availableColorsMap[gameId][playerData.color] = false;
    });
  });

  return availableColorsMap;
};

export const generateUserGameData = async (userId, gameId) => {
  //console.log(userId, gameId)
  const userGameRecordCreationReq = await fetch(`http://localhost:8080/api/userGames/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'userGamesUserId': userId,
      'userGamesGameId': gameId
    })
  });

  if (userGameRecordCreationReq.status !== 200) {
    //console.log('here')
    return [null, "There was a network error. Please try again"];
  }

  const userGameRes = await userGameRecordCreationReq.json();
  //console.log(userGameRes)
  if (userGameRes.status !== 200) {
    return [null, userGameRes.message];
  }

  return [userGameRes, null];

};

export const fetchGameLimitStatus = async (userId) => {
  // let gameLimitStatusReq = {
  //   status: 500
  // };
  const gameLimitStatusReq = await fetch(`http://localhost:8080/api/users/${userId}/activeGameCount`);

  if (gameLimitStatusReq.status !== 200) {
    return [null, "There was a server error when trying to fetch some user data. Please try again."];
  }

  let gameLimitStatusRes = await gameLimitStatusReq.json();

  if (gameLimitStatusRes.status !== 200) {
    return [null, gameLimitStatusRes.message];
  }

  return [gameLimitStatusRes, null];
}

export const removeGameFromGameList = (gameList, gameId) => {
  gameList.forEach((game, i) => {
    if (game.gameId == gameId) {
      gameList.splice(i, 1);
    }
  })

  return gameList;
}

export const fetchUserGame = async (userId, gameId) => {
  const userGameRecordReq = await fetch(`http://localhost:8080/api/userGames/userId/${userId}/game/${gameId}`)

  const userGameRes = await userGameRecordReq.json();

  if (userGameRes.status !== 200) {
    return null;
  }
  else {
    return userGameRes;
  }
}

export const fetchAllOtherPlayerInfosByUsername = async (usernames, gameId) => {
  let queryString = '';
  usernames.forEach((user) => {
    if (queryString === '') {
      queryString = `${user.userId}`;
    }
    else {
      queryString = queryString + `,${user.userId}`;
    }
  });
  const allOtherPlayerInfosReq = await fetch(`http://localhost:8080/api/player_info/all/for/game/${gameId}?usernames=${queryString}`);
  const allOtherPlayerInfosRes = await allOtherPlayerInfosReq.json();
  const parsedPlayerInfos = parsePlayerInfoField(allOtherPlayerInfosRes);
  return parsedPlayerInfos;
}

export const fetchAllOtherPlayerUsernames = (game, username) => {
  const players = typeof game.players === 'string' ? JSON.parse(game.players) : game.players;
  const playerList = [];

  players.forEach(data => {
    if (data.username !== username) {
      playerList.push(data.username);
    }
  });

  return playerList;
}

// fetching/formatting/helper = util
export const getOtherPlayerIds = (gamePlayers, currPlayerId) => {
  
  if(typeof gamePlayers === 'string'){
    gamePlayers = JSON.parse(gamePlayers);
  }

  let ids = [];

  gamePlayers.forEach(player => {
    if (player.id !== currPlayerId) {
      ids.push(player.id);
    }
  });

  return ids;
}

// calculation/formatting/helper = util
export const getIsPendingOSCP = async (gamePlayers, currPlayerId, currGameId) => {
  let queryString = null;
  const otherPlayerIds = getOtherPlayerIds(gamePlayers, currPlayerId);
  otherPlayerIds.forEach(player => {
    if (queryString) {
      queryString += `,${player.id}`
    }
    else {
      queryString = `${player.id}`
    }
  });
  const res = await fetch(`http://localhost:8080/api/player_info/over-seven-card-penalty/status?gameId=${currGameId}&userIds=${otherPlayerIds}`)
  const status = await res.json();
  return status;
}

export const generateQueryString = (arr, field) => {
  let queryString = null;
  if (field) {
    arr.forEach(data => {
      if (!queryString) {
        queryString = data[field];
      }
      else {
        queryString += `,${data[field]}`
      }
    })
  }
  else {
    arr.forEach(data => {
      if (!queryString) {
        queryString = data
      }
      else {
        queryString += `,${data}`
      }
    })
  }
  return queryString;
}

export const getTurnPhase = (turnPhaseIdx) => {
  if (turnPhaseIdx === 0) {
    return 'diceRoll';
  }
  else if (turnPhaseIdx === 1) {
    return 'trading';
  }
  else {
    return 'building';
  }
}

// calculation/formatting/helper = util
export const generateInitialGamePhaseInstructions = (players) => {
  const data = {
    index: 0,
  }

  let dataIdx = 0;
  let i = 0;
  let direction = 'forward';
  let requiredAmount = 1;
  let finished = false;

  while (!finished) {
    let player = players[i];
    let nextEntry = {};

    if (dataIdx === players.length - 1) {
      direction = 'backward';
      requiredAmount = 2;
    }
    if (dataIdx === (players.length + players.length - 2)) {
      direction = 'none';
    }

    nextEntry.playerId = player.id;
    nextEntry.requiredFinalState = { settlements: requiredAmount, roads: requiredAmount };
    nextEntry.incrementDirection = direction;

    data[dataIdx] = nextEntry;

    if (dataIdx === (players.length + players.length - 2)) {
      finished = true;
      break;
    }
    if (direction === 'forward') {
      i += 1;
    } else {
      i -= 1;
    }
    dataIdx++;
  }

  return data;
};

export const parseTradeRequestData = (tradeRequestData) => {
  const desiredResources = JSON.parse(tradeRequestData.desiredResources);
  const offeredResources = JSON.parse(tradeRequestData.offeredResources);

  return {
    'desiredResources': desiredResources,
    'offeredResources': offeredResources,
  }
}

// calculation/helper = util
export const delayLoadingMessage = (time, onSetIsLoading) => {
  setTimeout(() => {
    onSetIsLoading(false)
  }, time)
}

// editing ui/helper = util
export const scrollToHalfHeight = (window) => {
  //console.log(window)
  const windowDimensions = getWindowDimensions(window);
  const halfHeight = windowDimensions.height / 2;
  window.scrollTo({
    top: halfHeight,
    behavior: 'smooth'
  });
}

export const getToken = (cookies) => {
  let token;
  cookies.forEach((term, i) => {
    if (term === 'token') {
      token = cookies[i + 1]
    }
  })

  return token;
}

// export const debugConsoleHandler = (e) => {
//   if (e.key === '`') {
//     ctx.onModifyModalState('devConsole');
//   };
// };

export const buyDevCard = (game, playerData) => {
  const currentGameCpy = lod.cloneDeep(parseGameDataInnerFields(game));
  const playerDataCpy = lod.cloneDeep(playerData);
  const gameDevCardsCpy = currentGameCpy.devCards;

  const playerResourceCards = playerDataCpy.playerInfo.hand['resource_cards'];
  const playerLockedDevCards = playerDataCpy.playerInfo.hand['locked_dev_cards'];
  const playerDevCards = playerDataCpy.playerInfo.hand['dev_cards'];

  playerResourceCards.sheep -= 1;
  playerResourceCards.hay -= 1;
  playerResourceCards.stone -= 1;

  const drawnCard = gameDevCardsCpy.shift();

  if (drawnCard === 'victory_point') {
    playerDevCards[drawnCard] += 1;
    playerDataCpy.playerInfo.points += 1;
  }
  else {
    playerLockedDevCards[drawnCard] += 1;
  }

  const data = {
    'updatedGame': currentGameCpy,
    'updatedPlayerData': playerDataCpy,
    'purchasedCard': drawnCard
  };

  return data
}

export const getFormatedDevCardName = (type) => {
  switch (type) {
    case 'knight':
      {
        return 'Knight';
      }

    case 'monopoly':
      {
        return 'Monopoly';
      }

    case 'year_of_plenty':
      {
        return 'Year of Plenty';
      }

    case 'road_building':
      {
        return 'Road Building';
      }

    case 'victory_point':
      {
        return 'Victory Point';
      }
  }
}

export const acceptedTradeCleanupHandler = (savedPlayerData, retryTypeCpy) => {
  retryTypeCpy.fetchAccepted = false;
  retryTypeCpy.accepted = false;
  setRetryType(retryTypeCpy);

  setAcceptTradeReloadAttemptCount(0);

  setLoading(false);

  ctx.onSetPlayerData(savedPlayerData);
};

export const handleAcceptedTradeRequest = async (tradeRecord, ctx) => {

  const { desiredResources, offeredResources } = parseTradeRequestData(tradeRecord);

  const updatedPlayerData = applyAcceptedTradeResultToPlayerData(lod.cloneDeep(ctx.playerData), 'SENDER', desiredResources, offeredResources);

  const [savedPlayerData, acceptTradeTransactionalSenderErrorMsg] = await acceptTradeTransactionalSender(tradeRecord, updatedPlayerData);

  if (acceptTradeTransactionalSenderErrorMsg) {
    return [null, acceptTradeTransactionalSenderErrorMsg];
  }

  return [savedPlayerData, null];
};

export const handleReceivedTradeRequest = (receivedTradeData, ctx) => {
  const REQUEST_TYPE = 'RECEIVE';

  prepareTradeModalData(REQUEST_TYPE, receivedTradeData, ctx);
  ctx.onModifyModalState('trade');
};

const turnPhaseChangeAllowed_DiceRoll = async (ctx, window, otherPlayerIds) => {
  const [otherPlayerData, errorMessage] = await getUserData(otherPlayerIds, ctx.currentGame.gameId);
  if (errorMessage) {
    ctx.onSetInfoModalTextColor('black');
    ctx.onSetInfoModalMessage(errorMessage);
    ctx.onModifyModalState('info');
    scrollToHalfHeight(window);
    return false;
  }

  const isPendingOSCP = checkForPendingOSCP(otherPlayerData);
  if (isPendingOSCP) {
    ctx.onSetInfoModalMessage("One or More Players Need to Return Cards as a Result of a Rolled 7 Before Continuing to the Trading Phase.");
    ctx.onModifyModalState('info');
    scrollToHalfHeight(window);
    return false;
  }

  return true;
}

const turnPhaseChangeAllowed_Trading = async (ctx, window, otherPlayerIds) => {
  const [isBlockedByPendingTradeOrError, checkForPendingTradesErrorMessage] = await checkForPendingTrades(otherPlayerIds, ctx.currentGame.gameId);

  if (isBlockedByPendingTradeOrError || checkForPendingTradesErrorMessage) {
    ctx.onSetInfoModalMessage(checkForPendingTradesErrorMessage);
    ctx.onModifyModalState('info');
    scrollToHalfHeight(window);
    return false;
  }
  if (ctx.robberPlacementMode) {
    ctx.onSetInfoModalMessage("Must Place the Robber Before Moving to Building Phase");
    ctx.onModifyModalState('info');
    scrollToHalfHeight(window);
    return false;
  }
  if (ctx.roadPlacementMode) {
    ctx.onSetInfoModalMessage("Must Finish Placing Roads Before Moving to Building Phase");
    ctx.onModifyModalState('info');
    scrollToHalfHeight(window);
    return false;
  }

  return true;
}

export const turnPhaseHandler = async (ctx, currTurnPhase, window) => {
  let turnPhaseChangeAllowed;

  const otherPlayerIds = getOtherPlayerIds(ctx.currentGame.players, ctx.userId);
  //console.log(currTurnPhase)
  if (currTurnPhase === 'diceRoll') {
    turnPhaseChangeAllowed = await turnPhaseChangeAllowed_DiceRoll(ctx, window, otherPlayerIds);
  }
  else {
    turnPhaseChangeAllowed = await turnPhaseChangeAllowed_Trading(ctx, window, otherPlayerIds);
  }

  if (!turnPhaseChangeAllowed) {
    return;
  }

  const [updatedGame, updateTurnPhaseErrorMessage] = await updateTurnPhase(ctx.currentGame.gameId);
  
  if (updateTurnPhaseErrorMessage) {
    ctx.onSetRecoveryModalData({
      type: 'turnPhaseTransition',
      recoveryFunctions: [updateTurnPhase, ctx.onSetCurrentGame],
      recoveryFunctionArgs: [
        [
          ctx.currentGame.gameId
        ],
      ],
      message: updateTurnPhaseErrorMessage,
      textColor: 'black'
    });
    ctx.onModifyModalState('recovery');
    return;
  };

  // NOTE: resetting robber placed to false if a 7 was rolled on this turn
  // makes it so that when it's your turn again, dice roll shows the correct UI
  // if it remains true, then dice roll ui thinks you placed the robber which suggests that
  // you already rolled a 7, and so you are prevented from being able to roll the dice "again"
  if (currTurnPhase === 'diceRoll') {
    ctx.onSetRobberPlaced(false);
  };

  ctx.onSetCurrentGame(updatedGame);
  ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
}

export const pendingStateActive = (playerData, desiredAction) => {
  let errorMessage = null;

  Object.keys(playerData).forEach(key => {
    //console.log(key);
    //console.log(playerData[key]);
    let value = playerData[key];

    if(key === 'placingRobber' && value === 1){
      errorMessage = `You must finish placing robber before ${desiredAction}`;
      return errorMessage;
    }
    
    if(key === 'yearOfPlentyActive' && value === 1){
      errorMessage = `You must finish your Year of Plenty selection before ${desiredAction}`;
      return errorMessage;
    }
    
    if(key === 'roadBuildingActive' && value === 1){
      errorMessage = `You must finish placing roads before ${desiredAction}`;
      return errorMessage;
    }

    if(key === 'monopolyActive' && value === 1){
      errorMessage = `You must finish your Monopoly selection before ${desiredAction}`;
      return errorMessage;
    }
  });

  return errorMessage;
}

export const createBugReport = async(bugReport) => {
  const createBugReportReq = await fetch(`http://localhost:8080/dumbCatan/bug-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bugReport)
  });

  if(createBugReportReq.status !== 200){
    return [null, 'There was an error with the create bug report request. Please try again.']
  };

  const createBugReportRes = await createBugReportReq.json();

  if(createBugReportRes.status !== 200){
    return [null, createBugReportRes.message];
  };

  return [createBugReportRes, null];
}

export const fetchBugList = async (setBugList) => {
  const fetchBugReportsReq = await fetch(`http://localhost:8080/dumbCatan/bug-report/all`)

  if(fetchBugReportsReq.status !== 200){
    return [null, 'There was an error with the fetch bug reports request. Please try again.']
  };

  const fetchBugReportsRes = await fetchBugReportsReq.json();

  return [fetchBugReportsRes, null];
}

export const deleteBugReport = async (reportId) => {
  const deleteBugReportReq = await fetch(`http://localhost:8080/dumbCatan/bug-report/${reportId}`,{
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if(deleteBugReportReq.status !== 200){
    return [null, 'There was an error with the delete bug report request. Please try again.']
  };

  const deleteBugReportRes = await deleteBugReportReq.json();

  if(deleteBugReportRes.status !== 200){
    return [null, deleteBugReportRes.message];
  };

  return [deleteBugReportRes, null];
}