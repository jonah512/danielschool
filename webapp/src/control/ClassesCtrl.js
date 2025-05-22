// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

const API_URL = `${window.APIURL}/classes/`; // Ensure trailing slash

export default class ClassesCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getClasses(search, year, term) {
    Logger.info('getClasses');
    if (term === 'all') term = null;
    if (year === 'all') year = null;

    axios
      .get(this.#url + "/classes", { params: { name: search, year: year, term: term } })
      .then(response => {
        Logger.info("Fetche classes:", response.data);
        EventPublisher.publish(EventDef.onClassListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching classes:", error));
  }

  addClass(classData, search = '') {
    Logger.info('Adding new class:', classData);
    axios
      .post(this.#url + "/classes/", classData) // Ensure trailing slash
      .then(response => {
        Logger.info("Class added successfully:", response.data);
        this.getClasses(search);
      })
      .catch(error => {
        Logger.error("Error adding class:", error.response?.data || error.message);
      });
  }

  updateClass(classId, classData, search = '') {
    axios
    .put(`${this.#url}/classes/${classId}`, classData) // Ensure trailing slash
    .then(response => {
      Logger.info("Class updated successfully:", response.data);
      this.getClasses(search);
    })
    .catch(error => {
      Logger.error("Error editing class:", error.response?.data || error.message);
    });
  }

  async deleteClasses(studentIds, search = '') {
    Logger.info('Deleting classes:', studentIds);

    for (const id of studentIds) {
      try {
        const response = await axios.delete(`${this.#url}/classes/${id}`);
        Logger.info(`Class with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting class with ID ${id}:`, error);
      }
    }
    this.getClasses(search); // Refresh the student list
  }

}

