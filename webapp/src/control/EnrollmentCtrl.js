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
    console.log('getEnrollment');
    if (term === 'all') term = null;
    if (year === 'all') year = null;

    axios
      .get(this.#url + "/enrollment", { params: { year: year, term: term } })
      .then(response => {
        console.log("Fetche enrollment:");
        EventPublisher.publish(EventDef.onEnrollmentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching enrollment:", error));
  }

  addEnrollment(enrollmentData) {
    console.log('Adding new enrollment:', enrollmentData);
    axios
      .post(this.#url + "/enrollment/", enrollmentData) // Ensure trailing slash
      .then(response => {
        console.log("Enrollment added successfully:", response.data);
        this.getEnrollment(enrollmentData.year, enrollmentData.term);
      })
      .catch(error => {
        Logger.error("Error adding enrollment:", error.response?.data || error.message);
      });
  }

  async addEnrollmentSync(enrollmentData) {
    console.log('Adding new enrollment:', enrollmentData);
    try {
      const response = await axios.post(`${this.#url}/enrollment/`, enrollmentData); // Ensure trailing slash
      console.log("Enrollment added successfully:", response.data);
      this.getEnrollment(enrollmentData.year, enrollmentData.term);
    } catch (error) {
      Logger.error("Error adding enrollment:", error.response?.data || error.message);
    }
  }
  
  async conditionAddEnrollmentSync(enrollmentData) {
    console.log('Adding new enrollment:', enrollmentData);
    try{
      const response = await axios.post(`${this.#url}/enrollment_condition/`, enrollmentData); // Ensure trailing slash
      console.log("Enrollment added successfully:", response.data);
      this.getEnrollment(enrollmentData.year, enrollmentData.term);
    } catch (error) {
      throw enrollmentData;
    }
  }

  async updateEnrollmentSync(enrollmentId, enrollmentData) {
    try {
      const response = await axios.put(`${this.#url}/enrollment/${enrollmentId}`, enrollmentData); // Ensure trailing slash
      console.log("Class updated successfully:", response.data);
    } catch (error) {
      Logger.error("Error editing enrollment:", error.response?.data || error.message);
    }
  }

  updateEnrollment(enrollmentId, enrollmentData) {
    axios
    .put(`${this.#url}/enrollment/${enrollmentId}`, enrollmentData) // Ensure trailing slash
    .then(response => {
      console.log("Class updated successfully:", response.data);
    })
    .catch(error => {
      Logger.error("Error editing enrollment:", error.response?.data || error.message);
    });

  }

  async deleteEnrollment(enrollmentId, year = null, term = null) {
    console.log('deleteEnrollment', enrollmentId, year, term);

    try {
      const response = await axios.delete(`${this.#url}/enrollment/${enrollmentId }`);
      console.log(`Enrollment with ID ${enrollmentId } deleted successfully:`);
    } catch (error) {
      Logger.error(`Error deleting enrollment with ID ${enrollmentId }:`, error);
    }
  }

  async deleteEnrollmentSync(enrollmentId, year = null, term = null) {
    console.log('deleteEnrollmentSync:', enrollmentId, year, term);

    try {
      const response = await axios.delete(`${this.#url}/enrollment/${enrollmentId}`);
      console.log(`Enrollment with ID ${enrollmentId} deleted successfully:`, response.data);
      if (year || term) {
        this.getEnrollment(year, term);
      }
    } catch (error) {
      Logger.error(`Error deleting enrollment with ID ${enrollmentId}:`, error.response?.data || error.message);
    }
  }

}

