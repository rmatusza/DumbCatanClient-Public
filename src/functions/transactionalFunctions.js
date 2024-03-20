import {
  applyAcceptedTradeResultToPlayerData,
  constructNewGameData, constructNewPlayerData,
  generateQueryString, getOtherPlayerIds,
  parseGameBoard,
  parseGameDataInnerFields,
  parsePlayerInfoField, stringifyGameDataInnerFields,
  stringifyPlayerInfoField
}
from "./utilFunctions"
import generateTileArrangement from "../utils/tile-identities";
import generateTileFrequencies from "../utils/tile-frequencies";
import insertDesertTile from "../utils/desert-tile-helper";
import generatePorts from '../utils/ports-helper';
import generateDevCards from '../utils/generate-dev-cards';
import initializeBoardGraph from '../utils/board-graph-initializer';
const lod = require('lodash');

// Does the following:
// 1. saves current player data
// 2. updates other player datas with a 1 in the OSCP field that must be cleared for curr user to be able to continue to next turn phase
// 3. saves game with the curr dice roll
export const rolledSevenTransaction = async (currPlayerInfo, playerList, userId, gameId) => {

  const otherUserIds = getOtherPlayerIds(playerList, userId);
  const queryString = generateQueryString(otherUserIds);
  const stringifiedPlayerInfo = stringifyPlayerInfoField(currPlayerInfo, true);

  const rolledSevenTransactionReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/user/${userId}/game/${gameId}/rolledSevenUpdate?userIds=${queryString}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(stringifiedPlayerInfo)
  });

  // const rolledSevenTransactionReq = {
  //   status: 500
  // }

  if (rolledSevenTransactionReq.status !== 200) {
    return [null, "There was a network error when trying to update data after dice roll. Please ensure that you have an internet connection and try again."]
  };

  // CONTAINS:
  // game 
  // playerData
  // status code
  // result message
  const rolledSevenTransactionRes = await rolledSevenTransactionReq.json();

  // const rolledSevenTransactionRes = {
  //   status: 500,
  //   message: "error"
  // }


  if (rolledSevenTransactionRes.status !== 200) {
    return [null, rolledSevenTransactionRes.message];
  };

  const SINGLE_OBJ = true;
  const parsedPlayerInfo = parsePlayerInfoField(rolledSevenTransactionRes.playerInfo, SINGLE_OBJ);
  const parsedGame = parseGameDataInnerFields(rolledSevenTransactionRes.game);

  const respnseData = {
    savedPlayerData: parsedPlayerInfo,
    savedGame: parsedGame
  }

  return [respnseData, null];
}

export const rolledNonSevenTransaction = async (updatedPlayerDataArr, gameId, userId, diceValue, currPlayerDataUpdated) => {
  // Function saves game AND player data
  let responseData = {
    'savedGame': null,
    'savedPlayerData': null,
  };

  const stringifiedUpdatedPlayerDataArr = stringifyPlayerInfoField(updatedPlayerDataArr);

  const rolledNonSevenTransactionReq = 
    await fetch(`http://localhost:8080/dumbCatan/transactionals/user/${userId}/game/${gameId}/rolledNonSevenUpdate?diceValue=${diceValue}&currPlayerDataUpdated=${currPlayerDataUpdated}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stringifiedUpdatedPlayerDataArr)
  });

  if (rolledNonSevenTransactionReq.status !== 200) {
    return [null, "There was a network error when trying to update data after dice roll. Please ensure that you have an internet connection and try again."];
  };

  const rolledNonSevenTransactionRes = await rolledNonSevenTransactionReq.json();

  if (rolledNonSevenTransactionRes.status !== 200) {
    return [null, rolledNonSevenTransactionRes.message];
  };

  
  responseData.savedGame = parseGameDataInnerFields(rolledNonSevenTransactionRes.game);
  responseData.savedPlayerData = rolledNonSevenTransactionRes.playerInfo ? parsePlayerInfoField(rolledNonSevenTransactionRes.playerInfo) : null;

  return [responseData, null];
}

export const fetchGameAndUserData = async (ctx) => {

  const gameAndUserDataReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/game/${ctx.currentGame.gameId}/for/user/${ctx.userId}`);

  if (gameAndUserDataReq.status !== 200) {
    return [null, "There was a network error when trying to fetch some data. Please ensure that you have an internet connection and try again."];
  };

  const gameAndUserDataRes = await gameAndUserDataReq.json();

  if (gameAndUserDataRes.status !== 200) {
    return [null, gameAndUserDataRes.message];
  };

  const parsedUpdatedPlayerData = parsePlayerInfoField(gameAndUserDataRes.playerInfo, true);
  const updatedGame = gameAndUserDataRes.game;
  const responseData = {
    'fetchedPlayerData': parsedUpdatedPlayerData,
    'fetchedGame': updatedGame
  }
  return [responseData, null];
}

