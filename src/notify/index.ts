import { Client } from '../client';
import { ClientKeyPaires, MessageStatus, NotifyResponse } from '../types';
import { changeNotificationStatusRequest } from '../api';
import { getDataSignature } from '../utils';

export class Notify {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  notificationList: NotifyResponse | null;
  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
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

  receiveNotify(notificationList: NotifyResponse) {
    console.log('notify class -------', notificationList);
    this.notificationList = notificationList;
    this._client.emit('notification.getList', { type: 'notification.getList' });
  }
}
