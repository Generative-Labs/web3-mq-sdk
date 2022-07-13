import type { PacketCallback } from 'mqtt';
import event from '../../core/eventEmitter';
import Wsconn from '../wsconn';

import { LoginParams, EventTypes } from '../../types';

import { Message } from '../message';
import { Channel } from '../channel';
import { User } from '../user';
import { Contact } from '../contact';
import { Api } from '../api';

export class Web3MQ {
  private static _instance: Web3MQ | null;
  token?: string;
  wsconn: any | undefined;
  api: Api;
  listeners: event;
  channel: Channel;
  messages: Message;
  user: User;
  contact: Contact;
  livep2p: any | undefined;

  /**
   *
   * @param {LoginParams} props - Login params
   */

  // eslint-disable-next-line no-unused-vars
  constructor(props?: LoginParams) {
    this.wsconn = new Wsconn();
    this.api = new Api();
    this.listeners = new event();
    this.channel = new Channel(this);
    this.messages = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
  }

  public static getInstance = (props?: LoginParams) => {
    if (!Web3MQ._instance) {
      Web3MQ._instance = new Web3MQ(props);
    }
    return Web3MQ._instance as Web3MQ;
  };

  send = (messageData: any, callback?: PacketCallback) => {
    if (!this.wsconn) {
      throw new Error('Websocket is not initialized');
    }
    // if (!this.token) {
    //   throw new Error('The Token is required!');
    // }
    return this.wsconn.send(messageData, callback);
  };

  // eslint-disable-next-line no-unused-vars
  receive = (fn: (message: any) => void) => {
    if (!this.wsconn) {
      throw new Error('Websocket is not initialized');
    }
    this.wsconn.receive = fn;
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);
}
