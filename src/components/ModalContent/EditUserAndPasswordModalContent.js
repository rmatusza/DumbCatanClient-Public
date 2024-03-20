import { useState, useContext } from 'react';
import ModalStateContext from '../../store/modal-context';
import './css/EditUsernameAndPasswordModalContent.css';
const EditUserAndPasswordModalContent = (props) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [usernameUpdated, setUsernameUpdated] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [allUpdated, setAllUpdated] = useState(false);
  const [updateAllError, setUpdateAllError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emptyUsername, setEmptyUsername] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [emptyConfirmationPassword,  setEmptyConfirmationPassword] = useState(false);
  const [updateAllFieldError, setUpdateAllFieldError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const ctx = useContext(ModalStateContext);

  const passwordsEqual = newPassword === confirmedPassword || newPassword === '' || confirmedPassword === '';
  //console.log(newPassword === confirmedPassword, newPassword === '', confirmedPassword === '')
  const usernameHandler = (e) => {
    setNewUsername(e.target.value);
  }

  const passwordHandler = (e) => {
    if (e.target.id === 'update-password') {
      setNewPassword(e.target.value);
      return
    }
    setConfirmedPassword(e.target.value);
    setConfirmPasswordTouched(true);
  }

  const cancelHandler = () => {
    ctx.onModifyModalState('editProfile');
    ctx.onModifyModalContent('editUsernameAndPassword');
  }

  const previousPageHandler = () => {
    ctx.onModifyModalContent('editUsernameAndPassword');

  }

  const submitHandler = async (e) => {
    e.preventDefault();

    if (e.target.id === 'update-username-button') {
      if(newUsername.trim().length === 0) {
        setEmptyUsername(true);
        setTimeout(() => {
          setEmptyUsername(false)
        }, 4000)
        return
      }
      setLoadingUsername(true);
      try {
        const res = await fetch(`http://localhost:8080/api/users/${ctx.userId}/edit-username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: newUsername,
          })
        })

        if (!res.status === 200) {
          const error = new Error();
          error.message(`encountered a problem while updating username - status ${res.status}`)
          throw error;
        }

        const { jwt, username } = await res.json();
        document.cookie = `token=${jwt}`;
        localStorage.setItem("playerName", username)
        props.onSetPlayerName(username);

        setLoadingUsername(false);
        setUsernameUpdated(true);
        setTimeout(() => {
          setUsernameUpdated(false);
        }, 2500)
        return
      } catch (e) {
        setLoadingUsername(false);
        setUsernameError(true);
        setTimeout(() => {
          setUsernameError(false);
        }, 4000);
        return
      }
    }

    if (e.target.id === 'update-password-button') {
      if(newPassword.trim().length === 0) {
        setEmptyPassword(true);
        setTimeout(() => {
          setEmptyPassword(false)
        }, 4000)
        return
      }

      if(confirmedPassword.trim().length === 0) {
        setEmptyConfirmationPassword(true);
        setTimeout(() => {
          setEmptyConfirmationPassword(false)
        }, 4000)
        return
      }
      setLoadingPassword(true);
      try {
        const res = await fetch(`http://localhost:8080/api/users/${ctx.userId}/edit-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: newPassword,
          })
        })

        if (!res.status === 200) {
          const error = new Error();
          error.message(`encountered a problem while updating password - status ${res.status}`)
          throw error;
        }

        const { jwt } = await res.json();
        document.cookie = `token=${jwt}`;

        setLoadingPassword(false);
        setPasswordUpdated(true);
        setTimeout(() => {
          setPasswordUpdated(false);
        }, 2500)
        return
      } catch (e) {
        setLoadingPassword(false);
        setPasswordError(true);
        setTimeout(() => {
          setPasswordError(false);
        }, 4000);
        return
      }
    }

    if (e.target.id === 'update-all-button') {

      if(newPassword.trim().length === 0 || confirmedPassword.trim().length === 0 || newUsername.trim().length === 0) {
        setUpdateAllFieldError(true);
        let currentAttempts = attempts;
        let newAttempts = currentAttempts+=1
        //console.log(newAttempts)
        setAttempts(newAttempts);
        setTimeout(() => {
          setUpdateAllFieldError(false);
        }, 4000)
        return
      }

      setLoadingPassword(true);
      try {
        const res = await fetch(`http://localhost:8080/api/users/${ctx.userId}/edit-username-and-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: newPassword,
            username: newUsername
          })
        })

        if (!res.status === 200) {
          const error = new Error();
          error.message(`encountered a problem while updating username and password - status ${res.status}`)
          throw error;
        }

        const { jwt, username } = await res.json();
        document.cookie = `token=${jwt}`;
        localStorage.setItem("playerName", username)
        props.onSetPlayerName(username);

        setLoadingPassword(false);
        setAllUpdated(true);
        setTimeout(() => {
          setAllUpdated(false);
        }, 2500)
        return
      } catch (e) {
        setLoadingPassword(false);
        setUpdateAllError(true);
        setTimeout(() => {
          setUpdateAllError(false);
        }, 4000);
        return
      }
    }
  }

  return (
    <div className='edit-username-and-password-form-container'>
      <form className="update-user-and-password-form">

        <div className='control__update-user-and-password'>

          <label htmlFor='update-username' style={{ color: 'white' }}><p>New Username:</p></label>
          <div className='update-username-container'>
            <input id="update-username" type="text" onChange={usernameHandler} />
            <button onClick={submitHandler} id='update-username-button'>Update Username</button>
          </div>
          {loadingUsername && <p style={{ color: 'rgb(148, 186, 241)', textAlign: 'center' }}>Loading...</p>}
          {usernameUpdated && <p style={{ color: 'rgb(94, 192, 85)', textAlign: 'center' }}>Username Updated!</p>}
          {usernameError && <p style={{ color: 'red', textAlign: 'center' }}>An error occured while updating username</p>}
          {emptyUsername && <p style={{ color: 'red', textAlign: 'center' }}>Please enter a username</p>}

          <label htmlFor='update-password' style={{ color: 'white' }}><p>New Password:</p></label>
          <input id="update-password" type="password" onChange={passwordHandler} />

          <label htmlFor='confirm-new-password' style={{ color: 'white' }}><p>Confirm New Password:</p></label>
          <div className='update-password-container'>
            <input id="confirm-new-password" type="password" onChange={passwordHandler} />
            <button id="update-password-button" onClick={submitHandler}>Update Password</button>
          </div>
          {!passwordsEqual && <p style={{ color: 'red', textAlign: 'center' }}>Passwords don't match</p>}
          {loadingPassword && <p style={{ color: 'rgb(148, 186, 241)', textAlign: 'center' }}>Loading...</p>}
          {passwordUpdated && <p style={{ color: 'rgb(94, 192, 85)', textAlign: 'center' }}>Password Updated!</p>}
          {passwordError && <p style={{ color: 'red', textAlign: 'center' }}>An error occured while updating password</p>}
          {(emptyPassword && !emptyConfirmationPassword) && <p style={{ color: 'red', textAlign: 'center' }}>Please enter a password</p>}
          {(emptyConfirmationPassword && !emptyPassword) && <p style={{ color: 'red', textAlign: 'center' }}>Please enter a confirmation password</p>}
          {(emptyConfirmationPassword && emptyPassword) && <p style={{ color: 'red', textAlign: 'center' }}>Please enter a password and confirmation password</p>}
          {(updateAllFieldError && attempts < 3) && <p style={{ color: 'red', textAlign: 'center' }}>Please ensure that all fields are filled</p>}
          {(updateAllFieldError && attempts >= 3) && <p style={{ color: 'red', textAlign: 'center' }}>Really?...</p>}
          {allUpdated && <p style={{ color: 'rgb(94, 192, 85)', textAlign: 'center' }}>Username and Password Updated!</p>}
        </div>

      </form>

      <div className='edit-user-and-pass-actions-container'>
        <div className="modal-actions">
          <button id="update-all-button" className='modal-confirm-button' onClick={submitHandler}>Update all</button>
        </div>

        <div className="modal-actions">
          <button className='modal-back-button' onClick={previousPageHandler}>Back</button>
        </div>

        <div className="modal-actions">
          <button className='modal-cancel-button' onClick={cancelHandler}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default EditUserAndPasswordModalContent;