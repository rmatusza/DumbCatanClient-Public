import { applyAcceptedTradeResultToPlayerData, parsePlayerInfoField, stringifyPlayerInfoField } from "./utilFunctions";
const lod = require('lodash');

// FILE CRITERIA:
// functions that are focused on anything user data related

// ex. saving user data, editing user data
// getting user data can be put here instead of utils since it's so specific to users

// update the name to fetchuserdata so we know we are making an http request
// FETCHING USER DATA SPECIFICALLY = USER FUNCTION
// FUNCTION DOES THE FOLLOWING:
// 1. fetches all player info records for the given gameId
// 2. if isOnePlayer is set to true then function extracts object 
//    in returned array from server, parses it, and returns it to caller
// 3. if removeCurrUser is set to true, this allows this function to fetch all users, remove the curr 
//    user and return the resulting array to the caller - effectively this fetches all OTHER users' data
export const getUserData = async (userIds, gameId, fetchingOnlyOnePlayer=false, removeCurrUserFromResult=false, currUserId) => {
  // return [null, 'error']
  const getUserDataReq = await fetch(`http://localhost:8080/api/player_info?gameId=${gameId}&userIds=${userIds}`);

  if (getUserDataReq.status !== 200) {
    return [null, "A network error was encountered. Please try again."];
  };

  const returnedPlayerData = await getUserDataReq.json();

  if (returnedPlayerData[0].status == 404) {
    return [[], "No users were found with the provided user ids. Please try again"];
  }

  if (returnedPlayerData[0].status == 500) {
    return [null, "A server error was encountered. Please try again."];
  }

  const parsedPlayerData = parsePlayerInfoField(fetchingOnlyOnePlayer ? returnedPlayerData[0] : returnedPlayerData, fetchingOnlyOnePlayer);
  
  if(!fetchingOnlyOnePlayer && removeCurrUserFromResult === true){
    parsedPlayerData.forEach((playerData, i) => {
      if(playerData.playerInfoUserId === currUserId){
        parsedPlayerData.splice(i, 1);
      }
    });
  };

  return [parsedPlayerData, null];
}

export const logoutUser = async (username) => {
  const req = await fetch(`http://localhost:8080/api/logout/${username}`, {
    method: 'PUT'
  });
  const res = req.json();
  return res;
}

// editing user data = user
export const saveUserData = async (playerDataArr, playerId) => {
  // let this function handle the parsing and stringifying
  // -> playerInfo needs to be a js object (NOT stringified)
  const formattedPlayerInfoArr = stringifyPlayerInfoField(playerDataArr);
  //console.log(formattedPlayerInfoArr)
  // return
  const updateUserDataReq = await fetch(`http://localhost:8080/api/player_info/${playerId}/bulk_update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formattedPlayerInfoArr)
  });

  if (updateUserDataReq.status !== 200) {
    return [null, "There was a network error when trying to update data after dice roll. Please ensure that you have an internet connection and try again."]
  };

  const updatedUserDataRes = await updateUserDataReq.json();

  if (updatedUserDataRes.status !== 200) {
    return [null, updatedUserDataRes.message];
  };

  const ONLY_PARSING_ONE_OBJECT = true;

  const parsedPlayerData = parsePlayerInfoField(updatedUserDataRes, ONLY_PARSING_ONE_OBJECT);
  return [parsedPlayerData, null];
}

// modifying user data = user function
export const buyRoadAndAddToPlayerData = (playerDataCpy, roadNumber, roadAction, setRoadAction, roadBuildingActive, gamePhase) => {
  //console.log(playerDataCpy)
  if (roadAction === 'DELETE') {
    let updatedPlayerRoads = playerDataCpy.playerInfo.structures.roads;
    updatedPlayerRoads.forEach((road, i) => {
      if (road === null) {
        updatedPlayerRoads.splice(i, 1)
      }
      if (road === roadNumber) {
        updatedPlayerRoads.splice(i, 1);
      }
    })
    setRoadAction('ADD');
    playerDataCpy.playerInfo.structures.roads = updatedPlayerRoads;
    //console.log(playerDataCpy)
    return playerDataCpy;
  }

  let resources = playerDataCpy.playerInfo.hand['resource_cards'];
  playerDataCpy.playerInfo.structures.roads.push(roadNumber);

  // NOTE: roadBuildingActive indicates that roadBuilding dev card was played
  // -> update name to distinguish better
  if (!roadBuildingActive && gamePhase !== 'INITIAL') {
    resources['brick'] -= 1;
    resources['wood'] -= 1;
  }

  return playerDataCpy;
};

// editing user data = user
export const addOverSevenCardPenaltyField = async (playerIds, gameId) => {
  let queryString = null;
  playerIds.forEach(id => {
    if (queryString === null) {
      queryString = id;
    } else {
      queryString += `,${id}`
    }
  })
  await fetch(`http://localhost:8080/api/player_info/over-seven-card-penalty/add?gameId=${gameId}&userIds=${queryString}`, {
    method: 'PUT'
  })
}

