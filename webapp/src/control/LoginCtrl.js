// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";
import RegisterCtrl from "./RegisterCtrl";

export default class LoginCtrl {
  constructor(url) {
  }

  verifyCredentials(id, password, onLoginVerification) {
    Logger.debug('verifyCredentials:', window.APIURL + "/users/login", password);
    axios.post(window.APIURL + "/users/login", {
        "email": id, 
        "password": password, 
      })
      .then(response => {
        Logger.debug('verifyCredentials:' + response.data.success);
        if (response.data.success) {
          Logger.debug('Login successful:', response.data);
          // Store the session ID in local storage
          RegisterCtrl.session_id = response.data.session_id;
          RegisterCtrl.userRole = response.data.user_role;
          RegisterCtrl.userId = id;
          localStorage.setItem('sessionId', response.data.session_id);
          localStorage.setItem('userRole', response.data.user_role);
          localStorage.setItem('userId', id);
        } else {
          Logger.error('Login failed:', response.data.message);
        }
        if (onLoginVerification !== undefined) {onLoginVerification(response.data); }
      })
      .catch(error => { Logger.error(error); onLoginVerification(error.message); });
  }
}