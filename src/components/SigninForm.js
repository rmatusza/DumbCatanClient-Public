import './css/AuthenticationForms.css';

const SigninForm = (props) => {
  return (
    <form>
      <div className='control'>
        <label htmlFor="usernmae">Username:</label>
        <input id="username" type="text" onChange={props.onUpdateForm}/>
      </div>

      <div className='control'>
        <label htmlFor="password">Password:</label>
        <input id="password" type="password" onChange={props.onUpdateForm}/>
      </div>

      <div className='card-footer'>
        <div className='actions'>
          <button onClick={props.onSignin}>Login</button>
        </div>

        <p>Don't have an account yet? <a className='signup-link' onClick={props.onSwitchFormType}>sign up here</a></p>
      </div>
    </form>
  )
}

export default SigninForm;