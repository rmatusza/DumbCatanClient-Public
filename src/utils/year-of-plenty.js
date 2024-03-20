const activateYearOfPlenty = (devCardDeck, playerDevCardsDeck) => {
  const drawnDevCardOne = devCardDeck.shift();
  const drawnDevCardTwo = devCardDeck.shift();
  playerDevCardsDeck[drawnDevCardOne] += 1;
  playerDevCardsDeck[drawnDevCardTwo] += 1;
  return [devCardDeck, playerDevCardsDeck];
}

export default activateYearOfPlenty;