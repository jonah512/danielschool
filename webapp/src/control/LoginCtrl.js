// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

export default class LoginCtrl {
  constructor(url) {
  }

  verifyCredentials(id, password, onLoginVerification) {
    Logger.info('verifyCredentials:', window.APIURL + "/users/login", password);
    axios.post(window.APIURL + "/users/login", {
        "email": id, 
        "password": password, 
      })
      .then(response => {
        Logger.debug('verifyCredentials:' + response.data.success);
        if (onLoginVerification !== undefined) {onLoginVerification(response.data); }
      })
      .catch(error => { Logger.error(error); onLoginVerification(error.message); });
  }
}