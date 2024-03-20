const getInitialResources = (selectedNode, tileToNodeResourceMap) => {
  const resources = {
    'hay': 0,
    'brick': 0,
    'stone': 0,
    'wood': 0,
    'sheep': 0
  };
  
  const map = Object.values(tileToNodeResourceMap);
  map.forEach((field, i) => {
    if(i === 10){
      return
    }
    if(field.a){
      const fieldANodes = field.a.nodes;
      const fieldBNodes = field.b.nodes;
      const fieldAResource = field.a.resource;
      const fieldBResource = field.b.resource;
      fieldANodes.forEach(node => {
        if(node == selectedNode){
          resources[fieldAResource] += 1;
        }
      });
      fieldBNodes.forEach(node => {
        if(node == selectedNode){
          resources[fieldBResource] += 1;
        }
      });
    }
    else {
      const fieldNodes = field.nodes;
      const fieldResource = field.resource;
      //console.log(field)
      fieldNodes.forEach(node => {
        if(node == selectedNode){
          resources[fieldResource] += 1;
        }
      });
    }
  })

  return resources;
}

export default getInitialResources;