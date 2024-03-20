import { useContext } from 'react';
import './css/StolenResourceUpdateModalContent.css';
import ModalStateContext from '../../store/modal-context';

const StolenResourceUpdateModalContent = () =>{
  const ctx = useContext(ModalStateContext);

  const closeModalHandler = () => {
    ctx.onModifyModalState('stolenResourceUpdate');
  }

  return (
    <div className='stolen-resource-update-modal-content-container'>

      <div className='stolen-resource-update-modal__message-container'>
        <h1>
          {
            ctx.stolenResourceUpdateData.monopoly === 'Y' ?
            (
              ctx.stolenResourceUpdateData.target ? 
              `${ctx.stolenResourceUpdateData.senderUsername} Stole ${ctx.stolenResourceUpdateData.resourceAmount} ${ctx.stolenResourceUpdateData.resourceType} From You`
              :
              `You Stole ${ctx.stolenResourceUpdateData.resourceAmount} ${ctx.stolenResourceUpdateData.resourceType} From ${ctx.stolenResourceUpdateData.targetUsername}`
            )
            :
            (
              ctx.stolenResourceUpdateData.target ? 
              `${ctx.stolenResourceUpdateData.senderUsername} Stole a ${ctx.stolenResourceUpdateData.resourceType} From You`
              :
              `You Stole a ${ctx.stolenResourceUpdateData.resourceType} From ${ctx.stolenResourceUpdateData.targetUsername}`
            )
          }
        </h1>
      </div>

      <div className='stolen-resource-update-modal__actions'>
        <button onClick={closeModalHandler}>Close</button>
      </div>
    </div>
  )
}

export default StolenResourceUpdateModalContent;