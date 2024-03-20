import { getUserData, saveUserData, buyStructureAndAddToPlayerData, allocateInitialResources, buyRoadAndAddToPlayerData } from "./userFunctions";
import { getSenderUsername, scrollToHalfHeight, removeGameBoardFromGameObject, parseGameBoard, getPlayerList, parseGameDataInnerFields } from "./utilFunctions";
import getWindowDimensions from '../utils/get-window-dimensions';
import generateTileArrangement from "../utils/tile-identities";
import generateTileFrequencies from "../utils/tile-frequencies";
import insertDesertTile from "../utils/desert-tile-helper";
import generatePorts from '../utils/ports-helper';
import generateDevCards from '../utils/generate-dev-cards';
import initializeBoardGraph from '../utils/board-graph-initializer';
import BoardManager from "../utils/board-manager";
import { robberPlacementTransactional, saveGameAndBoardTransactional } from "./transactionalFunctions";
const lod = require('lodash');

// FILE CRITERIA:
// functions that are focused on anything board/gameplay related

// ex. saving game, determining the winner, editing the board state
// editing game phase including special game phases
// getting the game can be put here instead of utils since it's so specific to games

// creating new game = game
export const createGame = async (colorSelection, boardGraph, userId, username, ctx) => {
  const gameBoardCpy = lod.cloneDeep(boardGraph);
  let generatedResourceTiles = generateTileArrangement();
  let diceValuesAndFrequencies = generateTileFrequencies();
  const generatedPorts = generatePorts();
  [generatedResourceTiles, diceValuesAndFrequencies] = insertDesertTile(generatedResourceTiles, diceValuesAndFrequencies);
  const initializedBoardGraph = initializeBoardGraph(generatedResourceTiles, diceValuesAndFrequencies, gameBoardCpy)
  const player = { id: userId, username: username, color: colorSelection }
  const devCards = generateDevCards();

  let newGame;

  const reqData = {
    'game': {
      'players': JSON.stringify([player]),
      'ports': JSON.stringify(generatedPorts),
      'currentPlayerIdx': 0,
      'ownerId': userId,
      'playerSize': 1,
      'devCards': JSON.stringify(devCards),
      'awards': JSON.stringify({
        'longestRoad': { 'username': null, 'userId': null, 'roadLength': 0 },
        'largestArmy': { 'username': null, 'userId': null, 'armySize': 0 }
      })
    }
  }


  const gameCreationReq = await fetch("http://localhost:8080/api/games", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqData)
  });

  // NOTE: could occur from an unhandled server error, server crash, or a network error
  if (gameCreationReq.status !== 200) {
    return [null, "game data not created"];
  }

  newGame = await gameCreationReq.json();
  //console.log(newGame)
  // return
  let userGameRes;
  // let userGameRes = {
  //   status: 500
  // }
  // let userGameRecordCreationReq = {
  //   status: 500
  // }

  if (newGame.status === 200) {

    ctx.onSetCurrentGame(newGame);
    ctx.onSetGameBoard(JSON.parse(newGame.boardStructures));

    const userGameRecordCreationReq = await fetch(`http://localhost:8080/api/userGames/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'userGamesUserId': userId,
        'userGamesGameId': newGame.gameId
      })
    });

    if (userGameRecordCreationReq.status !== 200) {
      userGameRes = {
        status: userGameRecordCreationReq.status
      }
    }
    else {
      userGameRes = await userGameRecordCreationReq.json();
    };
  }
  else {
    return [null, "game data not created"];
  };

  let playerData;
  // const playerData = {
  //   status: 500
  // }
  // const playerDataReq = {
  //   status: 500
  // }

  // REFACTOR NOTE: change playerInfo from a large string to 
  // individual instance variables on the backend 
  if (userGameRes.status == 200) {

    const playerDataReq = await fetch(`http://localhost:8080/api/player_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'playerInfoGameId': newGame.gameId,
        'playerInfoUserId': userId,
        'playerInfo': JSON.stringify({
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
        })
      })
    });

    if (playerDataReq.status !== 200) {
      playerData = {
        status: playerDataReq.status
      };
    }
    else {
      playerData = await playerDataReq.json();
    }
  }
  else {
    return [newGame.gameId, 'user game data not created'];
  }

  if (playerData.status !== 200) {
    return [null, 'player data not created'];
  }

  playerData.playerInfo = JSON.parse(playerData.playerInfo);
  const gameListCpy = lod.cloneDeep(ctx.gameList);
  gameListCpy.push(newGame);
  ctx.onSetPlayerData(playerData);
  ctx.onSetGameList(gameListCpy);
  return [newGame.gameId, null];
}

