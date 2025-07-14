// Copyright (c) 2025 Milal Daniel Korean School.
import Logger from "../logger/Logger";
import EventPublisher from "../event/EventPublisher";
import { EventDef } from '../event/EventDef';
import Guid from "../random/Guid";
import English from "../../language/English";
import Korean from "../../language/Korean";

class ResourceObj {
  static #instance = null;
  constructor() {
    if (ResourceObj.#instance) {
      throw new Error('ResourceObj cannot be created! Try to use Resource');
    }
    ResourceObj.#instance = this;
    this.#load();
  }

  language = 'Korean';
  #resource = null;
  #languages = ['Korean', 'Enlish'];
  languageObjects = {};


  #load() {
    if(this.language === 'Korean') this.#resource = Korean;
    else this.#resource = English;
  }

  getLanguages() {
      return this.#languages;
  }

  setTestingMode(mode) {

  }

  setLanguage(lang) {
    this.language = lang;
    this.#load();
    EventPublisher.publish(EventDef.onLanguageChange, this.language);
  }

  get(key, ...args) {
    if (!this.#resource) {
      Logger.debug('resource is not loaded yet.');
      return '';
    }

    const keys = key.split('.');
    let node = this.#resource;
    if (node === undefined || node === null) {
      return '';
    }
    keys.forEach(k => {
      try {
        node = node[k];
        if (node === undefined || node === null) {
          Logger.error('cannot find key=' + key);
          return '';
        }
      }
      catch (error) {
        Logger.error(error);
        return '';
      }
    });

    let str = node || '';
    args.forEach((arg, index) => {
      str = str.replace(new RegExp(`\\{${index}\\}`, 'g'), arg);
    });
    return str;
  }  
}

let Resource = new ResourceObj();
export default Resource;