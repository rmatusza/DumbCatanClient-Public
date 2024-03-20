import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGameLimitStatus } from '../../functions/utilFunctions';
import { createAndSetGameTransactional } from '../../functions/transactionalFunctions';
import gameBoard from '../../utils/game-board';
import ModalStateContext from '../../store/modal-context';
import './css/CreateGameModalContent.css';

const CreateGameModalContent = (props) => {
  const [color, setColor] = useState(null);
  const [noColorChosenError, setNoColorChosenError] = useState(false);
  const navigate = useNavigate();
  const ctx = useContext(ModalStateContext);

  const colorSelectionHandler = (e) => {
    // props.onSetColor(e.target.id);
    setColor(e.target.id);
  }

  const createGameHandler = async () => {
    if (!color) {
      setNoColorChosenError(true);
      return
    }

    const [gameLimitStatus, gameLimitStatusErrorMessage] = await fetchGameLimitStatus(ctx.userId);
    if (gameLimitStatusErrorMessage) {
      ctx.onSetInfoModalMessage(gameLimitStatusErrorMessage);
      ctx.onModifyModalState('createGame');
      ctx.onSetInfoModalTextColor('black');
      ctx.onModifyModalState('info');
      return
    }

    ctx.onModifyModalState('createGame');
    ctx.onModifyDrawerState();

    const [responsedata, errorMessage] = await createAndSetGameTransactional(color, gameBoard, ctx.userId, ctx.username, ctx);
    if (errorMessage) {
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage('New game was not created successfully, please close this modal and try once more');
      ctx.onModifyModalState('info');
      return
    };

    const newGame = responsedata.savedGame;
    const newPlayerData = responsedata.savedPlayerData;
    const newGameBoardData = responsedata.savedGameBoardData;
   
    ctx.onSetCurrentGame(newGame);
    ctx.onSetGameBoard(newGameBoardData.gameBoard);
    ctx.onSetPlayerData(newPlayerData);
    
    navigate(`/game-space/${newGame.gameId}`);
  }

  return (
    <div className='pre-game-modal-content'>
      <div className='pre-game-modal-title-container'>
        <h2 className="pre-game-modal-title">Select Your Color:</h2>
      </div>
      <div className="pre-game-modal-color-selections">
        <div className='error-container'>
          {
            noColorChosenError
            &&
            <h3 className='no-color-chosen-error'>Please Select a Color</h3>
          }
        </div>
        <div className="color-choice-container">

          <div className="color-choice">
            Orange
          </div>
          <div className={'orange' + (color === 'orange' ? '__selected' : '')} id='orange' onClick={colorSelectionHandler}>

          </div>

        </div>

        <div className="color-choice-container">

          <div className="color-choice">
            White
          </div>
          <div className={"white" + (color === 'white' ? '__selected' : '')} id='white' onClick={colorSelectionHandler}>

          </div>

        </div>

        <div className="color-choice-container">

          <div className="color-choice">
            Red
          </div>
          <div className={"red" + (color === 'red' ? '__selected' : '')} id='red' onClick={colorSelectionHandler}>

          </div>

        </div>

        <div className="color-choice-container">

          <div className="color-choice">
            Blue
          </div>
          <div className={"blue" + (color === 'blue' ? '__selected' : '')} id='blue' onClick={colorSelectionHandler}>

          </div>

        </div>
      </div>

      <div className='pre-game-modal-actions'>
        <button className='modal-confirm-button' onClick={createGameHandler}>Create Game</button>
        <button className='modal-cancel-button' onClick={() => ctx.onModifyModalState('createGame')}>Close</button>
      </div>
    </div>
  )
}

export default CreateGameModalContent;