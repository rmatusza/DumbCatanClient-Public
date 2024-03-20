import { useState, useContext, useEffect } from 'react';
import ModalStateContext from '../../store/modal-context';
import { saveUserData } from '../../functions/userFunctions';
import { getObjectValueSum } from '../../functions/utilFunctions';
import './css/OverSevenCardPenaltyModalContent.css';
const lod = require('lodash');
const resourceCardImages = require.context('../../../public/images/resource_cards', true);

const OverSevenCardPenaltyModalContent = () => {
  const ctx = useContext(ModalStateContext);
  const [totalCardsReturned, setTotalCardsReturned] = useState(0);
  const [numberOfCardsToReturn, setNumberOfCardsToReturn] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resourceCards, setResourceCards] = useState({
    'hay': 0,
    'sheep': 0,
    'brick': 0,
    'wood': 0,
    'stone': 0
  })
  const [returnedCards, setReturnedCards] = useState({
    'hay': 0,
    'stone': 0,
    'wood': 0,
    'brick': 0,
    'sheep': 0
  });
  
  useEffect(() => {
    //console.log('OSCP MC UE');

    const handTotal = getObjectValueSum(ctx.playerData.playerInfo.hand['resource_cards']);

    setNumberOfCardsToReturn(Math.floor(handTotal/2));
    setResourceCards(lod.cloneDeep(ctx.playerData.playerInfo.hand['resource_cards']));

  }, [ctx.playerData]);

  const returnCardHandler = (type, resource) => {
    //console.log(type)

    const resourceCardsCpy = lod.cloneDeep(resourceCards);
    const returnedCardsCpy = lod.cloneDeep(returnedCards);

    if (type === 'RETURN') {
      // Already returned required number of cards
      if (totalCardsReturned === numberOfCardsToReturn) {
        return
      }

      // Don't have any more of that resource to return
      if (resourceCards[resource] === 0) {
        return
      }

      resourceCardsCpy[resource] -= 1;
      returnedCardsCpy[resource] += 1;

      setTotalCardsReturned(() => totalCardsReturned+1);
      setReturnedCards(returnedCardsCpy);
      setResourceCards(resourceCardsCpy);

      return
    }

    // NOTE: below handles adding cards back to hand
    
    // No more of that resource to add back to hand 
    if (returnedCards[resource] === 0) {
      return
    }

    returnedCardsCpy[resource] -= 1;
    resourceCardsCpy[resource] += 1;

    setTotalCardsReturned(() => totalCardsReturned-1);
    setReturnedCards(returnedCardsCpy);
    setResourceCards(resourceCardsCpy);
  }

  const submissionHandler = async () => {
    //console.log('SUBMISSION HANDLER ');

    if(numberOfCardsToReturn !== totalCardsReturned){
      return
    }

    const playerDataCpy = lod.cloneDeep(ctx.playerData);
    
    playerDataCpy.playerInfo.hand['resource_cards'] = resourceCards;
    // playerDataCpy.playerInfo.overSevenCardPenalty = false;
    playerDataCpy.overSevenCardPenalty = 0;

    const [updatedPlayerData, saveUserDataErrorMsg] = await saveUserData([playerDataCpy], ctx.userId);
    if(saveUserDataErrorMsg){
      setErrorMessage(saveUserDataErrorMsg);
      return;
    }
    ctx.onSetPlayerData(updatedPlayerData);
    ctx.onSetOverSevenCardPenaltyModalActive(false);
  }

  return (
    <div className='modal-content-container__over-seven-card-penalty'>

      <div className='modal-title'>
        <h3>{`You Had Over 7 Cards When a 7 Was Rolled. Choose ${numberOfCardsToReturn} Cards to Return`}</h3>
        {
          errorMessage
          &&
          <h3>{errorMessage}</h3>
        }
      </div>

      <div className='returned-cards-container__title'>
        <h3>Returned Cards:</h3>
      </div>
      <div className='returned-cards-container'>
        {
          Object.keys(returnedCards).map((resource, i) => {
            if (returnedCards[resource] > 0) {
              return (
                <div className='returned-card-container' key={i}>
                  <h4>{returnedCards[resource]}</h4>
                  <img className={'hay-card'} src={resourceCardImages(`./${resource}_card.png`)} />
                </div>
              )
            }
          })
        }
      </div>

      <div className='card-selections__title'>
        <h3>Your Cards:</h3>
      </div>
      <div className='card-selections'>
        <div className='card-selection'>
          <h4>{resourceCards.hay}</h4>
          <img className='hay-card' src={resourceCardImages(`./hay_card.png`)} />
          <div className='card-selections__actions'>
            <button onClick={() => returnCardHandler('RETURN', 'hay')}>-</button>
            <button onClick={() => returnCardHandler('UNDO', 'hay')}>+</button>
          </div>
        </div>
        <div className='card-selection'>
          <h4>{resourceCards.stone}</h4>
          <img className='hay-card' src={resourceCardImages(`./stone_card.png`)} />
          <div className='card-selections__actions'>
            <button onClick={() => returnCardHandler('RETURN', 'stone')}>-</button>
            <button onClick={() => returnCardHandler('UNDO', 'stone')}>+</button>
          </div>
        </div>
        <div className='card-selection'>
          <h4>{resourceCards.wood}</h4>
          <img className='hay-card' src={resourceCardImages(`./wood_card.png`)} />
          <div className='card-selections__actions'>
            <button onClick={() => returnCardHandler('RETURN', 'wood')}>-</button>
            <button onClick={() => returnCardHandler('UNDO', 'wood')}>+</button>
          </div>
        </div>
        <div className='card-selection'>
          <h4>{resourceCards.brick}</h4>
          <img className='hay-card' src={resourceCardImages(`./brick_card.png`)} />
          <div className='card-selections__actions'>
            <button onClick={() => returnCardHandler('RETURN', 'brick')}>-</button>
            <button onClick={() => returnCardHandler('UNDO', 'brick')}>+</button>
          </div>
        </div>
        <div className='card-selection'>
          <h4>{resourceCards.sheep}</h4>
          <img className='hay-card' src={resourceCardImages(`./sheep_card.png`)} />
          <div className='card-selections__actions'>
            <button onClick={() => returnCardHandler('RETURN', 'sheep')}>-</button>
            <button onClick={() => returnCardHandler('UNDO', 'sheep')}>+</button>
          </div>
        </div>
      </div>

      <div className='confirm-returned-cards__actions'>
        <button onClick={submissionHandler}>Return Cards</button>
      </div>
    </div>
  )
}

export default OverSevenCardPenaltyModalContent;