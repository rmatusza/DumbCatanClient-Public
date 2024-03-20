import { useContext, useState, useEffect } from 'react';
import ModalStateContext from '../../store/modal-context';
import './css/InfoModalContent.css';

const InfoModalContent = () => {
  const [infoModalMessage, setInfoModalMessage] = useState("Loading...")
  const [infoModalTextColor, setInfoModalTextColor] = useState('black');
  const ctx = useContext(ModalStateContext);

  useEffect(async () => {
    setInfoModalMessage(ctx.infoModalMessage);
    if(ctx.infoModalTextColor){
      setInfoModalTextColor(ctx.infoModalTextColor);
    }
  }, [ctx.infoModalMessage, ctx.infoModalTextColor, ctx.currentGame]);

  const closeModalHandler = () => {
    if(ctx.infoModalData.performActionOnClose){
      //console.log('performing cleanup action')
      ctx.infoModalData.callback(...ctx.infoModalData.arguments);
    }
    ctx.onModifyModalState('info');
  }

  return (
    <div className='info-modal-container'>
      <div className='info-modal-message-container' style={{ color: infoModalTextColor }}>
        <h2 style={{ whiteSpace: "pre-wrap" }}>{infoModalMessage}</h2>
      </div>

      <div className='info-modal-actions'>
        {
          ctx.infoModalData.displayCloseButton
          &&
          <button onClick={closeModalHandler}>Close</button>
        }
      </div>

    </div>
  )
}

export default InfoModalContent;