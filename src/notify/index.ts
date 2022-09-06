import { Client } from '../client';
import {
  ClientKeyPaires,
  MessageStatus,
  NotifyResponse,
  PageParams,
  TopicListType,
  SubscribeListType,
} from '../types';
import {
  changeNotificationStatusRequest,
  createTopicRequest,
  subscribeTopicRequest,
  publishTopicMessageRequest,
  myCreateTopicListRequest,
  mySubscribeTopicListRequest,
} from '../api';
import { getDataSignature } from '../utils';
import { Web3MQMessageListResponse } from '../pb';

export class Notify {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  notificationList: NotifyResponse[] | null;
  myTopicList: TopicListType[] | null;
  mySubscribeList: SubscribeListType[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    client.connect.receiveNotify = this.receiveNotify;
    this.notificationList = null;
    this.myTopicList = null;
    this.mySubscribeList = null;
  }

  async getMyCreateTopicList(options: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await myCreateTopicListRequest({
      web3mq_signature,
      userid,
      timestamp,
      ...options,
    });
    this.myTopicList = data;
    this._client.emit('notification.getMyTopicList', { type: 'notification.getMyTopicList' });
    console.log(data, 123);
    return data;
  }

  async getMySubscribeTopicList(options: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await mySubscribeTopicListRequest({
      web3mq_signature,
      userid,
      timestamp,
      ...options,
    });
    this.mySubscribeList = data;
    this._client.emit('notification.getMySubscribeList', {
      type: 'notification.getMySubscribeList',
    });
    console.log(data, 34535);
    return data;
  }

  async createTopic(topic_name: string) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await createTopicRequest({ web3mq_signature, userid, timestamp, topic_name });
    return data;
  }

  async subscribeTopic(topicid: string) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + topicid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const data = await subscribeTopicRequest({ web3mq_signature, userid, timestamp, topicid });
    return data;
  }

  async publishTopicMessage(params: { topicid: string; title: string; content: string }) {
    const { title, content, topicid } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + topicid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const data = await publishTopicMessageRequest({
      web3mq_signature,
      userid,
      timestamp,
      title,
      content,
      topicid,
    });
    console.log(data);
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
    this.notificationList = list;
    this._client.emit('notification.getList', { type: 'notification.getList' });
  };
}