export const deleteGame = async (gameId) => {
  // let deleteGameReq = {
  //   status: 500
  // }
  const deleteGamereq = await fetch(`http://localhost:8080/api/games/${gameId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (deleteGamereq.status !== 200) {
    return [null, `There was a network error when attempting to delete game ${gameId}. Please try again.`]
  };

  let deleteGameRes = await deleteGamereq.json();

  if (deleteGameRes.status !== 200) {
    return [null, deleteGameRes.message];
  }

  return [deleteGameRes, null];
}

// getting a gamephse = util
export const getGamePhase = (currentGame) => {
  if (currentGame.initialGamePhase === 0 && currentGame.mainGamePhase === 0) {
    return 'PRE';
  }
  else if (currentGame.initialGamePhase === 1) {
    return 'INITIAL';
  }
  else {
    return 'MAIN';
  }
}

// creating a clone is like a helper = util
// REFACTOR NOTE: RENAME TO SOMETHING LIKE CREATE GAME CLONE
export const getGame = (currentGame) => {
  const gameCpy = lod.cloneDeep(currentGame);
  return gameCpy;
}

export const getGameBoard = async (gameId) => {
  const getGameBoardReq = await fetch(`http://localhost:8080/dumbCatan/games/${gameId}/board`);

  if (getGameBoardReq.status !== 200) {
    return [null, "There was a network or server error when trying to fetch the game board. Please try again."];
  }

  const gameBoard = await getGameBoardReq.json();

  if (gameBoard.status !== 200) {
    return [null, gameBoard.message];
  }
  const parsedGame = parseGameBoard(gameBoard);

  return [parsedGame, null];
}

// fetching substantial game data from db = game
// NOTE: trying new approach to avoid ws handler stale data issue
// -> my thinking is that if ctx is an object then it would just be the referece
// to ctx that is stale but all the data in ctx is not stale
// -> report back on this
export const getGameData = async (ctx) => {
  const updatedGameDataReq = await fetch(`http://localhost:8080/api/games/${ctx.currentGame.gameId}/data`);
  const updatedGameData = await updatedGameDataReq.json();
  updatedGameData.boardStructures = ctx.gameBoard;
  return updatedGameData;
}

// saving a game = game
export const saveGame = async (gameCpy, userWonGame, username) => {

  // REFACTOR NOTE: here and elsewhere, need to either pass the data to save or grab it
  // from state/context to save. it needs to be consistent
  if (userWonGame === true) {
    gameCpy.gameOver = 1;
    gameCpy.winnerUsername = username;
  };

  const saveGameReq = await fetch(`http://localhost:8080/api/games/${gameCpy.gameId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gameCpy)
  });

  if (saveGameReq.status !== 200) {
    return [null, "There was a network or server error when trying to save the game. Please try again."];
  };

  const saveGameRes = await saveGameReq.json();

  if (saveGameRes.status !== 200) {
    return [null, saveGameRes.message];
  }

  return [saveGameRes, null];
};

export const saveBoard = async (gameId, board) => {

  const saveBoardReq = await fetch(`http://localhost:8080/dumbCatan/games/${gameId}/board`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'gameBoard': JSON.stringify(board)
    })
  });

  if (saveBoardReq.status !== 200) {
    return [null, "There was a network or server error when trying to save the game board. Please try again."]
  }

  const savedBoardRes = await saveBoardReq.json();

  if (savedBoardRes.status !== 200) {
    return [null, savedBoardRes.message];
  }

  const parsedBoard = parseGameBoard(savedBoardRes);
  //console.log(parsedBoard.gameBoard)
  return [parsedBoard.gameBoard, null];
}

// getting board from db = game
export const getBoard = async (gameId) => {
  const getBoardReq = await fetch(`http://localhost:8080/dumbCatan/games/${gameId}/board`);

  const getBoardRes = await getBoardReq.json();

  const parsedBoard = parseGameBoard(getBoardRes.gameBoard);

  return parsedBoard;
}

