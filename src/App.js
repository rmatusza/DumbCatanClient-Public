import { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { authenticate, getToken } from "./functions/utilFunctions";
import GameSpace from "./pages/GameSpace";
import Authentication from "./pages/Authentication";
import Home from "./pages/Home";
import ModalStateContext from './store/modal-context';
import Drawer from "./components/Drawer";
import Header from "./components/Header";
import Modals from "./components/ModalContent/Modals";
import GamesList from "./pages/GamesList";
import InvitesList from "./pages/InvitesList";
import ReportBug from "./pages/ReportBug";
import BugList from "./pages/BugList";
import About from "./pages/About";
import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [avatarURL, setAvatarURL] = useState('./av_1.png');
  const [refreshListenerRegistered, setRefreshListenerRegistered] = useState(false);
  const navigate = useNavigate();
  const ctx = useContext(ModalStateContext);

  useEffect(async () => {
    //console.log('APP UE');

    const INITIAL_AUTHENTICATION_ATTEMPT = true;

    if (localStorage.getItem('path') !== '/home') {
      localStorage.setItem('path', '/home');
    };

    const cookies = document.cookie.split("=");
    let token = getToken(cookies);

    await authenticate(token, navigate, ctx, INITIAL_AUTHENTICATION_ATTEMPT);

  }, []);

  return (
    <>
      {
        ctx.authenticated
        &&
        <Header />
      }

      <Modals
        onSetPlayerName={setPlayerName}
        onSetAvatarURL={setAvatarURL}
      />

      {
        ctx.drawerFirstTime
        &&
        <Drawer class={`${ctx.drawerActive ? 'drawer-active' : 'drawer-inactive'}`} />
      }

      <Routes>

        <Route path="/authentication"
          element=
          {
            <Authentication
            />
          }
        />

        <Route path="/game-space/:id"
          element=
          {
            <GameSpace />
          }
        />

        <Route path="/home"
          element=
          {
            <Home />
          }
        />

        <Route path="/your-games"
          element=
          {
            <GamesList />
          }
        />

        <Route path="/your-invites"
          element=
          {
            <InvitesList />
          }
        />

        <Route path="/report-bug"
          element=
          {
            <ReportBug />
          }
        />

        <Route path="/bug-list"
          element=
          {
            <BugList />
          }
        />

        <Route path="/about"
          element=
          {
            <About />
          }
        />

        <Route path="/*" element={<Navigate to="/home" />} />

      </Routes>
    </>
  );
}

export default App;