export const createAndSetGameTransactional = async (colorSelection, gameBoard, userId, username, ctx) => {
  const gameBoardCpy = lod.cloneDeep(gameBoard);
  let generatedResourceTiles = generateTileArrangement();
  let diceValuesAndFrequencies = generateTileFrequencies();
  const generatedPorts = generatePorts();
  [generatedResourceTiles, diceValuesAndFrequencies] = insertDesertTile(generatedResourceTiles, diceValuesAndFrequencies);
  const initializedGameBoard = initializeBoardGraph(generatedResourceTiles, diceValuesAndFrequencies, gameBoardCpy)
  const player = { id: userId, username: username, color: colorSelection }
  const devCards = generateDevCards();
  
  const game = constructNewGameData(player, generatedPorts, userId, devCards);
  const playerData = constructNewPlayerData(userId, username, colorSelection);
 
  const stringifiedGame = stringifyGameDataInnerFields(game);
  const stringifiedplayerData = stringifyPlayerInfoField(lod.cloneDeep(playerData), true);

  const reqData = {
    'game': stringifiedGame,
    'gameBoard': {
      'gameBoard': JSON.stringify(initializedGameBoard),
      'gameBoardGameId': null, 
    },
    'playerInfo': stringifiedplayerData
  }
  
  const gameCreationReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/new/game/created/by/user/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqData)
  });

  if (gameCreationReq.status !== 200) {
    return [null, "An error occurred when attempting to create new game"];
  }

  const newGameData = await gameCreationReq.json();
  
  if (newGameData.status !== 200) {
    return [null, newGameData.message];
  }

  const responseData = {
    'savedGame': parseGameDataInnerFields(newGameData.game),
    'savedPlayerData': parsePlayerInfoField(newGameData.playerInfo, true),
    'savedGameBoardData': parseGameBoard(newGameData.gameBoard)
  }

  return [responseData, null];
}

export const finishTurnTransaction = async (gameId, playerInfo) => {
  const formattedPlayerInfo = stringifyPlayerInfoField(playerInfo, true);

  const finishTurnTransactionReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/game/${gameId}/finish/turn`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedPlayerInfo)
  })

  if(finishTurnTransactionReq.status !== 200){
    return [null, "There was a network error when attempting to finish turn. Please try again."];
  }

  const finishTurnTransactionRes = await finishTurnTransactionReq.json();

  if(finishTurnTransactionRes.status !== 200){
    return [null, finishTurnTransactionRes.message];
  }

  const parsedGame = parseGameDataInnerFields(finishTurnTransactionRes.game);
  const parsedPlayerInfo = parsePlayerInfoField(finishTurnTransactionRes.playerInfo, true);

  const data = {
    savedGame: parsedGame,
    savedPlayerInfo: parsedPlayerInfo
  }

  return [data, null];
};

// SAVES UPDATED PLAYER DATA, AND DELETES THE TRADE
export const acceptTradeTransactionalSender = async (tradeRecord, updatedPlayerData) => {
  const IS_SINGLE_OBJECT = true;
  //console.log(updatedPlayerData)
  const acceptTradeTransactionalSenderReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/trade/${tradeRecord.tradeId}/accepted`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'trade': tradeRecord,
      'playerInfo': stringifyPlayerInfoField(updatedPlayerData, IS_SINGLE_OBJECT)
    })
  })

  if(acceptTradeTransactionalSenderReq.status !== 200){
    return [null, "There was a network error when trying to save player data and delete accepted trade. Please try again."];
  }

  const savedPlayerInfo = await acceptTradeTransactionalSenderReq.json();

  if(savedPlayerInfo.status !== 200){
    return [null, savedPlayerInfo.message];
  }
  
  const parsedSavedPlayerData = parsePlayerInfoField(savedPlayerInfo, IS_SINGLE_OBJECT);
  //console.log(parsedSavedPlayerData)
  return [parsedSavedPlayerData, null];  
};