// saving gameData = game
export const saveGameData = async (game, username = null, userWonGame = false) => {
  if (userWonGame === true) {
    game.gameOver = 1;
    game.winnerUsername = username;
  }
  const updateData = removeGameBoardFromGameObject(game);
  //console.log("UPDATED GAME DATA: ", updateData)
  const saveGameDataReq = await fetch(`http://localhost:8080/api/games/${game.gameId}/data`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  const saveGameDataRes = await saveGameDataReq.json();
  return saveGameDataRes;
}

// editing game board = game
export const addRoadToBoard = (startNode, endNode, color, boardManager, roadAction) => {
  let roadNumber;
  try {
    if (roadAction === 'ADD') {
      roadNumber = boardManager.addRoad(startNode, endNode, color);
      //console.log(boardManager.getGameBoard())
      return roadNumber;
    }
    if (roadAction === 'DELETE') {
      roadNumber = boardManager.deleteRoad(startNode, endNode);
      return roadNumber;
    }
  } catch (e) {
    //console.log(e.message)
    return e.message
  }
};

// editing game board = game
export const addStructureToBoard = (boardManager, structureType, playerColor, node, username, userId, isInitialGamePhase) => {

  try {
    boardManager.addStructure(structureType, playerColor, node, username, userId, isInitialGamePhase);
    return [boardManager.getGameBoard(), null];
  } catch (e) {
    return [null, e.message];
  }
}
// gameplay related = game
// FUNCTION DOES:
// - handles tracking and updating of road placement count awarded from the road building dev card
// - get to place two free roads
// 1. if it's the first road being placed, update player info to indicate that 
//    the first road has been placed - needed in case of a disconnect/reconnect
//    -> also update context with the road placement count
// 2. if 2nd road is placed then road building dev card mode is disabled and road building road counts are reset
// 3. return true if road building from dev card is complete or if road building dev card is not active 
//    and return false if road building from dev card is still active
export const roadBuildingDevCardHandler =
  // REFACTOR NOTE: if we are keeping track of road placement count in player data then 
  // don't think we need to also keep track in context too
  (
    roadBuildingDevCardActive, roadBuildingDevCardRoadCount,
    onSetRoadBuildingDevCardRoadCount,
    onSetSpecialGameMode, playerData
  ) => {

    if (!roadBuildingDevCardActive) {
      return true;
    };

    if (playerData.roadBuildingRoadCount === 1) {
      playerData.roadBuildingActive = 0;
      playerData.roadBuildingRoadCount = 0;

      onSetRoadBuildingDevCardRoadCount(0);
      onSetSpecialGameMode('roadBuilding', false);

      return true;
    }

    playerData.roadBuildingRoadCount = 1;
    onSetRoadBuildingDevCardRoadCount(() => roadBuildingDevCardRoadCount + 1);

    return false;
  };

// helper = util
// FUNCTION DOES:
// 1. if placed 1 of 2 roads from road building dev card function only clears start and end nodes array 
// 2. if road building dev card not active or 2nd road placed if dev card is active, function clears start 
//    and end nodes array AND road building mode is disabled
export const roadBuildingCleanupHelper = (onSetStartAndEndNodes, onSetRoadPlacementMode, roadBuildingModeComplete) => {
  if (!roadBuildingModeComplete === true) {
    onSetStartAndEndNodes([]);
    return
  }
  //console.log('ROAD BUILDING NOT ACTIVE - TURNING OFF ROAD PLACEMENT MODE')
  onSetStartAndEndNodes([]);
  onSetRoadPlacementMode(false);
};

// gameplay = game
// FUNCTION DOES THE FOLLOWING:
// 1. checks the current user's longest road count
// 2. if the count is less than 5 or the main game phase hasn't started or the player's longest road count is not greater 
//    than the current longest road count then no changes are made and data provided is returned
// 3. if user has the new longest road then the appropriate updates are made to player data - including potentially removing points from previous owner if applicable
// 4. updated player data(s) are returned
export const longestRoadHandler = async (playerDataCpy, currentGameCpy, boardManager, username, color, userId, gamePhase) => {

  if (gamePhase !== 'MAIN') {
    return [currentGameCpy, [playerDataCpy], false];
  };
  //console.log(boardManager.getGameBoard())
  const awardsCpy = lod.cloneDeep(currentGameCpy.awards);
  let longestRoad = awardsCpy.longestRoad.roadLength;
  let longestPlayerRoad = boardManager.getLongestRoad(username, color);
  //console.log('LONGEST PLAYER ROAD: ', longestPlayerRoad)
  //console.log("LONGEST PLAYER ROAD: ", longestPlayerRoad)

  let previousLongestRoadUserId = awardsCpy.longestRoad.userId;

  // checking to see if there is a new longest road length
  if (
    (longestPlayerRoad >= 5) && (longestPlayerRoad > longestRoad)
  ) {

    // found new longest road length:
    //--// *** OLD OWNER ***
    if (awardsCpy.longestRoad.username === username) {
      //console.log('SAME OWNER')
      awardsCpy.longestRoad.roadLength = longestPlayerRoad;
      currentGameCpy.awards = awardsCpy;
      return [currentGameCpy, [playerDataCpy], true];
    }
    else {
      // have a new owner in both the 'if' and the 'else' so add 2 points
      playerDataCpy.playerInfo.points += 2;

      // checking to see if new owner is first owner
      //--  // *** NEW OWNER - FIRST OWNER ***
      if (longestRoad === 0) {
        //console.log('FIRST OWNER')
        awardsCpy.longestRoad.roadLength = longestPlayerRoad;
        awardsCpy.longestRoad.username = username;
        awardsCpy.longestRoad.userId = userId;
        currentGameCpy.awards = awardsCpy;
        return [currentGameCpy, [playerDataCpy], true];
      }

      //--  // *** NEW OWNER - NOT FIRST OWNER ***
      else {
        //console.log('DIFFERENT OWNER')
        awardsCpy.longestRoad.roadLength = longestPlayerRoad;
        awardsCpy.longestRoad.username = username;
        awardsCpy.longestRoad.userId = userId;
        currentGameCpy.awards = awardsCpy;
        let [previousLROPlayerData, errorMessage] = await getUserData(previousLongestRoadUserId, currentGameCpy.gameId);
        if (errorMessage) {
          return [null, null, null, `There was an error when updating Longest Road data. Please try again.`];
        }
        previousLROPlayerData = previousLROPlayerData[0];
        previousLROPlayerData.playerInfo.points -= 2;
        return [currentGameCpy, [playerDataCpy, previousLROPlayerData], true];
      }
    }
  };

  //--// *** NO LONGEST ROAD ***
  //console.log('NO LONGEST ROAD FOUND')
  return [currentGameCpy, [playerDataCpy], false];
};

// gameplay = game
export const largestArmyHandler = async (playerDataCpy, currentGameCpy, username, userId) => {
  const activeKnights = playerDataCpy.playerInfo.hand.activeKnights;
  const awards = currentGameCpy.awards;
  const largestArmyAward = awards.largestArmy;

  if (activeKnights < 3) {
    // not eligible
    return [currentGameCpy, [playerDataCpy], false];
  }

  // new largest army found
  if (activeKnights > largestArmyAward.armySize) {

    // first owner 
    if (largestArmyAward.armySize === 0) {
      currentGameCpy.awards.largestArmy.username = username;
      currentGameCpy.awards.largestArmy.userId = userId;
      currentGameCpy.awards.largestArmy.armySize = activeKnights;

      playerDataCpy.playerInfo.points += 2;

      return [currentGameCpy, [playerDataCpy], true];
    }

    // same owner
    if (largestArmyAward.username === username) {

      currentGameCpy.awards.largestArmy.armySize = activeKnights;

      return [currentGameCpy, [playerDataCpy], true];
    }

    // new owner
    let previousLargestArmyOwner = await getUserData(largestArmyAward.userId, currentGameCpy.gameId);
    previousLargestArmyOwner = previousLargestArmyOwner[0];
    previousLargestArmyOwner.playerInfo.points -= 2;

    currentGameCpy.awards.largestArmy.username = username;
    currentGameCpy.awards.largestArmy.userId = userId;
    currentGameCpy.awards.largestArmy.armySize = activeKnights;

    playerDataCpy.playerInfo.points += 2;

    return [currentGameCpy, [playerDataCpy, previousLargestArmyOwner], true];
  }

  // no new largest army
  return [currentGameCpy, [playerDataCpy], false];
}

// helper = util
export const checkForWinHandler = (playerData) => {
  //console.log(playerData)
  if (playerData.playerInfo.points >= 10) {
    return true;
  }

  return false;
}

// not specific to game - it's like a helper = util
export const fetchInvites = async (userId, onSetUnavailableColors, onSetColorSelectionMap, onSetGames) => {
  // return [null, 'error'];
  const fetchInvitesReq = await fetch(`http://localhost:8080/api/invites/for/${userId}`);

  if (fetchInvitesReq.status !== 200) {
    return [null, "There was a network or server issue when trying to fetch your invites. Please try again."];
  }

  const fetchInvitesRes = await fetchInvitesReq.json();

  if (fetchInvitesRes[0].status === 404) {
    return [[], null];
  }

  if (fetchInvitesRes[0].status !== 200) {
    return [null, fetchInvitesRes[0].message];
  };

  return [fetchInvitesRes, null];
}

export const startMainGamePhase = async (ctx) => {

  ctx.onSetRoadPlacementMode(false);
  ctx.onSetStructurePlacementMode(false);

  const [updatedGame, errorMsg] = await initiateMainGamePhase(ctx.currentGame.gameId);
  if (errorMsg) {
    // ctx.onSetInfoModalMessage(errorMsg);
    // ctx.onModifyModalState('info');
    // return;
    return [null, errorMsg];
  };

  return [updatedGame, null];
}

export const updateInitialGameInstructions = async (ctx, initialGameInstructions) => {
  const initialGameInstructionsCpy = lod.cloneDeep(initialGameInstructions);
  initialGameInstructionsCpy.index += 1;

  ctx.onSetRoadPlacementMode(false);
  ctx.onSetStructurePlacementMode(false);

  const [updatedGame, saveInitialGameErrorMsg] = await saveInitialGameHandler(initialGameInstructionsCpy, ctx.currentGame.gameId);
  if (saveInitialGameErrorMsg) {
    return [null, saveInitialGameErrorMsg];
  }

  return [updatedGame, null];
}

// not specific to one game or gameplay - it's like a helper = util
export const fetchGames = async (userId) => {
  const IS_ARRAY = true;
  const fetchGamesReq = await fetch(`http://localhost:8080/api/games/for/user/${userId}`);
  // const fetchGamesReq = {
  //   status: 500
  // }

  if (fetchGamesReq.status !== 200) {
    return [null, "There was a network or server issue when trying to send this trade. Please try again."];
  };

  const fetchGamesRes = await fetchGamesReq.json();

  if (fetchGamesRes[0].status === 404) {
    return [[], null];
  };

  if (fetchGamesRes[0].status !== 200) {
    return [null, fetchGamesRes[0].message];
  };

  const parsedGames = parseGameDataInnerFields(fetchGamesRes, IS_ARRAY);

  return [parsedGames, null];
};

export const initiateMainGamePhase = async (gameId) => {
  const updateGameReq = await fetch(`http://localhost:8080/api/games/${gameId}/start_main_game`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (updateGameReq.status !== 200) {
    return [null, "There was a network or server issue when trying to send this trade. Please try again."];
  };

  const updateGameRes = await updateGameReq.json();

  if (updateGameRes.status !== 200) {
    return [null, updateGameRes.status];
  };

  const parsedGame = parseGameDataInnerFields(updateGameRes);

  return [parsedGame, null];
}

export const saveInitialGameHandler = async (initialGameInstructions, gameId) => {
  const saveInitialGameReq = await fetch(`http://localhost:8080/api/games/${gameId}/initial_placements`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'initialGameInstructions': JSON.stringify(initialGameInstructions)
    })
  })

  if (saveInitialGameReq.status !== 200) {
    return [null, "There was a network or server issue when trying to send this trade. Please try again."];
  }

  const saveInitialGameRes = await saveInitialGameReq.json();

  if (saveInitialGameRes.status !== 200) {
    return [null, saveInitialGameRes.message];
  };

  const parsedGame = parseGameDataInnerFields(saveInitialGameRes);

  return [parsedGame, null];
}

