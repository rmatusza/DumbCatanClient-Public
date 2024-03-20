import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentPlayerName, getTurnPhase } from '../functions/utilFunctions';
import { getGameAwards, getGamePhase } from '../functions/gameFunctions';
import Tiles from '../components/Tiles';
import BoardOverlay from '../components/BoardOverlay';
import ModalStateContext from '../store/modal-context';
import PlayerUI from '../components/PlayerUI';
import WebsocketHandler from '../components/WebsocketHandler';
import InitialLoadHandler from '../components/InitialLoadHandler';
import './css/GameSpace.css';

const GameSpace = (props) => {
  const [gameBoard, setGameBoard] = useState(null);
  const [gamePhase, setGamePhase] = useState(null);
  const [turnPhaseUI, setTurnPhaseUI] = useState(null);
  const [gameAwards, setGameAwards] = useState(null);
  const [playerList, setPlayerList] = useState(null);
  const [currPlayerName, setCurrPlayerName] = useState(null);
  const [finishedInitialChecks, setFinishedInitialChecks] = useState(false);

  const ctx = useContext(ModalStateContext);
  const navigate = useNavigate();

  //console.log(ctx.stompClient)

  useEffect(async () => {
    //console.log('GAME SPACE UE')

    if (!ctx.currentGame) {
      return
    }

    if (!ctx.authenticated) {
      navigate("/authentication");
    }

    if (ctx.currentGame.playerSize !== null) {
      const
        {
          gameOver,
          winnerUsername
        } = ctx.currentGame

      if (gameOver === 1) {
        ctx.onSetWinnerUsername(winnerUsername);
        ctx.onModifyModalState('gameOver');
      }

      const turnPhase = getTurnPhase(ctx.currentGame.currTurnPhaseIdx);
      const gameAwards = getGameAwards(ctx.currentGame);
      const gamePhase = getGamePhase(ctx.currentGame);
      const currentPlayerName = getCurrentPlayerName(ctx.currentGame);

      setTurnPhaseUI(turnPhase);
      setGameAwards(gameAwards);
      setGamePhase(gamePhase);
      setCurrPlayerName(currentPlayerName);

      ctx.onSetGamePhase(gamePhase);
      ctx.onSetCurrentPlayerName(currentPlayerName);
    }
  }, [ctx.currentGame]);

  // GAME BOARD USE EFFECT
  useEffect(() => {

    if (!ctx.gameBoard) {
      return
    };
    setGameBoard(ctx.gameBoard);

  }, [ctx.gameBoard]);

  return (
    (gameBoard && ctx.currentGame.gameId !== null)
    &&
    <>

      {
        !finishedInitialChecks
        &&
        <InitialLoadHandler 
          setFinishedInitialChecks={setFinishedInitialChecks}
          setPlayerList={setPlayerList}
        />
      }

      <WebsocketHandler
        currentGame={ctx.currentGame}
        userId={ctx.userId}
      />

      <div className="game-space-page">

        <BoardOverlay
          gameBoard={gameBoard}
        />

        <div className='board-container'>
          <div className={`row-0`} key={0}>
            <Tiles idx={0} gameBoard={gameBoard} />
          </div>
          <div className={`row-1`} key={1}>
            <Tiles idx={1} gameBoard={gameBoard} />
          </div>
          <div className={`row-2`} key={2}>
            <Tiles idx={2} gameBoard={gameBoard} />
          </div>
          <div className={`row-3`} key={3}>
            <Tiles idx={3} gameBoard={gameBoard} />
          </div>
          <div className={`row-4`} key={4}>
            <Tiles idx={4} gameBoard={gameBoard} />
          </div>
        </div>

      </div>

      {
        finishedInitialChecks
        &&
        <PlayerUI
          playerList={playerList}
          turnPhaseUI={turnPhaseUI}
          gameAwards={gameAwards}
          gamePhase={gamePhase}
          currPlayerName={currPlayerName}
        />
      }
      <script></script>
    </>
  )
};

export default GameSpace;