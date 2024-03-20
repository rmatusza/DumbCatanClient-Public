import { useState, useContext, useEffect } from 'react';
import ModalStateContext from '../store/modal-context';
import BuildingPhase from './BuildingPhase';
import DiceRollPhase from './DiceRollPhase';
import TradingPhase from './TradingPhase';
import { updateTurnPhase } from '../functions/gameFunctions';
import { getIsYourTurn, getTurnPhase } from '../functions/utilFunctions';
import './css/MainGamePlayerUI.css';

const MainGamePlayerUI = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [turnPhase, setTurnPhase] = useState('diceRoll');
  const ctx = useContext(ModalStateContext);

  useEffect(()=>{
    //console.log('MAIN GAME PLAYER UI UE')
    if(!ctx.currentGame){
      return
    }
    const fetchedIsYourTurn = getIsYourTurn(ctx.currentGame, ctx.userId, "MGPUI UE");
    //console.log('IS YOUR TURN: ', isYourTurn);
    if(fetchedIsYourTurn){
      //console.log('IS YOUR TURN: ', isYourTurn);
      const checkedTurnPhase = getTurnPhase(ctx.currentGame.currTurnPhaseIdx);
      if(checkedTurnPhase !== turnPhase){
        //console.log(checkedTurnPhase)
        setTurnPhase(checkedTurnPhase);
      }
    }
    if(fetchedIsYourTurn !== isYourTurn){
      setIsYourTurn(fetchedIsYourTurn);
    }
  }, [ctx.currentGame])

  const mainGamePlayerUIContent = () => {

    if( !isYourTurn ){
      return (
        <h2>Waiting for other player to finish turn</h2>
      )
    }

    if (props.turnPhaseUI === 'diceRoll') {
      return (
        <DiceRollPhase
          onSetIsLoading={setIsLoading}
          isLoading={isLoading}
        />
      )
    }

    if (props.turnPhaseUI === 'trading') {
      return(
        <TradingPhase />
      )
    }

    if (props.turnPhaseUI === 'building') {
      return (
        <BuildingPhase />
      )
    }

  }

  // REFACTOR NOTE: see if you can get rid of the turnphaseUI check
  return (
    <div className={`main-game-ui-container${props.turnPhaseUI === 'diceRoll' ? '__dice-roll-step' : ''}`}>
      { mainGamePlayerUIContent(isYourTurn) }
    </div>
  )
}

export default MainGamePlayerUI