export const updateDiceRollValue = async (currentGame, diceResult) => {
  const res = await fetch(`http://localhost:8080/api/games/${currentGame.gameId}/dice_value_update/${diceResult}`, {
    'method': 'PUT',
    'Content-Type': 'application/json',
    'body': JSON.stringify({})
  });
  const updatedGame = await res.json();
  return updatedGame;
}

// fetching not editing or gameplay related = util
export const fetchGame = async (gameId) => {
  //console.log('fetching game: ', gameId)
  let fetchGameReq = await fetch(`http://localhost:8080/api/games/${gameId}`)

  if (fetchGameReq.status !== 200) {
    return [null, `A network error occurred. Please try again`];
  }

  const fetchGameRes = await fetchGameReq.json();

  if (fetchGameRes.status == 404) {
    return [null, `Game ${gameId} was not found`];
  }

  if (fetchGameRes.status == 500) {
    return [null, "A server error was encountered. Please try again."];
  }

  return [fetchGameRes, null];
}

export const sendTradeRequest = async (bodyContent) => {
  const body = JSON.stringify(
    bodyContent
  )

  // const sendTradeReq = {
  //   status: 500
  // }
  const sendTradeReq = await fetch('http://localhost:8080/api/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body
  });

  // const sendTradeReq = {
  //   status: 500
  // }

  if (sendTradeReq.status !== 200) {
    return [null, "There was a network issue when trying to send this trade. Please try again."];
  };

  const sendTradeRes = await sendTradeReq.json();

  if (sendTradeRes.status !== 200) {
    return [null, sendTradeRes.message];
  };

  return [sendTradeRes, null];
}

