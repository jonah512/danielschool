// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class UsersCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  updateProfile(search) {
    Logger.debug('fetchUsers', search);
    axios
      .get(this.#url + "/users", { params: { name: search } })
      .then(response => {
        Logger.debug("Fetched Users:", response.data);
        EventPublisher.publish(EventDef.onUserListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching users:", error));
  }

  async getAccessedUser() {
    try {
      const response = await axios.get(this.#url + "/GetSessionQueue");
      Logger.debug("Accessed User:", response.data);
      return response.data;
    } catch (error) {
      Logger.error("Error fetching accessed user:", error);
      throw error;
    }
  }
  
  clearUser(search) {
    Logger.debug('clearUser', search);
    axios
      .get(this.#url + "/ClearSessionQueue")
      .then(response => {
        Logger.debug("ClearSessionQueue:", response.data);
      })
      .catch(error => Logger.error("Error ClearSessionQueue:", error));
  }

}

