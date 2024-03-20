const addTileToNodeMapToBoardGraph = (values, boardGraph) => {

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
    [38,14,15,16,39],
  ];

  for(let i=0; i<nodeResourceGroups.length; i++){
    let value = values[i].value;
    let nodeGroup = nodeResourceGroups[i];
    let boardGraphTiles = boardGraph.tiles;
    if(value !== '2' && value !== '12' && value !== null && value !== 'previousLocation'){
      if(boardGraphTiles[value].a.nodes.length === 0){
        boardGraphTiles[value].a.nodes = nodeGroup;
      }
      else {
        boardGraphTiles[value].b.nodes = nodeGroup
      }
    }
    else if(value !== null && value !== 'previousLocation'){
      boardGraphTiles[value].nodes = nodeGroup;
    }
  }
  return boardGraph;
}

export default addTileToNodeMapToBoardGraph;