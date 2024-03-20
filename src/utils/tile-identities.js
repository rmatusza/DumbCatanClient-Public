const generateTileArrangement = () => {
  const shuffledTilesTracker = new Set();
  const shuffeledTiles = []

  const tileIndicies = 
  [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
    10, 11, 12, 13, 14, 15, 16, 17
  ]

  const tiles = 
  [
    'hay',
    'hay',
    'hay',
    'hay',
    'wood',
    'wood',
    'wood',
    'wood',
    'sheep',
    'sheep',
    'sheep',
    'sheep',
    'brick',
    'brick',
    'brick',
    'stone',
    'stone',
    'stone',
  ]

  while(tileIndicies.length > 0){
    
    let tileIndiciesArrayIndex = Math.floor(Math.random() * tileIndicies.length);

    let tileIndex = tileIndicies.splice(tileIndiciesArrayIndex, 1).pop();

    shuffeledTiles.push(tiles[tileIndex])
  }

  return shuffeledTiles

}

export default generateTileArrangement;