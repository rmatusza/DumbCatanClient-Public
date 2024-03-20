import { useState, useEffect, useContext } from 'react';
import { getPlayerDevCardsCopy, getLockedPlayerDevCardsCopy } from '../functions/userFunctions';
import { uninitializedDevCards, uninitializedLockedDevCards, uninitializedResourceCards, uninitializedStructures } from '../static/data/uninitialized_data';
import { TbArrowRightTail } from "react-icons/tb";
import PreGamePlayerUI from './PreGamePlayerUI';
import InitialGamePlayerUI from './InitialGamePlayerUI';
import MainGamePlayerUI from './MainGamePlayerUI';
import ModalStateContext from '../store/modal-context';
import PlayerInfo from './PlayerInfo';
import GameUpdates from './GameUpdates';
import './css/PlayerUI.css';

const PlayerUI = (props) => {
  const ctx = useContext(ModalStateContext);
  const [otherPlayerInfoView, setOtherPlayerInfoView] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [activeKnights, setActiveKnights] = useState(-1);
  const [devCards, setDevCards] = useState(uninitializedDevCards);
  const [lockedDevCards, setLockedDevCards] = useState(uninitializedLockedDevCards);
  const [resourceCards, setResourceCards] = useState(uninitializedResourceCards);
  const [structures, setStructures] = useState(uninitializedStructures);
  const { playerList, turnPhaseUI, gameAwards, gamePhase, currPlayerName } = props;

  // PLAYER DATA AND PENDING USER STATES UE
  useEffect(() => {
    //console.log('PLAYER UI PLAYER DATA UE');
    if (!ctx.playerData) {
      return
    }

    // REFACTOR NOTE: consider conditionally setting the below data
    // -> it's likely that only one or some subset need to be updated if any at all

    // SOLUTION IDEA: could add a column in playerInfo table that specifies what field was changed when playerInfo was saved and can 
    // specifically update that field only

    // SOLUTION IDEA: above solution could lead to issues due to timing b/c of the asynchronous nature of things. instead could just create a 
    // util function to compare previous data and incoming data - each slice of data is not big and so would be a non-costly operation or less so that 
    // resetting each field unecessarily 
    let playerDevCards = getPlayerDevCardsCopy(ctx.playerData, 'PLAYER UI');
    let lockedPlayerDevCards = getLockedPlayerDevCardsCopy(ctx.playerData);
    let resourceCards = ctx.playerData.playerInfo.hand['resource_cards'];
    let structures = ctx.playerData.playerInfo.structures;

    setDevCards(playerDevCards);
    setLockedDevCards(lockedPlayerDevCards);
    setResourceCards(resourceCards);
    setStructures(structures);
    setActiveKnights(ctx.playerData.playerInfo.hand.activeKnights);
    setPlayerData(ctx.playerData);

  }, [ctx.playerData]);

  const viewHandler = () => {
    setOtherPlayerInfoView(() => !otherPlayerInfoView)
  };

  const playerUiHandler = () => {
    ctx.onSetPlayerMenuOpen(null);
  };

  return (
    playerData
    &&
    <>
      <div className='player-ui-toggle-bar' onClick={playerUiHandler}>
        <h2>{ctx.playerMenuOpen ? 'Close Player Menu' : 'Open Player Menu'}</h2>
      </div>

      <div className={`player-ui-container${ctx.playerMenuOpen ? '__active' : '__inactive'}`}>

        {/* LEFT SIDE OF PLAYER UI */}
        <PlayerInfo
          color={playerData.playerInfo.color}
          points={playerData.playerInfo.points}
          settlements={structures.settlements.length}
          cities={structures.cities.length}
          roads={structures.roads.length}
          resourceCards={resourceCards}
          devCards={devCards}
          lockedDevCards={lockedDevCards}
          activeKnights={activeKnights}
          gameAwards={gameAwards}
        />

        {/* RIGHT SIDE OF PLAYER UI */}
        <div className='player-actions-and-updates'>

          <GameUpdates
            currPlayerName={currPlayerName}
            viewHandler={viewHandler}
            otherPlayerInfoView={otherPlayerInfoView}
            playerList={playerList}
          />

          <div className='player-actions'>

            <div className='turn-phases'>
              <h3 className={turnPhaseUI === 'diceRoll' ? 'active-phase' : ''}>Dice Roll</h3>
              <h1> <TbArrowRightTail /> </h1>
              <h3 className={turnPhaseUI === 'trading' ? 'active-phase' : ''}>Trading / Buy Dev Card</h3>
              <h1> <TbArrowRightTail /> </h1>
              <h3 className={turnPhaseUI === 'building' ? 'active-phase' : ''}>Building</h3>
            </div>

            <div className='underline'>
              <div />
            </div>

            <div className='turn-actions-ui'>
              {
                gamePhase === 'PRE'
                &&
                <PreGamePlayerUI />
              }
              {
                gamePhase === 'INITIAL'
                &&
                <InitialGamePlayerUI />
              }
              {
                gamePhase === 'MAIN'
                &&
                <MainGamePlayerUI turnPhaseUI={turnPhaseUI} />
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default PlayerUI;