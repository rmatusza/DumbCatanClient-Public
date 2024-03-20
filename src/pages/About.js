import './css/About.css';

const About = () => {

  return (
    <div id='about-page-container'>
      <div id='about-page_info-container'>
        <h1>Dumb Catan - Version 1.0</h1>
        <div id='repo-links_container'>
          <a href='https://github.com/rmatusza/dumb-catan' target="_blank">Client Application Github Repository</a>
          <h3>|</h3>
          <a href='https://github.com/rmatusza/dumb-catan' target="_blank">Server Application Github Repository</a>
        </div>
        <h2>Included Features:</h2>
        <div id='feature-list'>
          <h4>1. Ability to create and edit a profile with avatar and username</h4>
          <h4>2. User password encryption</h4>
          <h4>3. Authentication via JWT token and Spring Security</h4>
          <h4>4. Ability to create and delete games</h4>
          <h4>5. Ability to invite friends to your game and accept/decline invitations from others</h4>
          <h4>6. Online realtime multiplayer via WebSocket - SockJS & STOMP messaging protocol</h4>
          <h4>7. All gameplay features associated with the base version of Catan. Such as the following:</h4>
          <ul>
            <li>Dice rolling</li>
            <li>Trading</li>
            <li>Building</li>
            <li>Purchasing and playing development cards</li>
            <li>Moving/using the robber</li>
          </ul>
        </div>
        <h2>Future Plans:</h2>
        <div id='feature-list'>
          <h4>1. Improved UI appearance</h4>
          <h4>2. Responsive UI for better user experience across different device sizes</h4>
          <h4>3. Transition to Redux for global application state management - currently using React Context</h4>
        </div>
        <h2>Stretch Goals:</h2>
        <div id='feature-list'>
          <h4>1. Addition of animations and sounds</h4>
          <h4>2. Addition of extra game modes - there are various interesting Catan expansion packs</h4>
          <h4>3. "AI" opponents</h4>
        </div>
      </div>
    </div>
  )
}

export default About;