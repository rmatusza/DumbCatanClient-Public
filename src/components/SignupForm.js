import './css/AuthenticationForms.css';

const SignupForm = (props) => {


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

      <div className='control'>
        <label htmlFor="confirm-password">Confirm Password:</label>
        <input id="confirm-password" type="password" onChange={props.onUpdateForm}/>
        {!props.passwordsEqual && <p style={{color: 'red'}}>Passwords don't match</p>}
      </div>

      <div className='card-footer'>
        <div className='actions'>
          <button onClick={props.onSignup}>Create Account</button>
        </div>
        <p>Already have an account? <a className='signup-link' onClick={props.onSwitchFormType}>sign in here</a></p>
      </div>
    </form>
  )
}

export default SignupForm;