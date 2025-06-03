// Copyright (c) 2025 Milal Daniel Korean School.
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SessionManager from './control/SessionManager';

const root = ReactDOM.createRoot(document.getElementById('root'));
let baseAddress = window.location.toString();
if(baseAddress.split('?').length > 1){
  baseAddress = baseAddress.split('?')[0];
  if (baseAddress.includes('/')) {
    baseAddress = baseAddress.split('/').slice(0, 3).join('/');
  }
}
console.log("Base address: " + baseAddress);
let headerAddress = baseAddress.split(':')[0] + ":";
let tailAddress = baseAddress.split(':')[1];
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

