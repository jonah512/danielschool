// Copyright (c) 2025 Milal Daniel Korean School.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SessionManager from './control/SessionManager';

const root = ReactDOM.createRoot(document.getElementById('root'));
let headerAddress = window.location.toString().split(':')[0] + ":";
let tailAddress = window.location.toString().split(':')[1];
if (tailAddress.endsWith('/')) {
  tailAddress = tailAddress.substring(0, tailAddress.length - 1);
}
window.LOGLEVEL = 'INFO';
window.APIURL = headerAddress + tailAddress + ':8080';
root.render(
  <React.StrictMode>
    <App loginStatus={SessionManager.loginStatus} />
  </React.StrictMode>
);