export const declineTradeRequest = async (tradeId) => {

  const declineTradeReq = await fetch(`http://localhost:8080/api/trade?tradeId=${tradeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (declineTradeReq.status !== 200) {
    return [null, "There was a network issue when trying to send this trade. Please try again."];
  };

  const declineTradeRes = await declineTradeReq.json();

  if (declineTradeRes.status !== 200) {
    return [null, declineTradeRes.message];
  }

  return [declineTradeRes, null];
}

// helper = utils
export const getGameDevCards = (currentGame) => {
  const parsedGameDevCards = JSON.parse(currentGame.devCards);
  return parsedGameDevCards;
}

// helper = utils
export const getGameAwards = (currentGame) => {
  if (typeof currentGame.awards === 'string') {
    currentGame.awards = JSON.parse(currentGame.awards);
    return currentGame.awards;
  }

  return currentGame.awards;
}

// helper = utils
export const getPorts = (currentGame) => {
  if (typeof currentGame.ports === 'string') {
    const parsedPorts = JSON.parse(currentGame.ports);
    return parsedPorts;
  }

  return currentGame.ports
}

// helper fetch = utils
export const fetchReceivedTradeRequests = async (ctx) => {
  //console.log('FETCHING RECEIVED TRADE REQUESTS');

  const playerList = getPlayerList(ctx.currentGame.players);
  const gameId = ctx.currentGame.gameId;
  const userId = ctx.userId;

  const receivedTradeRequestsReq = await fetch(`http://localhost:8080/api/trade/requested/to/user/${userId}/for/game/${gameId}`);

  if (receivedTradeRequestsReq.status !== 200) {
    return [null, "There was a network error when fetching received trade requests. Please try again."];
  }

  const receivedTradeRequestsRes = await receivedTradeRequestsReq.json();

  if (receivedTradeRequestsRes.status === 404) {
    return [null, null];
  }

  if (receivedTradeRequestsRes.status !== 200) {
    return [null, receivedTradeRequestsRes.message];
  }

  const { tradesSenderId } = receivedTradeRequestsRes;
  const senderUsername = getSenderUsername(tradesSenderId, playerList);

  receivedTradeRequestsRes.senderUsername = senderUsername;

  return [receivedTradeRequestsRes, null];
}

// not related to game or gameplay = utils
// FUNCTION DOES THE FOLLOWING:
// 1. Fetches trade requests that were sent by curr user and that were accepted by recipient user
// 2. Gets called during useEffect in player ui component to check for requests that were accepted when sender was not connected
export const fetchAccpetedTradeRequests = async (ctx) => {
  //console.log('FETCHING ACCEPTED TRADE REQUESTS')
  const gameId = ctx.currentGame.gameId;
  const senderId = ctx.userId
  const fetchAcceptedTradeReq = await fetch(`http://localhost:8080/api/trade/sent/by/user/${senderId}/for/game/${gameId}/accepted`);

  if (fetchAcceptedTradeReq.status !== 200) {
    return [null, "There was a network error when attempting to fetch accepted trades. Please try again."];
  }

  const fetchAcceptedTradeRes = await fetchAcceptedTradeReq.json();

  if (fetchAcceptedTradeRes.status === 404) {
    return [null, null];
  }

  if (fetchAcceptedTradeRes.status !== 200) {
    return [null, fetchAcceptedTradeRes.message];
  }

  return [fetchAcceptedTradeRes, null];
}

export const deleteTrade = async (tradeId) => {

  const deleteTradeReq = await fetch(`http://localhost:8080/api/trade?tradeId=${tradeId}`, {
    method: 'DELETE',
  });

  // if (req.status === 200) {
  //   const res = await req.json();
  //   if (res.tradeFound === false) {
  //     return null;
  //   }
  //   const {
  //     desiredResources,
  //     offeredResources,
  //     tradeId
  //   } = res;

  //   return {
  //     desiredResources,
  //     offeredResources,
  //     tradeId
  //   }
  // };
}

// involves updating player data = user
// This function does the following:
// 1. updates the trade record so that the trade status is 1
// -> this indicates to the sender that the trade was accepted so they can pull
//    the record and apply the result to their player data
export const acceptTradeRequest = async (tradeObj) => {

  const acceptTradeReq = await fetch(`http://localhost:8080/api/trade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tradeObj)
  })

  if (acceptTradeReq.status !== 200) {
    return [null, "There was a network error when attempting to accept this trade request. Please try again."];
  }

  const acceptTradeRes = await acceptTradeReq.json();

  if (acceptTradeRes.status !== 200) {
    return [null, acceptTradeRes.message];
  }

  return [acceptTradeRes, null];
}

// helper/utility = utils
export const getInitialResources = (selectedNode, tileToNodeResourceMap) => {
  const resources = {
    'hay': 0,
    'brick': 0,
    'stone': 0,
    'wood': 0,
    'sheep': 0
  };

  const map = Object.values(tileToNodeResourceMap);
  map.forEach((field, i) => {
    if (i === 10) {
      return
    }
    if (field.a) {
      const fieldANodes = field.a.nodes;
      const fieldBNodes = field.b.nodes;
      const fieldAResource = field.a.resource;
      const fieldBResource = field.b.resource;
      fieldANodes.forEach(node => {
        if (node == selectedNode) {
          resources[fieldAResource] += 1;
        }
      });
      fieldBNodes.forEach(node => {
        if (node == selectedNode) {
          resources[fieldBResource] += 1;
        }
      });
    }
    else {
      const fieldNodes = field.nodes;
      const fieldResource = field.resource;
      //console.log(field)
      fieldNodes.forEach(node => {
        if (node == selectedNode) {
          resources[fieldResource] += 1;
        }
      });
    }
  })

  //console.log(resources);
  return resources;
}

// fetching/helper = utils
export const getInitialGameInstructions = (currentGame) => {
  const parsedInitialGameInstructions = JSON.parse(currentGame.initialGameInstructions);
  return parsedInitialGameInstructions;
}

export const updateTurnPhase = async (gameId) => {
  const updateTurnPhaseReq = await fetch(`http://localhost:8080/api/games/${gameId}/turnPhase`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
  })

  if (updateTurnPhaseReq.status !== 200) {
    return [null, "There was a network or server error when attempting to move to the next turn phase. Please try again."]
  }

  const updatedGame = await updateTurnPhaseReq.json();

  if (updatedGame.status !== 200) {
    return [null, updatedGame.message];
  }

  const parsedGame = parseGameDataInnerFields(updatedGame);
  return [parsedGame, null];
}

// gameplay related = game
// DOES THE FOLLOWING:
// - occurs when a 7 is rolled
// 1. Turns on this robber placement mode which allows you to
//    place the robber on the board
// 2. when this game mode is enabled, everyone who has > 7 cards
// has to give up half their cards
// - function determines if cards need to be halved and if so
// triggers the modal that will allow you to choose the cards to
// return to the bank
export const startRobberModeHandler = (ctx, wasRoller, OSCP, totalCards) => {
  if (wasRoller) {
    ctx.onSetSpecialGameMode('robber', true);
  }

  if (OSCP) {
    scrollToHalfHeight(window);
    let cardsToReturn = Math.floor(totalCards / 2);
    ctx.onSetTradeModalData({
      'numberOfCardsToReturn': cardsToReturn,
      'submissionHandler': saveUserData
    })
    ctx.onModifyModalState('overSevenCardPenalty');
  }
}

