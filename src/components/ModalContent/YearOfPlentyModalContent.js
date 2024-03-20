import { useState, useContext } from 'react';
import { getPlayerDevCards } from '../../functions/userFunctions';
import { saveUserData } from '../../functions/userFunctions';
import ModalStateContext from '../../store/modal-context';
import './css/yearOfPlentyModalContent.css';
const resourceCards = require.context('../../../public/images/resource_cards', true);
const lod = require('lodash');

const YearOfPlentyModalContent = () => {
  const [resourceSelections, setResourceSelections] = useState({
    'wood': 0,
    'brick': 0,
    'stone': 0,
    'hay': 0,
    'sheep': 0,
  });
  const [isError, setIsError] = useState(false);
  const ctx = useContext(ModalStateContext);

  const resourceSelectionHandler = (resource, action) => {
    const resourceSelectionsCpy = {...resourceSelections};
    const selectionTotal = Object.values(resourceSelectionsCpy).reduce((total, num) => total + num);
    if(action === 'add'){
      if(selectionTotal === 2){
        return
      }
      resourceSelectionsCpy[resource] += 1;
      setResourceSelections(resourceSelectionsCpy);
      return
    }

    resourceSelectionsCpy[resource] -= 1;
    setResourceSelections(resourceSelectionsCpy);
  }

  const completeSelectionHandler = async () => {
    const totalSelected = Object.values(resourceSelections).reduce((total, num) => total + num);
    if (totalSelected === 2) {
      const playerDataCpy = lod.cloneDeep(ctx.playerData);
      const updatedPlayerResourceCards = playerDataCpy.playerInfo.hand['resource_cards'];
      playerDataCpy.playerInfo.hand['dev_cards']['year_of_plenty'] -= 1;
      Object.keys(resourceSelections).forEach(resource => {
        if(resourceSelections[resource] > 0){
          let resourceAmount = resourceSelections[resource]
          updatedPlayerResourceCards[resource] += resourceAmount;
        }
      })
      playerDataCpy.playerInfo.hand['resource_cards'] = updatedPlayerResourceCards;
      playerDataCpy.yearOfPlentyActive = 0;
      const [savedPlayerData, saveUserDataErrorMsg] = await saveUserData([playerDataCpy], ctx.userId);
      ctx.onSetPlayerData(savedPlayerData);
      ctx.onModifyModalState('yearOfPlenty');
    }
    setIsError(true);
  }

  return (
    <div className='year-of-plenty-modal-content-container'>
      <div className='year-of-plenty-modal-title'>
        <h2>
          Pick Any Two Resources to Add to Your Hand
        </h2>
      </div>
      <div className='year-of-plenty-error-message'>
        {
          isError
          &&
          <h3>Make Sure That You Have Selected 2 Resources</h3>
        }
      </div>
      <div className='year-of-plenty-resources-container'>
        {
          Object.keys(resourceSelections).map((resource, i) => {
            if(resourceSelections[resource] > 0){
              return (
                <div className='year-of-plenty-resource'>
                  <img key={i} onClick={() => resourceSelectionHandler(resource, 'add')} className='hay-card' src={resourceCards(`./${resource}_card.png`)} />
                  <div className='year-of-plenty-resource-actions'>
                    <p>x{resourceSelections[resource]}</p>
                    <button id='reduce-yop-resource-amount-button' onClick={() => resourceSelectionHandler(resource, 'remove')} style={{ cursor: 'pointer' }}>Reduce</button>
                  </div>
                </div>
              )
            }
            else {
              return(
                <div className='year-of-plenty-resource'>
                  <img key={i} onClick={() => resourceSelectionHandler(resource, 'add')} className='hay-card' src={resourceCards(`./${resource}_card.png`)} />
                  <div className='year-of-plenty-resource-actions'>
                  </div>
                </div>
              )
            }
          })
        }
      </div>
      <div className='year-of-plenty-modal-actions'>
        <button onClick={completeSelectionHandler}>Accept Resources</button>
      </div>
    </div>
  )
}

export default YearOfPlentyModalContent;