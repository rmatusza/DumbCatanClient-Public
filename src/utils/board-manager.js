import nodeToRoadMap from "./node-to-road-map";
const lod = require('lodash');

class BoardManager {

  constructor(gameBoard) {
    this.gameBoard = gameBoard;
  }

  getGameBoard = function () { return this.gameBoard }
  setGameBoard = function (gameBoard) { this.gameBoard = gameBoard };

  // will need to generate a JSON version of this graph and push it to db by the person
  // who creates a game session, then others will obtain this graph object from db, transform
  // it to a POJO and then pass it to BoardManager constructor for duration of game.

  // when logged off and upon login we retreive object from db and instantiate once more

  // this object is used to update the UI

  // if person A makes a change, request is made with websockets and person B receives
  // the nodes that changed along with the changes that were made so that the changes can be
  // made locally instead of having to pull down the whole object and parse it, etc.

  checkStructurePlacementValidity__Initial = function () {
    let targetNode = this.gameBoard.location;
    let targetNodeNeighbors = targetNode.neighbors;

    let isValidPlacement = true

    for (let i = 0; i < targetNodeNeighbors.length; i++) {
      let currentNeighbor = targetNodeNeighbors[i];

      if (currentNeighbor.structure) {
        isValidPlacement = false;
      }
    }

    return isValidPlacement;
  }

  checkStructurePlacementValidity = function (location, playerColor) {
    let targetNode = this.gameBoard[location];
    let targetNodeNeighbors = targetNode.neighbors;
    let targetNodeRoads = targetNode['road_slots'];


    let isValidPlacement = true
    let roadCounter = 0

    for (let i = 0; i < targetNodeRoads.length; i++) {
      let roadEndLocation = targetNodeRoads[i]['connecting_node'];
      let roadColor = targetNodeRoads[i]['color'];

      if (roadEndLocation && roadColor === playerColor) {
        let newCurrentNode = this.gameBoard[roadEndLocation];
        let newCurrentNodeRoads = newCurrentNode['road_slots'];


        for (let j = 0; j < newCurrentNodeRoads.length; j++) {
          let roadEndLocation = newCurrentNodeRoads[i]['connecting_node'];
          let roadColor = newCurrentNodeRoads[i]['color'];

          if (roadEndLocation && roadColor === playerColor) {
            roadCounter++;
            break;
          }
        }
      }
    }

    if (roadCounter < 2) {
      isValidPlacement = false;
      return
    }

    for (let i = 0; i < targetNodeNeighbors.length; i++) {
      let currentNeighbor = targetNodeNeighbors[i];

      if (currentNeighbor.structure) {
        isValidPlacement = false;
      }
    }

    return isValidPlacement;
  }


  checkRoadPlacementValidity = function (location, color) {

  }

  // 1. can't add settlement if there is another settlement in adjacent
  // node regardless of its color -- DONE
  // 2. can't add settlement to a node that does not have at least 2 consecutive
  // roads attached to it -- DONE
  // 3. can't add a city if there's not a settlement of the same color at 
  // the given node -- DONE
  // 4. can't place a settlement where there is already a settlement -- DONE
  // 5. can't place a city where there is already a city -- DONE

