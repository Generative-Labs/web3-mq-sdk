import { Register } from '../register';
import { Channel } from '../channel';
import { Connect, SignConnect } from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Topic } from '../topic';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl, getFastestUrl } from '../utils';
import {
  KeyPairsType,
  ClientKeyPaires,
  EventTypes,
  initOptions,
  SignClientOptions,
} from '../types';
export class Client {
  private static _instance: Client | null;
  static wsUrl: string;
  static register: Register;
  keys: ClientKeyPaires;
  channel: Channel;
  listeners: event;
  connect: Connect;
  message: Message;
  user: User;
  contact: Contact;
  notify: Notify;
  topic: Topic;

  constructor(keys: KeyPairsType) {
    this.keys = keys;
    this.listeners = new event();
    this.channel = new Channel(this);
    this.connect = new Connect(this);
    this.message = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
    this.notify = new Notify(this);
    this.topic = new Topic(this);
  }

  public static init = async (
    initOptions: initOptions = {
      connectUrl: null,
    },
  ) => {
    const { connectUrl, app_key, env } = initOptions;
    const fastUrl = connectUrl || (await getFastestUrl(env));
    Client.wsUrl = selectUrl('ws', fastUrl);
    new Request(selectUrl('http', fastUrl));
    Client.register = new Register(app_key);
    return fastUrl;
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

  public static getSignClient = async (options: SignClientOptions): Promise<SignConnect> => {
    if (!options) {
      throw new Error('The options is required!');
    }
    const { connectUrl = null, env } = options;
    const fastUrl = connectUrl || (await getFastestUrl(env));
    return new SignConnect({ wsUrl: selectUrl('ws', fastUrl), ...options });
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);
}
