import { useEffect, useState, useContext } from 'react';
import { getPorts, robberHandler, submitStructureHandler } from '../functions/gameFunctions';
import ModalStateContext from '../store/modal-context';
import './css/BoardOverlay.css';

const portsImages = require.context('../../public/images/ports', true);

const BoardOverlay = (props) => {
  const [gameBoard, setGameBoard] = useState(null);
  const [ports, setPorts] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [tileValueFrequencies, setTileValueFrequencies] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(null);
  const ctx = useContext(ModalStateContext);
  

  // REFACTOR NOTE: when creating a new game on game space page
  // old settlement placements remain
  // -> consider checking for a change in current game id in this useEffect
  //    and reinitialize if the id changes
  useEffect(() => {
    //console.log('BOARD OVERLAY UE')
    
    if(props.gameBoard){
      //console.log(props.gameBoard)
      setGameBoard(props.gameBoard);
      // doing the initial game board ui setup
      // -> doesn't need to be done every time hence 
      //    the initialLoadComplete value check
      if(!initialLoadComplete && props.gameBoard && (ctx.currentGame.gameId === currentGameId || currentGameId === null)){
        const ports = getPorts(ctx.currentGame);
        const tileValueFrequencies = props.gameBoard.tileValueFrequencyOrder.valueAndFrequencyOrder;
        setTileValueFrequencies(tileValueFrequencies);
        setPorts(ports);
        setCurrentGameId(ctx.currentGame.gameId)
        setInitialLoadComplete(true);
      }
    }
  }, [props.gameBoard]);

  // for the class name and style of the roads and structures consider using a function to make 
  // it more dynamic and then make it fully dynamic later
  // CHANGE TO USE CSS GRID LATER 
  return (
    initialLoadComplete ?
    
      <div className="board-overlay-container">

        {/* PORTS */}

        <div className='port-overlay-row-0'>

          <div className='port-0'>
            <img src={portsImages('./'+ports[0][0]+'.png')} className='port-0-image' />
          </div>
          <div className='port-1'>
            <img src={portsImages('./'+ports[0][1]+'.png')} className='port-0-image' />
          </div>

        </div>

        <div className='port-overlay-row-1'>
          <div className='port-2'>
            <img src={portsImages('./'+ports[1][0]+'.png')} className='port-2-image' />
          </div>
          <div className='port-3'>
            <img src={portsImages('./'+ports[1][1]+'.png')} className='port-3-image' />
          </div>
        </div>

        <div className='port-overlay-row-2'>
          <div className='port-4'>
            <img src={portsImages('./'+ports[2][0]+'.png')} className='port-4-image' />
          </div>
          <div className='port-5'>
            <img src={portsImages('./'+ports[2][1]+'.png')} className='port-5-image' />
          </div>
          <div className='port-6'>
            <img src={portsImages('./'+ports[2][2]+'.png')} className='port-6-image' />
          </div>
        </div>

        <div className='port-overlay-row-3'>
          <div className='port-7'>
            <img src={portsImages('./'+ports[3][0]+'.png')} className='port-7-image' />
          </div>
          <div className='port-8'>
            <img src={portsImages('./'+ports[3][1]+'.png')} className='port-8-image' />
          </div>
        </div>


        {/* STRUCTURES */}


        {/* ROW 0 */}

        <div className='structure-overlay-row-0'>

          {/* ROADS */}

          <div id="0" className={"row-0-road-0" + `${gameBoard.roads[0].placed}`} style={{ borderRight: `${gameBoard.roads[0].color ? `10px solid ${gameBoard.roads[0].color}` : ''}` }}>
          </div>

          <div id="1" className={"row-0-road-1" + `${gameBoard.roads[1].placed}`} style={{ borderRight: `${gameBoard.roads[1].color ? `10px solid ${gameBoard.roads[1].color}` : ''}` }}>
          </div>

          <div id="2" className={"row-0-road-2" + `${gameBoard.roads[2].placed}`} style={{ borderRight: `${gameBoard.roads[2].color ? `10px solid ${gameBoard.roads[2].color}` : ''}` }}>
          </div>

          <div id="3" className={"row-0-road-3" + `${gameBoard.roads[3].placed}`} style={{ borderRight: `${gameBoard.roads[3].color ? `10px solid ${gameBoard.roads[3].color}` : ''}` }}>
          </div>

          <div id="4" className={"row-0-road-4" + `${gameBoard.roads[4].placed}`} style={{ borderRight: `${gameBoard.roads[4].color ? `10px solid ${gameBoard.roads[4].color}` : ''}` }}>
          </div>

          <div id="5" className={"row-0-road-5" + `${gameBoard.roads[5].placed}`} style={{ borderRight: `${gameBoard.roads[5].color ? `10px solid ${gameBoard.roads[5].color}` : ''}` }}>
          </div>

          {/* STRUCTURES */}

          <div className={`row-0__node__0__${gameBoard[0]['structure']}`} style={{ backgroundColor: `${gameBoard[0]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 0 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(0, ctx)}>
          </div>

          <div className={`row-0__node__1__${gameBoard[1]['structure']}`} style={{ backgroundColor: `${gameBoard[1]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 1 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(1, ctx)}>
          </div>

          <div className={`row-0__node__2__${gameBoard[2]['structure']}`} style={{ backgroundColor: `${gameBoard[2]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 2 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(2, ctx)}>
          </div>

          <div className={`row-0__node__3__${gameBoard[3]['structure']}`} style={{ backgroundColor: `${gameBoard[3]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 3 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(3, ctx)}>
          </div>

          <div className={`row-0__node__4__${gameBoard[4]['structure']}`} style={{ backgroundColor: `${gameBoard[4]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 4 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(4, ctx)}>
          </div>

          <div className={`row-0__node__29__${gameBoard[29]['structure']}`} style={{ backgroundColor: `${gameBoard[29]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 29 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(29, ctx)}>
          </div>

          <div className={`row-0__node__5__${gameBoard[5]['structure']}`} style={{ backgroundColor: `${gameBoard[5]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 5 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(5, ctx)}>
          </div>

        </div>

        {/* ROW 1 */}

        <div className='structure-overlay-row-1'>

          {/* ROADS */}

          <div id="29" className={"row-1-road-0" + `${gameBoard.roads[29].placed}`} style={{ borderRight: `${gameBoard.roads[29].color ? `10px solid ${gameBoard.roads[29].color}` : ''}` }}>
          </div>

          <div id="70" className={"row-1-road-1" + `${gameBoard.roads[70].placed}`} style={{ borderRight: `${gameBoard.roads[70].color ? `10px solid ${gameBoard.roads[70].color}` : ''}` }}>
          </div>

          <div id="71" className={"row-1-road-2" + `${gameBoard.roads[71].placed}`} style={{ borderRight: `${gameBoard.roads[71].color ? `10px solid ${gameBoard.roads[71].color}` : ''}` }}>
          </div>

          <div id="6" className={"row-1-road-3" + `${gameBoard.roads[6].placed}`} style={{ borderRight: `${gameBoard.roads[6].color ? `10px solid ${gameBoard.roads[6].color}` : ''}` }}>
          </div>

          {tileValueFrequencies[0].values.map((valueTile, i) => {
            let distinction = tileValueFrequencies[0].distinctions[i];
            let value = valueTile;
            if (value === null) {
              return (
                <div key={i}></div>
              )
            }
            else {
              return (
                <div className={`tile-${i} tile-listener`} onClick={() => robberHandler(value, distinction, gameBoard, ctx)} key={i}/>
              )
            }
          })}

        </div>
        {/* resourceFrequencyTiles */}

        {/* ROW 2 */}

        <div className='structure-overlay-row-2'>

          {/* ROADS */}

          <div id="28" className={"row-2-road-0" + `${gameBoard.roads[28].placed}`} style={{ borderRight: `${gameBoard.roads[28].color ? `10px solid ${gameBoard.roads[28].color}` : ''}` }}>
          </div>

          <div id="30" className={"row-2-road-1" + `${gameBoard.roads[30].placed}`} style={{ borderRight: `${gameBoard.roads[30].color ? `10px solid ${gameBoard.roads[30].color}` : ''}` }}>
          </div>

          <div id="31" className={"row-2-road-2" + `${gameBoard.roads[31].placed}`} style={{ borderRight: `${gameBoard.roads[31].color ? `10px solid ${gameBoard.roads[31].color}` : ''}` }}>
          </div>

          <div id="32" className={"row-2-road-3" + `${gameBoard.roads[32].placed}`} style={{ borderRight: `${gameBoard.roads[32].color ? `10px solid ${gameBoard.roads[32].color}` : ''}` }}>
          </div>

          <div id="33" className={"row-2-road-4" + `${gameBoard.roads[33].placed}`} style={{ borderRight: `${gameBoard.roads[33].color ? `10px solid ${gameBoard.roads[33].color}` : ''}` }}>
          </div>

          <div id="34" className={"row-2-road-5" + `${gameBoard.roads[34].placed}`} style={{ borderRight: `${gameBoard.roads[34].color ? `10px solid ${gameBoard.roads[34].color}` : ''}` }}>
          </div>

          <div id="35" className={"row-2-road-6" + `${gameBoard.roads[35].placed}`} style={{ borderRight: `${gameBoard.roads[35].color ? `10px solid ${gameBoard.roads[35].color}` : ''}` }}>
          </div>

          <div id="7" className={"row-2-road-7" + `${gameBoard.roads[7].placed}`} style={{ borderRight: `${gameBoard.roads[7].color ? `10px solid ${gameBoard.roads[7].color}` : ''}` }}>
          </div>

          {/* STRUCTURES */}

          <div className={`row-2__node__27__${gameBoard[27]['structure']}`} style={{ backgroundColor: `${gameBoard[27]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 27 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(27, ctx)}>
          </div>

          <div className={`row-2__node__28__${gameBoard[28]['structure']}`} style={{ backgroundColor: `${gameBoard[28]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 28 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(28, ctx)}>
          </div>

          <div className={`row-2__node__47__${gameBoard[47]['structure']}`} style={{ backgroundColor: `${gameBoard[47]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 47 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(47, ctx)}>
          </div>

          <div className={`row-2__node__30__${gameBoard[30]['structure']}`} style={{ backgroundColor: `${gameBoard[30]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 30 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(30, ctx)}>
          </div>

          <div className={`row-2__node__31__${gameBoard[31]['structure']}`} style={{ backgroundColor: `${gameBoard[31]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 31 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(31, ctx)}>
          </div>

          <div className={`row-2__node__32__${gameBoard[32]['structure']}`} style={{ backgroundColor: `${gameBoard[32]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 32 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(32, ctx)}>
          </div>

          <div className={`row-2__node__33__${gameBoard[33]['structure']}`} style={{ backgroundColor: `${gameBoard[33]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 33 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(33, ctx)}>
          </div>

          <div className={`row-2__node__6__${gameBoard[6]['structure']}`} style={{ backgroundColor: `${gameBoard[6]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 6 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(6, ctx)}>
          </div>

          <div className={`row-2__node__7__${gameBoard[7]['structure']}`} style={{ backgroundColor: `${gameBoard[7]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 7 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(7, ctx)}>
          </div>

        </div>

        {/* ROW 3 */}

        <div className='structure-overlay-row-3'>

          {/* ROADS */}

          <div id="27" className={"row-3-road-0" + `${gameBoard.roads[27].placed}`} style={{ borderRight: `${gameBoard.roads[27].color ? `10px solid ${gameBoard.roads[27].color}` : ''}` }}>
          </div>

          <div id="36" className={"row-3-road-1" + `${gameBoard.roads[36].placed}`} style={{ borderRight: `${gameBoard.roads[36].color ? `10px solid ${gameBoard.roads[36].color}` : ''}` }}>
          </div>

          <div id="37" className={"row-3-road-2" + `${gameBoard.roads[37].placed}`} style={{ borderRight: `${gameBoard.roads[37].color ? `10px solid ${gameBoard.roads[37].color}` : ''}` }}>
          </div>

          <div id="38" className={"row-3-road-3" + `${gameBoard.roads[38].placed}`} style={{ borderRight: `${gameBoard.roads[38].color ? `10px solid ${gameBoard.roads[38].color}` : ''}` }}>
          </div>

          <div id="8" className={"row-3-road-4" + `${gameBoard.roads[8].placed}`} style={{ borderRight: `${gameBoard.roads[8].color ? `10px solid ${gameBoard.roads[8].color}` : ''}` }}>
          </div>

          {tileValueFrequencies[1].values.map((valueTile, i) => {
            let distinction = tileValueFrequencies[1].distinctions[i];
            let value = valueTile;
            if (value === null) {
              return (
                <div key={i}></div>
              )
            }
            else {
              return (
                <div className={`tile-${i+3} tile-listener`} onClick={() => robberHandler(value, distinction, gameBoard, ctx)} key={i}/>
              )
            }
          })}

          {/* STRUCTURES */}

        </div>

        {/* ROW 4 */}

        <div className='structure-overlay-row-4'>

          {/* ROADS */}

          <div id="26" className={"row-4-road-0" + `${gameBoard.roads[26].placed}`} style={{ borderRight: `${gameBoard.roads[26].color ? `10px solid ${gameBoard.roads[26].color}` : ''}` }}>
          </div>

          <div id="39" className={"row-4-road-1" + `${gameBoard.roads[39].placed}`} style={{ borderRight: `${gameBoard.roads[39].color ? `10px solid ${gameBoard.roads[39].color}` : ''}` }}>
          </div>

          <div id="40" className={"row-4-road-2" + `${gameBoard.roads[40].placed}`} style={{ borderRight: `${gameBoard.roads[40].color ? `10px solid ${gameBoard.roads[40].color}` : ''}` }}>
          </div>

          <div id="41" className={"row-4-road-3" + `${gameBoard.roads[41].placed}`} style={{ borderRight: `${gameBoard.roads[41].color ? `10px solid ${gameBoard.roads[41].color}` : ''}` }}>
          </div>

          <div id="42" className={"row-4-road-4" + `${gameBoard.roads[42].placed}`} style={{ borderRight: `${gameBoard.roads[42].color ? `10px solid ${gameBoard.roads[42].color}` : ''}` }}>
          </div>

          <div id="43" className={"row-4-road-5" + `${gameBoard.roads[43].placed}`} style={{ borderRight: `${gameBoard.roads[43].color ? `10px solid ${gameBoard.roads[43].color}` : ''}` }}>
          </div>

          <div id="44" className={"row-4-road-6" + `${gameBoard.roads[44].placed}`} style={{ borderRight: `${gameBoard.roads[44].color ? `10px solid ${gameBoard.roads[44].color}` : ''}` }}>
          </div>

          <div id="45" className={"row-4-road-7" + `${gameBoard.roads[45].placed}`} style={{ borderRight: `${gameBoard.roads[45].color ? `10px solid ${gameBoard.roads[45].color}` : ''}` }}>
          </div>

          <div id="46" className={"row-4-road-8" + `${gameBoard.roads[46].placed}`} style={{ borderRight: `${gameBoard.roads[46].color ? `10px solid ${gameBoard.roads[46].color}` : ''}` }}>
          </div>

          <div id="9" className={"row-4-road-9" + `${gameBoard.roads[9].placed}`} style={{ borderRight: `${gameBoard.roads[9].color ? `10px solid ${gameBoard.roads[9].color}` : ''}` }}>
          </div>

          {/* STRUCTURES */}

          <div className={`row-4__node__25__${gameBoard[25]['structure']}`} style={{ backgroundColor: `${gameBoard[25]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 25 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(25, ctx)}>
          </div>

          <div className={`row-4__node__26__${gameBoard[26]['structure']}`} style={{ backgroundColor: `${gameBoard[26]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 26 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(26, ctx)}>
          </div>

          <div className={`row-4__node__45__${gameBoard[45]['structure']}`} style={{ backgroundColor: `${gameBoard[45]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 45 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(45, ctx)}>
          </div>

          <div className={`row-4__node__46__${gameBoard[46]['structure']}`} style={{ backgroundColor: `${gameBoard[46]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 46 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(46, ctx)}>
          </div>

          <div className={`row-4__node__53__${gameBoard[53]['structure']}`} style={{ backgroundColor: `${gameBoard[53]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 53 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(53, ctx)}>
          </div>

          <div className={`row-4__node__48__${gameBoard[48]['structure']}`} style={{ backgroundColor: `${gameBoard[48]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 48 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(48, ctx)}>
          </div>

          <div className={`row-4__node__49__${gameBoard[49]['structure']}`} style={{ backgroundColor: `${gameBoard[49]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 49 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(49, ctx)}>
          </div>

          <div className={`row-4__node__34__${gameBoard[34]['structure']}`} style={{ backgroundColor: `${gameBoard[34]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 34 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(34, ctx)}>
          </div>

          <div className={`row-4__node__35__${gameBoard[35]['structure']}`} style={{ backgroundColor: `${gameBoard[35]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 35 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(35, ctx)}>
          </div>

          <div className={`row-4__node__8__${gameBoard[8]['structure']}`} style={{ backgroundColor: `${gameBoard[8]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 8 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(8, ctx)}>
          </div>

          <div className={`row-4__node__9__${gameBoard[9]['structure']}`} style={{ backgroundColor: `${gameBoard[9]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 9 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(9, ctx)}>
          </div>

        </div>

        {/* ROW 5 */}

        <div className='structure-overlay-row-5'>

          {/* ROADS */}

          <div id="25" className={"row-5-road-0" + `${gameBoard.roads[25].placed}`} style={{ borderRight: `${gameBoard.roads[25].color ? `10px solid ${gameBoard.roads[25].color}` : ''}` }}>
          </div>

          <div id="47" className={"row-5-road-1" + `${gameBoard.roads[47].placed}`} style={{ borderRight: `${gameBoard.roads[47].color ? `10px solid ${gameBoard.roads[47].color}` : ''}` }}>
          </div>

          <div id="48" className={"row-5-road-2" + `${gameBoard.roads[48].placed}`} style={{ borderRight: `${gameBoard.roads[48].color ? `10px solid ${gameBoard.roads[48].color}` : ''}` }}>
          </div>

          <div id="49" className={"row-5-road-3" + `${gameBoard.roads[49].placed}`} style={{ borderRight: `${gameBoard.roads[49].color ? `10px solid ${gameBoard.roads[49].color}` : ''}` }}>
          </div>

          <div id="50" className={"row-5-road-4" + `${gameBoard.roads[50].placed}`} style={{ borderRight: `${gameBoard.roads[50].color ? `10px solid ${gameBoard.roads[50].color}` : ''}` }}>
          </div>

          <div id="10" className={"row-5-road-5" + `${gameBoard.roads[10].placed}`} style={{ borderRight: `${gameBoard.roads[10].color ? `10px solid ${gameBoard.roads[10].color}` : ''}` }}>
          </div>

          {tileValueFrequencies[2].values.map((valueTile, i) => {
            let distinction = tileValueFrequencies[2].distinctions[i];
            let value = valueTile;
            if (value === null) {
              return (
                <div key={i}></div>
              )
            }
            else {
              return (
                <div className={`tile-${i+7} tile-listener`} onClick={() => robberHandler(value, distinction, gameBoard, ctx)} key={i}/>
              )
            }
          })}

        </div>

        {/* ROW 6 */}

        <div className='structure-overlay-row-6'>

          {/* ROADS */}

          <div id="24" className={"row-6-road-0" + `${gameBoard.roads[24].placed}`} style={{ borderRight: `${gameBoard.roads[24].color ? `10px solid ${gameBoard.roads[24].color}` : ''}` }}>
          </div>

          <div id="51" className={"row-6-road-1" + `${gameBoard.roads[51].placed}`} style={{ borderRight: `${gameBoard.roads[51].color ? `10px solid ${gameBoard.roads[51].color}` : ''}` }}>
          </div>

          <div id="52" className={"row-6-road-2" + `${gameBoard.roads[52].placed}`} style={{ borderRight: `${gameBoard.roads[52].color ? `10px solid ${gameBoard.roads[52].color}` : ''}` }}>
          </div>

          <div id="53" className={"row-6-road-3" + `${gameBoard.roads[53].placed}`} style={{ borderRight: `${gameBoard.roads[53].color ? `10px solid ${gameBoard.roads[53].color}` : ''}` }}>
          </div>

          <div id="54" className={"row-6-road-4" + `${gameBoard.roads[54].placed}`} style={{ borderRight: `${gameBoard.roads[54].color ? `10px solid ${gameBoard.roads[54].color}` : ''}` }}>
          </div>

          <div id="55" className={"row-6-road-5" + `${gameBoard.roads[55].placed}`} style={{ borderRight: `${gameBoard.roads[55].color ? `10px solid ${gameBoard.roads[55].color}` : ''}` }}>
          </div>

          <div id="56" className={"row-6-road-6" + `${gameBoard.roads[56].placed}`} style={{ borderRight: `${gameBoard.roads[56].color ? `10px solid ${gameBoard.roads[56].color}` : ''}` }}>
          </div>

          <div id="57" className={"row-6-road-7" + `${gameBoard.roads[57].placed}`} style={{ borderRight: `${gameBoard.roads[57].color ? `10px solid ${gameBoard.roads[57].color}` : ''}` }}>
          </div>

          <div id="58" className={"row-6-road-8" + `${gameBoard.roads[58].placed}`} style={{ borderRight: `${gameBoard.roads[58].color ? `10px solid ${gameBoard.roads[58].color}` : ''}` }}>
          </div>

          <div id="11" className={"row-6-road-9" + `${gameBoard.roads[11].placed}`}>
          </div>

          {/* STRUCTURES */}

          <div className={`row-6__node__24__${gameBoard[24]['structure']}`} style={{ backgroundColor: `${gameBoard[24]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 24 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(24, ctx)}>
          </div>

          <div className={`row-6__node__23__${gameBoard[23]['structure']}`} style={{ backgroundColor: `${gameBoard[23]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 23 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(23, ctx)}>
          </div>

          <div className={`row-6__node__44__${gameBoard[44]['structure']}`} style={{ backgroundColor: `${gameBoard[44]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 44 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(44, ctx)}>
          </div>

          <div className={`row-6__node__43__${gameBoard[43]['structure']}`} style={{ backgroundColor: `${gameBoard[43]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 43 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(43, ctx)}>
          </div>

          <div className={`row-6__node__52__${gameBoard[52]['structure']}`} style={{ backgroundColor: `${gameBoard[52]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 52 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(52, ctx)}>
          </div>

          <div className={`row-6__node__51__${gameBoard[51]['structure']}`} style={{ backgroundColor: `${gameBoard[51]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 51 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(51, ctx)}>
          </div>

          <div className={`row-6__node__50__${gameBoard[50]['structure']}`} style={{ backgroundColor: `${gameBoard[50]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 50 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(50, ctx)}>
          </div>

          <div className={`row-6__node__37__${gameBoard[37]['structure']}`} style={{ backgroundColor: `${gameBoard[37]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 37 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(37, ctx)}>
          </div>

          <div className={`row-6__node__36__${gameBoard[36]['structure']}`} style={{ backgroundColor: `${gameBoard[36]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 36 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(36, ctx)}>
          </div>

          <div className={`row-6__node__11__${gameBoard[11]['structure']}`} style={{ backgroundColor: `${gameBoard[11]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 11 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(11, ctx)}>
          </div>

          <div className={`row-6__node__10__${gameBoard[10]['structure']}`} style={{ backgroundColor: `${gameBoard[10]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 10 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(10, ctx)}>
          </div>

        </div>

        {/* ROW 7 */}

        <div className='structure-overlay-row-7'>

          {/* ROADS */}

          <div id="23" className={"row-7-road-0" + `${gameBoard.roads[23].placed}`} style={{ borderRight: `${gameBoard.roads[23].color ? `10px solid ${gameBoard.roads[23].color}` : ''}` }}>
          </div>

          <div id="59" className={"row-7-road-1" + `${gameBoard.roads[59].placed}`} style={{ borderRight: `${gameBoard.roads[59].color ? `10px solid ${gameBoard.roads[59].color}` : ''}` }}>
          </div>

          <div id="60" className={"row-7-road-2" + `${gameBoard.roads[60].placed}`} style={{ borderRight: `${gameBoard.roads[60].color ? `10px solid ${gameBoard.roads[60].color}` : ''}` }}>
          </div>

          <div id="61" className={"row-7-road-3" + `${gameBoard.roads[61].placed}`} style={{ borderRight: `${gameBoard.roads[61].color ? `10px solid ${gameBoard.roads[61].color}` : ''}` }}>
          </div>

          <div id="12" className={"row-7-road-4" + `${gameBoard.roads[12].placed}`} style={{ borderRight: `${gameBoard.roads[12].color ? `10px solid ${gameBoard.roads[12].color}` : ''}` }}>
          </div>

          {tileValueFrequencies[3].values.map((valueTile, i) => {
            let distinction = tileValueFrequencies[3].distinctions[i];
            let value = valueTile;
            if (value === null) {
              return (
                <div key={i}></div>
              )
            }
            else {
              return (
                <div className={`tile-${i+12} tile-listener`} onClick={() => robberHandler(value, distinction, gameBoard, ctx)} key={i} />
              )
            }
          })}

          {/* STRUCTURES */}

        </div>

        {/* ROW 8 */}

        <div className='structure-overlay-row-8'>

          {/* ROADS */}

          <div id="22" className={"row-8-road-0" + `${gameBoard.roads[22].placed}`} style={{ borderRight: `${gameBoard.roads[22].color ? `10px solid ${gameBoard.roads[22].color}` : ''}` }}>
          </div>

          <div id="62" className={"row-8-road-1" + `${gameBoard.roads[62].placed}`} style={{ borderRight: `${gameBoard.roads[62].color ? `10px solid ${gameBoard.roads[62].color}` : ''}` }}>
          </div>

          <div id="63" className={"row-8-road-2" + `${gameBoard.roads[63].placed}`} style={{ borderRight: `${gameBoard.roads[63].color ? `10px solid ${gameBoard.roads[63].color}` : ''}` }}>
          </div>

          <div id="64" className={"row-8-road-3" + `${gameBoard.roads[64].placed}`} style={{ borderRight: `${gameBoard.roads[64].color ? `10px solid ${gameBoard.roads[64].color}` : ''}` }}>
          </div>

          <div id="65" className={"row-8-road-4" + `${gameBoard.roads[65].placed}`} style={{ borderRight: `${gameBoard.roads[65].color ? `10px solid ${gameBoard.roads[65].color}` : ''}` }}>
          </div>

          <div id="66" className={"row-8-road-5" + `${gameBoard.roads[66].placed}`} style={{ borderRight: `${gameBoard.roads[66].color ? `10px solid ${gameBoard.roads[66].color}` : ''}` }}>
          </div>

          <div id="67" className={"row-8-road-6" + `${gameBoard.roads[67].placed}`} style={{ borderRight: `${gameBoard.roads[67].color ? `10px solid ${gameBoard.roads[67].color}` : ''}` }}>
          </div>

          <div id="13" className={"row-8-road-7" + `${gameBoard.roads[13].placed}`} style={{ borderRight: `${gameBoard.roads[13].color ? `10px solid ${gameBoard.roads[13].color}` : ''}` }}>
          </div>


          {/* STRUCTURES */}

          <div className={`row-8__node__22__${gameBoard[22]['structure']}`} style={{ backgroundColor: `${gameBoard[22]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 22 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(22, ctx)}>
          </div>

          <div className={`row-8__node__21__${gameBoard[21]['structure']}`} style={{ backgroundColor: `${gameBoard[21]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 21 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(21, ctx)}>
          </div>

          <div className={`row-8__node__42__${gameBoard[42]['structure']}`} style={{ backgroundColor: `${gameBoard[42]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 42 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(42, ctx)}>
          </div>

          <div className={`row-8__node__41__${gameBoard[41]['structure']}`} style={{ backgroundColor: `${gameBoard[41]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 41 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(41, ctx)}>
          </div>

          <div className={`row-8__node__40__${gameBoard[40]['structure']}`} style={{ backgroundColor: `${gameBoard[40]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 40 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(40, ctx)}>
          </div>

          <div className={`row-8__node__39__${gameBoard[39]['structure']}`} style={{ backgroundColor: `${gameBoard[39]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 39 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(39, ctx)}>
          </div>

          <div className={`row-8__node__38__${gameBoard[38]['structure']}`} style={{ backgroundColor: `${gameBoard[38]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 38 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(38, ctx)}>
          </div>

          <div className={`row-8__node__13__${gameBoard[13]['structure']}`} style={{ backgroundColor: `${gameBoard[13]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 13 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(13, ctx)}>
          </div>

          <div className={`row-8__node__12__${gameBoard[12]['structure']}`} style={{ backgroundColor: `${gameBoard[12]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 12 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(12, ctx)}>
          </div>

        </div>

        {/* ROW 9 */}

        <div className='structure-overlay-row-9'>

          {/* ROADS */}

          <div id="21" className={"row-9-road-0" + `${gameBoard.roads[21].placed}`} style={{ borderRight: `${gameBoard.roads[21].color ? `10px solid ${gameBoard.roads[21].color}` : ''}` }}>
          </div>

          <div id="68" className={"row-9-road-1" + `${gameBoard.roads[68].placed}`} style={{ borderRight: `${gameBoard.roads[68].color ? `10px solid ${gameBoard.roads[68].color}` : ''}` }}>
          </div>

          <div id="69" className={"row-9-road-2" + `${gameBoard.roads[69].placed}`} style={{ borderRight: `${gameBoard.roads[69].color ? `10px solid ${gameBoard.roads[69].color}` : ''}` }}>
          </div>

          <div id="14" className={"row-9-road-3" + `${gameBoard.roads[14].placed}`} style={{ borderRight: `${gameBoard.roads[14].color ? `10px solid ${gameBoard.roads[14].color}` : ''}` }}>
          </div>

          {tileValueFrequencies[4].values.map((valueTile, i) => {
            let distinction = tileValueFrequencies[4].distinctions[i];
            let value = valueTile;
            if (value === null) {
              return (
                <div key={i}></div>
              )
            }
            else {
              return (
                <div className={`tile-${i+16} tile-listener`} onClick={() => robberHandler(value, distinction, gameBoard, ctx)} key={i}/>
              )
            }
          })}

        </div>

        {/* ROW 10 */}

        <div className='structure-overlay-row-10'>

          {/* ROADS */}

          <div id="20" className={"row-10-road-0" + `${gameBoard.roads[20].placed}`} style={{ borderRight: `${gameBoard.roads[20].color ? `10px solid ${gameBoard.roads[20].color}` : ''}` }}>
          </div>

          <div id="19" className={"row-10-road-1" + `${gameBoard.roads[19].placed}`} style={{ borderRight: `${gameBoard.roads[19].color ? `10px solid ${gameBoard.roads[19].color}` : ''}` }}>
          </div>

          <div id="18" className={"row-10-road-2" + `${gameBoard.roads[18].placed}`} style={{ borderRight: `${gameBoard.roads[18].color ? `10px solid ${gameBoard.roads[18].color}` : ''}` }}>
          </div>

          <div id="17" className={"row-10-road-3" + `${gameBoard.roads[17].placed}`} style={{ borderRight: `${gameBoard.roads[17].color ? `10px solid ${gameBoard.roads[17].color}` : ''}` }}>
          </div>

          <div id="16" className={"row-10-road-4" + `${gameBoard.roads[16].placed}`} style={{ borderRight: `${gameBoard.roads[16].color ? `10px solid ${gameBoard.roads[16].color}` : ''}` }}>
          </div>

          <div id="15" className={"row-10-road-5" + `${gameBoard.roads[15].placed}`} style={{ borderRight: `${gameBoard.roads[15].color ? `10px solid ${gameBoard.roads[15].color}` : ''}` }}>
          </div>

          {/* STRUCTURES */}

          <div className={`row-10__node__20__${gameBoard[20]['structure']}`} style={{ backgroundColor: `${gameBoard[20]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 20 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(20, ctx)}>
          </div>

          <div className={`row-10__node__19__${gameBoard[19]['structure']}`} style={{ backgroundColor: `${gameBoard[19]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 19 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(19, ctx)}>
          </div>

          <div className={`row-10__node__18__${gameBoard[18]['structure']}`} style={{ backgroundColor: `${gameBoard[18]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 18 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(18, ctx)}>
          </div>

          <div className={`row-10__node__17__${gameBoard[17]['structure']}`} style={{ backgroundColor: `${gameBoard[17]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 17 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(17, ctx)}>
          </div>

          <div className={`row-10__node__16__${gameBoard[16]['structure']}`} style={{ backgroundColor: `${gameBoard[16]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 16 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(16, ctx)}>
          </div>

          <div className={`row-10__node__15__${gameBoard[15]['structure']}`} style={{ backgroundColor: `${gameBoard[15]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 15 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(15, ctx)}>
          </div>

          <div className={`row-10__node__14__${gameBoard[14]['structure']}`} style={{ backgroundColor: `${gameBoard[14]['color']}`, borderColor: `${ctx.startAndEndNodes[0] === 14 ? 'rgb(0, 255, 0)' : ''}` }} onClick={() => submitStructureHandler(14, ctx)}>
          </div>

        </div>

      </div>
      :
      <></>
  )
}

export default BoardOverlay;