  addStructure = function (structureType, color, location, username, userId, initialPlacement) {
    let node = this.gameBoard[location];
    let areTwoConsectiveRoads = false;

    // check that there is not an adjacent neighbor - city or settlement
    for (let i = 0; i < node.neighbors.length; i++) {
      //console.log(node.neighbors)
      let neighborNode = this.gameBoard[node.neighbors[i]];
      if (neighborNode.structure !== "") {
        const invalidSettlementPlacement = new Error("Illegal move: can't place a settlement where there is an adjacent city or settlement");
        throw invalidSettlementPlacement;
      }
    }

    // check that there is not already a structure in the spot where you are trying to build
    if (structureType === 'settlement' && node.structure !== '') {
      const invalidSettlementPlacement = new Error("Illegal move: there is already a settlement or city at this node");
      throw invalidSettlementPlacement;
    }

    if(initialPlacement){
      node.root = true;
      node.structure = 'settlement';
      node.color = color;
      node.username = username;
      node.userId = userId
      return
    }

    // verify city placement
    // 1. can't place city where there's already a city
    // 2. can't place city where there's not a settlement 
    // 3. can't upgrade someone else's settlement to a city

    if (structureType === 'city' && node.structure === 'city') {
      const invalidCityPlacement = new Error("Illegal move: there is already a city at this node");
      throw invalidCityPlacement;
    }

    if (structureType === 'city' && node.structure === "") {
      const invalidCityPlacement = new Error("Illegal move: you can only place a city where there is a settlment");
      throw invalidCityPlacement;
    }

    if (structureType === 'city' && node.color !== color) {
      const invalidCityPlacement = new Error("Illegal move: city must be the same color as the settlement");
      throw invalidCityPlacement;
    }

    if (structureType === 'city') {
      node.structure = 'city';
      return
    }

    // check for two consecutive roads for settlement placement

    let currentNodeRoadSlotsCopy = [...node['road_slots']];

    while (currentNodeRoadSlotsCopy.length > 0) {
      let roadSlot = currentNodeRoadSlotsCopy.pop();
      let connectingNode = roadSlot['connecting_node'];
      let roadColor = roadSlot['color'];

      if (connectingNode === null || roadColor !== color) {
        continue;
      }

      let connectedNode = this.gameBoard[connectingNode];

      let connectedNodeRoadSlotsCopy = [...connectedNode['road_slots']]

      while (connectedNodeRoadSlotsCopy.length > 0) {
        let roadSlot = connectedNodeRoadSlotsCopy.pop();
        let connectingNode = roadSlot['connecting_node'];
        let roadColor = roadSlot['color'];

        if (connectingNode === null || roadColor !== color) {
          continue;
        }

        areTwoConsectiveRoads = true;

        node.structure = 'settlement';
        node.color = color;
        node.username = username;
        node.userId = userId
        return
      }
    }

    const invalidSettlementPlacement = new Error("Illegal move: a settlement must be connected to two consecutive roads which must also be of the same color as the settlement");
    throw invalidSettlementPlacement;
  }

  // 1. can't add a road where there is no structure - DONE
  // 2. can't add a road to a structure of a different color - DONE
  // 3. can't add a road to a road to a different color - DONE
  // 4. can't add a road where there already is a road - DONE
  // 5. when placing a road, need to update color of that node - DONE
  // 6. node must end at a neighboring node - DONE

