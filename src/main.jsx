import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';  // Only keep App.css if this is the main stylesheet
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);