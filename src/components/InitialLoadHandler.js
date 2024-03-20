import { useEffect, useState, useContext } from "react";
import { fetchAccpetedTradeRequests, fetchReceivedTradeRequests } from "../functions/gameFunctions";
import { checkAndSetSpecialGameMode_InitialLoad, getIsYourTurn, getPlayerList, handleAcceptedTradeRequest, handleOSCPAndRobberPlacement_InitialLoad, handleReceivedTradeRequest, parseTradeRequestData } from "../functions/utilFunctions";
import { retryFetchData, retryHandleData } from "../functions/RecoveryFunctions";
import { saveUserData } from "../functions/userFunctions";
import ModalStateContext from "../store/modal-context";
const lod = require('lodash');

const InitialLoadHandler = (props) => {
  const ctx = useContext(ModalStateContext);
  const [allInitialChecksComplete, setAllInitialChecksComplete] = useState(false)
  const [playerData, setPlayerData] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [acceptedTradeRequestData, setAcceptedTradeRequestData] = useState(null);
  const [initialSetupTracker, setInitialSetupTracker] = useState({
    'setPlayerList': { 'completed': false },
    'checkedForReceivedTradeRequests': { 'completed': false },
    'checkedForAcceptedTradeRequests': { 'completed': false },
    'handledAcceptedTradeRequests': { 'completed': false },
    'checkedForPendingSpecialGameMode': { 'completed': false },
    'checkedForPendingOSCPAndRobberPlacement': { 'completed': false }
  });
  const [retryTypeTracker, setRetryTypeTracker] = useState({
    'fetchReceived': { 'retry': false, 'attempts': 0 },
    'fetchAccepted': { 'retry': false, 'attempts': 0 },
    'handleAccepted': { 'retry': false, 'attempts': 0 },
    'OSCP': { 'retry': false, 'attempts': 0 }
  });

  const updateInitialSetupTracker = (type, initialSetupTrackerCpy) => {
    initialSetupTrackerCpy[type].completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy)
  };

  const placeHolder = (initialSetupTrackerCpy) => {
    const playerList = getPlayerList(currentGame.players);
    props.setPlayerList(playerList);

    updateInitialSetupTracker('setPlayerList', initialSetupTrackerCpy);
  };

  const checkForReceivedTradeRequests = async (retryTypeTrackerCpy, initialSetupTrackerCpy, isRetry) => {
    const isYourTurn = getIsYourTurn(currentGame, ctx.userId);

    if (!isYourTurn) {

      if (isRetry) {

        setTimeout(async () => {
          const [receivedTradeRequest, fetchTradeRequestErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryFetchData(fetchReceivedTradeRequests, [ctx], ctx, true, errorMessage, retryTypeTrackerCpy.fetchReceived.attempts);

          if (reachedAttemptLimit) {
            // TO-DO: possibly handle in some way. not sure what will be needed yet
            return
          };

          if (fetchTradeRequestErrorMsg) {
            if (errorMessage !== fetchTradeRequestErrorMsg) {
              setErrorMessage(fetchTradeRequestErrorMsg);
            };
            retryTypeTrackerCpy.fetchReceived.attempts = updatedReloadAttemptCount;
            setRetryTypeTracker(retryTypeTrackerCpy);
            return
          };

          if (receivedTradeRequest) {
            handleReceivedTradeRequest(receivedTradeRequest, ctx);
          };

          initialSetupTrackerCpy.checkedForReceivedTradeRequests.completed = true;
          retryTypeTrackerCpy.fetchReceived.retry = false;

          setRetryTypeTracker(retryTypeTrackerCpy);
          setInitialSetupTracker(initialSetupTrackerCpy);

        }, 5000);
      }
      else {
        const [receivedTradeRequest, fetchMissedTradeRequestsErrorMsg] = await fetchReceivedTradeRequests(ctx);

        if (fetchMissedTradeRequestsErrorMsg) {
          retryTypeTrackerCpy.fetchReceived.retry = true;
          retryTypeTrackerCpy.fetchReceived.attempts = retryTypeTrackerCpy.fetchReceived.attempts + 1;
          setRetryTypeTracker(retryTypeTrackerCpy);
          setErrorMessage(fetchMissedTradeRequestsErrorMsg);
          return
        };

        if (receivedTradeRequest) {
          handleReceivedTradeRequest(receivedTradeRequest, ctx);
        };

        initialSetupTrackerCpy.checkedForReceivedTradeRequests.completed = true;
        setInitialSetupTracker(initialSetupTrackerCpy);
      }
    }
    initialSetupTrackerCpy.checkedForReceivedTradeRequests.completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy);
  };

  const checkForAcceptedTradeRequests = async (retryTypeTrackerCpy, initialSetupTrackerCpy, isRetry) => {
    const isYourTurn = getIsYourTurn(currentGame, ctx.userId);

    if (isYourTurn) {

      if (isRetry) {

        setTimeout(async () => {
          const [acceptedTradeRequest, fetchAcceptedTradeRequestErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryFetchData(fetchAccpetedTradeRequests, [ctx], ctx, true, errorMessage, retryTypeTrackerCpy.fetchAccepted.attempts);

          if (reachedAttemptLimit) {
            // TO-DO: possibly handle in some way. not sure what will be needed yet
            return
          };

          if (fetchAcceptedTradeRequestErrorMsg) {
            if (errorMessage !== fetchAcceptedTradeRequestErrorMsg) {
              setErrorMessage(fetchAcceptedTradeRequestErrorMsg);
            };
            retryTypeTrackerCpy.fetchAccepted.attempts = updatedReloadAttemptCount;
            setRetryTypeTracker(retryTypeTrackerCpy);
            return
          };

          if (acceptedTradeRequest) {
            setAcceptedTradeRequestData(acceptedTradeRequest);

            retryTypeTrackerCpy.fetchAccepted.retry = false;
            setRetryTypeTracker(retryTypeTrackerCpy);
          };

        }, 5000);
      }
      else {
        const [acceptedTradeRequest, fetchAcceptedTradeRequestErrorMsg] = await fetchAccpetedTradeRequests(ctx);

        if (fetchAcceptedTradeRequestErrorMsg) {
          retryTypeTrackerCpy.fetchAccepted.retry = true;
          retryTypeTrackerCpy.fetchAccepted.attempts = retryTypeTrackerCpy.fetchAccepted.attempts + 1;

          setRetryTypeTracker(retryTypeTrackerCpy);
          setErrorMessage(fetchAcceptedTradeRequestErrorMsg);
          return;
        };

        if (acceptedTradeRequest) {
          setAcceptedTradeRequestData(acceptedTradeRequest);
        }
      }
    }
    initialSetupTrackerCpy.checkedForAcceptedTradeRequests.completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy);
  };

  const acceptedTradeRequestHandler = async (retryTypeTrackerCpy, initialSetupTrackerCpy, isRetry) => {

    if (acceptedTradeRequestData) {

      if (isRetry) {

        setTimeout(async () => {
          const [updatedPlayerData, handleAcceptedTradeErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryHandleData(handleAcceptedTradeRequest, [acceptedTradeRequestData, ctx], ctx, true, errorMessage, retryTypeTrackerCpy.handleAccepted.attempts);

          if (reachedAttemptLimit) {
            // TO-DO: possibly handle in some way. not sure what will be needed yet
            return
          };

          if (handleAcceptedTradeErrorMsg) {
            if (errorMessage !== handleAcceptedTradeErrorMsg) {
              setErrorMessage(handleAcceptedTradeErrorMsg);
            };
            retryTypeTrackerCpy.handleAccepted.attempts = updatedReloadAttemptCount;
            setRetryTypeTracker(retryTypeTrackerCpy);
            return
          };

          if (updatedPlayerData) {
            retryTypeTrackerCpy.handleAccepted.retry = false;
            initialSetupTrackerCpy.handledAcceptedTradeRequests.completed = true;

            setRetryTypeTracker(retryTypeTrackerCpy);
            setInitialSetupTracker(initialSetupTrackerCpy);
            ctx.onSetPlayerData(updatedPlayerData);
          };

        }, 5000);
      }

      const [savedPlayerData, handleAcceptedTradeErrorMsg] = await handleAcceptedTradeRequest(acceptedTradeRequestData, ctx);

      if (handleAcceptedTradeErrorMsg) {
        retryTypeTrackerCpy.handleAccepted.retry = true;
        retryTypeTrackerCpy.handleAccepted.attempts = retryTypeTrackerCpy.handleAccepted.attempts + 1;

        setRetryTypeTracker(retryTypeTrackerCpy);
        setErrorMessage(handleAcceptedTradeErrorMsg);
        return;
      };

      ctx.onSetPlayerData(savedPlayerData);
    };

    initialSetupTrackerCpy.handledAcceptedTradeRequests.completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy);
  };

  const checkForPendingSpecialGameMode = (initialSetupTrackerCpy) => {
    checkAndSetSpecialGameMode_InitialLoad(ctx);

    initialSetupTrackerCpy.checkedForPendingSpecialGameMode.completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy);
  };

  const checkForPendingOSCPAndRobberPlacement = async (retryTypeTrackerCpy, initialSetupTrackerCpy, isRetry) => {
    const updatedPlayerData = handleOSCPAndRobberPlacement_InitialLoad(playerData.overSevenCardPenalty, playerData.placingRobber, ctx);

    if (updatedPlayerData) {

      if (isRetry) {

        setTimeout(async () => {
          const [savedPlayerData, savePlayerDataErrorMsg, updatedReloadAttemptCount, reachedAttemptLimit] = await retryHandleData(saveUserData, [[updatedPlayerData], ctx.userId], ctx, true, errorMessage, retryTypeTrackerCpy.OSCP.attempts);

          if (reachedAttemptLimit) {
            // TO-DO: possibly handle in some way. not sure what will be needed yet
            return
          };

          if (savePlayerDataErrorMsg) {
            if (errorMessage !== savePlayerDataErrorMsg) {
              setErrorMessage(savePlayerDataErrorMsg);
            };
            retryTypeTrackerCpy.OCSP.attempts = updatedReloadAttemptCount;
            setRetryTypeTracker(retryTypeTrackerCpy);
            return
          };

          retryTypeTrackerCpy.OCSP.retry = false;
          setRetryTypeTracker(retryTypeTrackerCpy);

          ctx.onSetPlayerData(savedPlayerData);

        }, 5000);
      }
      else {
        const [savedPlayerData, savePlayerDataErrorMsg] = await saveUserData([updatedPlayerData], ctx.userId);

        if (savePlayerDataErrorMsg) {
          retryTypeTrackerCpy.OSCP.retry = true;
          retryTypeTrackerCpy.OSCP.attempts = retryTypeTrackerCpy.OSCP.attempts + 1;
          setRetryTypeTracker(retryTypeTrackerCpy);
          setErrorMessage(savePlayerDataErrorMsg);
          return;
        }

        ctx.onSetPlayerData(savedPlayerData);
      }
    };

    initialSetupTrackerCpy.checkedForPendingOSCPAndRobberPlacement.completed = true;
    setInitialSetupTracker(initialSetupTrackerCpy);
    // verifySetupComplete(initialSetupTrackerCpy);
    setAllInitialChecksComplete(true);
    
  };

  // INITIAL LOAD USE EFFECTS:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!playerData) {
      setPlayerData(ctx.playerData);
    }
    if (!currentGame) {
      setCurrentGame(ctx.currentGame)
    }
  }, [ctx.playerData, ctx.currentGame]);

  useEffect(() => {
    if (!playerData || !currentGame) {
      return;
    }
    if (allInitialChecksComplete) {
      props.setFinishedInitialChecks(true);
      return;
    }
    //console.log('PERFORMING INITIAL CHECKS...');
    const retryTypeTrackerCpy = lod.cloneDeep(retryTypeTracker);
    const initialSetupTrackerCpy = lod.cloneDeep(initialSetupTracker);

    for (let setupType in initialSetupTracker) {

      if (!initialSetupTracker[setupType].completed) {

        switch (setupType) {

          case 'setPlayerList':
            placeHolder(initialSetupTrackerCpy);
            break;

          case 'checkedForReceivedTradeRequests':
            checkForReceivedTradeRequests(retryTypeTrackerCpy, initialSetupTrackerCpy, false);
            break;

          case 'checkedForAcceptedTradeRequests':
            checkForAcceptedTradeRequests(retryTypeTrackerCpy, initialSetupTrackerCpy, false);
            break;

          case 'handledAcceptedTradeRequests':
            acceptedTradeRequestHandler(retryTypeTrackerCpy, initialSetupTrackerCpy, false);
            break;

          case 'checkedForPendingSpecialGameMode':
            checkForPendingSpecialGameMode(initialSetupTrackerCpy);
            break;

          case 'checkedForPendingOSCPAndRobberPlacement':
            checkForPendingOSCPAndRobberPlacement(retryTypeTracker, initialSetupTrackerCpy, false);
            break;
        }
      }
    } 

    if(allInitialChecksComplete){
      props.setFinishedInitialChecks(true);
    }

  }, [initialSetupTracker, playerData, currentGame, allInitialChecksComplete]);


  useEffect(() => {
    const retryTypeTrackerCpy = lod.cloneDeep(retryTypeTracker);
    const initialSetupTrackerCpy = lod.cloneDeep(initialSetupTracker);

    for (let retryType in retryTypeTracker) {

      if (retryTypeTracker[retryType].retry) {
        //console.log('RETRYING INITIAL SETUP...')
        switch (retryType) {

          case 'fetchReceived':
            checkForReceivedTradeRequests(retryTypeTrackerCpy, initialSetupTrackerCpy, true);
            break;

          case 'fetchAccepted':
            checkForAcceptedTradeRequests(retryTypeTrackerCpy, initialSetupTrackerCpy, true);
            break;

          case 'handleAccepted':
            acceptedTradeRequestHandler(retryTypeTrackerCpy, initialSetupTrackerCpy, true);
            break;

          case 'OSCP':
            checkForPendingOSCPAndRobberPlacement(retryTypeTrackerCpy, initialSetupTrackerCpy, true);
            break;

          default:
            break;
        }
      }
    }
  }, [retryTypeTracker]);


  return null;
}

export default InitialLoadHandler;