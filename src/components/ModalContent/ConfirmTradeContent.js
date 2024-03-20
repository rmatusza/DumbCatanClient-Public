import { useContext } from 'react';
import ModalStateContext from '../../store/modal-context';
import './css/ConfirmTradeContent.css';

const resourceCards = require.context('../../../public/images/resource_cards', true);

const ConfirmTradeContent = (props) => {
  const ctx = useContext(ModalStateContext);

  return (
    <div className='confirm-trade-content'>
      <div className='trade-confirmation-header'>
        <h2 style={{ textDecoration: 'underline' }}>Trading With {ctx.tradeModalData.tradeRecipient}</h2>
      </div>
      <div className='trade-status-message-container'>
        {
          props.tradeSent && props.invalidTrade
          &&
          <h1 className={'invalid-trade-message'}>Invalid Trade</h1>
        }
        {
          props.tradeSent && !props.invalidTrade
          &&
          <h1 className={'valid-trade-message'}>Trade Sent</h1>
        }
        {
          props.portTradeSent && props.invalidTrade
          &&
          <h1 className={'invalid-trade-message'}>Invalid Trade</h1>
        }
        {
          props.portTradeSent && !props.invalidTrade
          &&
          <h1 className={'valid-trade-message'}>Trade Successful</h1>
        }
      </div>
      <div className='trade-data-container'>

        <div className='offering-section'>
          <h3>Offering</h3>
          <div className='trade-counts'>
            {Object.keys(ctx.tradeModalData.offeredResources).map((resource, i) => {
              if (ctx.tradeModalData.offeredResources[resource] !== 0) {
                return (
                  <div className='trade-count' key={i}>
                    <img id='offering-hay' className='hay-card' src={resourceCards(`./${resource}_card.png`)} />
                    <h3 id='resource-amount-confirmation'>x {ctx.tradeModalData.offeredResources[resource]}</h3>
                  </div>
                )
              }
            })}
          </div>
        </div>

        <div className='exchange-section'>
          <h3>In Exchange For</h3>
          <div className='trade-counts'>
            {Object.keys(ctx.tradeModalData.desiredResources).map((resource, i) => {
              if (ctx.tradeModalData.desiredResources[resource] !== 0) {
                return (
                  <div className='trade-count' key={i}>
                    <img id='offering-hay' className='hay-card' src={resourceCards(`./${resource}_card.png`)} />
                    <h3 id='resource-amount-confirmation'>x {ctx.tradeModalData.desiredResources[resource]}</h3>
                  </div>
                )
              }
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmTradeContent;