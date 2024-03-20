import { useState, useEffect, useContext } from 'react';
import ModalStateContext from '../store/modal-context';
import uninitialzedgameBoard from '../utils/game-board';
import './css/Tiles.css';

const tileImages = require.context('../../public/images/tiles')

const Tiles = (props) => {
  const ctx = useContext(ModalStateContext);
  const [values, setValues] = useState(null);
  const [frequencies, setFrequencies] = useState(null);
  const [distinctions, setDistinctions] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [initalLoadComplete, setInitialLoadComplete] = useState(false);
  const [gameBoard, setGameBoard] = useState(uninitialzedgameBoard);
 
  useEffect(() => {
    //console.log('TILES UE')

    if(!props.gameBoard){
      return
    }

    setGameBoard(props.gameBoard);

    if(!initalLoadComplete && props.gameBoard){
      const values= props.gameBoard.tileValueFrequencyOrder.valueAndFrequencyOrder[props.idx].values;
      const frequencies= props.gameBoard.tileValueFrequencyOrder.valueAndFrequencyOrder[props.idx].frequencies;
      const distinctions= props.gameBoard.tileValueFrequencyOrder.valueAndFrequencyOrder[props.idx].distinctions;
      const tiles= props.gameBoard.tileValueFrequencyOrder.tileOrder[props.idx];
      
      setValues(values);
      setFrequencies(frequencies);
      setDistinctions(distinctions);
      setTiles(tiles);
      setInitialLoadComplete(true);
    }

  }, [props.gameBoard]);

  const getRobberPlacement = (value, distinction) => {
    let robberIsPlaced = false;
    if (value === null) {
      return robberIsPlaced
    }
    if (distinction) {
      robberIsPlaced = gameBoard.tiles[value][distinction].robber;
    }
    else {
      robberIsPlaced = gameBoard.tiles[value].robber;
    }
    return robberIsPlaced
  }
 
  // REFACTOR NOTE:
  // Seems like there are additional steps that can be cut
  // try to do a more direct way of getting the needed image 
  // try to remove the images state and the useEffect
  return (
    initalLoadComplete ? 

      tiles.map((tile, idx) => {
        const value = values[idx];
        const frequency = frequencies[idx];
        const distinction = distinctions[idx];
        // use helper function to get id for the tile class div b/c 
        // distinction is sometimes null
        let isRobberPlaced = getRobberPlacement(value, distinction);
        return (
          <div className={`tile`} key={idx}>
            <img src={tileImages('./'+tile+'.png')} className='tile-image' />
            {
              tile !== 'desert'
              &&
              <div className={`value-frequency-container ${isRobberPlaced ? 'robber' : ''}`}>
                <div className='value-token'>
                  <h2 className="value" style={{ color: 'black', textAlign: 'center' }}>
                    {value}
                  </h2>
                </div>
                <div>
                  <h3 className="frequency" style={{ color: `${frequency === 5 ? 'red' : 'green'}`, textAlign: 'center' }}>
                    {/* {props.frequencyTiles[idx] ? props.frequencyTiles[idx].frequency : ''} */}
                    {frequency}
                  </h3>
                </div>
              </div>
            }
          </div>
        )
      })
    :
    <></>
  )
}



export default Tiles;