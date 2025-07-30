// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';
import SessionManager from "./SessionManager";

export default class StudentCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getStudents(search = '') {
    Logger.debug('getStudents');
    axios
      .get(this.#url + "/students", { params: { name: search } })
      .then(response => {
        const searchFromSession = SessionManager.getSearchWord('Students');
        if(searchFromSession !== search && searchFromSession !== null) {
          console.log("Search word from session does not match current search, updating session.");
          return;
        }
        EventPublisher.publish(EventDef.onStudentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }

  getStudentsEnrollment(search = '') {
    Logger.debug('getStudents');
    axios
      .get(this.#url + "/students", { params: { name: search } })
      .then(response => {
        const searchFromSession = SessionManager.getSearchWord('Enrollment');
        if(searchFromSession !== search && searchFromSession !== null) {
          console.log("Search word from session does not match current search, updating session.");
          return;
        }
        EventPublisher.publish(EventDef.onStudentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }

  getStudentsClassroomManager(search = '') {
    console.log('getStudents', search);
    axios
      .get(this.#url + "/students", { params: { name: search } })
      .then(response => {
        const searchFromSession = SessionManager.getSearchWord('ClassroomManager');
        if(searchFromSession !== search && searchFromSession !== null) {
          console.log("Search word from session does not match current search, updating session:", searchFromSession, 'seaarch', search);
          return;
        }
        EventPublisher.publish(EventDef.onStudentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }

  async getStudentsSync(search = '') {
    Logger.debug('getStudentsSync', search);
    try {
      const response = await axios.get(this.#url + "/students", { params: { name: search } });
      Logger.debug("getStudentsSync Students:", response.data);
      return response.data;
    } catch (error) {
      Logger.error("Error fetching students:", error);
    }
  }

  async addNewStudentSync(studentData, search = '') {
    Logger.debug('Adding new student:', studentData);
    try {
      const response = await axios.post(this.#url + "/students", studentData);
      Logger.debug("Student added successfully:", response.data);
      this.getStudents(search);
    } catch (error) {
      Logger.error("Error adding student:", error);
    }
  }

  updateStudent(studentId, studentData, search = '') {
    Logger.debug('Updating student:', studentId, studentData);
    axios
      .put(`${this.#url}/students/${studentId}`, studentData)
      .then(response => {
        this.getStudents(search);
      })
      .catch(error => Logger.error("Error updating student:", error));
  }

  async deleteStudentsSync(studentIds, search = '') {
    Logger.debug('Deleting students:', studentIds);

    for (const id of studentIds) {
      try {
        const response = await axios.delete(`${this.#url}/students/${id}`);
        Logger.debug(`Student with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting student with ID ${id}:`, error);
      }
    }
    this.getStudents(search); // Refresh the student list
  }

}

