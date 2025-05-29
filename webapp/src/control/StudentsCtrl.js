// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class StudentCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getStudents(search = '') {
    console.log('getStudents');
    axios
      .get(this.#url + "/students", { params: { name: search } })
      .then(response => {
        console.log("Fetched Students:", response.data);
        EventPublisher.publish(EventDef.onStudentListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }

  async getStudentsSync(search = '') {
    console.log('getStudentsSync', search);
    try {
      const response = await axios.get(this.#url + "/students", { params: { name: search } });
      console.log("getStudentsSync Students:", response.data);
      return response.data;
    } catch (error) {
      Logger.error("Error fetching students:", error);
    }
  }

  async addNewStudentSync(studentData, search = '') {
    console.log('Adding new student:', studentData);
    try {
      const response = await axios.post(this.#url + "/students", studentData);
      console.log("Student added successfully:", response.data);
      this.getStudents(search);
    } catch (error) {
      Logger.error("Error adding student:", error);
    }
  }

  updateStudent(studentId, studentData, search = '') {
    console.log('Updating student:', studentId, studentData);
    axios
      .put(`${this.#url}/students/${studentId}`, studentData)
      .then(response => {
        this.getStudents(search);
      })
      .catch(error => Logger.error("Error updating student:", error));
  }

  async deleteStudentsSync(studentIds, search = '') {
    console.log('Deleting students:', studentIds);

    for (const id of studentIds) {
      try {
        const response = await axios.delete(`${this.#url}/students/${id}`);
        console.log(`Student with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting student with ID ${id}:`, error);
      }
    }
    this.getStudents(search); // Refresh the student list
  }

}

