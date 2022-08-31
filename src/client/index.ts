import { Register } from '../register';
import { Channel } from '../channel';
import { Connect } from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl } from '../utils';
import { KeyPairsType, ClientKeyPaires, EventTypes, initOptions } from '../types';
export class Client {
  private static _instance: Client | null;
  static wsUrl: string;
  keys: ClientKeyPaires;
  channel: Channel;
  listeners: event;
  connect: Connect;
  message: Message;
  user: User;
  contact: Contact;
  notify: Notify;

  constructor(keys: KeyPairsType) {
    this.keys = { ...keys, userid: `user:${keys.PublicKey}` };
    this.listeners = new event();
    this.channel = new Channel(this);
    this.connect = new Connect(this);
    this.message = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
    this.notify = new Notify(this);
  }

  public static init = (initOptions: initOptions = {}) => {
    const { connectUrl, app_key } = initOptions;
    Client.wsUrl = selectUrl('ws', connectUrl);
    new Request(selectUrl('http', connectUrl));
    return new Register(app_key);
  };

  public static getInstance = (keys: KeyPairsType) => {
    if (!keys) {
      throw new Error('The PrivateKey and PublicKey is required!');
    }
    if (!Client._instance) {
      Client._instance = new Client(keys);
    }
    return Client._instance as Client;
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);
}
