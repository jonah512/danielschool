// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

const API_URL = `${window.APIURL}/enrollment/`; // Ensure trailing slash

export default class EnrollmentCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getEnrollment( year, term) {
    Logger.info('getEnrollment');
    if (term === 'all') term = null;
    if (year === 'all') year = null;

    axios
      .get(this.#url + "/enrollment", { params: { year: year, term: term } })
      .then(response => {
        Logger.info("Fetche enrollment:", response.data);
        EventPublisher.publish(EventDef.onEnrollmentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching enrollment:", error));
  }

  addEnrollment(enrollmentData) {
    Logger.info('Adding new enrollment:', enrollmentData);
    axios
      .post(this.#url + "/enrollment/", enrollmentData) // Ensure trailing slash
      .then(response => {
        Logger.info("Enrollment added successfully:", response.data);
        this.getEnrollment(enrollmentData.year, enrollmentData.term);
      })
      .catch(error => {
        Logger.error("Error adding enrollment:", error.response?.data || error.message);
      });
  }

  async addEnrollmentSync(enrollmentData) {
    Logger.info('Adding new enrollment:', enrollmentData);
    try {
      const response = await axios.post(`${this.#url}/enrollment/`, enrollmentData); // Ensure trailing slash
      Logger.info("Enrollment added successfully:", response.data);
      this.getEnrollment(enrollmentData.year, enrollmentData.term);
    } catch (error) {
      Logger.error("Error adding enrollment:", error.response?.data || error.message);
    }
  }
  
  async updateEnrollmentSync(enrollmentId, enrollmentData) {
    try {
      const response = await axios.put(`${this.#url}/enrollment/${enrollmentId}`, enrollmentData); // Ensure trailing slash
      Logger.info("Class updated successfully:", response.data);
    } catch (error) {
      Logger.error("Error editing enrollment:", error.response?.data || error.message);
    }
  }

  updateEnrollment(enrollmentId, enrollmentData) {
    axios
    .put(`${this.#url}/enrollment/${enrollmentId}`, enrollmentData) // Ensure trailing slash
    .then(response => {
      Logger.info("Class updated successfully:", response.data);
    })
    .catch(error => {
      Logger.error("Error editing enrollment:", error.response?.data || error.message);
    });

  }

  async deleteEnrollment(enrollmentId, year = null, term = null) {
    Logger.info('Deleting enrollment:', enrollmentId, year, term);

    try {
      const response = await axios.delete(`${this.#url}/enrollment/${enrollmentId }`);
      Logger.info(`Enrollment with ID ${enrollmentId } deleted successfully:`);
    } catch (error) {
      Logger.error(`Error deleting enrollment with ID ${enrollmentId }:`, error);
    }
  }

}

