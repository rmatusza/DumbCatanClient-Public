import { useState, useContext, useEffect } from 'react';
import { largestArmyHandler, checkForWinHandler } from '../../functions/gameFunctions';
import { getPlayerDevCardsCopy, saveUserData } from '../../functions/userFunctions';
import { getFormatedDevCardName, checkForPendingTrades, activateAndDiscardPlayedDevCard, getObjectValueSum, getOtherPlayerIds, scrollToHalfHeight } from '../../functions/utilFunctions';
import { saveGameAndPlayerDataTransactional } from '../../functions/transactionalFunctions';
import ModalStateContext from '../../store/modal-context';
import getDevCardDescription from '../../utils/get-dev-card-description';
import './css/PlayDevCardModalContent.css';

const devCards = require.context('../../../public/images/dev_cards', true);
const lod = require('lodash');

// REFACTOR NOTE: updated player info record in db so that active knights has its own column
const PlayDevCardModalContent = (props) => {
  const [playerDevCardsCpy, setPlayerDevCardsCpy] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [totalDevCards, setTotalDevCards] = useState(null);
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('PLAY DEV CARD MC UE');

    scrollToHalfHeight(window);

    let playerDevCardsCpy = getPlayerDevCardsCopy(ctx.playerData, 'PLAY DEV CARD MODAL CONTENT');
    let totalDevCards = getObjectValueSum(playerDevCardsCpy);

    let preSelectedDevCard;
    Object.keys(playerDevCardsCpy).forEach(devCard => {
      if (playerDevCardsCpy[devCard] > 0 && devCard !== 'victory_point') {
        preSelectedDevCard = devCard;
        return;
      }
    });

    setPlayerDevCardsCpy(playerDevCardsCpy);
    setSelectedCard(preSelectedDevCard);
    setTotalDevCards(totalDevCards);
  }, []);

  const closeModalHandler = () => {
    ctx.onModifyModalState('playDevCard');
  }

  const yearOfPlentyHandler = async () => {
    const playerDataCpy = lod.cloneDeep(ctx.playerData);

    playerDataCpy.playerInfo.hand['dev_cards']['year_of_plenty'] -= 1;
    playerDataCpy.yearOfPlentyActive = 1;

    const [savedUserData, saveUserDataErrorMsg] = await saveUserData([playerDataCpy], ctx.userId);
    if (saveUserDataErrorMsg) {
      ctx.onSetInfoModalMessage(saveUserDataErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    ctx.onSetPlayerData(savedUserData);

    ctx.onSetSpecialGameMode('yearOfPlenty', true);

    ctx.onModifyModalState('playDevCard');
    ctx.onModifyModalState('yearOfPlenty');

    return;
  };

  const roadBuildingHandler = async () => {
    const playerDataCpy = lod.cloneDeep(ctx.playerData);

    playerDataCpy.playerInfo.hand['dev_cards']['road_building'] -= 1;
    playerDataCpy.roadBuildingActive = 1;

    const [savedUserData, saveUserDataErrorMsg] = await saveUserData([playerDataCpy], ctx.userId);
    if (saveUserDataErrorMsg) {
      ctx.onSetInfoModalMessage(saveUserDataErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    ctx.onSetPlayerData(savedUserData);

    ctx.onSetSpecialGameMode('roadBuilding', true);
    ctx.onSetRoadPlacementMode(true);

    ctx.onModifyModalState('playDevCard');

    return;
  };

  const monopolyHandler = async () => {
    const playerDataCpy = lod.cloneDeep(ctx.playerData);
    const otherPlayerIds = getOtherPlayerIds(ctx.currentGame.players, ctx.userId);

    const [isPendingTrade, checkForPendingTradesErrorMsg] = await checkForPendingTrades(otherPlayerIds, ctx.currentGame.gameId);
    if (checkForPendingTradesErrorMsg || isPendingTrade) {
      ctx.onSetInfoModalMessage(checkForPendingTradesErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    const updatedPlayerData = activateAndDiscardPlayedDevCard(playerDataCpy, selectedCard);

    const [savedUserData, saveUserDataErrorMsg] = await saveUserData([updatedPlayerData], ctx.userId);
    if (saveUserDataErrorMsg) {
      ctx.onSetInfoModalMessage(saveUserDataErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    ctx.onSetPlayerData(savedUserData);

    ctx.onSetSpecialGameMode('monopoly', true);
    ctx.onModifyModalState('playDevCard');
    ctx.onModifyModalState('monopoly');

    return;
  };

  const knightHandler = async () => {
    const playerDataCpy = lod.cloneDeep(ctx.playerData);
    const currentGameCpy = lod.cloneDeep(ctx.currentGame);
    const otherPlayerIds = getOtherPlayerIds(currentGameCpy.players, ctx.userId);

    const [isPendingTrade, checkForPendingTradesErrorMsg] = await checkForPendingTrades(otherPlayerIds, currentGameCpy.gameId);
    if (checkForPendingTradesErrorMsg) {
      ctx.onSetInfoModalMessage(checkForPendingTradesErrorMsg);
      ctx.onModifyModalState('info');
      return;
    }

    // NOTE: updatedPlayerData is an array with either 1 or 2 playerInfo objects
    // -> will be 2 if curr player is replacing second player as the new award holder
    const [updatedGame, updatedPlayerData, LAFound] = await largestArmyHandler(activateAndDiscardPlayedDevCard(playerDataCpy, selectedCard), currentGameCpy, ctx.username, ctx.userId);
    const userWonGame = checkForWinHandler(updatedPlayerData[0]);

    const [responseData, saveGameAndPlayerDataTransactionalErrorMsg] = await saveGameAndPlayerDataTransactional(updatedGame, updatedPlayerData, userWonGame, ctx.username, ctx.userId, LAFound);
    if (saveGameAndPlayerDataTransactionalErrorMsg) {
      ctx.onSetInfoModalMessage(saveGameAndPlayerDataTransactionalErrorMsg);
      ctx.onModifyModalState('info');
      return;
    };

    ctx.onSetPlayerData(responseData.savedPlayerData);

    if (userWonGame || LAFound) {
      ctx.onSetCurrentGame(responseData.savedGame);
      // NOTE: if user won game and/or a new largest army was recorded, then game data has changed and other users need to be alerted to refetch the game record
      ctx.stompClient.send(`/ws/game/${ctx.currentGame.gameId}/update`, {}, JSON.stringify({ senderId: ctx.userId }));

      if (updatedPlayerData.length === 2) {
        const previousOwnerData = updatedPlayerData[1];
        // NOTE: when there is a new LA AND a previous award holder is being replaced with a new award holder (indicated by updatedPlayerData having a length of 2 - contains 
        // current user/new award holder and old award holder), then old award holder lost 2 points in the largestArmyHandler and their updated data was then saved in the
        // saveGameAndPlayerDataTransactional - WS request then needs to be sent to alert them to refetch their updated player data
        ctx.stompClient.send(`/ws/user/${previousOwnerData.playerInfoUserId}/dataUpdate/for/game/${ctx.currentGame.gameId}`, {}, JSON.stringify({ senderId: ctx.userId, gameId: ctx.currentGame.gameId }));
      }
    };

    if (!userWonGame) {
      ctx.onSetSpecialGameMode('robber', true);
    };

    ctx.onModifyModalState('playDevCard');
  };

  const playDevCardHandler = () => {

    switch (selectedCard) {
      case 'year_of_plenty': yearOfPlentyHandler();
        break;

      case "road_building": roadBuildingHandler();
        break;

      case "monopoly": monopolyHandler();
        break;

      case "knight": knightHandler();
        break;

      default:
        return;
    }
  };

  const cardSelectionHandler = (card) => {
    setSelectedCard(card);
  };

  return(
    playerDevCardsCpy ?

      <div className='play-dev-card-modal-content-container'>

        <div className='play-dev-card-modal-title'>
          <h2>
            {
              totalDevCards === 1 ?
                'Are you sure you want to play this dev card?'
                :
                'Choose one of the below dev cards'
            }
          </h2>
        </div>

        <div className='play-dev-card-modal-dev-cards'>
          {
            Object.keys(playerDevCardsCpy).map((devCard, i) => {
              if (playerDevCardsCpy[devCard] > 0 && devCard !== 'victory_point') {
                return (
                  <div className='dev-card-container' onClick={() => cardSelectionHandler(devCard)} key={i}>
                    <h4 className={`${selectedCard === devCard ? 'selected-dev-card' : ''}`}>{getFormatedDevCardName(devCard)}</h4>
                    <img className={`${devCard}-card`} src={devCards(`./${devCard}.png`)} />
                  </div>
                )
              }
            })
          }
        </div>

        <div className='play-dev-card-modal-card-description-container'>
          <p>{getDevCardDescription(selectedCard)}</p>
        </div>

        <div className='play-dev-card-modal-actions'>
          <button onClick={playDevCardHandler}>Play Dev Card</button>
          <button onClick={closeModalHandler}>Cancel</button>
        </div>

      </div>

      :

      <div className='play-dev-card-modal-content-container'></div>
  )
}

export default PlayDevCardModalContent;