// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';
import SchedulesCtrl from '../control/SchedulesCtrl'; // Import SchedulesCtrl

class RegisterCtrlObj {
  parent_email = '';
  students = [];
  selected_student = null;
  request = null;
  classes = [];
  enrollments = [];
  teachers = [];
  consents = [];
  year = 0;
  term = '';
  sessionCheckInterval = null;
  waitingPosition = 0;
  selectedClassPeriod1 = null;
  selectedClassPeriod2 = null;
  selectedClassPeriod3 = null;
  scheduleCheckInterval = null;
  latestSchedule = null;
  currentDateTime = new Date();
  openingDate = new Date();
  closingDate = new Date();
  timeGap = 0;
  constructor() {
    this.parent_email = localStorage.getItem('parent_email');   
  }

  findEmail(email, onSuccess, onError) {
    Logger.debug('findEmail', email);
    axios
      .get(window.APIURL + "/students", { params: { name: email } })
      .then(response => {
        Logger.debug("Fetched Students:", response.data);
        if (response.data && response.data.length > 0) {
          onSuccess(response.data);
          this.parent_email = email;
          localStorage.setItem('parent_email', email);
          this.startSession(email);

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

  searchEmail(student_name, onSuccess) {
    Logger.debug('searchEmail', student_name);
    axios
    .get(window.APIURL + "/students", { params: { name: student_name } })
    .then(response => {
      Logger.debug("Fetched Students:", response.data);
      if (response.data && response.data.length > 0) {
        onSuccess(response.data);
      } else {
        Logger.debug("No students found with the given name.");
      }
    })
    .catch(error => {
      Logger.error("Error fetching students:", error);      
    }
    );
  }

  startSession(email) {
    // call /session/StartSession API
    Logger.debug('Starting session', email);
    axios
      .post(window.APIURL + "/StartSession?email=" + email) // Fix: Pass email as a query parameter
      .then(response => {
        Logger.debug("Session started successfully:", response.data);
        localStorage.setItem('session_key', response.data.session_key);

        if (this.waitingPosition != response.data.position) {
          EventPublisher.publish(EventDef.onWaitingPosition, response.data.position);
          this.waitingPosition = response.data.position;
        }
        // start timer to check session status every 5 seconds
        this.sessionCheckInterval = setInterval(() => {
          Logger.debug("Checking session status...", localStorage.getItem('parent_email'), localStorage.getItem('session_key'));
          if (localStorage.getItem('parent_email') == null || !localStorage.getItem('session_key') == null) {
            EventPublisher.publish(EventDef.onMenuChanged, 'Login');
            clearInterval(this.sessionCheckInterval);
            return;
          }
          axios.post(window.APIURL + "/CheckSession?email=" + localStorage.getItem('parent_email') + "&session_key=" + localStorage.getItem('session_key'))
            .then(response => {
              Logger.debug("Session status checked:", response.data, this.waitingPosition);
              if (this.waitingPosition != response.data.position) {
                EventPublisher.publish(EventDef.onWaitingPosition, response.data.position);
                this.waitingPosition = response.data.position;
              }
            })
            .catch(error => {
              localStorage.setItem('session_key', '');
              Logger.error("Error checking session status:", error);
              // exit timeInterval
              EventPublisher.publish(EventDef.onMenuChanged, 'Login');
              clearInterval(this.sessionCheckInterval);
            });
        }, 5 * 1000); // 5 seconds
      })
      .catch(error => {
        Logger.error("Error starting session:", error);
      });
  }

  cleanUpSession() {
    Logger.debug('Cleaning up session');
    // call /session/EndSession API
    if (localStorage.getItem('parent_email') != null && localStorage.getItem('session_key') != null) {
      axios.post(window.APIURL + "/EndSession?email=" + localStorage.getItem('parent_email') + "&session_key=" + localStorage.getItem('session_key'))
        .then(response => {
          Logger.debug("[cleanUpSession] Session ended successfully:", response.data);
        })
        .catch(error => {
          console.error("[cleanUpSession] Error ending session:", error);
        });

    }

    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    localStorage.removeItem('parent_email');
    localStorage.removeItem('session_key');
    this.parent_email = null;
    this.selected_student = null;
    this.selectedClassPeriod1 = null;
    this.selectedClassPeriod2 = null;
    this.selectedClassPeriod3 = null;

    Logger.debug('[cleanUpSession] Session cleaned up');
  }

  getStudentWithId(id) {
    Logger.debug('getStudent');
    axios
      .get(window.APIURL + "/students/" + id)
      .then(response => {
        Logger.debug("Fetched Students:", response.data);
        this.selected_student = response.data;
        EventPublisher.publish(EventDef.onSelectedStudentChanged, response.data);
      })
      .catch(error => Logger.error("Error fetching students:", error));
  }

  updateStudent(studentId, studentData, search = '') {
    Logger.debug('Updating student:', studentId, studentData);
    axios
      .put(`${window.APIURL}/students/${studentId}`, studentData)
      .then(response => {
        this.getStudentWithId(studentId);
      })
      .catch(error => Logger.error("Error updating student:", error));
  }

  startScheduleCheck() {
    Logger.debug('Starting schedule check...');
    const schedule_control = new SchedulesCtrl(window.APIURL);
    this.scheduleCheckInterval = setInterval(() => {
      schedule_control.getSchedules();
    }, 10 * 1000); // 10 seconds
  }

  stopScheduleCheck() {
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval);
      this.scheduleCheckInterval = null;
      Logger.debug('Schedule check stopped.');
    }
  }

}

let RegisterCtrl = new RegisterCtrlObj();
export default RegisterCtrl;