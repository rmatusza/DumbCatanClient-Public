import { useContext, useState } from 'react';
import ModalStateContext from '../../store/modal-context';
import { editDevCards, editPoints, editResourceCards } from '../../functions/userFunctions';
import './css/DevConsoleModalContent.css';

const DevConsoleModalContent = () => {
  const [points, setPoints] = useState(NaN);
  const [selectedResourceCard, setSelectedResourceCard] = useState('brick');
  const [resourceQuantity, setResourceQuantity] = useState(NaN);
  const [selectedDevCard, setSelectedDevCard] = useState('knight');
  const [devCardQuantity, setDevCardQuantity] = useState(NaN);
  const [gameNumber, setGameNumber] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const ctx = useContext(ModalStateContext);

  const editResourceCardHandler = (e) => {
    //console.log(e.target.value)
    setSelectedResourceCard(e.target.value);
  }

  const editDevCardHandler = (e) => {
    setSelectedDevCard(e.target.value);
  }

  const resourceQuantityHandler = (e) => {
    setResourceQuantity(parseInt(e.target.value, 10));
  }

  const devCardQuantityHandler = (e) => {
    setDevCardQuantity(parseInt(e.target.value, 10));
  }

  const editPointsHander = (e) => {
    setPoints(parseInt(e.target.value, 10));
  }

  const playerIdHandler = (e) => {
    setPlayerId(parseInt(e.target.value, 10))
  }

  const gameNumberHandler = (e) => {
    setGameNumber(parseInt(e.target.value, 10));
  }

  const submitHandler = async (type) => {
    if (type === 'modifyResourceCards') {
      if(isNaN(resourceQuantity)){
        return
      }
      const resources = {};
      resources[selectedResourceCard] = resourceQuantity;
      await editResourceCards(ctx.playerData, resources, ctx.onSetPlayerData);
    }
    else if (type === 'modifyDevCards') {
      if(isNaN(devCardQuantity)){
        return
      }
      const devCards = {};
      devCards[selectedDevCard] = devCardQuantity;
      await editDevCards(ctx.playerData, devCards, ctx.onSetPlayerData);
    }
    else {
      if(isNaN(points)){
        //console.log('returning')
        return
      }
      await editPoints(ctx.playerData, points, ctx.onSetPlayerData);
    }
  }

  const deleteRoadHandler = () => {
    ctx.onSetRoadAction('DELETE');
    ctx.onSetRoadPlacementMode(true);
    ctx.onModifyModalState('devConsole');
  }

  const recalcLRHandler = () => {
    return
  }

  const toggleRobberMode = () => {
    //console.log('HERER')
    ctx.onSetSpecialGameMode('robber');
  }

  return (
    <div className="dev-console-modal-container">

      <div className='game-and-player-info-container'>

        <div className='dev-console-form-container'>
          <label for='gameNumber'>Game Number</label>
          <input name='gameNumber' type='number' onChange={gameNumberHandler}></input>
        </div>

        <div className='dev-console-form-container'>
          <label for='playerId'>Player ID</label>
          <input name='playerId' type='number' onChange={playerIdHandler}></input>
        </div>

      </div>

      {/* */}

      <div className='delete-road-container'>
        <button onClick={deleteRoadHandler}>Delete Road</button>
        <button style={{'backgroundColor': ctx.robberPlacementMode === true ? 'green' : 'red'}} onClick={toggleRobberMode}>Robber Mode</button>
      </div>

      {/* */}

      <div className='edit-resource-card-container'>

        <select className='dev-console-select' onChange={editResourceCardHandler}>
          <option value={'brick'}>
            Brick
          </option>
          <option value={'wood'}>
            Wood
          </option>
          <option value={'hay'}>
            Hay
          </option>
          <option value={'stone'}>
            Stone
          </option>
          <option value={'sheep'}>
            Sheep
          </option>
        </select>

        <div className='dev-console-form-container'>
          <label for='resourceQuantity'>Quantity</label>
          <input name='resourceQuantity' type='number' onChange={resourceQuantityHandler}></input>
        </div>

        <div className='dev-console-submit-button-container'>
          <button onClick={() => submitHandler('modifyResourceCards')}>Modify Resource Cards</button>
        </div>

      </div>

      {/* */}

      <div className='edit-dev-card-container'>

        <select className='dev-console-select' onChange={editDevCardHandler}>
          <option value={'knight'}>
            Knight
          </option>
          <option value={'monopoly'}>
            Monopoly
          </option>
          <option value={'road_building'}>
            Road Building
          </option>
          <option value={'year_of_plenty'}>
            Year of Plenty
          </option>
        </select>

        <div className='dev-console-form-container'>
          <label for='devCardQuantity'>Quantity</label>
          <input name='devCardQuantity' type='number' onChange={devCardQuantityHandler}></input>
        </div>

        <div className='dev-console-submit-button-container'>
          <button onClick={() => submitHandler('modifyDevCards')}>Modify Dev Cards</button>
        </div>

      </div>

      {/* */}

      <div className='edit-points-container'>

        <div className='placeholder'></div>

        <div className='dev-console-form-container'>
          <label for='points'>Points</label>
          <input name='points' type='number' onChange={editPointsHander}></input>
        </div>

        <div className='dev-console-submit-button-container'>
          <button onClick={() => submitHandler('modifyPoints')}>Modify Points</button>
        </div>

      </div>

      {/* */}

      <div className='dev-console-modal-actions'>
        <button className='modal-cancel-button' onClick={() => ctx.onModifyModalState('devConsole')}>Close</button>
      </div>
    </div>
  )
}

export default DevConsoleModalContent;