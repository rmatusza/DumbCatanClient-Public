import boardGraph from "./board-graph";
import nodeToRoadMap from "./node-to-road-map";
const lod = require('lodash');

class DevBoardManager {

  constructor(boardGraph) {
    this.gameBoard = boardGraph;
  }

  getBoardGraph = function () { return this.gameBoard };
  setBoardGraph = function(boardGraph) { this.gameBoard = boardGraph };


  // add structure method for development that allows me to place structures 
  // anywhere as long as colors match and as long as structures are 
  // incremented correctly (null -> settlement -> city)
  addStructure = function (structureType, color, location, username, userId, initialPlacement) {
    let updateNode = this.gameBoard[location];

    if (updateNode.color !== color && updateNode.color !== null) {
      return;
    }
    
    if (updateNode.structure === '' && structureType === 'settlement') {
      updateNode.structure = structureType;
      updateNode.color = color;
      updateNode.username = username;
      updateNode.userId = userId
      if(initialPlacement){
        updateNode.root = true;
      }
      return;
    }

    if (updateNode.structure === 'settlement' && structureType === 'city') {
      updateNode.structure = structureType;
    }

    return updateNode
  }


  // add road method for development that allows me to place roads anywhere 
  // with the only restriction being that i can't double place the roads
  addRoad = function (start, end, playerColor) {

    let startNode = this.gameBoard[start];
    let endNode = this.gameBoard[end];
    let startNodeNeighbors = Object.keys(nodeToRoadMap[start]);
    let isValidPlacement = false;
    //console.log(this.gameBoard)
    if (startNode['can_add_road'] === true) {

      startNodeNeighbors.forEach(neighbor => {
        if(neighbor == end) {
          isValidPlacement = true;
        }
      });

      if(isValidPlacement === false){
        //console.log('not valid placement')
        return;
      };

      // updating start node
      for (let i = 0; i < startNode['road_slots'].length; i++) {
        //console.log('updating start node')
        let roadSlot = startNode['road_slots'][i];
        if (!roadSlot.color) {
          roadSlot.color = playerColor;
          roadSlot['connecting_node'] = end;

          // if we're updating the last road slot then we can't add any more roads
          if (i == startNode['road_slots'].length - 1) {
            startNode['can_add_road'] = false;
          }

          break;
        }
      }


      // updating end node
      for (let i = 0; i < endNode['road_slots'].length; i++) {
        //console.log('updating end node')
        let roadSlot = endNode['road_slots'][i];
        if (!roadSlot.color) {
          roadSlot.color = playerColor;
          roadSlot['connecting_node'] = start;

          // if we're updating the last road slot then we can't add any more roads
          if (i == endNode['road_slots'].length - 1) {
            endNode['can_add_road'] = false;
          }

          break;
        }
      }

      //console.log('adding road to board graph')
      let roadNumber = nodeToRoadMap[start][end];
      this.gameBoard.roads[roadNumber].placed = '__placed';
      this.gameBoard.roads[roadNumber].color = playerColor;
      //console.log('done')
      return roadNumber;
    }
  }

  deleteRoad = function(startNode, endNode){
    let BGCpy = lod.cloneDeep(this.gameBoard);
    let startNodeObj = BGCpy[startNode];
    let endNodeObj = BGCpy[endNode];

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
        BGCpy.roads[roadNumber].placed = '';
        BGCpy.roads[roadNumber].color = null;
        this.setBoardGraph(BGCpy);
        return roadNumber;
      }
    }
  }

  addRobber = function(value, distinction){
    let previousTileValue = this.gameBoard.tiles.previousLocation.value;
    let previousTileDistinction = this.gameBoard.tiles.previousLocation.distinction;
    
    let previousTile;
    let tile = distinction ? this.gameBoard.tiles[value][distinction] : this.gameBoard.tiles[value];
    
    if(previousTileDistinction){
      if(value === previousTileValue && previousTileDistinction === distinction){
        //console.log('duplicate')
        return [null, null];
      }
    }
    else {
      if(value === previousTile){
        //console.log('duplicate')
        return [null, null];
      }
    }

    if(previousTileValue){
      previousTileDistinction  ? previousTile = this.gameBoard.tiles[previousTileValue][previousTileDistinction] : previousTile = this.gameBoard.tiles[previousTileValue]
      previousTile.robber = false;
    }
    
    tile.robber = true;

    if(distinction){
      this.gameBoard.tiles.previousLocation.value = value;
      this.gameBoard.tiles.previousLocation.distinction = distinction;
    }
    else {
      this.gameBoard.tiles.previousLocation.value = value;
      this.gameBoard.tiles.previousLocation.distinction = null;
    }

    const gameBoardCpy = {...this.gameBoard}
    return [gameBoardCpy, tile.nodes];
  }

  // REFACTOR NOTE: if you make a copy of the length and then increment it at the 
  // top of the depthFirstRoadSearch method that might allow you to avoid passing 
  // around an object each time
  getLongestRoad = function(username, color){
    const TOTAL_NODES = 54;
    let rootOne = null;
    let rootTwo = null;
    
    for(let i=0; i<TOTAL_NODES; i++){
      if(this.gameBoard[i].username === username && this.gameBoard[i].root === true){
        if(rootOne === null){
          rootOne = i;
          continue;
        }      
        rootTwo = i;
        break;
      }
    }
  
    const depthFirstRoadSearch = (currNode, color, set=new Set(), length=0, solutionArr=[], stack=[]) => {
      set.add(currNode.node);
      let lengthCpy = length;
      let potentialNeighbors = this.gameBoard[currNode.node]['road_slots'];
      let neighbors = [];
      potentialNeighbors.forEach(pN => {
        if(!set.has(pN['connecting_node']) && pN.color === color){
          neighbors.push({node: pN['connecting_node'], currLen: lengthCpy+1})
        }
      });
      if(neighbors.length === 0){
        solutionArr.push(currNode.currLen);
      };
      stack.push(...neighbors);
      if(stack.length === 0){
        return solutionArr;
      };
      let newCurrNode = stack.pop();
      return depthFirstRoadSearch(newCurrNode, color, set, newCurrNode.currLen, solutionArr, stack);
    }
  
    let result = [depthFirstRoadSearch({node: rootOne, currLen: 0}, color), depthFirstRoadSearch({node: rootTwo, currLen: 0}, color)];
    let FinalLongestRoad = null;
    result.forEach(roadLenghts => {
      let currLongestRoad =roadLenghts.reduce((maxVal, nextVal) => {
        if(nextVal > maxVal){
          return nextVal
        }
        else {
          return maxVal
        }
      })
      if(FinalLongestRoad < currLongestRoad) {
        FinalLongestRoad = currLongestRoad;
      }
    })
    
    if(FinalLongestRoad === null){
      return 0;
    }
    return FinalLongestRoad;
  }
}

export default DevBoardManager;