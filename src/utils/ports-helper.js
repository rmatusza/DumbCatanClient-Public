const generatePorts = () => {

  const shuffeledPorts = [];
  const formattedPorts = [];

  const ports = 
  [
    '3_all',
    '2_hay',
    '2_stone',
    '3_all',
    '2_sheep',
    '3_all',
    '3_all',
    '2_brick',
    '2_wood',
  ];

  const indices = [0,1,2,3,4,5,6,7,8]

  while(indices.length > 0){
    const selectionIdx = Math.floor(Math.random()*indices.length);
    //console.log('SELECTION INDEX: ', selectionIdx)
    const idx = indices.splice(selectionIdx, 1).pop()
    //console.log('INDEX: ', idx)
    shuffeledPorts.push(ports[idx])
  }

  const innerPortArrayLengths = [2,2,3,2]

  let i = 0

  while(shuffeledPorts.length > 0){
    let innerArray = shuffeledPorts.splice(0, innerPortArrayLengths[i])
    formattedPorts.push(innerArray);
    i++
  }

  return formattedPorts;
}

export default generatePorts;