// Copyright (c) 2025 Milal Daniel Korean School.
import React, { useState } from 'react';
import { useEffect } from 'react';
import DanielAdminApp from './DanielAdminApp';
import Login from './Login'
import Register from './component/register/Register'; // Import the Register component
import SessionManager from './control/SessionManager';
import AlertDialog from './component/common/AlertDialog';
import LoginCtrl from './control/LoginCtrl';
import Resource from './framework/resource/Resource';
import md5 from './framework/security/Md5';
import Logger from './framework/logger/Logger';
import UserRole from './framework/user_role/UserRole';
import EventPublisher from "./framework/event/EventPublisher";
import { EventDef } from "./framework/event/EventDef";

export default function App(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(SessionManager.getLoginStatus());
  const [loginFail, setLoginFail] = useState(false);
  const [loginForbidden, setLoginForbidden] = useState(false);
  const MODULE = 'App';
  
  useEffect(() => {
    (async () => {
      await Resource.loadLanguageList();
    })();

    if (SessionManager.connectionTimer !== undefined) {
      clearInterval(SessionManager.connectionTimer);
    }
    SessionManager.connectionTimer = setInterval(checkDeviceConnection, 3000);
    setTimeout(() => {
      checkIfLiveConnection();
    }, 1000);
    return () => {
      clearInterval(SessionManager.connectionTimer);
    }
  }, [props, window.APIURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkIfLiveConnection = () => {
    // get sessionId, userRole, userId from localStorage
    const sessionId = localStorage.getItem('sessionId');
    const userRole = localStorage.getItem('userRole'); 
    const userId = localStorage.getItem('userId');
    const language = localStorage.getItem('selectedLanguage')
    console.log('sessionId:', sessionId);
    console.log('userRole:', userRole);
    console.log('userId:', userId);

    if (sessionId !== undefined && sessionId !== null && sessionId !== '' && sessionId !== 'undefined') {
      console.log('sessionId is valid', sessionId);
      SessionManager.setLoginStatus(true);
      SessionManager.setUserRole(userRole);
      SessionManager.setUserId(userId);
      setIsLoggedIn(true);
      UserRole.load(userRole);
      setLoginForbidden(false);
      console.log('language:', language);
      if(language !== undefined && language !== null && language !== '' && language !== 'undefined') {
        Resource.setLanguage(language);
      }
    } else {
      SessionManager.setLoginStatus(false);
      setIsLoggedIn(false);
    }
  }

  const checkDeviceConnection = () => {
    SessionManager.checkDeviceConnection();
  }

  const handleLogin = (id, password) => {
    const cmsLogin = new LoginCtrl(window.APIURL);
    SessionManager.setUserId(id);
    SessionManager.setPassword(md5(password));
    cmsLogin.verifyCredentials(id, md5(password), onLogin);
  };

  const onLogin = (response) => {
    console.log(response);
    if (response.success) {
      SessionManager.setLoginStatus(true);
      SessionManager.setUserRole(response.user_role);
      setIsLoggedIn(SessionManager.getLoginStatus());
      setLoginFail(false);
      UserRole.load(SessionManager.getUserRole());

    }
    else if (response.indexOf('403')>0) { // forbidden case
      SessionManager.setLoginStatus(false);
      setIsLoggedIn(SessionManager.getLoginStatus());
      setLoginForbidden(true);
      UserRole.reset();      
    }
    else {
      SessionManager.setLoginStatus(false);
      setIsLoggedIn(SessionManager.getLoginStatus());
      setLoginFail(true);
      UserRole.reset();
    }
  }

  const onConfirm = () => {
    setLoginFail(false);
    setLoginForbidden(false);
  }

  return (
    <div>
      {

          window.location.pathname === '/manager' ? 
            (isLoggedIn ? <DanielAdminApp /> : <Login onLogin={handleLogin} />) : 
            (<Register />)

      }
      <div>
        {loginFail &&
          <AlertDialog onConfirm={onConfirm} ConfirmLabel={Resource.get('common.dialog.close')} YesOrNo={false} Open={true} Title={Resource.get('login.loginfailtitle')} Content={Resource.get('login.loginfailcontent')} />
        }
        {loginForbidden &&
          <AlertDialog onConfirm={onConfirm} ConfirmLabel={Resource.get('common.dialog.close')} YesOrNo={false} Open={true} Title={Resource.get('login.loginfailtitle')} Content={Resource.get('login.loginforbiddencontent')} />
        }
      </div>
    </div>
  );
};