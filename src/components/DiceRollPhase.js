import { useContext, useEffect, useState } from "react";
import { rolledSevenTransactionHandler, rolledNonSevenTransactionHandler, turnPhaseHandler, getTurnPhase } from "../functions/utilFunctions";
import { WSMessage } from '../static/data/uninitializedWSMessage'
import ModalStateContext from "../store/modal-context";
import getWindowDimensions from "../utils/get-window-dimensions";

const lod = require('lodash');
const axeSpinner = require.context("../../public/images/other");

const DiceRollPhase = (props) => {
  const [robberPlacementMode, setRobberPlacementMode] = useState(false);
  const [robberPlaced, setRobberPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('DICE ROLL PHASE UE');

    setRobberPlacementMode(ctx.robberPlacementMode);
    setRobberPlaced(ctx.robberPlaced);

    if (!diceResult && ctx.currentGame.currDiceRoll !== 0) {
      setDiceResult(ctx.currentGame.currDiceRoll);
    };

    if(ctx.currentGame.currDiceRoll === 0 && diceResult !== null){
      setDiceResult(null);
    }

  }, [ctx.robberPlacementMode, ctx.robberPlaced, ctx.currentGame]);

  const applySevenRoll = async (wasRoller, playerDataCpy) => {
    const [transactionRes, transactionErrorMessage] = await rolledSevenTransactionHandler(playerDataCpy, ctx.currentGame.players, ctx.userId, ctx.currentGame.gameId, ctx, wasRoller);

    if (transactionErrorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'diceRollSeven',
        recoveryFunctions: [rolledSevenTransactionHandler],
        recoveryFunctionArgs: [
          [
            playerDataCpy,
            ctx.currentGame.players,
            ctx.userId,
            ctx.currentGame.gameId,
            ctx,
            wasRoller
          ]
        ],
        message: transactionErrorMessage,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
      return
    };

    const {savedPlayerData, savedGame} = transactionRes;

    ctx.onSetPlayerData(savedPlayerData);
    ctx.onSetCurrentGame(savedGame);

    WSMessage.senderId = ctx.userId;
    WSMessage.diceValue = 7;

    ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/diceRoll`, {}, JSON.stringify(WSMessage));
  };

  const applyNonSevenRoll = async (diceResult, playerDataCpy, gameCpy) => {
    
    const [rolledNonSevenResData, nonSevenDiceRollUpdateErrorMessage] = await rolledNonSevenTransactionHandler(playerDataCpy, diceResult, ctx, gameCpy);
    
    if (nonSevenDiceRollUpdateErrorMessage) {
      ctx.onSetRecoveryModalData({
        type: 'applyDiceResultAndSave',
        recoveryFunctions: [rolledNonSevenTransactionHandler],
        recoveryFunctionArgs: [
          [
            playerDataCpy,
            diceResult,
            ctx,
            gameCpy
          ],
        ],
        message: nonSevenDiceRollUpdateErrorMessage,
        textColor: 'black'
      });
      ctx.onModifyModalState('recovery');
    }

    const WSMessage = {
      'senderId': ctx.userId,
      'diceValue': diceResult
    };

    const {savedPlayerData, savedGame} = rolledNonSevenResData;

    if (savedPlayerData) {
      ctx.onSetPlayerData(savedPlayerData);
    };

    ctx.onSetCurrentGame(savedGame);

    ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/diceRoll`, {}, JSON.stringify(WSMessage));
  };

  const rollDice = () => {
    setIsLoading(true);
    // let diceResult = 8;
    let diceResult = Math.floor((Math.random() * 6) + 1) + Math.floor((Math.random() * 6) + 1);

    setTimeout(() => {
      setIsLoading(false);

      let wasRoller = true;
      setDiceResult(diceResult);

      const playerDataCpy = lod.cloneDeep(ctx.playerData);
      const gameCpy = lod.cloneDeep(ctx.currentGame);

      gameCpy.currDiceRoll = diceResult;

      if (diceResult === 7) {
        applySevenRoll(wasRoller, playerDataCpy);
      }
      else {
        applyNonSevenRoll(diceResult, playerDataCpy, gameCpy);
      }
    }, 3000);
  };

  const startNextTurnPhase = async () => {
    const windowDimensions = getWindowDimensions(window);
    const currTurnPhase = getTurnPhase(ctx.currentGame.currTurnPhaseIdx)
    await turnPhaseHandler(ctx, currTurnPhase, windowDimensions, window);
  }


  const getUI = () => {
    if (isLoading) {
      return (
        <>
          <div className='spinner-container__main-game'>
            <img className="spinner-img__main-game" src={axeSpinner('./axe_spinner.png')} />
          </div>
          <h2 style={{ color: 'black' }}>Rolling Dice...</h2>
        </>
      )
    }

    if (diceResult) {
      return (
        <>
          <h2 style={{ color: 'black', marginTop: '10px', marginBottom: 0 }}>Number Rolled:</h2>
          <h1 className='dice-result'>{diceResult}</h1>
          {
            robberPlacementMode && !robberPlaced
            &&
            <h3 style={{ 'color': 'red', 'padding': '5px' }}>Place the Robber by Clicking on One of the Game Tiles</h3>
          }
          {
            (!robberPlacementMode || robberPlaced)
            &&
            <button onClick={startNextTurnPhase}>Continue</button>
          }
        </>
      )
    }

    if (!diceResult && robberPlacementMode) {
      return (
        <>
          <h2 style={{ color: 'black', marginTop: '10px', marginBottom: 0 }}>Number Rolled:</h2>
          <h1 className='dice-result'>7</h1>
          {
            robberPlacementMode && !robberPlaced
            &&
            <h3 style={{ 'color': 'red', 'padding': '5px' }}>Place the Robber by Clicking on One of the Game Tiles</h3>
          }
        </>
      )
    }

    if (robberPlaced) {
      return (
        <button onClick={startNextTurnPhase}>Continue</button>
      )
    }

    return (
      <button onClick={rollDice}>Roll Dice</button>
    )
  }

  return (
    <>
      {getUI()}
    </>
  )
}

export default DiceRollPhase;