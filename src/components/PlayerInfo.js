import { useContext } from "react";
import ModalStateContext from "../store/modal-context";

// THIS IS THE LEFT SIDE OF THE PLAYER UI 
const PlayerInfo = (props) => {
  const ctx = useContext(ModalStateContext);

  return (
    <div className='player-info'>
      <div className='color-banner' style={{ backgroundColor: props.color }}></div>
      <h3 className='points'>Points <span>{props.points}</span></h3>
      <table>
        <tbody>
          <tr>
            <td className='row-name'>Settlements:</td>
            <td>{props.settlements}</td>
          </tr>
          <tr>
            <td className='row-name'>Cities:</td>
            <td>{props.cities}</td>
          </tr>
          <tr>
            <td className='row-name'>Roads:</td>
            <td>{props.roads}</td>
          </tr>
        </tbody>
      </table>
      <h3>Resources</h3>
      <table>
        <tbody>
          <tr>
            <td className='row-name'>Hay:</td>
            <td>{props.resourceCards.hay}</td>
          </tr>
          <tr>
            <td className='row-name'>Stone:</td>
            <td>{props.resourceCards.stone}</td>
          </tr>
          <tr>
            <td className='row-name'>Wood:</td>
            <td>{props.resourceCards.wood}</td>
          </tr>
          <tr>
            <td className='row-name'>Brick:</td>
            <td>{props.resourceCards.brick}</td>
          </tr>
          <tr>
            <td className='row-name'>Sheep:</td>
            <td>{props.resourceCards.sheep}</td>
          </tr>
        </tbody>
      </table>
      <h3>Development Cards</h3>
      <table>
        <tbody>
          <tr>
            <td className='row-name'>Year of Plenty:</td>
            <td>{props.devCards['year_of_plenty'] + props.lockedDevCards['year_of_plenty']}</td>
          </tr>
          <tr>
            <td className='row-name'>Road Building:</td>
            <td>{props.devCards['road_building'] + props.lockedDevCards['road_building']}</td>
          </tr>
          <tr>
            <td className='row-name'>Victory Points:</td>
            <td>{props.devCards['victory_point']}</td>
          </tr>
          <tr>
            <td className='row-name'>Monopoly:</td>
            <td>{props.devCards['monopoly'] + props.lockedDevCards['monopoly']}</td>
          </tr>
          <tr>
            <td className='row-name'>Knights:</td>
            <td>{props.devCards.knight + props.lockedDevCards.knight}</td>
          </tr>
          <tr className='active-knights'>
            <td className='row-name'>Active Knights:</td>
            <td>{props.activeKnights === -1 ? 'Loading...' : props.activeKnights}</td>
          </tr>
        </tbody>
      </table>
      <h3 className='awards-section-title'>Awards</h3>
      <table>
        <tbody className='awards-table-body'>
          {
            Object.keys(props.gameAwards).map((awardType, i) => {
              if (props.gameAwards[awardType].userId === ctx.userId) {
                return (
                  <tr key={i}>
                    <td className='row-name'>{`${awardType === 'longestRoad' ? `Longest Road: ${props.gameAwards.longestRoad.roadLength}` : `Largest Army: ${props.gameAwards.largestArmy.armySize}`}`}</td>
                  </tr>
                )
              }
            })
          }
          {
            props.gameAwards.longestRoad.userId !== ctx.userId
            &&
            props.gameAwards.largestArmy.userId !== ctx.userId
            &&
            <tr>
              <td style={{ 'textAlign': 'left' }}>No Awards</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  )
}

export default PlayerInfo;