// Copyright (c) 2025 Milal Daniel Korean School.
import { Client } from '@stomp/stompjs';
import EventPublisher from '../event/EventPublisher';
import Logger from '../logger/Logger';
class RmqListenerObj {
  static #instance = null;
  static #checkTimer = null;
  constructor() { // singleton
    if (RmqListenerObj.#instance) {
      throw new Error('RmqListener cannot be created! Try to use RmqListener');
    }
    RmqListenerObj.#instance = this;
    if (RmqListenerObj.#checkTimer == null) {
      RmqListenerObj.#checkTimer = setInterval(this.checkConnections, 3000);
    }
  }

  destructor() {

  }

  #id = '';
  #ip = '';
  #vhost = '';
  #port = 0;
  #password = '';
  #clients = new Map();
  #connections = new Map();

  setConnectionInfo(id, password, vhost, ip, port) {
    this.#id = id;
    this.#ip = ip;
    this.#password = password;
    this.#vhost = vhost;
    this.#port = port;
    Logger.debug('setConnectionInfo : ' + ip);
  }
  
  subscribe(exchangeName)
  {
    this.#subscribeWithIp(exchangeName, this.#ip); 
  }

  checkConnections() {
    try {
      const self = RmqListenerObj.#instance;
      Logger.debug('[checkConnections] start', self.#connections);
      self.#connections.forEach((value, key) => {
        if (value.connection === false) {
          Logger.debug('[checkConnections] find not connected session', self.#clients.get(key));
          let client = self.#createClient(value.exchangeName, key, value.ip);
          self.#clients.set(key, client);
          Logger.debug('[checkConnections] try to subscribe again', self.#clients);
          client.activate();
        }
        else {
          Logger.debug('[checkConnections] connection is good', self.#clients.get(key));
        }
      });
    }
    catch (err) {
      Logger.error('[checkConnections] ', err);
    }
  }
  
  #subscribeWithIp(exchangeName, ip) {
    const key = exchangeName + '@' + ip;
    if (this.#clients.has(key)) { // there should be one client for each exchange
      Logger.debug(key + ' is already subscribed.');
      if (this.#connections.get(key).connection === false) {
        Logger.debug(key + " was disconnected!!");
      }
      else {
        return;// already exist and connected
      }
    }

    this.#connections.set(key, {connection:false, exchangeName:exchangeName, ip:ip});
    let client = this.#createClient(exchangeName, key, ip);
    this.#clients.set(key, client);

    Logger.debug('subscribe', this.#clients);
    client.activate();
  }

  #createClient(exchangeName, key, ip) {
    let client = new Client({
      brokerURL: 'ws://' + ip + ':' + this.#port + '/ws',
      connectHeaders: {
        login: this.#id,
        passcode: this.#password,
        host: this.#vhost
      },
      onConnect: () => {
        Logger.debug('Connected:' + exchangeName + '@' + ip);
        // Subscribe to the dynamically created queue
        client.subscribe(`/exchange/${exchangeName}`, (message) => {
          Logger.debug(`/exchange/${exchangeName}`, message);
          EventPublisher.publish(exchangeName, message.body);
        });
        this.#connections.set(key, {connection:true, exchangeName:exchangeName, ip:ip});
      },

      onStompError: (frame) => {
        Logger.error(`Broker reported error: ${frame.headers['message']}`);
        Logger.error(`Additional details: ${frame.body}`);
        if (this.#clients.has(key)) {         
          let conn = this.#connections.get(key);
          conn.connection = false;
          this.#connections.set(key, conn);
        }
      },
      onWebSocketClose: () => {
        Logger.error('WebSocket connection closed');
        if (this.#clients.has(key)) {
          let conn = this.#connections.get(key);
          conn.connection = false;
          this.#connections.set(key, conn);
        }
      },
    });
    return client;
  }

  cleanUp() {
	// TODO: implement this.
  }

  unSubscribe(exchangeName) {
    Logger.debug('unSubscribe: ', exchangeName);
    const key = exchangeName + '@' + this.#ip;
    let client = this.#clients.get(key);
    if (client != null) {
      client.deactivate();
      this.#clients.delete(key);
      this.#connections.delete(key);
    }
  }
}

let RmqListener = new RmqListenerObj();
export default RmqListener;