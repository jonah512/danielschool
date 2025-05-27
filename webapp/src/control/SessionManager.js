// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";
import EventPublisher from "../framework/event/EventPublisher";
import { EventDef } from "../framework/event/EventDef";
import Guid from "../framework/random/Guid";
import Os from "../framework/os/Os";
import Defines from "../component/Defines"
import UserRole from "../framework/user_role/UserRole";

let self = null;

class SessionManagerObj {

  constructor() {
    if (self) {
      throw new Error('SessionManagerObj cannot be created! Try to use SessionManager');
    }
    self = this;
  }

  loginStatus = false;
  userRole = '';
  deviceConnectionStatus = false;
  connectionTimer = undefined;
  userId = '';
  passwordDigested = '';
  onDeviceConnectionChanged = new Map();
  sessionId = Guid.generate32();
  strictedMode = false;

  #searchWord = new Map();
  setSearchWord(key, word) {
    if (word === undefined || word === null || word === "") {
      this.#searchWord.delete(key);
    }
    else {
      this.#searchWord.set(key, word);
    }
  }
  
  getSearchWord(key) {
    if (this.#searchWord.has(key)) {
      return this.#searchWord.get(key);
    }
    else {
      return null;
    }
  }

  setStrictedMode(mode) {
    this.strictedMode = mode;
  }

  getStrictedMode() {
    return this.strictedMode;
  }

  setUserId(id) {
    this.userId = id;
  }

  getUserId() {
    return this.userId;
  }

  setUserRole(role) {
    this.userRole = role;
  }

  getPassword() {
    return this.passwordDigested;
  }

  setPassword(password) {
    this.passwordDigested = password;
  }

  getUserRole() {
    if (this.deviceConnectionStatus) {
      if (this.strictedMode) {
        return this.userRole + '_strict';
      }
      else {
        return this.userRole;
      }
    }
    else {
      return this.userRole + "_cms_off";
    }
  }

  setLoginStatus(status) {
    self.loginStatus = status;
  }

  getLoginStatus() {
    return self.loginStatus;
  }

  checkDeviceConnection() {
    axios
      .get(window.APIURL + "/session/GetServerStatus")
      .then(response => {
        let changed = self.deviceConnectionStatus === false;
        self.deviceConnectionStatus = true;
        for (const [, eventDeligator] of self.onDeviceConnectionChanged.entries()) {
          if (eventDeligator !== null) {
            eventDeligator(true, changed);
          }
        }
      })
      .catch(
        error => {
          let changed = self.deviceConnectionStatus === true;
          self.deviceConnectionStatus = false;
          for (const [, eventDeligator] of self.onDeviceConnectionChanged.entries()) {
            if (eventDeligator !== null) {
              eventDeligator(false, changed);
            }
          }
        }
      );
  }

  addDeviceConnectionArbiter(key, eventDeligator) {
    Logger.debug('addDeviceConnectionArbiter:' + key + " is added.");
    self.onDeviceConnectionChanged.set(key, eventDeligator);
  }

  removeDeviceConnectionArbiter(key) {
    Logger.debug('removeDeviceConnectionArbiter:' + key + " is removed.");
    self.onDeviceConnectionChanged.delete(key);
  }

  startCheckingStream() {
    if (self.streamCheckTimer !== undefined && self.streamCheckTimer !== null) {
      return;
    }
    self.streamCheckTimer = setInterval(self.onStreamCheckTimer, 3000);
  }

  stopCheckingStream() {
    if (self.streamCheckTimer === undefined || self.streamCheckTimer === null) {
      return;
    }
    clearInterval(self.streamCheckTimer);
    self.streamCheckTimer = null;
  }
};

let SessionManager = new SessionManagerObj();
export default SessionManager;

