import { useContext, useState } from 'react';
import ModalStateContext from '../../store/modal-context';
import getWindowDimensions from '../../utils/get-window-dimensions';
import './css/InvitationModalContent.css';

const InvitationModalContent = () => {
  const ctx = useContext(ModalStateContext);
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [inviteSent, setInviteSent] = useState(false);
  const { height } = getWindowDimensions(window);
  const halfHeight = height / 2;
  window.scrollTo({
    top: halfHeight,
    behavior: 'smooth'
  });
  const formDataHandler = (e) => {
    if (e.target.id === 'username') {
      setUsername(e.target.value);
      return
    };

    setGameId(parseInt(e.target.value, 10));
  }

  const errorMessageTimer = () => {
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000)
  }

  const successMessageTimer = () => {
    setTimeout(() => {
      setInviteSent(false);
    }, 5000)
  }

  const sendInvite = async (e) => {
    e.preventDefault();

    if(username.trim() === ''){
      setErrorMessage("Please provide a username");
      errorMessageTimer();
      return;
    }

    if(!gameId){
      setErrorMessage("Please provide a game id");
      errorMessageTimer();
      return;
    }

    setIsLoading(true);

    const createInviteReq = await fetch(`http://localhost:8080/api/invite?recipient_username=${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'senderId': ctx.userId,
        'gameId': gameId
      })
    })

    const res = await createInviteReq.json();

    if (res.status !== 200) {
      setIsLoading(false);
      setErrorMessage(res.message);
      errorMessageTimer();
      return
    }
    setIsLoading(false);
    setInviteSent(true);
    successMessageTimer();
    await ctx.stompClient.send(`/ws/invite/${username}`, {}, JSON.stringify({}))
    // const invite = await res.json();
  }

  return (
    <form className='invitation-form'>
      <div className='control-container'>
        <div className='control'>
          <label htmlFor="usernmae">Recipient Username:</label>
          <input id="username" type="text" onChange={formDataHandler} />
        </div>

        <div className='control'>
          <label htmlFor="game_id">Game ID:</label>
          <input id="game_id" type="text" onChange={formDataHandler} />
        </div>
      </div>

      <div className='response-container'>
        {
          errorMessage
          &&
          <h4 className='error-message'>{errorMessage}</h4>
        }
        {
          isLoading
          &&
          <h3 className='loading-message'>Loading...</h3>
        }
        {
          inviteSent
          &&
          <h3 className='success-message'>Invite Has Been Sent</h3>
        }
      </div>

      <div className='card-footer'>
        <div className='invitation-modal-actions'>
          <button onClick={sendInvite}>Send Invite</button>
          <button onClick={() => ctx.onModifyModalState('invitation')}>Cancel</button>
        </div>
      </div>
    </form>
  )
}

export default InvitationModalContent;