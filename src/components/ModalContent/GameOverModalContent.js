import { useContext } from 'react';
import { useNavigate } from "react-router-dom";
import ModalStateContext from '../../store/modal-context';
import './css/GameOverModalContent.css';

const GameOverModalContent = () => {
  const ctx = useContext(ModalStateContext);
  const navigate = useNavigate();
  //console.log(ctx)
  const exitHandler = () => {
    navigate('/home');
    ctx.onModifyModalState('gameOver');
  }

  return (
    <div className='game-over-modal-content-container'>

      <h1 className='game-over-modal-title'>
        Game Over
      </h1>

      <h3 className='game-over-modal-winner-info'>
        {`${ctx.winnerUsername} Has Won This Game`}
      </h3>

      <div className='game-over-actions'>
        <button onClick={exitHandler}>Exit</button>
      </div>

    </div>
  )
}

export default GameOverModalContent;