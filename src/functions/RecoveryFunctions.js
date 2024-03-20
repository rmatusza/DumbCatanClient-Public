export const retryFetchData = async (fetchFunction, fetchFunctionArgs, ctx, displayCloseButton = true, errorMessage = null, reloadAttempt = 1, reloadLimit = 12, displayModal = true) => {

  if (reloadAttempt >= reloadLimit) {

    if (displayModal === true) {
      ctx.onSetInfoModalData({
        'displayCloseButton': displayCloseButton
      })
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
    }
    
    return [null, errorMessage, reloadAttempt, true]
  }

  const [fetchedData, fetchErrorMsg] = await fetchFunction(...fetchFunctionArgs);

  if (fetchErrorMsg) {
    return [null, fetchErrorMsg, reloadAttempt + 1, false];
  };

  return [fetchedData, null, null, false];
}

export const retryHandleData = async (handlerFunction, handlerFunctionArgs, ctx, displayCloseButton = true, errorMessage = null, reloadAttempt = 1, reloadLimit = 12, displayModal = true) => {
  
  if (reloadAttempt >= reloadLimit) {

    if (displayModal === true) {
      ctx.onSetInfoModalData({
        'displayCloseButton': displayCloseButton
      })
      ctx.onSetInfoModalMessage(errorMessage);
      ctx.onModifyModalState('info');
    }

    return [null, errorMessage, reloadAttempt, true]
  }

  const [handledData, handleDataErrorMsg] = await handlerFunction(...handlerFunctionArgs);

  if (handleDataErrorMsg) {
    return [null, handleDataErrorMsg, reloadAttempt + 1, false];
  };

  return [handledData, null, null, false];
}