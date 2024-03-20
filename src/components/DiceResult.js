import { useContext, useEffect, useState } from 'react';
import { getGamePhase } from '../functions/gameFunctions';
import { getObjectValueSum } from '../functions/utilFunctions';
import ModalStateContext from '../store/modal-context';
import fetchGainedResources from "../utils/fetch-gained-resources";
import './css/DiceResult.css';

const icons = require.context('../../public/images/resource_icons', true);

const DiceResult = () => {
  const ctx = useContext(ModalStateContext);
  const [resourceAmount, setResourceAmount] = useState(0);
  const [numberRolled, setNumberRolled] = useState(null);
  const [gainedResources, setGainedResources] = useState({ 'uninitialized': true });
  const iconMap = {
    'wood': './wood_icon.png',
    'brick': './brick_icon.png',
    'sheep': './sheep_icon.png',
    'stone': './stone_icon.png',
    'hay': './hay_icon.png',
  }

  // REFACTOR NOTE: can't we just add currDiceRoll to dependency array?
  useEffect(() => {
    //console.log('DICE RESULT UE');

    const gamePhase = getGamePhase(ctx.currentGame);

    // some game update happened that's not related to the dice roll and can be ignored
    if (ctx.currentGame.currDiceRoll === numberRolled) {
      return
    }


    // no resources are gained for a 7 so don't need to do the stuff at bottom
    if (ctx.currentGame.currDiceRoll === 7) {
      setNumberRolled(7);
      setResourceAmount(0);
      return
    }

    // Ended turn - had a numberRolled but now currDiceRoll is back to 0 (meaning that turn ended and currDiceRoll was reset)
    if (ctx.currentGame.currDiceRoll === 0 && numberRolled) {
      setNumberRolled(null);
      return
    }

    // either game hasn't started yet or curr player hasn't rolled the dice
    if (ctx.currentGame.currDiceRoll === 0 && !numberRolled) {
      return
    }

    // started turn - didn't have a number rolled but now currDiceRoll is non-zero
    // if(gamePhase)
    let fetchedGainedResources = (gamePhase === 'PRE' || gamePhase === 'INITIAL') ? null : fetchGainedResources(ctx.gameBoard.tiles, ctx.playerData.playerInfo.structures, ctx.currentGame.currDiceRoll, ctx.playerData.playerInfo.username);
    if (fetchedGainedResources) {
      fetchedGainedResources.uninitialized = false;
      const resourceTotal = getObjectValueSum(fetchedGainedResources);
      setGainedResources(fetchedGainedResources);
      setNumberRolled(ctx.currentGame.currDiceRoll);
      setResourceAmount(resourceTotal);
    }
  }, [ctx.currentGame, ctx.gameBoard]);

  return (
    numberRolled
    &&
    <div className='dice-result-content'>
      <div className='roll-results'>
        <p>Number Rolled:</p>
        <span>{numberRolled}</span>
      </div>

      <p className='resources-gained-title'>Resources Gained:</p>
      <div className='resources-gained-container'>
        <div className='your-resources'>
          {
            resourceAmount > 0
              ?
              Object.keys(gainedResources).map((resource, i) => {
                let resourceAmount = gainedResources[resource];
                if (resourceAmount > 0) {
                  return (
                    <div className={resource + '-icon'} key={i}>
                      <img src={icons(iconMap[resource])} />
                      x {resourceAmount}
                    </div>
                  )
                }
              })
              :
              <h4>No Resources Gained</h4>
          }
        </div>
      </div>
    </div>
  )
}

export default DiceResult;