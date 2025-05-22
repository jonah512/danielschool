// Copyright (c) 2025 Milal Daniel Korean School.

export default class Guid {
  static generate32() {
    // Generate a random hexadecimal number with 32 digits
    let hexDigits = '0123456789abcdef';
    let guid = '';
    for (let i = 0; i < 32; i++) {
      guid += hexDigits.charAt(Math.floor(Math.random() * 16));
    }

    // Insert hyphens at appropriate positions to form a GUID-like structure
    guid = guid.substr(0, 8) + '-' +
      guid.substr(8, 4) + '-' +
      guid.substr(12, 4) + '-' +
      guid.substr(16, 4) + '-' +
      guid.substr(20);

    return guid;
  }

  static generate16() {
    // Generate a random hexadecimal number with 32 digits
    let hexDigits = '0123456789abcdef';
    let guid = '';
    for (let i = 0; i < 8; i++) {
      guid += hexDigits.charAt(Math.floor(Math.random() * 16));
    }
    guid += '-';
    for (let i = 0; i < 7; i++) {
      guid += hexDigits.charAt(Math.floor(Math.random() * 16));
    }

    return guid;
  }
};
