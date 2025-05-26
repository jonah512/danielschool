// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';


class RegisterCtrlObj {
  parent_email = '';
  students = [];
  selected_student = null;
  
  constructor() {
    this.parent_email = localStorage.getItem('parent_email');
  }

  findEmail(email, onSuccess, onError) {
    Logger.info('findEmail', email);
    axios
      .get(window.APIURL + "/students", { params: { name: email } })
      .then(response => {
        Logger.info("Fetched Students:", response.data);
        if (response.data && response.data.length > 0) {
          onSuccess(response.data);
          this.parent_email = email;
          localStorage.setItem('parent_email', email);
        } else {
          onError("No students found with the given name.");
        }
      })
      .catch(error => {
        Logger.error("Error fetching students:", error);
        onError("Error fetching students: " + error.message);
      }
      );
  }

  
  getStudentWithId(id) {
    Logger.info('getStudent');
    axios
      .get(window.APIURL + "/students/" + id)
      .then(response => {
        Logger.info("Fetched Students:", response.data);
        this.selected_student = response.data;
        EventPublisher.publish(EventDef.onSelectedStudentChanged, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }
  
  updateStudent(studentId, studentData, search = '') {
    Logger.info('Updating student:', studentId, studentData);
    axios
      .put(`${window.APIURL}/students/${studentId}`, studentData)
      .then(response => {
        this.getStudentWithId(studentId);
      })
      .catch(error => Logger.error("Error updating student:", error));
  }


}

let RegisterCtrl = new RegisterCtrlObj();
export default RegisterCtrl;