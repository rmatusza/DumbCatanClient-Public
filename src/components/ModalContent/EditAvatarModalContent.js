import { useState, useContext, useEffect } from "react";
import ModalStateContext from "../../store/modal-context";
import './css/EditAvatarModalContent.css';
const images = require.context('../../../public/images/profile_avatars', true);

// TODO: make a separate object to keep track of which object is selected
// becuase currenly you're making a copy of the whole image object which
// includes the image. it would be more efficient to have an object that
// just maps the url to a selected state and only use the image object
// to save the images to then be able to render them even after state updates

const EditAvatarModalContent = (props) => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [selectionError, setSelectionError] = useState(false);
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('EDIT AVATAR UE');

    const imageObj = {
      './av_1.png': {'image': images('./av_1.png'), 'selected': false},
      './av_2.png': {'image': images('./av_2.png'), 'selected': false},
      './av_3.png': {'image': images('./av_3.png'), 'selected': false},
      './av_4.png': {'image': images('./av_4.png'), 'selected': false},
      './av_5.png': {'image': images('./av_5.png'), 'selected': false},
    };

    setLoadedImages(imageObj);
  }, []);

  const cancelHandler = () => {
    ctx.onModifyModalState('editProfile');
    ctx.onModifyModalContent('editAvatar');
  }

  const previousPageHandler = () => {
    ctx.onModifyModalContent('editAvatar');
  }

  const selectAvatarHandler = e => {
    e.preventDefault();
    const avatarsCpy = {...loadedImages}
    const newAvatar = e.target.id
    avatarsCpy[newAvatar].selected = true
    const oldAvatar = selectedAvatar
    if(selectedAvatar){
      avatarsCpy[oldAvatar].selected = false
    }

    setLoadedImages(avatarsCpy) 
    setSelectedAvatar(e.target.id);
  }

  const updateAvatarHandler = async (e) => {
    e.preventDefault();
    if(!selectedAvatar){
      setSelectionError(true);

      setTimeout(() => {
        setSelectionError(false)
      },4000)

      return
    }
    setLoading(true);
    try{
      const res = await fetch(`http://localhost:8080/api/users/${ctx.userId}/edit-avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'avatarURL': selectedAvatar
        })
      })

      if(!res.status === 200) {
        throw new Error('error');
      }

      const {avatar_url} = await res.json();
      props.onSetAvatarURL(avatar_url);
      ctx.onSetAvatarURL(avatar_url);
      localStorage.setItem("avatarURL", avatar_url);
      setLoading(false);
      setAvatarUpdated(true);
      setTimeout(() => {
        setAvatarUpdated(false)
      }, 2000)

    }catch(e){
      setLoading(false);
    }

  }
  
  const loadedImagesKeys = Object.keys(loadedImages);

  return (
    <div className="avatars-container">
      <h2 style={{color: 'white', textDecoration: 'underline'}}>Select an Avatar</h2>
      <div className={`avatar-row`}>
        {
          loadedImagesKeys.length > 0
          && 
          loadedImagesKeys.map((url, i) => {
            return (
              <div className={`${loadedImages[url]['selected'] ? 'avatar-frame__selected' : 'avatar-frame'}`} key={i}>
                <img src={loadedImages[url].image} className='avatar-img' id={url} onClick={selectAvatarHandler} />
              </div>
            )
          })
        }
      </div>
      <div className="avatar-messages-container">
        {loading && <p style={{ color:'white', textAlign: 'center' }}>Loading...</p>}
        {avatarUpdated && <p style={{ color: 'rgb(94, 192, 85)', textAlign: 'center' }}>Avatar Updated!</p>}
        {selectionError && <p style={{ color: 'red', textAlign: 'center' }}>Please make a selection</p>}
      </div>

      <div className='edit-avatar-actions-container'>

        <div className="modal-actions">
          <button className='modal-confirm-button' onClick={updateAvatarHandler}>Update Avatar</button>
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

export default EditAvatarModalContent;