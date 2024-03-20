import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalStateContext from '../store/modal-context';
import { debugConsoleHandler } from '../functions/utilFunctions';
const avatarOne = '/images/profile_avatars/av_1.png';
const avatarTwo = '/images/profile_avatars/av_2.png';
const avatarThree = '/images/profile_avatars/av_3.png';
const avatarFour = '/images/profile_avatars/av_4.png';
const avatarFive = '/images/profile_avatars/av_5.png';
const lod = require('lodash');

const Header = (props) => {
  const [profileAvatars, setProfileAvatars] = useState(null);
  const navigate = useNavigate();
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    setProfileAvatars({
      './av_1.png': avatarOne,
      './av_2.png': avatarTwo,
      './av_3.png': avatarThree,
      './av_4.png': avatarFour,
      './av_5.png': avatarFive,
    })
  }, [])

  const drawerHandler = async () => {
    if(!ctx.drawerFirstTime){
      ctx.onSetDrawerFirstTime(true);
    }
    ctx.onModifyDrawerState()
  }

  // REFACTOR NOTE: add this function to util functions file
  const logoutHandler = async (e) => {
    e.preventDefault();
    
    ctx.stompClient.disconnect();

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('attemptsCounter');
   
    ctx.onSetAuthenticated(false);
    ctx.onModifyDrawerState('logout');

    navigate("/authentication");
  };

  return (
    
    profileAvatars ? 

    <div>
      <header className="home-page__header">
        <div className="avatar-container">
          <img className="avatar-image" src={profileAvatars[ctx.avatarURL]} />
          <div className="name-and-menu__container">
            <p className="name-tag">{ctx.username}</p>
            <div className="menu-button__container" onClick={drawerHandler}>
              <p>Menu</p>
            </div>
          </div>
        </div>

        <div className="home-header-text__container">
          <h1 className="home-header__text">Catan... Sort of</h1>
        </div>

        <h2 className="logout-button__home-page" onClick={logoutHandler}>Logout</h2>

      </header>
    </div>

    :

    <></>
  )
}

export default Header;