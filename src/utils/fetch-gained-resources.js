import { sortedIndexOf } from "lodash";

const fetchGainedResources = (tileToNodeMap, structures, diceResult, username) => {
  if(diceResult == 0){
    return null
  }
  
  const resources = {
    'hay': 0,
    'brick': 0,
    'stone': 0,
    'wood': 0,
    'sheep': 0
  };

  //console.log(tileToNodeMap);

  const settlements = structures.settlements;
  const cities = structures.cities;
 
  if(tileToNodeMap[diceResult].a)
  {
    const hasRobberA = tileToNodeMap[diceResult].a.robber;
    const hasRobberB = tileToNodeMap[diceResult].b.robber;
    const resourceA = tileToNodeMap[diceResult].a.resource;
    const nodesA = tileToNodeMap[diceResult].a.nodes;
    const resourceB = tileToNodeMap[diceResult].b.resource;
    const nodesB = tileToNodeMap[diceResult].b.nodes;

    settlements.forEach((settlement) => {
      if(nodesA.includes(settlement) && !hasRobberA){
        resources[resourceA] += 1
      }
      if(nodesB.includes(settlement) && !hasRobberB){
        resources[resourceB] += 1
      }
    })

    cities.forEach((city) => {
      if(nodesA.includes(city) && !hasRobberA){
        resources[resourceA] += 2
      }
      if(nodesB.includes(city) && !hasRobberB){
        resources[resourceB] += 2
      }
    })
  }
  else 
  {
    const hasRobber = tileToNodeMap[diceResult].robber;
    const resource = tileToNodeMap[diceResult].resource;
    const nodes = tileToNodeMap[diceResult].nodes;

    settlements.forEach((settlement) => {
      if(nodes.includes(settlement) && !hasRobber){
        resources[resource] += 1
      }
    })

    cities.forEach((city) => {
      if(nodes.includes(city) && !hasRobber){
        resources[resource] += 2
      }
    })
  }
  //console.log(`${username} has the following resources:`);
  //console.log(resources)
  return resources;
}

export default fetchGainedResources;