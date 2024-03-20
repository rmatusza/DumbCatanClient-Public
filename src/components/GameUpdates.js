
import DiceResult from './DiceResult';
import OtherPlayerInfo from './OtherPlayerInfo';
import './css/PlayerUI.css';

const GameUpdates = (props) => {
  const {currPlayerName, viewHandler, otherPlayerInfoView, playerList} = props;

  return (
    <div className='live-updates'>
      <div className='live-updates_header'>
        <div className='current-turn'>
          <h4>Current Turn:</h4>
          <span>{currPlayerName ? currPlayerName : 'Loading...'}</span>
        </div>
        <button onClick={viewHandler}>{otherPlayerInfoView ? 'View Game Updates' : 'View Other Player Info'}</button>
      </div>
      <div className='live-updates_body'>
        {
          otherPlayerInfoView
          &&
          <OtherPlayerInfo
            playerList={playerList}
          />
        }
        {
          !otherPlayerInfoView
          &&
          <DiceResult />
        }
      </div>
    </div>
  )
}

export default GameUpdates;