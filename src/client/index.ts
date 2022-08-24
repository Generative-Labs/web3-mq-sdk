import { Channel } from '../channel';
import { Connect } from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl } from '../utils';
import { KeyPairsType, ClientKeyPaires, EventTypes } from '../types';
export class Client {
  private static _instance: Client | null;
  keys: ClientKeyPaires;
  wsUrl: string;
  channel: Channel;
  listeners: event;
  connect: Connect;
  message: Message;
  user: User;
  contact: Contact;
  notify: Notify;

  constructor(keys: KeyPairsType, baseUrl?: string) {
    this.keys = { ...keys, userid: `user:${keys.PublicKey}` };
    this.wsUrl = selectUrl('ws', baseUrl);
    this.listeners = new event();
    this.channel = new Channel(this);
    this.connect = new Connect(this);
    this.message = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
    this.notify = new Notify(this);
    new Request(selectUrl('http', baseUrl));
  }

  public static getInstance = (keys: KeyPairsType, baseUrl?: string) => {
    if (!keys) {
      throw new Error('The PrivateKey and PublicKey is required!');
    }
    if (!Client._instance) {
      Client._instance = new Client(keys, baseUrl);
    }
    return Client._instance as Client;
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);
}
