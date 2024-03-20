import { useContext } from 'react';
import ModalStateContext from '../../store/modal-context';
import './css/EditProfileModalContent.css';
const images = require.context('../../../public/images/profile_avatars', true);


const EditProfileModalContent = (props) => {
  const ctx = useContext(ModalStateContext);

  const cancelHandler = () => {
    ctx.onModifyModalState('editProfile');
  }

  return (
    <div className='user-info-container'>
      <div className='username-info-container'>
        <div>
          <h2 style={{color: 'white'}}>Username:</h2>
          <div className='edit-username-and-password-links__container'>
            <p style={{color: 'rgb(148, 186, 241)', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => ctx.onModifyModalContent('editUsernameAndPassword')}>Edit username and password</p>
          </div>
        </div>
        <p className='modal-username-text'>{ctx.username}</p>
      </div>
      {/* <div className='password-info-container'>

        <h2 style={{color: 'white'}}>Password:</h2>
      </div> */}
      <div className='avatar-info-container'>
        <div>
          <h2 style={{color: 'white'}}>Current Avatar:</h2>
          <p style={{color: 'rgb(148, 186, 241)', textDecoration: 'underline', cursor: 'pointer'}} onClick={() => ctx.onModifyModalContent('editAvatar')}>Edit avatar</p>
        </div>
        <img src={images(ctx.avatarURL)} className="current-avatar-img" />
      </div>

      <div className='view-profile-actions-container'>
        <div className="modal-actions">
          <button className='modal-cancel-button' onClick={cancelHandler}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModalContent;