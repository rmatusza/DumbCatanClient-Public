const generateNodeToPortMap = (ports) => {
  // ports is a 2D array. the inner arrays are like sections of the board
  // where ports can be found (0 - 3 keys in the object).
  // the inner object links the port type, whose index in the inner array 
  // of ports is equal to the index in the inner object, to the nodes that
  // are attached to that port such that {0: {0: [0, 29]}} means first section
  // in ports array, first port, connected to nodes 0, 29. this is then used to 
  // link the actual port type to the nodes to be used in trades
  const portToNodeMap = {
    0: {0: [0, 29], 1: [2, 3]},
    1: {0: [25, 26], 1: [6, 7]},
    2: {0: [22, 23], 1: [9, 10], 2: [12, 13]},
    3: {0: [19, 20], 1: [16, 17]}
  }

  const nodeToPortMap = {
    29: null,
    0: null,
    2: null,
    3: null,
    25: null,
    26: null,
    6: null,
    7: null,
    22: null,
    23: null,
    9: null,
    10: null,
    12: null,
    13: null,
    19: null,
    20: null,
    17: null,
    16: null,
  }

  for (let i=0; i<ports.length; i++){
    let portSection = ports[i];
    for (let j=0; j<portSection.length; j++){
      let portType = portSection[j];
      let nodeOne = portToNodeMap[i][j][0];
      let nodeTwo = portToNodeMap[i][j][1];
      nodeToPortMap[nodeOne] = portType;
      nodeToPortMap[nodeTwo] = portType;
    }
  }
 
  return nodeToPortMap;
}

export default generateNodeToPortMap;