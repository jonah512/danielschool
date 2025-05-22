// Copyright (c) 2025 Milal Daniel Korean School.
class OsObj {
  static #instance = null;
  constructor() {
    if (OsObj.#instance) {
      throw new Error('OsObj cannot be created! Try to use Os');
    }
    OsObj.#instance = this;
  }
  isMobileBrowser() {
    const userAgent = navigator.userAgent;
    const mobileKeywords = [
      'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'
    ];

    return mobileKeywords.some(keyword => userAgent.includes(keyword));
  }
  isIOS() {
    const userAgent = navigator.userAgent;
    const mobileKeywords = [
      'iPhone', 'iPad', 'iPod'
    ];
    return mobileKeywords.some(keyword => userAgent.includes(keyword));
  }
}

let Os = new OsObj();
export default Os;