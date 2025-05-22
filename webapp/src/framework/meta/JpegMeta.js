// Copyright (c) 2025 Milal Daniel Korean School.
import Logger from "../../framework/logger/Logger";

export default class JpegMeta {

  #handleBinaryFile(img, binFile, callback) {
    let data = this.#findAndExtractMetadataInJPEG(binFile);
    callback(data);
  };

  extractMetadata(img, callback) {
    let http = new XMLHttpRequest();
    http.onload = () => {
      if (http.status === 200) {
        this.#handleBinaryFile(img, http.response, callback);
      }
      http = null;
    };
    http.open("GET", img.src, true);
    http.responseType = "arraybuffer";
    http.send(null);
  }

  #findAndExtractMetadataInJPEG(file) {
    let dataView = new DataView(file);
    this.debug = true;
    Logger.debug("Got file of length " + file.byteLength);

    if ((dataView.getUint8(0) !== 0xFF) || (dataView.getUint8(1) !== 0xD8)) {
      Logger.error("Not a valid JPEG");
      return null;
    }

    const searchString = "<VIRTEK_METADATA>";
    const searchBytes = new TextEncoder().encode(searchString);
    const length = file.byteLength;
    let pos = length - searchBytes.length;

    searchLoop:
    while (pos >= 0) {
      for (let i = 0; i < searchBytes.length; i++) {
        if (dataView.getUint8(pos + i) !== searchBytes[i]) {
          pos--;
          continue searchLoop;
        }
      }

      Logger.debug("Found '<VIRTEK_METADATA>' at offset " + pos);

      // Calculate the start of data after the matched string
      let dataStart = pos + searchBytes.length;

      // Extract remaining data as a string
      let extractedData = "";
      for (let i = dataStart; i < length; i++) {
        extractedData += String.fromCharCode(dataView.getUint8(i));
      }

      // Try to parse as JSON
      try {
        let jsonData = JSON.parse(extractedData);
        return jsonData; // return JSON object if successful
      } catch (e) {
        Logger.error("Data is not valid JSON, returning as string.");
        return extractedData; // return as string if JSON parsing fails
      }
    }

    Logger.error("String 'VIRTEK-METADATA' not found");
    return null; // string not found or no data after the string
  }

}