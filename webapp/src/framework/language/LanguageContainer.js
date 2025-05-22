// Copyright (c) 2025 Milal Daniel Korean School.
export default class LanguageContainer{
  resource = {}
  constructor(res){
    this.setResource(res);
  }
  getResource = () => {
    return this.resource;
  };
  setResource = (res) => {
    this.resource = res;
  }
};

