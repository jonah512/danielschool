// Copyright (c) 2025 Milal Daniel Korean School.
import Logger from "../logger/Logger";
import EventPublisher from "../event/EventPublisher";
import { EventDef } from '../event/EventDef';
import LanguageContainer from "../language/LanguageContainer";
import Guid from "../random/Guid";


class ResourceObj {
  static #instance = null;
  constructor() {
    if (ResourceObj.#instance) {
      throw new Error('ResourceObj cannot be created! Try to use Resource');
    }
    ResourceObj.#instance = this;
    this.#load();
  }

  language = 'English';
  #resource = null;
  #languages = [];
  languageObjects = {};
  #testingMode = false;

  #load() {
    this.language = localStorage.getItem('selectedLanguage') || 'English';
    if (this.languageObjects[this.language]) {
      this.#resource = this.languageObjects[this.language].getResource();
      console.log('this.#resource:', this.#resource);
    }
  }

  getLanguages() {
    if (!this.#testingMode) {
      let ret = [];
      this.#languages.map((item, index) => (item !== 'fo-fo' ? ret.push(item) : Logger.debug('skip fo-fo')));
      return ret;
    }
    else {
      return this.#languages;
    }
  }

  setTestingMode(mode) {
    this.#testingMode = mode;
  }

  setLanguage(lang) {
    console.log('languageObjects:', this.languageObjects);
    if (this.languageObjects[lang] == null) {
      Logger.error('cannot find language:' + lang);
    }
    localStorage.setItem('selectedLanguage', lang);
    this.language = lang;
    this.#load();
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

  loadLanguageList = async () => {
    if (this.#languages.length > 0) {
      return;
    }
    try {
      const response = await fetch('/language/languages.json?index=' + Guid.generate16());
      if (!response.ok) {
        throw new Error('Failed to fetch resource');
      }
      const resourceData = await response.json();
      this.#languages = resourceData.languages.map(lang => lang.replace('.json', ''));
      await this.loadLanguageClasses();
    } catch (error) {
      Logger.error('Error fetching resource:', error);
    }
    console.log('this.#languages:', this.#languages, this.language);
  };

  loadLanguageClasses = async () => {
    this.#languages.forEach(async (lang) => {
      const response = await fetch('/language/' + lang + '.json?index=' + Guid.generate16());
      if (!response.ok) {
        Logger.error('Failed to fetch resource');
      }
      let resourceData = await response.json();
      this.#resource = new LanguageContainer(resourceData);
      this.languageObjects[lang] = this.#resource;
      this.#load();
      EventPublisher.publish(EventDef.onLanguageChange, this.language);
    });
  };
}

let Resource = new ResourceObj();
export default Resource;