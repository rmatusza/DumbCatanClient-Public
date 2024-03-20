const insertDesertTile = (resourceTiles, frequencyTiles) => {
  const insertionIndex = Math.floor(Math.random() * 18)

  resourceTiles.splice(insertionIndex, 0, 'desert');
  frequencyTiles.splice(insertionIndex, 0, {'value': null, 'frequency': null})

  return [resourceTiles, frequencyTiles];
}

export default insertDesertTile;