// Copyright (c) 2025 Milal Daniel Korean School.

class LoggerObj {
  static #instance = null;
  constructor() {
    if (LoggerObj.#instance) {
      throw new Error('UserRole cannot be created! Try to use LoggerObj');
    }
    LoggerObj.#instance = this;
  }
  
  setLogLevel(level) {
    window.LOGLEVEL= level;
  }
    
  debug(...args) {
    if (window.LOGLEVEL === 'DEBUG') {
      if (args.length > 1) {
        let message = this.#getCurrentDateTime() + JSON.stringify(args[0]);
        args.shift();
        Logger.debug(message, args);
      }
      else {
        Logger.debug(this.#getCurrentDateTime(), JSON.stringify(args));
      }
    }
  }

  info(...args) {
    if (args.length > 1) {
      let message = this.#getCurrentDateTime() + JSON.stringify(args[0]);
      args.shift();
      Logger.debug(message, args);
    }
    else {
      Logger.debug(this.#getCurrentDateTime(), JSON.stringify(args));
    }
  }

  error(...args) {
    if (args.length > 1) {
      let message = this.#getCurrentDateTime() + JSON.stringify(args[0]);
      args.shift();
      console.error(message, args);
    }
    else {
      console.error(this.#getCurrentDateTime(), JSON.stringify(args));
    }
  }

  #getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Ensures 3-digit milliseconds
  
    return `[${date} ${time}.${milliseconds}] `;
  }
}

let Logger = new LoggerObj();
export default Logger;
