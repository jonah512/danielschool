// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class RequestsCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  sendEmail(requestObj) {
    console.log('Sending email:', requestObj);
    axios
      .post(this.#url + '/requests/send_email/', requestObj)
      .then(response => {
        Logger.debug('Email sent successfully:', response.data);
      })
      .catch(error => {
        Logger.error("Error sending email:", error);
      });
  }
  
  getRequests(search) {
    Logger.debug('fetchRequests');
    axios
      .get(this.#url + "/requests", { params: { name: search } })
      .then(response => {
        EventPublisher.publish(EventDef.onRequestListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching requests:", error));
  }

  updateRequest(requestId, requestData, search = '') {
    Logger.debug('Updating request:', requestId, requestData);
    axios
      .put(`${this.#url}/requests/${requestId}`, requestData)
      .then(response => {
        this.getRequests(search);
      })
      .catch(error => Logger.error("Error updating request:", error));
  }

  addNewRequest(requestData, search = '') {
    Logger.debug('Adding new request:', requestData);
    axios
      .post(this.#url + "/requests", requestData)
      .then(response => {
        this.getRequests(search);
      })
      .catch(error => Logger.error("Error adding request:", error));
  }

  async deleteRequests(requestIds, search = '') {
    Logger.debug('Deleting requests:', requestIds);

    for (const id of requestIds) {
      try {
        const response = await axios.delete(`${this.#url}/requests/${id}`);
        Logger.debug(`Request with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting request with ID ${id}:`, error);
      }
    }
    this.getRequests(search); // Refresh the request list
  }

}

