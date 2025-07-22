// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class ConsentCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getConsents() {
    Logger.debug('fetchConsents');
    axios
      .get(this.#url + "/consents" )
      .then(response => {
        EventPublisher.publish(EventDef.onConsentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching consents:", error));
  }
  
  async getConsentsSync() {
    Logger.debug('fetchConsents');
    try{
      const response = await axios.get(this.#url + "/consents" );
      Logger.debug("Fetched Consents:", response.data);
      EventPublisher.publish(EventDef.onConsentListChange, response.data);
      return response.data;
    } catch (error) {
      Logger.error(error);
    }
  }


  updateConsent(consentId, consentData) {
    Logger.debug('Updating consent:', consentId, consentData);
    axios
      .put(`${this.#url}/consents/${consentId}`, consentData)
      .then(response => {
        this.getConsents();
      })
      .catch(error => Logger.error("Error updating consent:", error));
  }

  addNewConsent(consentData) {
    Logger.debug('Adding new consent:', consentData);
    axios
      .post(this.#url + "/consents", consentData)
      .then(response => {
        this.getConsents();
      })
      .catch(error => Logger.error("Error adding consent:", error));
  }

  async deleteConsents(consentIds) {
    Logger.debug('Deleting consents:', consentIds);

    for (const id of consentIds) {
      try {
        const response = await axios.delete(`${this.#url}/consents/${id}`);
        Logger.debug(`Consent with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting consent with ID ${id}:`, error);
      }
    }
    this.getConsents(); // Refresh the consent list
  }

}

