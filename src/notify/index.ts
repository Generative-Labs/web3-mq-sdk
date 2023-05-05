import { Client } from '../client';
import { ClientKeyPaires, MessageStatus, NotifyResponse, QueryNotificationsParams } from '../types';
import { changeNotificationStatusRequest, queryNotificationsRequest } from '../api';
import { getDataSignature } from '../utils';
import { Web3MQMessageListResponse } from '../pb';

export class Notify {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  notificationList: NotifyResponse[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    client.connect.receiveNotify = this.receiveNotify;
    this.notificationList = null;
  }

  async changeNotificationStatus(messages: string[], status: MessageStatus = 'delivered') {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + status + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await changeNotificationStatusRequest({
      web3mq_signature,
      userid,
      timestamp,
      messages,
      status,
    });
    return data;
  }

  receiveNotify = (pbType: number, bytes: Uint8Array) => {
    const { data } = Web3MQMessageListResponse.fromBinary(bytes);
    const list = data.map((item) => JSON.parse(new TextDecoder().decode(item.payload)));
    if (!this.notificationList) {
      this.notificationList = list;
    } else {
      this.notificationList = [...list, ...this.notificationList];
    }
    if (this._client.listeners.events['notification.getList']) {
      this._client.emit('notification.getList', { type: 'notification.getList' });
    }
  };

  async queryNotifications(option: QueryNotificationsParams) {
    const { userid, PrivateKey } = this._keys;
    const { topic = '', notice_type = '' } = option;
    const timestamp = Date.now();
    const msg = userid + topic + notice_type + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, msg);
    const {
      data: { result = [] },
    } = await queryNotificationsRequest({ userid, timestamp, web3mq_signature, ...option });
    const list = result.map((item: any) => {
      return item.payload;
    });
    if (this.notificationList && option.page !== 1) {
      this.notificationList = [...list, ...this.notificationList];
    } else {
      this.notificationList = list;
    }
    if (this._client.listeners.events['notification.getList']) {
      this._client.emit('notification.getList', { type: 'notification.getList' });
    }
    // return data;
  }
}
