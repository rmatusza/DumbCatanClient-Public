import { useEffect, useState, useContext } from 'react';
import { connectToWebsocket } from '../functions/webSocketFunctions';
import { useNavigate } from 'react-router-dom';
import { clearAttemptsCounter, getToken } from '../functions/utilFunctions';
import ModalStateContext from '../store/modal-context';
import Card from '../UI/Card';
import SigninForm from '../components/SigninForm';
import SignupForm from '../components/SignupForm';
import './css/Authentication.css';
import '../styles/buttons.css';

const soundFile = require("../static/audio/mideval_eminem.mp3");
const axeSpinner = require.context("../../public/images/other");

const Authentication = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [signin, setSignin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reEnteredPassword, setReEnteredPassword] = useState('');
  const [missingFormData, setMissingFormData] = useState(false);
  const [badSignin, setBadSignin] = useState(false);
  const [badSignup, setBadSignup] = useState(false);
  const [badSigninMessage, setBadSigninMessage] = useState('');
  const [badSignupMessage, setBadSignupMessage] = useState('');
  const [role, setRole] = useState('USER');
  // const [ip, setIP] = useState('');
  const navigate = useNavigate();
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('AUTHENTICATION UE');

    if (ctx.authenticated) {
      navigate("/home")
    };

  }, []);

  const audio = new Audio(soundFile);

  const audioHandler = () => {
    audio.load()
    audio.play();
  }

  const passwordsEqual = password === reEnteredPassword || password === '' || reEnteredPassword === '';

  const formHandler = (e) => {
    let value = e.target.value
    switch (e.target.id) {
      case "username": setUsername(value);
        break;

      case "password": setPassword(value);
        break;

      case "confirm-password": setReEnteredPassword(value);
        break;
    }
  }

  const switchFormTypeHandler = (e) => {
    e.preventDefault();
    setSignin(() => !signin)
  }

  const loginHandler = async (e) => {

    e.preventDefault();

    let formData = [username.trim(), password.trim()];
    if (formData.includes('')) {
      setMissingFormData(true);
      return
    } else {
      setMissingFormData(false);
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'username': username, 'password': password })
      })
      if (await res.status !== 200) {
        // if(res.status === 409){
        //   setBadSignin(true);
        //   setBadSigninMessage("User is Already Signed in")
        //   throw new Error("User is Already Signed in");
        // }
        setBadSignin(true);
        setBadSigninMessage("username and/or password is invalid")
        throw new Error("username and/or password is invalid")
      }

      if (!ctx.stompClient.connected) {
        await connectToWebsocket(username, ctx.onSetStompConnected, ctx.onSetSock, ctx.onSetStompClient);
      }

      const { jwt, role, id, avatar_url } = await res.json();
      document.cookie = `token=${jwt};expires=31536000`;
      ctx.onSetUserCredentials(username, id, avatar_url)
      ctx.onSetRole(() => role);

      setTimeout(async () => {
        clearAttemptsCounter();
        ctx.onSetAuthenticated(true);
        ctx.onSetAuthenticating(false);
        setIsLoading(false);
        navigate("/home");
      }, 1500)

    } catch (e) {
      setIsLoading(false);
    }
  }

  const signupHandler = async (e) => {
    e.preventDefault();
    let formData = [username.trim(), password.trim(), reEnteredPassword.trim()];
    if (formData.includes('')) {
      setMissingFormData(true);
      return
    } else {
      setMissingFormData(false);
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'username': username, 'password': password, 'role': 'USER' })
      })

      if (res.status !== 200) {
        //console.log('HERE')
        setBadSignup(true);
        throw new Error("Something went wrong")
      }

      if (!ctx.stompClient.connected) {
        await connectToWebsocket(username, ctx.onSetStompConnected, ctx.onSetSock, ctx.onSetStompClient);
      }

      const { jwt, role, id, avatar_url, status, message } = await res.json();
      if(status !== 200){
        if(message.includes("constraint [users.username_UNIQUE]")){
          setBadSignup(true);
          setBadSignupMessage("Username Provided is Already Taken");
        }
        else{
          setBadSignup(true);
          setBadSignupMessage("A Server Error Has Occurred. Please Wait a Moment and Try Again.");
        }
        setIsLoading(false);
        return
      }
      document.cookie = `token=${jwt};expires=31536000`;
      ctx.onSetUserCredentials(username, id, avatar_url);
      ctx.onSetRole(() => role);
      
      setTimeout(async () => {
        clearAttemptsCounter();
        ctx.onSetAuthenticated(true);
        ctx.onSetAuthenticating(false);
        setIsLoading(false);
        navigate("/");
      }, 1500)

    } catch (e) {
      setIsLoading(false);
    }
  }

  return (
    <div className='authentication-page__container'>
      <div className="background-image__container">
        <header className='authentication-page__header'>
          <h1 className='font-link'>Catan... Sort of</h1>
          {/* <button style={{'display': 'hidden'}} onClick={null} className='eminem-button'>Click for medieval eminem music</button> */}
        </header>
        <section className='authentication-card__container'>
          <Card styles={"authentication-card"}>
            <h2 className='authentication-card-title'>{signin ? 'Enter Your Username and Password' : 'Create a Username and Password'}</h2>
            {missingFormData && <p style={{ color: 'red' }}>Please enter a username and password</p>}
            {badSignin && <p style={{ color: 'red' }}>{badSigninMessage}</p>}
            {badSignup && <p style={{ color: 'red' }}>{badSignupMessage}</p>}
            <div>
              {
                signin
                &&
                <SigninForm onUpdateForm={formHandler} onSwitchFormType={switchFormTypeHandler} onSignin={loginHandler} />
              }

              {
                !signin
                &&
                <SignupForm onUpdateForm={formHandler} onSwitchFormType={switchFormTypeHandler} onSignup={signupHandler} passwordsEqual={passwordsEqual} />
              }
            </div>
          </Card>
        </section>
        <section className='page-bottom'>
          {
            isLoading
            &&
            <>
              <div className='spinner-container'>
                <div className="loading-spinner">
                  <img className="spinner-img" src={axeSpinner('./axe_spinner.png')} />
                </div>
              </div>
              <h1 style={{ color: 'white' }}>Loading...</h1>
            </>
          }
          {
            ctx.authenticating
            &&
            <>
              <div className='spinner-container'>
                <div className="loading-spinner">
                  <img className="spinner-img" src={axeSpinner('./axe_spinner.png')} />
                </div>
              </div>
              <h1 style={{ color: 'white' }}>Trying to sign you in...</h1>
            </>
          }
        </section>
      </div>
    </div>
  )
}

export default Authentication;