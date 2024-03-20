import { useState, useContext } from 'react';
import ModalStateContext from '../../store/modal-context';
import getWindowDimensions from '../../utils/get-window-dimensions';
import './css/BuildConfirmationModalContent.css';
const resourceCards = require.context('../../../public/images/resource_cards', true);

const BuildConfirmationModalContent = () => {
  const [hasRequiredResources, setHasRequiredResources] = useState(true);
  const ctx = useContext(ModalStateContext);
  const { height } = getWindowDimensions(window);
  const halfHeight = height / 2;
  window.scrollTo({
    top: halfHeight,
    behavior: 'smooth'
  });
  const requiredResources = {
    'Settlement': {
      'wood': 1,
      'brick': 1,
      'hay': 1,
      'sheep': 1
    },
    'City': {
      'hay': 2,
      'stone': 3
    },
    'Road': {
      'brick': 1,
      'wood': 1
    }
  }

  const validateResources = () => {
    const playerResources = ctx.playerData.playerInfo.hand['resource_cards'];
    const type = ctx.tradeModalData.type;

    if (type === 'Settlement') {
      let MINIMUM_RESOURCE_AMOUNT = 1;

      let hasEnoughWood = playerResources['wood'] >= MINIMUM_RESOURCE_AMOUNT;
      let hasEnoughBrick = playerResources['brick'] >= MINIMUM_RESOURCE_AMOUNT;
      let hasEnoughHay = playerResources['hay'] >= MINIMUM_RESOURCE_AMOUNT;
      let hasEnoughSheep = playerResources['sheep'] >= MINIMUM_RESOURCE_AMOUNT;

      if (hasEnoughWood && hasEnoughBrick && hasEnoughHay && hasEnoughSheep) {
        ctx.onSetStructureType('settlement');
        ctx.onSetStructurePlacementMode(true);
        ctx.onSetRoadPlacementMode(false);
        ctx.onModifyModalState('buildConfirmation');
        return
      };
      setHasRequiredResources(false);
      return
    };

    if (type === 'City') {
      let MINIMUM_HAY_AMOUNT = 2;
      let MINIMUM_STONE_AMOUNT = 3;

      if (playerResources['hay'] >= MINIMUM_HAY_AMOUNT && playerResources['stone'] >= MINIMUM_STONE_AMOUNT) {
        ctx.onSetStructureType('city');
        ctx.onSetStructurePlacementMode(true);
        ctx.onSetRoadPlacementMode(false);
        ctx.onModifyModalState('buildConfirmation');
        return
      }
      setHasRequiredResources(false);
      return
    };

    if (type === 'Road') {
      let MINIMUM_BRICK_AMOUNT = 1;
      let MINIMUM_WOOD_AMOUNT = 1;

      if (playerResources['brick'] >= MINIMUM_BRICK_AMOUNT && playerResources['wood'] >= MINIMUM_WOOD_AMOUNT) {
        ctx.onSetRoadPlacementMode(true);
        ctx.onSetStructurePlacementMode(false);
        ctx.onModifyModalState('buildConfirmation');
        return
      }
      setHasRequiredResources(false);
      return
    };

    if (type === 'pass') {
      return
    };
  }

  const closeModalHandler = () => {
    ctx.onModifyModalState('buildConfirmation');
  }

  return (
    <div className='build-confirmation-modal-content-container'>

      <div className='build-confirmation-title'>
        <h2>{`Are You Sure You Want to Build a ${ctx.tradeModalData.type}?`}</h2>
        <h3>You Will need to Spend the Bellow Cards to Build This Structure</h3>
      </div>

      <div className={`build-confirmation-error-message`}>
        <h3>{`${!hasRequiredResources ? "You Don't Have the Required Cards" : ''}`}</h3>
      </div>

      <div className='build-confirmation-required-resources'>
        {
          Object.keys(requiredResources[ctx.tradeModalData.type]).map((resourceType, i) => {
            return (
              <div className='required-resource' key={i}>
                <img className={`${resourceType}-card`} src={resourceCards(`./${resourceType}_card.png`)} />
                <h4>{`x${requiredResources[ctx.tradeModalData.type][resourceType]}`}</h4>
              </div>
            )
          })
        }
      </div>

      <div className='build-confirmation-actions'>
        <button onClick={validateResources}>{`Build ${ctx.tradeModalData.type}`}</button>
        <button onClick={closeModalHandler}>Cancel</button>
      </div>
    </div>
  )
}

export default BuildConfirmationModalContent;