  addRoad = function (start, end, playerColor) {
    let startNodeRoads = this.gameBoard[`${start}`]['road_slots'];
    let endNodeRodes = this.gameBoard[end]['road_slots'];

    // CASE: start and end notes are not connected
    if (!this.gameBoard[`${start}`]['neighbors'].includes(parseInt(end, 10)) || !this.gameBoard[`${end}`]['neighbors'].includes(parseInt(start, 10))) {
      //console.log('roadEndOutOfBoundsError')
      const roadEndOutOfBoundsError = new Error("Illegal move: road end must end at a neighboring node");
      throw roadEndOutOfBoundsError;
    }
    
    // CASE: starting road at someone elses settlement
    // not a problem IF the end connects to your own road or settlement
    if (this.gameBoard[`${start}`]['structure'] && this.gameBoard[`${start}`]['color'] !== playerColor) {
      const roadToStructureColorMismatchError = new Error(`Illegal move: cannot connect ${playerColor} road to a ${this.gameBoard[`${start}`]['color']} structure or road`);
      let hasValidConnectingRoad = false;
      
      endNodeRodes.forEach(road => {
        if(road.color === playerColor){
          hasValidConnectingRoad = true;
        }
      });

      // there's not a structure and there's not a valid connecting road
      if(this.gameBoard[`${end}`]['color'] === null && !hasValidConnectingRoad){
        throw roadToStructureColorMismatchError;
      };
      // there is a structure at end point but it is not valid
      if(this.gameBoard[`${end}`]['color'] && this.gameBoard[`${end}`]['color'] !== playerColor){
        throw roadToStructureColorMismatchError;
      };
    }

    // CASE: road already exists between start and end nodes
    for (let i = 0; i < startNodeRoads.length; i++) {
      let roadOption = startNodeRoads[i];
      if (roadOption['connecting_node'] == end) {
        //console.log('roadAlreadyExistsError')
        const roadAlreadyExistsError = new Error("Illegal move: a road already exists at this location")
        throw roadAlreadyExistsError;
      }
    }

    // CASE: starting at blank node and ending at node with no settlement/city
    if (this.gameBoard[`${start}`].structure === '' && this.gameBoard[`${end}`].structure === '') {
      let canPlaceRoad = false;
      this.gameBoard[`${start}`]['road_slots'].forEach(roadSlot => {
        if (roadSlot.color === playerColor) {
          canPlaceRoad = true;
        }
      })
      if (!canPlaceRoad) {
        //console.log('noStructureToAddRoadToError')
        const noStructureToAddRoadToError = new Error("Illegal move: there is not a valid structure or road to connect a road to");
        throw noStructureToAddRoadToError;
      }
    }

    // CASE: starting at blank node and ending at node with settlement/city
    if (this.gameBoard[`${start}`].structure === '' && this.gameBoard[`${end}`].structure) {
      const roadToStructureColorMismatchError = new Error(`Illegal move: cannot connect ${playerColor} road to a ${this.gameBoard[`${end}`]['color']} structure`);
      
      // no valid structure or connecting roads at end node
      if(this.gameBoard[`${end}`]['color'] !== playerColor){
        throw roadToStructureColorMismatchError;
      }
    }

    for (let i = 0; i < startNodeRoads.length; i++) {

      let roadOption = startNodeRoads[i];

      if (!roadOption['connecting_node']) {
        roadOption['connecting_node'] = parseInt(end, 10);
        roadOption['color'] = playerColor;
        this.gameBoard[end]['can_add_road'] = true;
        break
      }
    }

    for (let i = 0; i < endNodeRodes.length; i++) {

      let roadOption = endNodeRodes[i];

      if (!roadOption['connecting_node']) {
        roadOption['connecting_node'] = parseInt(start, 10);
        roadOption['color'] = playerColor;
        break
      }
    }

    let roadNumber = nodeToRoadMap[start][end];
    this.gameBoard.roads[roadNumber].placed = '__placed';
    this.gameBoard.roads[roadNumber].color = playerColor;
    return roadNumber;
  }

  deleteRoad = function(startNode, endNode){
    let startNodeObj = this.gameBoard[startNode];
    let endNodeObj = this.gameBoard[endNode];

    for (let i = 0; i < startNodeObj['road_slots'].length; i++) {
      let connectingNode = startNodeObj['road_slots'][i]['connecting_node'];
      // let startRoadColor = startNodeObj['road_slots'][i].color;
      if(connectingNode === endNode){
        startNodeObj['road_slots'][i]['connecting_node'] = null;
        startNodeObj['road_slots'][i].color = null;
        for(let j = 0; j < endNodeObj['road_slots'].length; j++){
          let connectingNode = endNodeObj['road_slots'][j]['connecting_node'];
          // let endRoadColor = endNodeObj['road_slots'][j].color;
          if(connectingNode === startNode){
            endNodeObj['road_slots'][j]['connecting_node'] = null;
            endNodeObj['road_slots'][j].color = null;
            break;
          }
        }
        let roadNumber = nodeToRoadMap[startNode][endNode];
        this.gameBoard.roads[roadNumber].placed = '';
        this.gameBoard.roads[roadNumber].color = null;
        //console.log('BOARD GRAPH WITH ROAD DELETED: ', this.gameBoard);
        this.setGameBoard(this.gameBoard);
        return roadNumber;
      }
    }
  }