// fetching/calculating/formatting = utils
// FUNCTION DOES THE FOLLOWING:
// 1. updates the theif's hand to add the stolen resouce
// 2. updates the victim's hand to subtract the stolen resource
export const stealResources = (targetPlayer, playerDataCpy, validResources) => {
  const targetPlayerDataCpy = lod.cloneDeep(targetPlayer);

  let targetPlayerResourceCards = targetPlayerDataCpy.playerInfo.hand['resource_cards'];
  let userResourceCards = playerDataCpy.playerInfo.hand['resource_cards'];
  const i = Math.floor(Math.random() * (validResources.length));
  const selectedResource = validResources[i];

  targetPlayerResourceCards[selectedResource] -= 1;
  userResourceCards[selectedResource] += 1;

  return [[targetPlayerDataCpy, playerDataCpy], selectedResource];
}

// REFACTOR NOTE: try to reduce redundancy if possible.
// -> consider making some helper functions to be used inside of this 
//    function
// There are two sets and two loops, etc.
// gameplay related = game
export const robberHandler = async (value, distinction, gameBoard, ctx) => {
  // ------------------------------------------------------------------
  // - this function handles the process of placing robber and 
  // stealing resources
  // - a variety of outcomes can occur:
  // 1. the tile contains no players
  // 2. the tile contains only one player
  // 3. the tile contains multiple players
  // 4. regardless of the number of players, one or all of the players
  // might not have any resources to steal
  // - if there are multiple players with available resources, then a
  // modal will be triggered giving the player the ability to select who
  // they would like to steal from
  // - if there is only one player a modal is not needed and a random
  // resource will be stolen
  // - if there are no players (affected users) or no players who
  // have resources (valid users) then only the board will be
  // updated with the new robber location
  // ------------------------------------------------------------------
  if (!ctx.robberPlacementMode) {
    return
  }

  const playerDataCpy = lod.cloneDeep(ctx.playerData);
  playerDataCpy.placingRobber = 0;

  const boardManager = new BoardManager(lod.cloneDeep(gameBoard));

  let affectedUsers = [];
  let queryString = '';
  let affectedUsersSet = new Set();

  let validUsers = [];
  let validUserResources = [];
  let validUsersSet = new Set();

  const [updatedGameBoard, affectedNodes] = boardManager.addRobber(value, distinction);
  if (updatedGameBoard === null) {
    return
  }

  // NOTE: gathering usernames and ids of all users attached to the tile that has the robber on it - will then 
  // fetch their player data to determine if they have resources to steal
  // this type of user is called an "affected user"
  affectedNodes.forEach(node => {
    if (updatedGameBoard[node].username && updatedGameBoard[node].username !== ctx.username) {
      if (!affectedUsersSet.has(updatedGameBoard[node].username)) {
        affectedUsers.push({ 'username': updatedGameBoard[node].username, 'userId': updatedGameBoard[node].userId });
        affectedUsersSet.add(updatedGameBoard[node].username)
      }
    }
  })


  // NOTE: constructing query string that will be used to fetch all affected users
  if (affectedUsers.length > 0) {

    affectedUsers.forEach((user) => {
      if (queryString === '') {
        queryString = `${user.userId}`;
      }
      else {
        queryString = queryString + `,${user.userId}`;
      }
    });

    // NOTE: fetching all affected users to determine if there are valid users among them
    // NOTE: *valid users are affected users who have resource cards*
    const req = await fetch(`http://localhost:8080/api/player_info?gameId=${ctx.currentGame.gameId}&userIds=${queryString}`, {
      headers: {
        'ContentType': 'application/json'
      }
    })

    // NOTE: serching for valid users
    if (req.status === 200) {
      const players = await req.json();
      players.forEach((player, i) => {

        let validResources = [];
        const parsedPlayerInfo = JSON.parse(player.playerInfo);
        player.playerInfo = parsedPlayerInfo;
        const playerResourceTypes = Object.keys(parsedPlayerInfo.hand['resource_cards']);

        for (let j = 0; j < playerResourceTypes.length; j++) {
          let resourceType = playerResourceTypes[j];
          let resourceAmount = parsedPlayerInfo.hand['resource_cards'][resourceType];

          if (resourceAmount > 0) {
            if (validUsersSet.has(player.playerInfo.id)) {
              validResources.push(resourceType);
            }
            else {
              validUsersSet.add(player.playerInfo.id);
              validResources.push(resourceType);
              validUsers.push(player);
            }
          }
        }
        if (validResources.length > 0) {
          validUserResources.push(validResources);
        }
      })
    }

    // NOTE: there were affected users and multiple valid users - need to open modal to choose who to steal from
    if (validUsers.length > 1) {
      const modalData = {
        'validUsers': validUsers,
        'validUserResources': validUserResources,
        'stealResourcesHandler': stealResources,
        'gameBoard': updatedGameBoard
      }
      ctx.onSetTradeModalData(modalData);
      ctx.onModifyModalState('resourceStealing');
      return
    }

    // NOTE: there were affected users and only 1 valid user
    // NOTE: change made to two player's data (stolen resources and placingRobber = 0 for curr user) and change made to the board state
    else if (validUsers.length === 1) {
      let targetPlayerId;
      let targetUsername;
      const [updatedPlayerDatas, stolenResource] = stealResources(validUsers[0], playerDataCpy, validUserResources[0]);
      updatedPlayerDatas.forEach((player, i) => {
        if (player.playerInfoUserId !== ctx.userId) {
          targetPlayerId = player.playerInfoUserId;
          targetUsername = player.playerInfo.username;
        }
      });

      //console.log('Stealing from: ' + targetPlayerId, targetUsername, stolenResource);
      const [responseData, robberPlacementTransactionalErrorMsg] = await robberPlacementTransactional(updatedPlayerDatas, boardManager.getGameBoard(), ctx.userId, ctx.currentGame.gameId);
      if (robberPlacementTransactionalErrorMsg) {
        ctx.onSetInfoModalTextColor('black');
        ctx.onSetInfoModalMessage(robberPlacementTransactionalErrorMsg);
        ctx.onModifyModalState('info');
        return
      }

      const savedPlayerData = responseData.playerInfo;
      const savedBoard = responseData.gameBoard;
      ctx.onSetPlayerData(savedPlayerData);
      ctx.onSetGameBoard(savedBoard.gameBoard);

      ctx.onSetStolenResourceUpdateData({ 'senderUsername': ctx.playerData.playerInfo.username, 'targetUsername': targetUsername, 'resourceType': stolenResource, 'resourceAmount': 1, 'target': false });

      ctx.onSetRobberPlaced(true);
      ctx.onSetRobberPlacementMode(false);

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
      // REFACTOR NOTE: consider using a different ws request - something indicating a user update. looks like something changed for the game data but only user data was changed - game id is needed but this is a user data change
      ctx.stompClient.send(`/ws/user/${targetPlayerId}/dataUpdate/for/game/${ctx.currentGame.gameId}`, {}, JSON.stringify({ senderId: ctx.userId, gameId: ctx.currentGame.gameId, stolenResources: { 'senderUsername': ctx.playerData.playerInfo.username, 'targetUsername': targetUsername, 'resourceType': stolenResource, 'resourceAmount': 1 } }));

      ctx.onModifyModalState('stolenResourceUpdate');
      return
    }

    // NOTE: There were affected users but no valid users
    // NOTE: change made to player data (placingRobber = 0) and change made to game board (robber placement)
    else {
      const [responseData, robberPlacementTransactionalErrorMsg] = await robberPlacementTransactional([playerDataCpy], boardManager.getGameBoard(), ctx.userId, ctx.currentGame.gameId);
      if (robberPlacementTransactionalErrorMsg) {
        ctx.onSetInfoModalTextColor('black');
        ctx.onSetInfoModalMessage(robberPlacementTransactionalErrorMsg);
        ctx.onModifyModalState('info');
        return
      }

      const savedPlayerData = responseData.playerInfo;
      const savedBoard = responseData.gameBoard;
      ctx.onSetPlayerData(savedPlayerData);
      ctx.onSetGameBoard(savedBoard.gameBoard);

      ctx.onSetRobberPlaced(true);
      ctx.onSetRobberPlacementMode(false);

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
    }
    return
  }
  // NOTE: there were no affected users and therefore also no valid users
  // NOTE: change made to player data (placingRobber = 0) and change made to game board (robber placement)
  const [responseData, robberPlacementTransactionalErrorMsg] = await robberPlacementTransactional([playerDataCpy], boardManager.getGameBoard(), ctx.userId, ctx.currentGame.gameId);
  if (robberPlacementTransactionalErrorMsg) {
    ctx.onSetInfoModalTextColor('black');
    ctx.onSetInfoModalMessage(robberPlacementTransactionalErrorMsg);
    ctx.onModifyModalState('info');
    return
  }
  //console.log(responseData)
  const savedPlayerData = responseData.playerInfo;
  const savedBoard = responseData.gameBoard;
  ctx.onSetPlayerData(savedPlayerData);
  ctx.onSetGameBoard(savedBoard.gameBoard);

  ctx.onSetRobberPlaced(true);
  ctx.onSetRobberPlacementMode(false);

  ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
}

