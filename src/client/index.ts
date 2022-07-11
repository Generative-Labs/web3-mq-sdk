import type { PacketCallback } from 'mqtt';
import request from '../core/request';
import event from '../core/eventEmitter';
import { getUserAvatar, login, setToken } from '../core/utils';
import MQTT from '../core/mqtt';

import { LoginParams, PageParams, EventTypes, GetRoomsParams, UserInfo } from '../types';

import { Message } from '../message';
import { Channel } from '../channel';
import { User } from '../user';
import { Contact } from '../contact';
import Livep2p from '../libp2p';

export class Web3MQ {
  private static _instance: Web3MQ | null;
  token?: string;
  mqtt: any | undefined;
  listeners: event;
  channel: Channel;
  messages: Message;
  user: User;
  contact: Contact;
  livep2p: any | undefined;

  constructor(props: LoginParams | string) {
    if (typeof props === 'object') {
      login(props).then(({ access_token }) => {
        this.token = access_token;
        this.mqtt = new MQTT(access_token);
      });
    }
    if (typeof props === 'string') {
      this.token = props;
      setToken(props);
      this.mqtt = new MQTT(props);
    }
    this.listeners = new event();
    this.channel = new Channel(this);
    this.messages = new Message(this);
    this.user = new User(this);
    this.contact = new Contact(this);
    this.subscribe();
    this.livep2p = new Livep2p();
  }

  public static getInstance = (props: LoginParams | string) => {
    if (!Web3MQ._instance) {
      Web3MQ._instance = new Web3MQ(props);
    }
    return Web3MQ._instance as Web3MQ;
  };

  /**
   * Subscribe per room
   * @param {GetRoomsParams}
   */
  async subscribe(params?: GetRoomsParams) {
    const { data } = await this.getMyRooms(params);
    data.forEach((channelItem) => this.mqtt.subscribe(channelItem));
  }

  /**
   * 查询所有联系人
   * @param {PageParams}
   */
  async queryContacts(options?: PageParams) {
    return this.contact.queryContacts(options);
  }

  /**
   * 搜索所有联系人
   * @param userName
   */

  async queryUsers(userName: string) {
    const { data: users } = await this.user.searchUsersByName({
      keyword: userName,
    });
    return users.map((user: UserInfo) => {
      return {
        ...user,
        ...getUserAvatar(user),
        userId: user.user_id,
      };
    });
  }

  send = (messageData: any, callback?: PacketCallback) => {
    if (!this.mqtt) {
      throw new Error('Websocket is not initialized');
    }
    if (!this.token) {
      throw new Error('The Token is required!');
    }
    return this.mqtt.send(messageData, callback);
  };

  // eslint-disable-next-line no-unused-vars
  receive = (fn: (message: any) => void) => {
    if (!this.mqtt) {
      throw new Error('Websocket is not initialized');
    }
    this.mqtt.receive = fn;
  };

  on = (eventName: EventTypes, callback: any) => this.listeners.on(eventName, callback);
  emit = (eventName: EventTypes, data: { type: EventTypes; data?: any }) =>
    this.listeners.emit(eventName, data);
  off = (eventName: EventTypes, callback?: any) => this.listeners.off(eventName, callback);
  once = (eventName: EventTypes, callback: any) => this.listeners.once(eventName, callback);

  getMyRooms = (params?: GetRoomsParams): Promise<{ data: string[] }> => {
    return request.get('/my_rooms', params as any);
  };
}
