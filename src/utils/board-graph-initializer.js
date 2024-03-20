const addTileToNodeMapToBoardGraph = (tiles, diceValues, boardGraph) => {

  const nodeResourceGroups = 
  [
    [0,1,29,28,30,47],
    [1,2,3,32,31,30],
    [3,4,5,6,33,32],
    [28,47,46,45,26,27],
    [30,31,48,53,46,47],
    [32,33,34,49,48,31],
    [6,7,8,35,34,33],
    [26,45,44,23,24,25],
    [46,53,52,43,44,45],
    [48,49,50,51,52,53],
    [34,35,36,37,50,49],
    [8,9,10,11,36,35],
    [44,43,42,21,22,23],
    [52,51,40,41,42,43],
    [50,37,38,39,40,51],
    [36,11,12,13,38,37],
    [42,41,18,19,20,21],
    [40,39,16,17,18,41],
    [38,13,14,15,16,39],
  ];

  for(let i=0; i<nodeResourceGroups.length; i++){
    let value = diceValues[i].value;
    let nodeGroup = nodeResourceGroups[i];
    let resourceType = tiles[i];
    let boardGraphTiles = boardGraph.tiles;
    if(value !== '2' && value !== '12' && value !== null && value !== 'previousLocation'){
      if(boardGraphTiles[value].a.nodes.length === 0){
        boardGraphTiles[value].a.nodes = nodeGroup;
        boardGraphTiles[value].a.resource = resourceType;
      }
      else {
        boardGraphTiles[value].b.nodes = nodeGroup
        boardGraphTiles[value].b.resource = resourceType;
      }
    }
    else if(value !== null && value !== 'previousLocation'){
      boardGraphTiles[value].nodes = nodeGroup;
      boardGraphTiles[value].resource = resourceType;
    }
  }
  return boardGraph;
}

const formatTiles = (tiles, diceValues, boardGraph) => {
  const tileValueSet = new Set();
  const tilesCpy = [...tiles];
  const diceValuesCpy = [...diceValues];
  
  const tilesByRow = 
  [
    tilesCpy.splice(0, 3), 
    tilesCpy.splice(0, 4), 
    tilesCpy.splice(0, 5), 
    tilesCpy.splice(0, 4), 
    tilesCpy.splice(0, 3)
  ];

  const diceValuesAndFrequenciesByRow = 
  [
    diceValuesCpy.splice(0, 3), 
    diceValuesCpy.splice(0, 4), 
    diceValuesCpy.splice(0, 5), 
    diceValuesCpy.splice(0, 4), 
    diceValuesCpy.splice(0, 3)
  ];

  tilesByRow.forEach((row, i) => {
    boardGraph.tileValueFrequencyOrder.tileOrder[i] = row;
  });

  diceValuesAndFrequenciesByRow.forEach((diceValuesAndFrequencies, i) => {
    let values = [];
    let frequencies = [];
    let distinctions = [];
    diceValuesAndFrequencies.forEach((diceValueAndFrequency) => {
      values.push(diceValueAndFrequency.value);
      frequencies.push(diceValueAndFrequency.frequency);

      if(diceValueAndFrequency.value !== '12' && diceValueAndFrequency.value !== '2' && diceValueAndFrequency.value !== null){
        if(tileValueSet.has(diceValueAndFrequency.value)){
          distinctions.push('b');
        }
        else{
          distinctions.push('a');
          tileValueSet.add(diceValueAndFrequency.value);
        }
      }
      else{
        distinctions.push(null);
      }

    })
    boardGraph.tileValueFrequencyOrder.valueAndFrequencyOrder[i].values = values;
    boardGraph.tileValueFrequencyOrder.valueAndFrequencyOrder[i].frequencies = frequencies;
    boardGraph.tileValueFrequencyOrder.valueAndFrequencyOrder[i].distinctions = distinctions;
  });

  return boardGraph;
}

const initializeBoardGraph = (tiles, diceValues, boardGraph) => {
  let gameBoardCpy = {...boardGraph}
  let boardGraphTileToNodeMapInitialized = addTileToNodeMapToBoardGraph(tiles, diceValues, gameBoardCpy);
  let boardGraphTileAndValueOrderInitialized = formatTiles(tiles, diceValues, boardGraphTileToNodeMapInitialized);
  let fullyInitializedBoardGraph = boardGraphTileAndValueOrderInitialized;
  return fullyInitializedBoardGraph;
}

export default initializeBoardGraph;