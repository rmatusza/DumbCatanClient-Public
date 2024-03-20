const formatTiles = (tiles, frequencies) => {
  //console.log('here')
  const tileValueSet = new Set();

  const tilesByRow = 
  [
    tiles.splice(0, 3), 
    tiles.splice(0, 4), 
    tiles.splice(0, 5), 
    tiles.splice(0, 4), 
    tiles.splice(0, 3)
  ]

  const frequenciesByRow = 
  [
    frequencies.splice(0, 3), 
    frequencies.splice(0, 4), 
    frequencies.splice(0, 5), 
    frequencies.splice(0, 4), 
    frequencies.splice(0, 3)
  ]

  const formattedTiles = {};

  for(let i=0; i<tilesByRow.length; i++){
    let tileFrequencies = []
    let tiles_row_i = tilesByRow[i]

    for(let j=0; j<tiles_row_i.length; j++){
      let tile = tiles_row_i[j];
      //console.log(tile)
      if(tile === 'desert'){
        tileFrequencies.push({'value': null, 'frequency': null, 'distinction': null})
        continue
      }
      const tileValueAndFrequency = frequenciesByRow[i][j];
      const tileValue = tileValueAndFrequency.value;
      let valueDistinction;
      if(tileValue == 12 || tileValue == 2){
        valueDistinction = null;
      }
      else if(tileValueSet.has(tileValue)){
        valueDistinction = 'b';
      }
      else{
        tileValueSet.add(tileValue)
        valueDistinction = 'a';
      }
      tileValueAndFrequency.distinction = valueDistinction
      //console.log(tileValueAndFrequency)
      tileFrequencies.push(tileValueAndFrequency)
    }

    formattedTiles[i] = {
      'tiles': tiles_row_i,
      'frequencies': tileFrequencies
    }
  }
  //console.log(formattedTiles)
  return formattedTiles;
}

// NOTE: need to first generate tiles then need to pass index
// of the desert tile to the generate frequency function, create
// random frequencies, then insert into that array at the index that 
// was passed in an object containing nulls

export default formatTiles;