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
    const { channel } = this._client;
    const { data } = Web3MQMessageListResponse.fromBinary(bytes);
    const list = data.map((item) => {
      const payload = JSON.parse(new TextDecoder().decode(item.payload));
      if (
        payload &&
        payload.type === 'system.group.agree_join_request' &&
        payload?.metadata?.groupid
      ) {
        channel.updateChannels({
          chatid: payload.metadata.groupid,
          chatType: 'group',
          topic: payload.metadata.groupid,
          topicType: 'group',
        });
      }
      return {
        ...payload,
        messageId: item.messageId,
        read: item.read,
      };
    });
    if (!this.notificationList) {
      this.notificationList = list;
    } else {
      this.notificationList = [...list, ...this.notificationList];
    }
    this._client.emit('notification.received', { type: 'notification.received', data: list });
    this._client.emit('notification.getList', { type: 'notification.getList', data: list });
    if (list.length > 0) {
      list.forEach((item) => {
        if (item.type === 'system.group_invitation') {
          this._client.emit('channel.invited', { type: 'channel.invited' });
        }
      });
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
      return {
        ...item.payload,
        messageId: item.messageid,
        read: item.read,
      };
    });
    if (this.notificationList && option.page !== 1) {
      this.notificationList = [...list, ...this.notificationList];
    } else {
      this.notificationList = list;
    }
    this._client.emit('notification.getList', { type: 'notification.getList' });
    return list;
  }
}
