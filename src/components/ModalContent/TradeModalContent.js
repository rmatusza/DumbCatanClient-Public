import { useContext, useState } from 'react';
import { sendTradeRequest, acceptTradeRequest, declineTradeRequest } from '../../functions/gameFunctions';
import { applyAcceptedTradeResultToPlayerData, applyPortTradeResultToPlayerData, prepareTradeRequestData, validateAcceptedTrade, validateNonPortTrade, validatePortTrade } from '../../functions/utilFunctions';
import { acceptTradeTransactionalRecipient } from '../../functions/transactionalFunctions';
import { saveUserData } from '../../functions/userFunctions';
import { WSMessage } from '../../static/data/uninitializedWSMessage'
import ModalStateContext from '../../store/modal-context';
import ConfirmTradeContent from './ConfirmTradeContent';
import ReceiveTradeContent from './ReceiveTradeContent';
import './css/TradeModalContent.css';
const lod = require('lodash');

// REFACTOR NOTE: move the send specific jsx into the ConfirmTradeContent component 
// and the receive specific jsx into the ReceiveTradeContent component
const TradeModalContent = (props) => {
  const [invalidTrade, setInvalidTrade] = useState(false);
  const [tradeSent, setTradeSent] = useState(false);
  const [portTradeSent, setPortTradeSent] = useState(false);
  const [tradeAccepted, setTradeAccepted] = useState(false);
  const [tradeDeclined, setTradeDeclined] = useState(false);
  const ctx = useContext(ModalStateContext);

  const tradeModalHandler = () => {
    ctx.onModifyModalState('trade');
  };

  const sendNonPortTradeRequestHandler = async () => {
    setTradeSent(true);

    const isValidTrade = validateNonPortTrade(ctx.tradeModalData, ctx.playerData);
    if (!isValidTrade) {
      setInvalidTrade(true);
      return
    }

    const requestData = prepareTradeRequestData(ctx);

    const [tradeRes, sendTradeRequestErrorMsg] = await sendTradeRequest(requestData);
    if (sendTradeRequestErrorMsg) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(sendTradeRequestErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    const recipientIdx = ctx.tradeModalData.tradeRecipientIdx;
    //console.log(recipientIdx)
    //console.log(ctx.tradeModalData)
    const recipientId = ctx.tradeModalData.playerList[recipientIdx].id;
    await ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/trade/request/to/${recipientId}`, {}, JSON.stringify({ senderId: ctx.userId }));
  };

  const sendPortTradeRequestHandler = async () => {
    setPortTradeSent(true);

    const isPortTradeValid = validatePortTrade(ctx.tradeModalData, ctx.playerData);
    if (!isPortTradeValid) {
      setInvalidTrade(true);
      return
    }

    const playerDataCpy = lod.cloneDeep(ctx.playerData);
    const updatedPlayerData = applyPortTradeResultToPlayerData(playerDataCpy, ctx.tradeModalData.desiredResources, ctx.tradeModalData.offeredResources);

    const [savedPlayerData, saveUserDataErrorMsg] = await saveUserData([updatedPlayerData], ctx.userId);
    if (saveUserDataErrorMsg) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(saveUserDataErrorMsg);
      ctx.onModifyModalState('info');
      return;
    }

    ctx.onSetPlayerData(savedPlayerData);
  }

  const acceptTradeRequestHandler = async () => {

    const isValidTrade = validateAcceptedTrade(ctx.tradeModalData, ctx.playerData);
    
    if (!isValidTrade) {
      setInvalidTrade(true);
      return;
    };

    const tradeMode = 'RECIPIENT';
    const senderId = ctx.tradeModalData.tradeSenderId;

    const updatedPlayerData = applyAcceptedTradeResultToPlayerData(lod.cloneDeep(ctx.playerData), tradeMode, ctx.tradeModalData.desiredResources, ctx.tradeModalData.offeredResources);

    const [savedPlayerData, acceptTradeTransactionalRecipientErrorMsg] = await acceptTradeTransactionalRecipient(updatedPlayerData, ctx.tradeModalData.tradeObject);
    
    if (acceptTradeTransactionalRecipientErrorMsg) {
      ctx.onModifyModalState('trade');
      ctx.onSetRecoveryModalData({
        type: 'acceptTradeTransactional_Recipient',
        recoveryFunctions: [acceptTradeTransactionalRecipient],
        recoveryFunctionArgs: [
          [
            updatedPlayerData,
            ctx.tradeModalData
          ],
        ],
        message: acceptTradeTransactionalRecipientErrorMsg,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    };

    
    WSMessage.tradeRecord = JSON.stringify(ctx.tradeModalData.tradeObject);
    setTradeAccepted(true);
    ctx.onSetPlayerData(savedPlayerData);
    ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/trade/request/from/${senderId}/to/${ctx.userId}/accepted`, {}, JSON.stringify(WSMessage));
  };

  const declineTradeRequestHandler = async () => {
    setTradeDeclined(true);

    const [declinedTrade, declineTradeRequestErrorMsg] = await declineTradeRequest(ctx.tradeModalData.tradeId);
    if (declineTradeRequestErrorMsg) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(declineTradeRequestErrorMsg);
      ctx.onModifyModalState('info');
      return
    };
  };


  return (
    <div id='trade-modal-content' className='trade-modal-content-container'>

      {
        ctx.tradeModalData.mode === 'SEND'
        &&
        <ConfirmTradeContent
          tradeSent={tradeSent}
          portTradeSent={portTradeSent}
          invalidTrade={invalidTrade}
        />
      }

      {
        ctx.tradeModalData.mode === 'RECEIVE'
        &&
        <ReceiveTradeContent invalidTrade={invalidTrade} tradeAccepted={tradeAccepted} tradeDeclined={tradeDeclined}/>
      }

      <div className='trade-modal-actions'>
        {
          ctx.tradeModalData.mode === 'SEND'
          &&
          <>
            <button onClick=
              {
                ctx.tradeModalData.isPortTrade ?
                  sendPortTradeRequestHandler
                  :
                  sendNonPortTradeRequestHandler
              }
            >
              Send Trade
            </button>
            <button onClick={tradeModalHandler}>{tradeSent ? 'Close' : 'Cancel'}</button>
          </>
        }
        {
          (ctx.tradeModalData.mode === 'RECEIVE' && (!tradeAccepted && !tradeDeclined))
          &&
          <>
            <button onClick={acceptTradeRequestHandler}>Accept Trade</button>
            <button onClick={declineTradeRequestHandler}>Decline Trade</button>
          </>
        }
        {
          (tradeAccepted || tradeDeclined)
          &&
          <button onClick={() => ctx.onModifyModalState('trade')}>Close</button>
        }
      </div>
    </div>
  );
}

export default TradeModalContent;
