import { useContext } from 'react';
import ModalStateContext from '../store/modal-context';
import './css/Modal.css';

function getWindowDimensions(playerMenuOpen) {
  const { innerWidth: width, innerHeight: height } = window;
  // can use this to add the extra px count when opening a modal 
  // on the game space page with the player menu closed

  // don't allow profile changes if on game-space page 
  //console.log(window.location.href)
  if(playerMenuOpen) {
    return window.screen.height + 500;
  }
  return window.innerHeight;
}

const Modal = (props) => {
  const ctx = useContext(ModalStateContext);
  return (
    <div 
      className={'modal-background'} 
      style={{'height': `${getWindowDimensions(ctx.playerMenuOpen)}px`}}
    >

      <div className={props.styles ? props.styles : 'modal-container'}>

        <h2>{props.message}</h2>

        <section className={'modal-content-container'}>
          {props.children}
        </section>

      </div>

    </div>
  )
}

export default Modal;