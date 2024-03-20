const generateTileFrequencies = () => {

  const shuffeledRolls = [];


  const rollIndicies = 
  [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
    10, 11, 12, 13, 14, 15, 16, 17
  ];

  const rolls = 
  {
    0: {'value': '2', 'frequency': 1},
    1: {'value': '3', 'frequency': 2},
    2: {'value': '3', 'frequency': 2},
    3: {'value': '4', 'frequency': 3},
    4: {'value': '4', 'frequency': 3},
    5: {'value': '5', 'frequency': 4},
    6: {'value': '5', 'frequency': 4},
    7: {'value': '6', 'frequency': 5},
    8: {'value': '6', 'frequency': 5},
    9: {'value': '8', 'frequency': 5},
    10: {'value': '8', 'frequency': 5},
    11: {'value': '9', 'frequency': 4},
    12: {'value': '9', 'frequency': 4},
    13: {'value': '10', 'frequency': 3},
    14: {'value': '10', 'frequency': 3},
    15: {'value': '11', 'frequency': 2},
    16: {'value': '11', 'frequency': 2},
    17: {'value': '12', 'frequency': 1},
  };

  while(rollIndicies.length > 0){
    let rollIndiciesArrayIndex = Math.floor(Math.random() * rollIndicies.length);

    let roleIndex = rollIndicies.splice(rollIndiciesArrayIndex, 1).pop();
    // let tile = 

    shuffeledRolls.push(rolls[roleIndex])
  }

  return shuffeledRolls
}

export default generateTileFrequencies;