  // can't place the robber in the space that it is currently placed - DONE
  addRobber = function (value, distinction) {
    let previousTileValue = this.gameBoard.tiles.previousLocation.value;
    let previousTileDistinction = this.gameBoard.tiles.previousLocation.distinction;

    let previousTile;
    let tile = distinction ? this.gameBoard.tiles[value][distinction] : this.gameBoard.tiles[value];

    if (previousTileDistinction) {
      if (value === previousTileValue && previousTileDistinction === distinction) {
        //console.log('duplicate')
        return [null, null];
      }
    }
    else {
      if (value === previousTile) {
        //console.log('duplicate')
        return [null, null];
      }
    }

    if (previousTileValue) {
      previousTileDistinction ? previousTile = this.gameBoard.tiles[previousTileValue][previousTileDistinction] : previousTile = this.gameBoard.tiles[previousTileValue]
      previousTile.robber = false;
    }

    tile.robber = true;

    if (distinction) {
      this.gameBoard.tiles.previousLocation.value = value;
      this.gameBoard.tiles.previousLocation.distinction = distinction;
    }
    else {
      this.gameBoard.tiles.previousLocation.value = value;
      this.gameBoard.tiles.previousLocation.distinction = null;
    }

    return [this.gameBoard, tile.nodes];
  }

  // REFACTOR NOTE: if you make a copy of the length and then increment it at the 
  // top of the depthFirstRoadSearch method that might allow you to avoid passing 
  // around an object each time
  getLongestRoad = function (username, color) {
    //console.log(this.gameBoard)
    const TOTAL_NODES = 54;
    let rootOne = null;
    let rootTwo = null;

    for (let i = 0; i < TOTAL_NODES; i++) {
      if (this.gameBoard[i].username === username && this.gameBoard[i].root === true) {
        if (rootOne === null) {
          rootOne = i;
          continue;
        }
        rootTwo = i;
        break;
      }
    }

    const depthFirstRoadSearch = (currNode, color, set = new Set(), length = 0, solutionArr = [], stack = []) => {
      set.add(currNode.node);
      let lengthCpy = length;
      let potentialNeighbors = this.gameBoard[currNode.node]['road_slots'];
      let neighbors = [];
      potentialNeighbors.forEach(pN => {
        if (!set.has(pN['connecting_node']) && pN.color === color) {
          neighbors.push({ node: pN['connecting_node'], currLen: lengthCpy + 1 })
        }
      });
      if (neighbors.length === 0) {
        solutionArr.push(currNode.currLen);
      };
      stack.push(...neighbors);
      if (stack.length === 0) {
        return solutionArr;
      };
      let newCurrNode = stack.pop();
      return depthFirstRoadSearch(newCurrNode, color, set, newCurrNode.currLen, solutionArr, stack);
    }

    let roadLengths = [...depthFirstRoadSearch({ node: rootOne, currLen: 0 }, color), ...depthFirstRoadSearch({ node: rootTwo, currLen: 0 }, color)];
    return Math.max(...roadLengths);

    // let FinalLongestRoad = null;
    // result.forEach(roadLenghts => {
    //   let currLongestRoad = roadLenghts.reduce((maxVal, nextVal) => {
    //     if (nextVal > maxVal) {
    //       return nextVal
    //     }
    //     else {
    //       return maxVal
    //     }
    //   })
    //   if (FinalLongestRoad < currLongestRoad) {
    //     FinalLongestRoad = currLongestRoad;
    //   }
    // })

    // if (FinalLongestRoad === null) {
    //   return 0;
    // }
    // return FinalLongestRoad;
  }
}

export default BoardManager;