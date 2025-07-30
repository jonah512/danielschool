// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';
import SessionManager from "./SessionManager";

const API_URL = `${window.APIURL}/classes/`; // Ensure trailing slash

export default class ClassesCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getClasses(search, year, term) {
    Logger.debug('getClasses');
    if (term === 'all') term = null;
    if (year === 'all') year = null;

    axios
      .get(this.#url + "/classes", { params: { name: search, year: year, term: term } })
      .then(response => {
        const searchFromSession = SessionManager.getSearchWord('Classes');
        if(search !== searchFromSession) {
          console.log("Search word from session does not match current search, updating session.");
          return;
        }
        EventPublisher.publish(EventDef.onClassListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching classes:", error));
  }

  getClassesForEnrollment(search, year, term) {
    Logger.debug('getClassesForEnrollment');
    if (term === 'all') term = null;
    if (year === 'all') year = null;

    axios
      .get(this.#url + "/classes", { params: { name: search, year: year, term: term } })
      .then(response => {
        EventPublisher.publish(EventDef.onClassListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching classes:", error));
  }

  addClass(classData, search = '') {
    Logger.debug('Adding new class:', classData);
    axios
      .post(this.#url + "/classes/", classData) // Ensure trailing slash
      .then(response => {
        Logger.debug("Class added successfully:", response.data);
        this.getClasses(search);
      })
      .catch(error => {
        Logger.error("Error adding class:", error.response?.data || error.message);
      });
  }

  async updateClassSync(classId, classData) {
    try {
      const response = await axios.put(`${this.#url}/classes/${classId}`, classData); // Ensure trailing slash
      Logger.debug("Class updated successfully:", response.data);
      return response.data; // Return the updated class data
    } catch (error) {
      Logger.error("Error editing class:", error.response?.data || error.message);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }

  async deleteClasses(studentIds, search = '') {
    Logger.debug('Deleting classes:', studentIds);

    for (const id of studentIds) {
      try {
        const response = await axios.delete(`${this.#url}/classes/${id}`);
        Logger.debug(`Class with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting class with ID ${id}:`, error);
      }
    }
    this.getClasses(search); // Refresh the student list
  }

}

