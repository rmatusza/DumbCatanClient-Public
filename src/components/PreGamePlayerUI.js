import { useContext, useState } from 'react';
import { getIsGameOwner, getPlayerList, generateInitialGamePhaseInstructions } from '../functions/utilFunctions';
import ModalStateContext from '../store/modal-context';
import shufflePlayers from '../utils/shuffle-players';
import './css/PreGamePlayerUI.css';

const PreGamePlayerUI = (props) => {
  const [notEnoughPlayers, setNotEnoughPlayers] = useState(false);
  const ctx = useContext(ModalStateContext);

  const shufflePlayersHandler = () => {
    //console.log('shuffling players')
    const playerList = getPlayerList(ctx.currentGame.players, 'PreGamePlayerUI');
    const shuffledPlayers = shufflePlayers(playerList);
    //console.log('shuffeled players: ', shuffledPlayers);
    return shuffledPlayers;
  }
  const startGameHandler = async () => {
    const shuffledPlayers = shufflePlayersHandler();
    if(shuffledPlayers.length < 2){
      //console.log('NOT ENOUGH PLAYERS: ', shuffledPlayers.length);
      setNotEnoughPlayers(true);
      return;
    }
    const initialGameInstructions = generateInitialGamePhaseInstructions(shuffledPlayers);

    const req = await fetch(`http://localhost:8080/api/games/${ctx.currentGame.gameId}/start_game`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'players': JSON.stringify(shuffledPlayers), 'initialGameInstructions': JSON.stringify(initialGameInstructions)})
    });
    const updatedGame = await req.json();
    ctx.onSetCurrentGame(updatedGame);
    await ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({senderId: ctx.userId}));
  }

  return(
    <div className='pre-game-ui-container'>
      {
        getIsGameOwner(ctx.currentGame.ownerId, ctx.userId) ?
        <button onClick={startGameHandler}>Start Game</button>
        :
        <h2 className='game-not-started-message'>Waiting on Game Owner to Start the Game</h2>
      }
      {
        notEnoughPlayers
        &&
        <h2 className='pre-game-ui-error-message'>You Need to Have at Least 2 Players to Start the Game</h2>
      }
    </div>
  )
}

export default PreGamePlayerUI;