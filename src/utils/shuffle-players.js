const shufflePlayers = (players) => {
  const playersCpy = [...players];
  const shuffledPlayers = [];

  while (playersCpy.length > 0) {
    let index = Math.floor(Math.random()*playersCpy.length);
    let player = playersCpy.splice(index, 1)

    shuffledPlayers.push(...player);
  }

  return shuffledPlayers;
}

export default shufflePlayers