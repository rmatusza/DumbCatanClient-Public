const shuffle = (deck, iterations) => {
  if(iterations === 0){
    return deck
  }
  let shuffledDeck = [];
  while (deck.length > 0) {
    const chosenIndex = Math.floor(Math.random() * deck.length);
    let devCard = deck.splice(chosenIndex, 1);
    shuffledDeck.push(devCard.pop());
  }
  iterations-=1;
  return shuffle(shuffledDeck, iterations);
}

const generateDevCards = () => {

  let devCardDeck = [];

  const cardCounts = {
    'knight': 14,
    'victory_point': 5,
    'road_building': 2,
    'year_of_plenty': 2,
    'monopoly': 2
  }

  Object.keys(cardCounts).forEach((cardType) => {
    let i = 0;
    while (i < cardCounts[cardType]) {
      devCardDeck.push(cardType)
      i++
    }
  })

  let shuffledDevCardDeck = shuffle(devCardDeck, 5);
  return shuffledDevCardDeck;
}

export default generateDevCards;