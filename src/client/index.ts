import { Register } from '../register';
import { Channel } from '../channel';
import {Connect, SignConnect, DappConnect} from '../connect';
import { Message } from '../message';
import { User } from '../user';
import { Contact } from '../contact';
import { Notify } from '../notify';
import { Topic } from '../topic';
import { Storage } from '../storage';
import { Request } from '../core/request';

import event from '../core/eventEmitter';
import { selectUrl, getFastestUrl } from '../utils';
import {
  KeyPairsType,
  ClientKeyPaires,
  EventTypes,
  initOptions,
  SendTempConnectOptions,
  SignClientCallBackType,
  Web3MQBridgeOptions,
} from '../types';

export class Client {
  private static _instance: Client | null;
  static wsUrl: string;
  static register: Register;
  static signClient: SignConnect;
  static dappConnectClient: DappConnect;
  keys: ClientKeyPaires;
  channel: Channel;
  listeners: event;
  connect: Connect;
  message: Message;
  user: User;
  contact: Contact;
  notify: Notify;
  topic: Topic;
  storage: Storage;

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
    this.storage = new Storage(this);
  }

  public static init = async (
    initOptions: initOptions = {
      connectUrl: null,
    },
  ) => {
    const { connectUrl, app_key, env, tempPubkey, didKey } = initOptions;
    const fastUrl = connectUrl || (await getFastestUrl(env));
    Client.wsUrl = selectUrl(fastUrl, 'ws');
    new Request(selectUrl(fastUrl), tempPubkey, didKey);
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

  public static getSignClient = (
    options: SendTempConnectOptions,
    // eslint-disable-next-line no-unused-vars
    callback: (params: SignClientCallBackType) => void,
  ) => {
    if (!options) {
      throw new Error('The options is required!');
    }
    Client.signClient = new SignConnect({ wsUrl: Client.wsUrl, ...options }, callback);
  };

  public static initDappConnectClient = (
    options: Omit<Web3MQBridgeOptions, 'wsUrl'>,
    // eslint-disable-next-line no-unused-vars
    callback: (params: SignClientCallBackType) => void,
  ) => {
    if (!options) {
      throw new Error('The options is required!');
    }
    Client.dappConnectClient = new DappConnect({ wsUrl: Client.wsUrl, ...options }, callback);
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);
}
