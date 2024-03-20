import { createContext, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ModalStateContext from '../store/modal-context';
import './css/Home.css';

const Home = (props) => {
  //console.log('HOME PAGE')
  const navigate = useNavigate();
  const ctx = useContext(ModalStateContext);

  useEffect(() => {
    //console.log('HOME UE');

    if (!ctx.authenticated) {
      navigate("/authentication")
    };
    
  }, [ctx.authenticated]);

  return (

    <div className="home-page__container">

      <section className="home-page__body">
        
      </section>

    </div>

  )
}

export default Home;