import './css/Card.css'
const Card = (props) => {
  return (
    <div className={props.styles ? props.styles : 'card'}>
      {props.children}
    </div>
  )
}

export default Card;