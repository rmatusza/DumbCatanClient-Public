import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalStateContext from '../store/modal-context';
import './css/Drawer.css';

const lod = require('lodash');

const Drawer = (props) => {
  const ctx = useContext(ModalStateContext);
  const navigate = useNavigate();
  const [playerColor, setPlayerColor] = useState(null);

  const userGamesHandler = () => {
    localStorage.setItem('path', '/your-games');
    navigate(`/your-games`);
    ctx.onSetPlayerMenuOpen(false);
    ctx.onModifyDrawerState(false);
  }

  const userInvitesHandler = () => {
    localStorage.setItem('path', '/your-invites');
    navigate(`/your-invites`);
    ctx.onSetPlayerMenuOpen(false);
    ctx.onModifyDrawerState(false);
  }

  const createGameModalHandler = () => {
    localStorage.setItem('path', '/game-space');
    ctx.onSetPlayerMenuOpen(false);
    ctx.onModifyModalState('createGame');
  }

  const officialRulesHandler = () => {
    window.open('https://catanrules.com/catan-rules-explained/', 'rel=noopener noreferrer');
  }

  const reportBugHandler = () => {
    localStorage.setItem('path', '/report-bug');
    navigate(`/report-bug`);
    ctx.onSetPlayerMenuOpen(false);
    ctx.onModifyDrawerState(false);
  }

  const bugListHandler = () => {
    localStorage.setItem('path', '/bug-list');
    navigate(`/bug-list`);
    ctx.onSetPlayerMenuOpen(false);
    ctx.onModifyDrawerState(false);
  }

  const aboutPageHandler = () => {
    localStorage.setItem('path', '/about');
    navigate(`/about`);
    ctx.onModifyDrawerState(false);
  }

  const debugConsoleHandler = () => {
    ctx.onModifyModalState('devConsole');
    ctx.onModifyDrawerState(false);
  }

  return (
    <div className={`${props.class}`}>
      <div className='options__container'>
        <h2 id="edit-profile" className='option' onClick={() => ctx.onModifyModalState('editProfile')}>View Profile</h2>
        <h2 id="create-game" className='option' onClick={createGameModalHandler}>Create Game</h2>
        <h2 id="invite-friends" className='option' onClick={() => ctx.onModifyModalState('invitation')}>Invite Friends</h2>
        <h2 id="your-invites" className='option' onClick={userInvitesHandler}>Your Invites</h2>
        <h2 id="your-games" className='option' onClick={userGamesHandler}>Your Games</h2>
        <h2 id="report-a-bug" className='option' onClick={reportBugHandler}>Report Bug</h2>
        {
          ctx.role === 'ADMIN'
          &&
          <h2 id="bug-list" className='option' onClick={bugListHandler}>Bug List</h2>
        }
        {
          ctx.role === 'ADMIN'
          &&
          <h2 id="debug-console" className='option' onClick={debugConsoleHandler}>Debug Console</h2>
        }
        <h2 id="official-rules" className='option' onClick={officialRulesHandler}>Official Rules</h2>
        <br />
        <h2 id="official-rules" className='option' onClick={aboutPageHandler}>About This App</h2>
      </div>
    </div>
  )
}

export default Drawer;