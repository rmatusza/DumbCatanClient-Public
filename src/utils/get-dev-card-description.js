const getDevCardDescription = (type) => {

  switch(type){

    case 'knight': 
      {
        return 'Using a knight allows you to move the robber and place it onto a new hex, and steal a random card from an opponent with settlements or cities adjacent to it. Playing 3 knight cards awards you the Largest Army card, worth 2 victory points'
      }
    
    case 'monopoly':
      {
        return 'When used, this card allows the player to steal ALL of any one resource of his/her choice from all other players. Monopoly can be used the turn after it has been obtained'
      }
    
    case 'year_of_plenty':
      {
        return 'When used, the player can draw 2 resource cards of their choice from the bank'
      }
    
    case 'road_building':
      {
        return 'When used, the player can place 2 roads as if they just built them'
      }
  }
}

export default getDevCardDescription;