// editing user data = user
export const removeOverSevenCardPenaltyField = async (playerIds, gameId) => {
  let queryString = null;
  playerIds.forEach(id => {
    if (queryString === null) {
      queryString = id;
    } else {
      queryString += `,${id}`
    }
  })
  await fetch(`http://localhost:8080/api/player_info/over-seven-card-penalty/remove?gameId=${gameId}&userIds=${queryString}`, {
    method: 'PUT'
  })
}

// NOTE: Think that this function might be redundant b/c player data is already stored in context
// its only utility is that it creates a copy and ensures that playerInfo is parsed
// NOTE: change the name because it sounds like we are fetching the data
// fetching/helper = utils
export const getPlayerData = (playerData) => {
  const playerDataCpy = JSON.parse(JSON.stringify(playerData))
  if (typeof playerDataCpy.playerInfo === 'string') {
    playerDataCpy.playerInfo = JSON.parse(playerData.playerInfo);
    return playerDataCpy;
  }
  return playerDataCpy;
}

// fetcing/helper = utils
export const getPlayerDevCardsCopy = (playerData, caller) => {
  //console.log(caller);
  // THE STANDARD FOR THIS APP IS THAT PLAYER DATA SHOULD BE PASSED IN
  // PARSED FORM
  return lod.cloneDeep(playerData.playerInfo.hand['dev_cards']);
}

// fetcing/helper = utils
export const getLockedPlayerDevCardsCopy = (playerData) => {
  // THE STANDARD FOR THIS APP IS THAT PLAYER DATA SHOULD BE PASSED IN
  // PARSED FORM

  // const parsedPlayerData = getPlayerData(playerData);
  return lod.cloneDeep(playerData.playerInfo.hand['locked_dev_cards']);
}

