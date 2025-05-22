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

  async deleteEnrollment(studentIds, search = '') {
    Logger.info('Deleting enrollment:', studentIds);

    for (const id of studentIds) {
      try {
        const response = await axios.delete(`${this.#url}/enrollment/${id}`);
        Logger.info(`Class with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting enrollment with ID ${id}:`, error);
      }
    }
    this.getEnrollment(search); // Refresh the student list
  }

}