export const acceptTradeTransactionalRecipient = async (updatedPlayerData, tradeObject) => {
  const SINGLE_OBJ = true;

  const acceptTradeTransactionalReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/accept-trade/and/save-player-data`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'trade': tradeObject,
      'playerInfo': stringifyPlayerInfoField(updatedPlayerData, SINGLE_OBJ)
    })
  });

  if(acceptTradeTransactionalReq.status !== 200){
    return [null, "There was an error when trying to save/update player and trade data. Please try again."];
  }

  const acceptTradeTransactionalRes = await acceptTradeTransactionalReq.json();

  if(acceptTradeTransactionalRes.status !== 200){
    return [null, acceptTradeTransactionalRes.message];
  }

  const parsedPlayerData = parsePlayerInfoField(acceptTradeTransactionalRes, SINGLE_OBJ);

  return [parsedPlayerData, null];
}

export const robberPlacementTransactional = async (playerDatas, gameBoard, currentPlayerId, gameId) => {
  //console.log(gameBoard);
  const formattedPlayerDatas = stringifyPlayerInfoField(playerDatas);
  const formattedGameBoard = JSON.stringify(gameBoard);
  const gameBoardReqObj = {
    'boardId': -1,
    'gameBoard': formattedGameBoard,
    'gameBoardGameId': gameId
  }
  const robberPlacementTransactionalReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/post/robber/placement/by/user/${currentPlayerId}/data/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'gameBoard': gameBoardReqObj,
      'playerInfos': formattedPlayerDatas,
      'playerInfo': null
    })
  })

  if(robberPlacementTransactionalReq.status !== 200){
    return [null, "There was a network error when trying to save player data and the game board. Please try again."];
  }

  const robberPlacementTransactionalRes = await robberPlacementTransactionalReq.json();

  if(robberPlacementTransactionalRes.status !== 200){
    return [null, robberPlacementTransactionalRes.message];
  }

  const savedPlayerData = robberPlacementTransactionalRes.playerInfo;
  const savedGameBoard = robberPlacementTransactionalRes.gameBoard;

  const parsedPlayerData = parsePlayerInfoField(savedPlayerData, true);
  const parsedGameBoard = parseGameBoard(savedGameBoard);

  const responseData = {
    'playerInfo': parsedPlayerData,
    'gameBoard': parsedGameBoard
  }

  return [responseData, null];
};

export const saveGameAndBoardTransactional = async (game, board, userWonGame, passedWinnerUsername, winnerId) => {
  let queryString = `http://localhost:8080/dumbCatan/transactionals/save/game/and/board`;

  if (userWonGame === true) {
    game.gameOver = 1;
    game.winnerUsername = passedWinnerUsername;
    queryString += `?userWonGame=${true}&winnerId=${winnerId}`;
  }
  else {
    queryString += `?userWonGame=${false}&winnerId=${-1}`;
  };

  const stringifiedBoard = JSON.stringify(board)

  const saveGameAndBoardReq = await fetch(queryString, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'game': stringifyGameDataInnerFields(game),
      'board': stringifiedBoard,
    })
  });

  if(saveGameAndBoardReq.status !== 200){
    return [null, "There was a network error when trying to save game and board data. Please try again."];
  };

  const saveGameAndBoardRes = await saveGameAndBoardReq.json();
  if(saveGameAndBoardRes.status !== 200){
    return [null, saveGameAndBoardRes.message];
  };
  
  const parsedGame = parseGameDataInnerFields(saveGameAndBoardRes.game);
  const parsedBoard = JSON.parse(saveGameAndBoardRes.board);

  const data = {
    'savedGame': parsedGame,
    'savedBoard': parsedBoard
  };

  return [data, null];
};


// FUNCTION DOES THE FOLLOWING:
// 1. handles situations in which player info needs to be saved and in which the game (and possibly user record) MIGHT need to be saved
// 2. user won game and NO award = player info + game + user record
// 3. user won game AND got award = player info + game + user record
// 4. user DIDN'T win game and DID win award = player info (possibly 2 if curr user is replacing last award holder) + game
// 5. user DIDN'T win game and DIDN'T win award = player info
// NOTE: function allows to cover multiple scenarios at once which allows for less code in areas of app where one or multiple of the above can happen
// -> can now just call this one function which handles all cases instead of having to individually check and handle each case and do error handling 
//    and recovery for each one in component 
export const saveGameAndPlayerDataTransactional = async (game, playerData, userWonGame=false, currUsername, currUserId, newAward='') => {
  // NOTE: expecting player data to be passed as an array containing either 1 or 2 playerInfo objects
    
  if (userWonGame === true) {
    game.gameOver = 1;
    game.winnerUsername = currUsername;
  };

  // NOTE: the first game and playerInfo in the body result in a 400 (due to not being stringified correctly) but the last 2 work
  // -> left them there b/c was confused about how to correctly parse such data for http request and this provides some insight  
  //    through compare and contrast
  const saveGameAndPlayerDataReq = await fetch(`http://localhost:8080/dumbCatan/transactionals/save/game/and/playerData?userWonGame=${userWonGame}&newAward=${newAward}&currUserId=${currUserId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // 'game': JSON.stringify(game),
      // 'playerInfo': JSON.stringify(playerData)
      'game': stringifyGameDataInnerFields(game),
      'playerInfos': stringifyPlayerInfoField(playerData)
    })
  });

  // const saveGameAndPlayerDataReq = {status: 500}

  if(saveGameAndPlayerDataReq.status !== 200){
    return [null, "There was a network error when trying to save game and board data. Please try again."];
  };

  const saveGameAndPlayerDataRes = await saveGameAndPlayerDataReq.json();

  if(saveGameAndPlayerDataRes.status !== 200){
    return [null, saveGameAndPlayerDataRes.message];
  };

  const IS_SINGLE_PLAYER_DATA_OBJECT = true;

  const responseData = {
    'savedGame': parseGameDataInnerFields(saveGameAndPlayerDataRes.game),
    'savedPlayerData': parsePlayerInfoField(saveGameAndPlayerDataRes.playerInfo, IS_SINGLE_PLAYER_DATA_OBJECT)
  };

  return [responseData, null];
};