// REFACTOR NOTE: rename with a more general name
// REFACTOR NOTE: there's some code duplication - can probably refactor such that the duplicated code can be used just once at the end
// after the structure specific operations have occurred
// -> could do an if...else to do a structure specific player data and game board update, then have one big transactional
//    for saving player data, game, and game board at the end
export const submitStructureHandler = async (node, ctx) => {
  const structureType = ctx.structureType;
  const gamePhase = getGamePhase(ctx.currentGame);

  // SETTLEMENT/CITY PLACEMENT HANDLER: 

  if (ctx.structurePlacementMode) {
    const currentGameCpy = lod.cloneDeep(ctx.currentGame);
    const gameBoardCpy = lod.cloneDeep(ctx.gameBoard);
    const playerDataCpy = lod.cloneDeep(ctx.playerData);
    const boardManager = new BoardManager(gameBoardCpy);

    let updatedPlayerData = buyStructureAndAddToPlayerData(playerDataCpy, node, gamePhase, structureType);

    //console.log(updatedPlayerData)
    // return

    if (gamePhase === 'INITIAL') {
      const initialResources = getInitialResources(node, gameBoardCpy.tiles);
      updatedPlayerData = allocateInitialResources(updatedPlayerData, initialResources);
    };

    const [updatedBoard, errorMessage] = addStructureToBoard(boardManager, structureType, ctx.playerData.playerInfo.color, node, ctx.username, ctx.userId, gamePhase === 'INITIAL');
    if (errorMessage) {
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
      return
    };

    const userWonGame = checkForWinHandler(updatedPlayerData);

    // NOTE: in all cases need to save user data due to structure purchase/placement
    const [savedPlayerData, saveUserDataErrorMessage] = await saveUserData([updatedPlayerData], ctx.userId);

    if (saveUserDataErrorMessage) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(saveUserDataErrorMessage);
      ctx.onModifyModalState('info');
      return
    };

    if (userWonGame) {
      // NOTE: need to save the game board due to structure placement AND need to save game due to the game being won - using transactional
      const [responseData, saveGameAndBoardErrorMessage] = await saveGameAndBoardTransactional(currentGameCpy, updatedBoard, userWonGame, ctx.username, ctx.userId);
      //console.log(responseData)
      if (saveGameAndBoardErrorMessage) {
        ctx.onSetRecoveryModalData({
          type: 'saveGame_WonGame',
          recoveryFunctions: [saveGameAndBoardTransactional],
          recoveryFunctionArgs: [
            [
              currentGameCpy,
              updatedBoard,
              userWonGame,
              ctx.username
            ],
            savedPlayerData
          ],
          message: errorMessage,
          textColor: 'black'
        });

        ctx.onModifyModalState('recovery');

        return
      };

      ctx.onSetWinnerUsername(ctx.username);
      ctx.onSetCurrentGame(responseData.savedGame);
      ctx.onSetGameBoard(responseData.savedBoard);
      ctx.onSetPlayerData(savedPlayerData);
      ctx.onSetStructurePlacementMode(false);
      ctx.onModifyModalState('gameOver');

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));

      return
    };

    // no winner = only game board needs to be saved due to structure placement
    const [savedBoard, savedBoardErrorMsg] = await saveBoard(ctx.currentGame.gameId, gameBoardCpy);
    if (savedBoardErrorMsg) {
      ctx.onSetRecoveryModalData({
        type: 'saveGameBoard',
        recoveryFunctions: [saveBoard],
        recoveryFunctionArgs: [
          [
            ctx.currentGame.gameId,
            gameBoardCpy
          ],
          savedPlayerData
        ],
        message: errorMessage,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    }
    //console.log(savedPlayerData)
    //console.log(savedBoard)
    ctx.onSetPlayerData(savedPlayerData);
    ctx.onSetGameBoard(savedBoard);
    ctx.onSetStructurePlacementMode(false);

    ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));
  }

  // ROAD PLACEMENT HANDLER: 

  if (ctx.roadPlacementMode) {

    if (ctx.startAndEndNodes.length === 1) {

      const currentGameCpy = lod.cloneDeep(ctx.currentGame);
      const playerDataCpy = lod.cloneDeep(ctx.playerData);
      const gameBoardCpy = lod.cloneDeep(ctx.gameBoard);
      const boardManager = new BoardManager(gameBoardCpy);

      const placedRoadNumber = addRoadToBoard(ctx.startAndEndNodes[0], node, ctx.playerData.playerInfo.color, boardManager, ctx.roadAction);
      if (typeof placedRoadNumber === 'string') {
        ctx.onSetInfoModalMessage(placedRoadNumber);
        ctx.onModifyModalState('info');
        ctx.onSetStartAndEndNodes([]);
        return
      }

      const playerDataWithRoadPurchased = buyRoadAndAddToPlayerData(playerDataCpy, placedRoadNumber, ctx.roadAction, ctx.onSetRoadAction, ctx.roadBuilding, getGamePhase(currentGameCpy));

      // NOTE: updatedPlayerData here may have two player data objects if there was a previous owner who is being replaced with a new owner
      // NOTE: player data and game can potentially be updated here
      const [updatedCurrentGame, updatedPlayerData, LRfound, errorMessage] = await longestRoadHandler(playerDataWithRoadPurchased, currentGameCpy, boardManager, ctx.username, ctx.playerData.playerInfo.color, ctx.userId, getGamePhase(currentGameCpy));
      if (errorMessage) {
        ctx.onSetInfoModalMessage(errorMessage);
        ctx.onSetInfoModalTextColor('black');
        ctx.onModifyModalState('info');
        ctx.onSetStartAndEndNodes([]);
        return
      };

      const [savedPlayerData, saveUserDataErrorMessage] = await saveUserData(updatedPlayerData, ctx.userId);
      if (saveUserDataErrorMessage) {
        ctx.onSetInfoModalTextColor('black');
        ctx.onSetInfoModalMessage(saveUserDataErrorMessage);
        ctx.onModifyModalState('info');
        return
      };

      // REFACTOR NOTE: there is a road building mode and then a special road building mode for the dev card
      // -> the special one indicates that road building mode should remain on until 2 roads are placed and so is needed
      // -> should rename the special mode however b/c it makes it seem like there are two duplicate states 
      const roadBuildingDevCardComplete = roadBuildingDevCardHandler(ctx.roadBuilding, ctx.roadBuildingDevCardRoadCount, ctx.onSetRoadBuildingDevCardRoadCount, ctx.onSetSpecialGameMode, savedPlayerData);
      roadBuildingCleanupHelper(ctx.onSetStartAndEndNodes, ctx.onSetRoadPlacementMode, roadBuildingDevCardComplete);

      const userWonGame = checkForWinHandler(savedPlayerData);

      if (userWonGame || LRfound) {
        // NOTE: need to save the game board due to road placement AND need to save game due to the game being won and/or longest road update - using transactional
        const [responseData, saveGameAndBoardErrorMessage] = await saveGameAndBoardTransactional(updatedCurrentGame, gameBoardCpy, userWonGame, ctx.username, ctx.userId);
        
        if (saveGameAndBoardErrorMessage) {
          ctx.onSetRecoveryModalData({
            type: 'saveGame_WonGame',
            recoveryFunctions: [saveGameAndBoardTransactional],
            recoveryFunctionArgs: [
              [
                currentGameCpy,
                gameBoardCpy,
                userWonGame,
                ctx.username
              ],
              savedPlayerData
            ],
            message: errorMessage,
            textColor: 'black'
          });

          ctx.onModifyModalState('recovery');

          return;
        };

        ctx.onSetCurrentGame(responseData.savedGame);
        ctx.onSetGameBoard(responseData.savedBoard);
        ctx.onSetPlayerData(savedPlayerData);

        if (userWonGame) {
          ctx.onSetWinnerUsername(ctx.username);
          ctx.onModifyModalState('gameOver');
        }

        await ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));
        await ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));

        return
      }

      // no LR and no game over = only need to save game board due to road placement
      const [savedBoard, savedBoardErrorMsg] = await saveBoard(ctx.currentGame.gameId, gameBoardCpy);
      if (savedBoardErrorMsg) {

        ctx.onSetRecoveryModalData({
          type: 'saveGameBoard',
          recoveryFunctions: [saveBoard],
          recoveryFunctionArgs: [
            [
              ctx.currentGame.gameId,
              gameBoardCpy
            ],
            savedPlayerData
          ],
          message: errorMessage,
          textColor: 'black'
        });

        ctx.onModifyModalState('recovery');

        return
      };
      //console.log('BOARD SAVED')
      //console.log(savedBoard)
      //console.log('PLAYER DATA SAVED')
      //console.log(savedPlayerData)
      ctx.onSetPlayerData(savedPlayerData);
      ctx.onSetGameBoard(savedBoard);

      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/gameBoard/update`, {}, JSON.stringify({ senderId: ctx.userId }));

      return
    };

    // Selected starting node for road placement - adding the starting node location:
    let startAndEndNodesCpy = [...ctx.startAndEndNodes];
    startAndEndNodesCpy.push(node);
    ctx.onSetStartAndEndNodes(startAndEndNodesCpy);
  };
};
