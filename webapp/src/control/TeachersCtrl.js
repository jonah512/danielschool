// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class TeacherCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getTeachers(search) {
    Logger.debug('fetchTeachers');
    axios
      .get(this.#url + "/teachers", { params: { name: search } })
      .then(response => {
        EventPublisher.publish(EventDef.onTeacherListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching teachers:", error));
  }

  updateTeacher(teacherId, teacherData, search = '') {
    Logger.debug('Updating teacher:', teacherId, teacherData);
    axios
      .put(`${this.#url}/teachers/${teacherId}`, teacherData)
      .then(response => {
        this.getTeachers(search);
      })
      .catch(error => Logger.error("Error updating teacher:", error));
  }

  addNewTeacher(teacherData, search = '') {
    Logger.debug('Adding new teacher:', teacherData);
    axios
      .post(this.#url + "/teachers", teacherData)
      .then(response => {
        this.getTeachers(search);
      })
      .catch(error => Logger.error("Error adding teacher:", error));
  }

  async deleteTeachers(teacherIds, search = '') {
    Logger.debug('Deleting teachers:', teacherIds);

    for (const id of teacherIds) {
      try {
        const response = await axios.delete(`${this.#url}/teachers/${id}`);
        Logger.debug(`Teacher with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting teacher with ID ${id}:`, error);
      }
    }
    this.getTeachers(search); // Refresh the teacher list
  }

}