export const generatePlayerInfoData = async (gameId, username, userId, colorSelection) => {

  let playerDataRes;
  // const playerDataRes = {
  //   status: 500,
  //   message: "PlayerInfo record not found"
  // }

  const playerDataReq = await fetch(`http://localhost:8080/api/player_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'playerInfoGameId': gameId,
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

  // const playerDataReq = {
  //   status: 500,
  // }

  if (playerDataReq.status !== 200) {
    return [null, "A network or server error has occurred. Please try again"];
  }

  // in the event of a successful request but missing record, failed db operation, etc.
  playerDataRes = await playerDataReq.json();
  //console.log(playerDataRes)
  
  if (playerDataRes.status !== 200) {
    return [null, playerDataRes.message];
  }

  const parsedPlayerData = parsePlayerInfoField(playerDataRes, true);

  return [parsedPlayerData, null];
};

export const updateWinCount = (userId) => {
  fetch(`http://localhost:8080/api/users/${userId}/addWin`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const updateLossCount = (userId) => {
  fetch(`http://localhost:8080/api/users/${userId}/addLoss`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// editing user data = user
export const allocateInitialResources = (playerData, initialResources) => {
  let logData = {};
  logData.gainedResources = JSON.stringify(initialResources);
  logData.playerDataBefore = JSON.stringify(playerData.playerInfo.hand['resource_cards']);
  const playerDataCpy = lod.cloneDeep(playerData);
  const initialResourceTypes = Object.keys(initialResources);
  initialResourceTypes.forEach(resourceType => {
    const playerHand = playerDataCpy.playerInfo.hand['resource_cards'];
    const resourceAmount = initialResources[resourceType];
    playerHand[resourceType] += resourceAmount;
  })
  logData.playerDataAfter = JSON.stringify(playerDataCpy.playerInfo.hand['resource_cards']);

  // fetch('http://localhost:8080/api/logging/resources', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(logData)
  // })
  return playerDataCpy;
}

// REFACTOR NOTE: NEED TO MAKE THE  CALL TO ALLOCATE INITIAL RESOURCES SEPARATE FROM THIS FUNCTION CALL
// editing user data = user
// FUNCTION DOES:
// 1. adds structure to player data
// 2. increments the user's points
// 3. if it's not the initial game phase then user 
//    also pays required resources for structure
export const buyStructureAndAddToPlayerData = (playerDataCpy, node, gamePhase, structureType) => {
  let resources = playerDataCpy.playerInfo.hand['resource_cards'];
  let structureCategory = structureType === 'settlement' ? 'settlements' : 'cities';
  
  playerDataCpy.playerInfo.structures[structureCategory].push(node);
  playerDataCpy.playerInfo.points += 1;

  if (gamePhase === 'INITIAL') {
    return playerDataCpy;
  }

  if (structureType === 'settlement') {
    resources['hay'] -= 1;
    resources['brick'] -= 1;
    resources['sheep'] -= 1;
    resources['wood'] -= 1;
  }

  if (structureType === 'city') {
    resources['hay'] -= 2;
    resources['stone'] -= 3
    const playerSettlements = playerDataCpy.playerInfo.structures.settlements
    const idx = playerSettlements.indexOf(node);
    playerDataCpy.playerInfo.structures.settlements.splice(idx, 1);
  }

  return playerDataCpy;
};

// editing user data = user
export const allocateResourcesToPlayerData = (playerData, gainedResources) => {
  const playerResources = playerData.playerInfo.hand['resource_cards'];

  Object.keys(gainedResources).forEach(resource => {
    const gainedResourceAmount = gainedResources[resource];
    if (gainedResourceAmount > 0) {
      playerResources[resource] += gainedResourceAmount;
    }
  })
 
  return playerData;
}

// editing user data = user
export const editResourceCards = async (playerData, resources, onSetPlayerData) => {
  //console.log(playerData)
  let playerDataCpy = lod.cloneDeep(playerData);
  let resourceKeys = Object.keys(resources);
  let resourceCards = playerDataCpy.playerInfo.hand['resource_cards'];
  resourceKeys.forEach(resource => {
    let resourceAmount = resources[resource];
    resourceCards[resource] = resourceAmount;
  })
  const updatedUserData = await saveUserData([playerDataCpy], playerDataCpy.playerInfoUserId);
  onSetPlayerData(updatedUserData[0]);
}

// editing user data = user
export const editDevCards = async (playerData, desiredDevCardDataObj, onSetPlayerData) => {
  let playerDataCpy = lod.cloneDeep(playerData);

  let desiredDevCards = Object.keys(desiredDevCardDataObj);

  desiredDevCards.forEach(devCardType => {
    let devCardAmount = desiredDevCardDataObj[devCardType];
    playerDataCpy.playerInfo.hand['dev_cards'][devCardType] = devCardAmount;
  })
  const [updatedUserData, errorMsg] = await saveUserData([playerDataCpy], playerDataCpy.playerInfoUserId);
  onSetPlayerData(updatedUserData);
}

// editing user data = user
export const editPoints = async (playerData, points, onSetPlayerData) => {
  let playerDataCpy = lod.cloneDeep(playerData);
  playerDataCpy.playerInfo.points = points;
  const updatedUserData = await saveUserData([playerDataCpy], playerDataCpy.playerInfoUserId);
  onSetPlayerData(updatedUserData);
}
