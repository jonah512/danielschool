// Copyright (c) 2025 Milal Daniel Korean School.
import axios from "axios";
import Logger from "../framework/logger/Logger";

import EventPublisher from '../framework/event/EventPublisher';
import { EventDef } from '../framework/event/EventDef';

export default class ScheduleCtrl {
  #url = "http://localhost"
  constructor(url) {
    this.#url = url;
  }

  getSchedules() {
    Logger.debug('fetchSchedules');
    axios
      .get(this.#url + "/schedules" )
      .then(response => {
        EventPublisher.publish(EventDef.onScheduleListChange, response.data);
      })
      .catch(error => Logger.error("Error fetching schedules:", error));
  }

  updateSchedule(scheduleId, scheduleData) {
    Logger.debug('Updating schedule:', scheduleId, scheduleData);
    axios
      .put(`${this.#url}/schedules/${scheduleId}`, scheduleData)
      .then(response => {
        this.getSchedules();
      })
      .catch(error => Logger.error("Error updating schedule:", error));
  }

  addNewSchedule(scheduleData) {
    Logger.debug('Adding new schedule:', scheduleData);
    axios
      .post(this.#url + "/schedules", scheduleData)
      .then(response => {
        this.getSchedules();
      })
      .catch(error => Logger.error("Error adding schedule:", error));
  }

  async deleteSchedules(scheduleIds) {
    Logger.debug('Deleting schedules:', scheduleIds);

    for (const id of scheduleIds) {
      try {
        const response = await axios.delete(`${this.#url}/schedules/${id}`);
        Logger.debug(`Schedule with ID ${id} deleted successfully:`);
      } catch (error) {
        Logger.error(`Error deleting schedule with ID ${id}:`, error);
      }
    }
    this.getSchedules(); // Refresh the schedule list
  }

}

