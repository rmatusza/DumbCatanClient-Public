import { useState, useContext } from 'react';
import { buyDevCard, getFormatedDevCardName } from '../../functions/utilFunctions';
import { checkForWinHandler } from '../../functions/gameFunctions';
import { saveGameAndPlayerDataTransactional } from '../../functions/transactionalFunctions';
import ModalStateContext from '../../store/modal-context';
import './css/DevCardModalContent.css';

const resourceCards = require.context('../../../public/images/resource_cards', true);

const BuyDevCardModalContent = () => {
  const [isValid, setIsValid] = useState(true);
  const ctx = useContext(ModalStateContext);
  const playerHand = ctx.playerData.playerInfo.hand['resource_cards'];

  const devCardModalHandler = () => {
    ctx.onModifyModalState('buyDevCard');
  }

  const validateDevCardPurchase = () => {
    let isValid = true;
    const requiredResources = [playerHand.sheep, playerHand.hay, playerHand.stone];

    requiredResources.forEach(resourceAmount => {
      if(resourceAmount === 0){
        isValid = false;
      }
    });

    return isValid;
  };

  const buyDevCardHandler = async () => {
    const isValid = validateDevCardPurchase();
    // NOTE: an award is either longest road or largest army
    const NEW_AWARD_OBTAINED = false;

    if(isValid){

      const {updatedGame, updatedPlayerData, purchasedCard} = buyDevCard(ctx.currentGame, ctx.playerData);
      const userWonGame = checkForWinHandler(updatedPlayerData);

      const [responseData, saveGameAndPlayerDataErrorMsg] = await saveGameAndPlayerDataTransactional(updatedGame, [updatedPlayerData], userWonGame, ctx.username, ctx.userId, NEW_AWARD_OBTAINED);
      if(saveGameAndPlayerDataErrorMsg){
        ctx.onSetInfoModalTextColor('black');
        ctx.onSetInfoModalMessage(saveGameAndPlayerDataErrorMsg);
        ctx.onModifyModalState('info');
        return
      };

      ctx.onSetPlayerData(responseData.savedPlayerData);
      ctx.onSetCurrentGame(responseData.savedGame);

      ctx.onModifyModalState('buyDevCard');

      if(purchasedCard !== null){
        const formattedCardName = getFormatedDevCardName(purchasedCard);
        ctx.onSetInfoModalTextColor('black');
        ctx.onSetInfoModalMessage(`you purchased a ${formattedCardName} card!`);
        ctx.onModifyModalState('info');
      };

      return
    };

    setIsValid(false);
  };

  return (
    <div className='dev-card-confirmation-container'>

      <div className='trade-confirmation-header'>
        <h2>Are You Sure You Want to Buy a Development Card?</h2>
      </div>

      <div className='invalid-trade-container'>
        {
          !isValid
          &&
          <h2>You Don't Have the Required Cards</h2>
        }
      </div>

      <div className='trade-requirements-container'>
        <h3>If You Accept, You Will Trade in One of Each of the Below Cards in Exchange for One Development Card</h3>
      </div>

      <div className='required-cards'>
        <img id='offering-hay' className='hay-card' src={resourceCards(`./sheep_card.png`)} />
        <img id='offering-hay' className='hay-card' src={resourceCards(`./hay_card.png`)} />
        <img id='offering-hay' className='hay-card' src={resourceCards(`./stone_card.png`)} />
      </div>

      <div className='dev-card-modal-actions'>
        <button onClick={devCardModalHandler}>Cancel</button>
        <button onClick={buyDevCardHandler}>Buy Dev Card</button>
      </div>

    </div>
  )
}

export default BuyDevCardModalContent;