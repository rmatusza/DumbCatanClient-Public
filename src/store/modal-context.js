import React, { useState, useEffect, useCallback } from "react";
import { scrollToHalfHeight } from "../functions/utilFunctions";
const lod = require('lodash');
// Should contain:
// 1. user info
// 2. current game info
// 3. modal states and toggle functions

const ModalStateContext = React.createContext({
  editProfileModalActive: false,
  editUsernameAndPassword: false,
  editAvatar: false,
  username: '',
  avatarURL: '',
  userId: null,
  drawerActive: false,
  authenticated: false,
  createGameModalActive: false,
  invitationModalActive: false,
  tradeModalActive: false,
  TradeModalContent: {
    'offeredResources': null,
    'desiredResources': null,
    'tradeRecipient': null,
    'playerHand': null,
    'requestFunction': null
  },
  playerMenuOpen: false,
  currentGame: null,
  playerData: null,
  createGameModalContent: null,
  stompClient: { connected: false },
  rolledResources: {},
  diceResult: {},
  stolenResourceUpdateModalActive: false,
  stolenResourceUpdateData: null,
  modalData: {},
  role: null,
  gameInvites: [],
  keyListenerRegistered: false
});

export const ModalStateContextProvider = (props) => {
  const [connectedToWebsocket, setConnectedToWebsocket] = useState(false);
  const [editProfileModalActive, setEditProfileModalActive] = useState(false);
  const [createGameModalActive, setCreateGameModalActive] = useState(false);
  const [editUsernameAndPassword, setEditUsernameAndPassword] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [currentModalContent, setCurrentModalContent] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(null);
  const [avatarURL, setAvatarURL] = useState('');
  const [userId, setUserId] = useState(null);
  const [winnerUsername, setWinnerUsername] = useState(null);
  const [drawerActive, setDrawerActive] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [invitationModalActive, setInvitationModalActive] = useState(false);
  const [tradeModalActive, setTradeModalActive] = useState(false);
  const [playerMenuOpen, setPlayerMenuOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState({
    playerSize: null,
    initialGamePhase: null,
    mainGamePhase: null,
    gameId: null,
    currentPlayerIdx: null
  });
  const [gameList, setGameList] = useState([]);
  const [gameInvites, setGameInvites] = useState([])
  const [playerData, setPlayerData] = useState(null);
  const [intialGameData, setInitialGameData] = useState({ 'game': {}, 'playerData': {} })
  const [devCardModalActive, setDevCardModalActive] = useState(false);
  const [overSevenCardPenaltyModalActive, setOverSevenCardPenaltyModalActive] = useState(false);
  const [resourceStealingModalActive, setResourceStealingModalActive] = useState(false);
  const [buildConfirmationModalActive, setBuildConfirmationModalActive] = useState(false);
  const [playDevCardModalActive, setPlayDevCardModalActive] = useState(false);
  const [yearOfPlentyModalActive, setYearOfPlentyModalActive] = useState(false);
  const [monopolyModalActive, setMonopolyModalActive] = useState(false);
  const [gameOverModalActive, setGameOverModalActive] = useState(false);
  const [devConsoleModalActive, setDevConsoleModalActive] = useState(false);
  const [stolenResourceUpdateModalActive, setStolenResourceUpdateModalActive] = useState(false);
  const [infoModalActive, setInfoModalActive] = useState(false);
  const [confirmationModalActive, setConfirmationModalActive] = useState(false);
  const [confirmationModalData, setConfirmationModalData] = useState(null);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [infoModalTextColor, setInfoModalTextColor] = useState('black');
  const [infoModalData, setInfoModalData] = useState({ 'displayCloseButton': true });
  const [recoveryModalActive, setRecoveryModalActive] = useState(false);
  const [recoveryModalMessage, setRecoveryModalMessage] = useState("");
  const [recoveryModalTextColor, setRecoveryModalTextColor] = useState('black');
  const [authenticating, setAuthenticating] = useState(false);
  const [recoveryModalData, setRecoveryModalData] = useState({
    type: '',
    recoveryFunctions: [],
    recoveryFunctionArgs: [[]],
    message: '',
    textColor: 'black'
  });
  const [stolenResourceUpdateData, setStolenResourceUpdateData] = useState(null);
  const [structureType, setStructureType] = useState('settlement');
  const [robberPlacementMode, setRobberPlacementMode] = useState(false);
  const [roadPlacementMode, setRoadPlacementMode] = useState(false);
  const [roadAction, setRoadAction] = useState('ADD');
  const [structurePlacementMode, setStructurePlacementMode] = useState(false);
  const [robberPlaced, setRobberPlaced] = useState(false);
  const [yearOfPlenty, setYearOfPlenty] = useState(false);
  const [roadBuilding, setRoadBuilding] = useState(false);
  const [monopoly, setMonopoly] = useState(false);
  const [stompClient, setStompClient] = useState({ connected: false });
  const [sock, setSock] = useState(null);
  const [stompConnected, setStompConnected] = useState(false);
  const [boardManager, setBoardManager] = useState(null);
  const [gameBoard, setGameBoard] = useState(null);
  const [boardGraph, setBoardGraph] = useState();
  const [targetGameId, setTargetGameId] = useState(null);
  const [gamePhase, setGamePhase] = useState(null);
  const [rolledResources, setRolledResources] = useState({});
  const [diceResultObj, setDiceResultObj] = useState({});
  const [startAndEndNodes, setStartAndEndNodes] = useState([]);
  const [roadBuildingDevCardRoadCount, setRoadBuildingDevCardRoadCount] = useState(0);
  const [turnPhase, setTurnPhase] = useState('diceRoll');
  const [currentPlayerName, setCurrentPlayerName] = useState('Game Not Started Yet');
  const [drawerFirstTime, setDrawerFirstTime] = useState(false);
  const [modalInfoData, setModalInfoData] = useState(null);
  const [tradeModalData, setTradeModalData] = useState({
    'offeredResources': null,
    'desiredResources': null,
    'tradeRecipient': null,
    'playerHand': null,
    'requestFunction': () => null
  });
  const [createGameModalContent, setCreateGameModalContent] = useState({
    'createGame': () => null
  });
  const [devCardModalContent, setDevCardModalContent] = useState({
    'updateDevCards': () => null
  });
  const [modalData, setModalData] = useState({});

  const modalStateHandler = (modalName, playerMenuOpen) => {

    scrollToHalfHeight(window);
    switch (modalName) {

      case 'editProfile':
        setPlayerMenuOpen(false);
        setEditProfileModalActive(() => !editProfileModalActive);
        break;

      case 'createGame':
        setCreateGameModalActive(() => !createGameModalActive);
        break;

      case 'invitation':
        setInvitationModalActive(() => !invitationModalActive);
        break;

      case 'trade':
        setTradeModalActive(() => !tradeModalActive);
        break;

      case 'buyDevCard':
        setDevCardModalActive(() => !devCardModalActive);
        break;

      case 'overSevenCardPenalty':
        setOverSevenCardPenaltyModalActive(() => !overSevenCardPenaltyModalActive);
        break;

      case 'resourceStealing':
        setResourceStealingModalActive(() => !resourceStealingModalActive);
        break;

      case 'buildConfirmation':
        setBuildConfirmationModalActive(() => !buildConfirmationModalActive);
        break;

      case 'playDevCard':
        setPlayDevCardModalActive(() => !playDevCardModalActive);
        break;

      case 'yearOfPlenty':
        setYearOfPlentyModalActive(() => !yearOfPlentyModalActive);
        break;

      case 'monopoly':
        setMonopolyModalActive(() => !monopolyModalActive);
        break;

      case 'gameOver':
        setGameOverModalActive(() => !gameOverModalActive);
        break;

      case 'devConsole':
        setDevConsoleModalActive(() => !devConsoleModalActive);
        break;

      case 'stolenResourceUpdate':
        setStolenResourceUpdateModalActive(() => !stolenResourceUpdateModalActive)
        break;

      case 'info':
        setInfoModalActive(() => !infoModalActive);
        break;

      case 'recovery':
        setRecoveryModalActive(() => !recoveryModalActive)
        break;

      case 'confirmation':
        setConfirmationModalActive(() => !confirmationModalActive)
        break;

      default: return
    }
  }

  const specialGameStateHandler = (mode, bool) => {
    switch (mode) {

      case 'robber':
        if (bool === true || bool === false) {
          setRobberPlacementMode(bool);
          break;
        }
        setRobberPlacementMode(() => !robberPlacementMode);
        break;

      case 'yearOfPlenty':
        if (bool === true || bool === false) {
          setYearOfPlenty(bool);
          break;
        }
        setYearOfPlenty(() => !yearOfPlenty);
        break;

      case 'roadBuilding':
        if (bool === true || bool === false) {
          setRoadBuilding(bool);
          break;
        }
        setRoadBuilding(() => !roadBuilding);
        break;

      case 'monopoly':
        if (bool === true || bool === false) {
          setMonopoly(bool);
          break;
        }
        setMonopoly(() => !monopoly);
        break;

      default: return
    }
  }

  const modalContentHandler = contentType => {
    switch (contentType) {
      case 'editUsernameAndPassword':
        if (!currentModalContent && !editUsernameAndPassword) {
          setCurrentModalContent(contentType)
          setEditUsernameAndPassword(() => !editUsernameAndPassword);
          break;
        }
        setCurrentModalContent(null);
        setEditUsernameAndPassword(() => !editUsernameAndPassword);
        break;

      case 'editAvatar':
        setEditAvatar(() => !editAvatar);
        break;

      default: return
    }
  }

  const storePlayerData = (playerData) => {
    if (!playerData) {
      return
    }
    if (typeof playerData.playerInfo === 'string') {
      playerData.playerInfo = JSON.parse(playerData.playerInfo);
      setPlayerData(playerData);
      return
    }
    setPlayerData(playerData);
  }

  const diceResultHelper = (diceResult, gameId) => {
    const diceResultCpy = lod.cloneDeep(diceResultObj);
    diceResultCpy[gameId] = diceResult;
    setDiceResultObj(diceResultCpy);
  }

  const rolledResourcesHelper = (rolledResources, gameId) => {
    const rolledResourcesCpy = lod.cloneDeep(rolledResources);
    rolledResourcesCpy[gameId] = rolledResources;
    //console.log(rolledResourcesCpy);
    setRolledResources(rolledResourcesCpy);
  }

  const setUserCredentials = (username, userId, avatarURL = './av_1.png') => {
    setUsername(username);
    setAvatarURL(avatarURL);
    setUserId(userId);
  }

  const modifyDrawerState = (drawerState) => {
    if (drawerState === 'logout') {
      setDrawerActive(false)
      return
    }
    setDrawerActive(() => !drawerActive)
  }

  const authenticationHandler = (authenticationState) => {
    setAuthenticated(authenticationState)
  }

  const playerMenuHandler = (bool) => {
    if (bool === null) {
      setPlayerMenuOpen(() => !playerMenuOpen);
      return
    }

    setPlayerMenuOpen(bool);
  }

  return (
    <ModalStateContext.Provider value=
      {
        {
          editProfileModalActive: editProfileModalActive,
          onModifyModalState: modalStateHandler,
          editUsernameAndPassword: editUsernameAndPassword,
          onModifyModalContent: modalContentHandler,
          currentModalContent: currentModalContent,
          editAvatar: editAvatar,
          username: username,
          avatarURL: avatarURL,
          userId: userId,
          onSetUserCredentials: setUserCredentials,
          drawerActive: drawerActive,
          onModifyDrawerState: modifyDrawerState,
          authenticated: authenticated,
          onSetAuthenticated: authenticationHandler,
          invitationModalActive: invitationModalActive,
          onSetInvitationModalActive: setInvitationModalActive,
          tradeModalActive: tradeModalActive,
          tradeModalData: tradeModalData,
          onSetTradeModalData: setTradeModalData,
          onSetPlayerMenuOpen: playerMenuHandler,
          playerMenuOpen: playerMenuOpen,
          currentGame: currentGame,
          onSetCurrentGame: setCurrentGame,
          playerData: playerData,
          onSetPlayerData: storePlayerData,
          createGameModalActive: createGameModalActive,
          onSetCreateGameModalActive: setCreateGameModalActive,
          createGameModalContent: createGameModalContent,
          onSetCreateGameModalContent: setCreateGameModalContent,
          devCardModalActive: devCardModalActive,
          onSetDevCardModalActive: setDevCardModalActive,
          devCardModalContent: devCardModalContent,
          onSetDevCardModalContent: setDevCardModalContent,
          overSevenCardPenaltyModalActive: overSevenCardPenaltyModalActive,
          resourceStealingModalActive: resourceStealingModalActive,
          buildConfirmationModalActive: buildConfirmationModalActive,
          structureType: structureType,
          onSetStructureType: setStructureType,
          playDevCardModalActive: playDevCardModalActive,
          robberPlacementMode: robberPlacementMode,
          onSetSpecialGameMode: specialGameStateHandler,
          robberPlaced: robberPlaced,
          onSetRobberPlaced: setRobberPlaced,
          yearOfPlenty: yearOfPlenty,
          yearOfPlentyModalActive: yearOfPlentyModalActive,
          roadBuilding: roadBuilding,
          roadPlacementMode: roadPlacementMode,
          onSetRoadPlacementMode: setRoadPlacementMode,
          structurePlacementMode: structurePlacementMode,
          onSetStructurePlacementMode: setStructurePlacementMode,
          monopolyModalActive: monopolyModalActive,
          monopoly: monopoly,
          intialGameData: intialGameData,
          onSetInitialGameData: setInitialGameData,
          gameOverModalActive,
          winnerUsername: winnerUsername,
          onSetWinnerUsername: setWinnerUsername,
          onSetStompClient: setStompClient,
          stompClient: stompClient,
          onSetSock: setSock,
          sock: sock,
          onSetStompConnected: setStompConnected,
          stompConnected: stompConnected,
          gameList: gameList,
          onSetGameList: setGameList,
          boardManager: boardManager,
          onSetBoardManager: setBoardManager,
          gamePhase: gamePhase,
          onSetGamePhase: setGamePhase,
          currentPlayerName: currentPlayerName,
          onSetCurrentPlayerName: setCurrentPlayerName,
          devConsoleModalActive: devConsoleModalActive,
          rolledResources: rolledResources,
          onSetRolledResources: rolledResourcesHelper,
          diceResultObj: diceResultObj,
          onSetDiceResult: diceResultHelper,
          stolenResourceUpdateModalActive: stolenResourceUpdateModalActive,
          stolenResourceUpdateData: stolenResourceUpdateData,
          onSetStolenResourceUpdateData: setStolenResourceUpdateData,
          modalData: modalData,
          onSetModalData: setModalData,
          onSetOverSevenCardPenaltyModalActive: setOverSevenCardPenaltyModalActive,
          infoModalActive: infoModalActive,
          onSetInfoModalMessage: setInfoModalMessage,
          infoModalMessage: infoModalMessage,
          infoModalTextColor: infoModalTextColor,
          onSetInfoModalTextColor: setInfoModalTextColor,
          infoModalData: infoModalData,
          onSetInfoModalData: setInfoModalData,
          recoveryModalActive: recoveryModalActive,
          onSetRecoveryModalMessage: setRecoveryModalMessage,
          recoveryModalMessage: recoveryModalMessage,
          recoveryModalTextColor: recoveryModalTextColor,
          onSetRecoveryModalTextColor: setRecoveryModalTextColor,
          roadAction: roadAction,
          onSetRoadAction: setRoadAction,
          onSetRobberPlacementMode: setRobberPlacementMode,
          turnPhase: turnPhase,
          onSetTurnPhase: setTurnPhase,
          gameBoard: gameBoard,
          onSetGameBoard: setGameBoard,
          startAndEndNodes: startAndEndNodes,
          onSetStartAndEndNodes: setStartAndEndNodes,
          roadBuildingDevCardRoadCount: roadBuildingDevCardRoadCount,
          onSetRoadBuildingDevCardRoadCount: setRoadBuildingDevCardRoadCount,
          confirmationModalActive: confirmationModalActive,
          onSetTargetGameId: setTargetGameId,
          targetGameId: targetGameId,
          onSetRecoveryModalData: setRecoveryModalData,
          recoveryModalData, recoveryModalData,
          drawerFirstTime: drawerFirstTime,
          onSetDrawerFirstTime: setDrawerFirstTime,
          modalInfoData: modalInfoData,
          onSetModalInfoData: setModalInfoData,
          authenticating: authenticating,
          onSetAuthenticating: setAuthenticating,
          confirmationModalData: confirmationModalData,
          onSetConfirmationModalData: setConfirmationModalData,
          role: role,
          onSetRole: setRole,
          gameInvites: gameInvites,
          onSetGameInvites: setGameInvites,
          onSetAvatarURL: setAvatarURL
        }
      }
    >
      {props.children}
    </ModalStateContext.Provider>
  )
}

export default ModalStateContext;