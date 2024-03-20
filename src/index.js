import {BrowserRouter} from 'react-router-dom';
import {ModalStateContextProvider} from './store/modal-context';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ModalStateContextProvider>
        <App />
      </ModalStateContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);