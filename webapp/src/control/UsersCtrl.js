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
    console.log('fetchUsers', search);
    axios
      .get(this.#url + "/users", { params: { name: search } })
      .then(response => {
        console.log("Fetched Users:", response.data);
        EventPublisher.publish(EventDef.onUserListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching users:", error));
  }
}

