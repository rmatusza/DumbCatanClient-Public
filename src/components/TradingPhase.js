import { useContext, useState, useEffect } from "react";
import { getPlayerDevCardsCopy } from "../functions/userFunctions";
import { portNameMap } from "../static/data/staticData";
import { uninitializedDesiredResources, uninitializedOfferedResources } from "../static/data/uninitialized_data";
import {
  tradeRecipientHandler,
  offeredResourceHandler,
  desiredResourceHandler,
  getPlayerList,
  checkForPendingTrades,
  getOtherPlayerIds,
  scrollToHalfHeight,
  getDevCardCount,
  getResourceTypeAmount,
  getObjectValueSum,
  turnPhaseHandler,
  getTurnPhase,
  pendingStateActive,
} from "../functions/utilFunctions";
import ModalStateContext from "../store/modal-context";
import generateNodeToPortMap from "../utils/node-to-port-map";
import getWindowDimensions from '../utils/get-window-dimensions';
import './css/TradingPhase.css';

const resourceCards = require.context('../../public/images/resource_cards', true);

const TradingPhase = (props) => {
  const [createTradeActive, setCreateTradeActive] = useState(true);
  const [tradeRecipientIdx, setTradeRecipientIdx] = useState(null);
  const [tradeRecipient, setTradeRecipient] = useState(null);
  const [tradeRecipientId, setTradeRecipientId] = useState(null);
  const [isPortTrade, setIsPortTrade] = useState(false);
  const [robberPlacementMode, setRobberPlacementMode] = useState(false);
  const [robberPlaced, setRobberPlaced] = useState(false);
  const [roadPlacementMode, setRoadPlacementMode] = useState(false);
  const [playerList, setPlayerList] = useState(null);
  const [portTradeOptions, setPortTradeOptions] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [offeredResources, setOfferedResources] = useState(uninitializedOfferedResources);
  const [desiredResources, setDesiredResources] = useState(uninitializedDesiredResources);
  const ctx = useContext(ModalStateContext);

  // GAME STATE USE EFFECT
  useEffect(() => {
    //console.log('TRADING PHASE GAME STATE UE');
    setRobberPlacementMode(ctx.robberPlacementMode);
    setRobberPlaced(ctx.robberPlaced);
    setRoadPlacementMode(ctx.roadPlacementMode);
  }, [ctx.robberPlacementMode, ctx.robberPlaced, ctx.roadPlacementMode])

  // DATA INITIALIZATION USE EFFECT
  useEffect(() => {
    //console.log('TRADING PHASE DATA INITIALIZATION UE');
    
    if(!initialLoadComplete){
      const portTradeOptions = [];
      const playerList = getPlayerList(ctx.currentGame.players, 'trading phase');
  
      const ports = ctx.currentGame.ports;
      const nodeToPortMap = generateNodeToPortMap(ports);
      
      const playerStructures = ctx.playerData.playerInfo.structures;
      const settlementAndCityLocations = [...playerStructures.settlements, ...playerStructures.cities];
  
      settlementAndCityLocations.forEach((node, i) => {
        if (nodeToPortMap[node]) {
          portTradeOptions.push(nodeToPortMap[node])
        }
      });

      setPlayerList(playerList);
      setPortTradeOptions(portTradeOptions);
      setInitialLoadComplete(true);
    }
    
  }, [ctx.playerData, ctx.currentGame]);

  const sendTradeRequest = async () => {
    // const playerDataCpy
    //console.log(ctx.playerData.playerInfo.hand['resource_cards'])
    const req = await fetch('http://localhost:8080/api/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          'tradesGameId': ctx.currentGame.gameId,
          'tradesSenderId': ctx.userId,
          'tradesRecipientId': playerList[tradeRecipientIdx].id,
          'offeredResources': JSON.stringify(offeredResources),
          'desiredResources': JSON.stringify(desiredResources),
          'senderData': JSON.stringify(ctx.playerData.playerInfo.hand['resource_cards'])
        }
      )
    })

    if (req.status !== 200) {
      // add error message 
    }
    const res = await req.json();
  }

  const createTradeHandler = () => {
    const errorMessage = pendingStateActive(ctx.playerData, 'trading');
    if(errorMessage){
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
      scrollToHalfHeight(window);
      return;
    }

    if (tradeRecipient !== null && tradeRecipient !== 'Choose a Recipient') {

      const totalOfferedResourceCount = getObjectValueSum(offeredResources);
      const totalDesiredResourcesCount = getObjectValueSum(desiredResources);

      const isInvalid = isPortTrade ?
      ( 
        totalOfferedResourceCount === 0
        ||
        totalDesiredResourcesCount === 0
      )
      :
      (
        totalOfferedResourceCount === 0
        &&
        totalDesiredResourcesCount === 0
      )
      
      if (isInvalid) {
        ctx.onSetInfoModalMessage(isPortTrade ? 
          "You must choose to offer AND receive a valid number and type of resources to trade at a given port. See the ratio displayed on the desired port to determine the correct number and type of resource." 
          : 
          "You must select at least 1 resource to give to the recipient OR at least 1 resource that you would like to receive from the recipient"
        );
        ctx.onSetInfoModalTextColor('black');
        ctx.onModifyModalState('info');
        scrollToHalfHeight(window);
        return;
      }

      ctx.onSetTradeModalData({
        'offeredResources': offeredResources,
        'desiredResources': desiredResources,
        'tradeRecipient': tradeRecipient,
        'tradeRecipientIdx': tradeRecipientIdx,
        'playerData': ctx.playerData,
        'playerList': playerList,
        'requestFunction': sendTradeRequest,
        'onSaveUserData': props.onSaveUserData,
        'isPortTrade': isPortTrade,
        'mode': 'SEND',
      });

      ctx.onModifyModalState('trade');
      scrollToHalfHeight(window);
      
      return;
    }
  }

  const startNextTurnPhase = async () => {
    // const windowDimensions = getWindowDimensions(window);
    const currTurnPhase = getTurnPhase(ctx.currentGame.currTurnPhaseIdx)
    
    await turnPhaseHandler(ctx, currTurnPhase, window);
  };

  const playDevCardHandler = () => {
    const errorMessage = pendingStateActive(ctx.playerData, 'playing a dev card');
    if(errorMessage){
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
      scrollToHalfHeight(window);
      return;
    };
    const playerDevCards = getPlayerDevCardsCopy(ctx.playerData, 'TRADING PHASE');
    if (getDevCardCount(playerDevCards) === 0) {
      scrollToHalfHeight(window);
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(`You do not have any playable development cards \n\n Note that you cannot play a development card on the same turn that you purchased it, and that victory points are automatically applied`);
      ctx.onModifyModalState('info');
      return
    };
    ctx.onModifyModalState('playDevCard');
  }

  const buyDevCardHandler = () => {
    const errorMessage = pendingStateActive(ctx.playerData, 'buying a dev card');
    if(errorMessage){
      ctx.onSetInfoModalTextColor('black');
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
      scrollToHalfHeight(window);
      return;
    }

    scrollToHalfHeight(window);
    ctx.onModifyModalState('buyDevCard');
  }

  // REFACTOR NOTE: this function is in bulding phase too, consider making it a util function
  const getPlayerInstructions = () => {
    if (roadPlacementMode) {
      return 'Place a Road by Clicking on the Desired Starting and Ending Position of the Road';
    }
    if (robberPlacementMode && !robberPlaced) {
      return 'Place the Robber by Clicking on One of the Game Tiles';
    }
    return '';
  }

  return (
    <>
      {
        (createTradeActive && initialLoadComplete)
        &&
        <>
          <div className='player-trade-select'>
            <p>Trade With:</p>
            <select onChange={(e) => tradeRecipientHandler(e, setIsPortTrade, setTradeRecipient, setTradeRecipientIdx, portNameMap, playerList)}>
              <option value={null}>Choose a Recipient</option>
              {
                playerList.map((player, i) => {
                  if (player.id !== ctx.userId) {
                    return (
                      <option value={i} key={i} id={player.id}>{player.username}</option>
                    )
                  }
                })
              }
              {
                portTradeOptions.map((port, i) => {
                  return (
                    <option value={port} key={i}>{portNameMap[port]}</option>
                  )
                })
              }
            </select>
          </div>
          <div className='resource-trade-options'>
            <div className='resource-trade-options__selection'>
              <h3>Offering:</h3>
              <div className='offering-selections'>
                <img onClick={() => offeredResourceHandler('wood', false, setOfferedResources, offeredResources)} className='hay-card' src={resourceCards('./wood_card.png')} />
                <img onClick={() => offeredResourceHandler('brick', false, setOfferedResources, offeredResources)} className='hay-card' src={resourceCards('./brick_card.png')} />
                <img onClick={() => offeredResourceHandler('stone', false, setOfferedResources, offeredResources)} className='hay-card' src={resourceCards('./stone_card.png')} />
                <img onClick={() => offeredResourceHandler('hay', false, setOfferedResources, offeredResources)} className='hay-card' src={resourceCards('./hay_card.png')} />
                <img onClick={() => offeredResourceHandler('sheep', false, setOfferedResources, offeredResources)} className='hay-card' src={resourceCards('./sheep_card.png')} />
              </div>
              <div className='trade-counts'>
                {Object.keys(offeredResources).map((resource, i) => {
                  if (offeredResources[resource] !== 0) {
                    return (
                      <div className='trade-count' key={i}>
                        <p>x{offeredResources[resource]}</p>
                        <button id='reduce-resource-amount-button' onClick={() => offeredResourceHandler(resource, true, setOfferedResources, offeredResources)} style={{ cursor: 'pointer' }}>Reduce</button>
                      </div>
                    )
                  }
                  return (
                    <div className='trade-count' key={i} />
                  )
                })}
              </div>
            </div>
            <div className='resource-trade-options_separator' />
            <div className='resource-trade-options__selection'>
              <h3>In Exchange For:</h3>
              <div className='offering-selections'>
                <img onClick={() => desiredResourceHandler('wood', false, setDesiredResources, desiredResources)} className='hay-card' src={resourceCards('./wood_card.png')} />
                <img onClick={() => desiredResourceHandler('brick', false, setDesiredResources, desiredResources)} className='hay-card' src={resourceCards('./brick_card.png')} />
                <img onClick={() => desiredResourceHandler('stone', false, setDesiredResources, desiredResources)} className='hay-card' src={resourceCards('./stone_card.png')} />
                <img onClick={() => desiredResourceHandler('hay', false, setDesiredResources, desiredResources)} className='hay-card' src={resourceCards('./hay_card.png')} />
                <img onClick={() => desiredResourceHandler('sheep', false, setDesiredResources, desiredResources)} className='hay-card' src={resourceCards('./sheep_card.png')} />
              </div>
              <div className='trade-counts'>
                {Object.keys(desiredResources).map((resource, i) => {
                  if (desiredResources[resource] !== 0) {
                    return (
                      <div className='trade-count' key={i}>
                        <p>x{desiredResources[resource]}</p>
                        <button id='reduce-resource-amount-button' onClick={() => desiredResourceHandler(resource, true, setDesiredResources, desiredResources)} style={{ cursor: 'pointer' }}>Reduce</button>
                      </div>
                    )
                  }
                  return (
                    <div className='trade-count' key={i} />
                  )
                })}
              </div>
            </div>
          </div>
        </>
      }
      {
        getPlayerInstructions() !== ''
        &&
        <div className='player-instructions_trading-phase'>
          {getPlayerInstructions()}
        </div>
      }
      <div className='trade-phase-actions'>
        <button className='trade-button' onClick={createTradeHandler}>Trade</button>
        <button className='buy-dev-card-button' onClick={buyDevCardHandler}> Buy Dev Card</button>
        <button className='play-dev-card-button' onClick={playDevCardHandler}> Play Dev Card</button>
        <button className='pass-button' onClick={startNextTurnPhase}> Pass </button>
      </div>
    </>
  )
}

export default TradingPhase;