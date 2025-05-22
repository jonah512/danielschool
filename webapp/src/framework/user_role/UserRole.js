// Copyright (c) 2025 Milal Daniel Korean School.
import Logger from "../logger/Logger";
import EventPublisher from "../event/EventPublisher";
import { EventDef } from "../event/EventDef";
import Guid from "../random/Guid";

class UserRoleObj {
  static #instance = null;

  #selectedRole = null;
  constructor() {
    if (UserRoleObj.#instance) {
      throw new Error('UserRole cannot be created! Try to use UserRoleInstance');
    }
    UserRoleObj.#instance = this;
  }

  async load(role) {
    Logger.debug('load', role);
    const response = await fetch('/user_role/' + role + '.json?index=' + Guid.generate16());
    if (!response.ok) {
      Logger.error('Failed to fetch resource');
    }
    this.#selectedRole = await response.json();
    Logger.debug('load', this.#selectedRole);
    EventPublisher.publish(EventDef.onUserRoleChange, role);
  };

  reset() {
    this.#selectedRole = null;
  }

  check(key) {
    if (!this.#selectedRole) {
      return false; // nothing is abled
    }

    const keys = key.split('.');
    let node = this.#selectedRole;
    if (node === undefined || node === null) {
      return false; // not defined? => disable it
    }

    keys.forEach(k => {
      try {
        node = node[k];
        if (node === undefined || node === null) {
          return false; // not defined? => disable it
        }
      }
      catch (error) {
        return '';
      }
    });

    return node || false;
  }

}

let UserRole = new UserRoleObj();
export default UserRole;