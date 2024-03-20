import { useContext, useState, useEffect } from 'react';
import { removeGameFromGameList } from '../../functions/utilFunctions';
import { deleteGame } from '../../functions/gameFunctions';
import ModalStateContext from '../../store/modal-context';
import "./css/ConfirmationModalContent.css";
const lod = require('lodash');


const ConfirmationModalContent = () => {
  const [confirmationType, setConfirmationType] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    if(ctx.confirmationModalData){
      setConfirmationType(ctx.confirmationModalData.type);
    }
  }, [ctx.confirmationModalData])

  const getConfirmationMessage = () => {
    switch (confirmationType) {
      case 'DELETE_GAME':
        {
          return (<h3>{ctx.confirmationModalData ? `Are you sure that you want to delete game ${ctx.confirmationModalData.gameId}?` : 'Loading...'}</h3>)
        }

      default: return
    }
  }

  const getErrorMessage = () => {
    return
  }

  const getExtraContent = () => {
    return
  }

  const getButtonName = () => {
    switch (confirmationType) {
      case 'DELETE_GAME':
        { return 'Delete Game' }

      default: return
    }
  }

  const closeModalHandler = () => {
    ctx.onModifyModalState('confirmation');
  }

  const confirmationHandler = async () => {
    switch (confirmationType) {
      case 'DELETE_GAME':
        {
          const gameListCopy = lod.cloneDeep(ctx.confirmationModalData.gameList); 
          const setGameList = ctx.confirmationModalData.setGameList;
          const gameId = ctx.confirmationModalData.gameId;

          const [res, errorMessage] = await deleteGame(gameId);
          if(errorMessage){
            setErrorMessage(errorMessage);
            return
          }

          const updatedGameList = removeGameFromGameList(gameListCopy, gameId);

          setGameList(updatedGameList);
          ctx.onModifyModalState('confirmation');
          ctx.onSetConfirmationModalData(null);
        }
        break;

      default: return
    }
  }

  return (
    <div className='confirmation-modal-content-container'>

      <div className='confirmation-message'>
        {getConfirmationMessage()}
      </div>

      <div className={`confirmation-error-message`}>
        {
          errorMessage
          &&
          <p>{errorMessage}</p>
        }
      </div>

      <div className='confirmation-extra-content'>
        {getExtraContent()}
      </div>

      <div className='confirmation-actions'>
        <button onClick={confirmationHandler}>{getButtonName()}</button>
        <button onClick={closeModalHandler}>Cancel</button>
      </div>
    </div>
  )
}

export default ConfirmationModalContent;