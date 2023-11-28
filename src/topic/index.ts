import { Client } from '../client';
import { ClientKeyPaires, PageParams, TopicListType, SubscribeListType } from '../types';
import {
  createTopicRequest,
  subscribeTopicRequest,
  publishTopicMessageRequest,
  myCreateTopicListRequest,
  mySubscribeTopicListRequest,
} from '../api';
import { getDataSignature } from '../utils';

export class Topic {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  myTopicList: TopicListType[] | null;
  mySubscribeList: SubscribeListType[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.myTopicList = null;
    this.mySubscribeList = null;
  }

  async getMyCreateTopicList(options: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data = [] } = await myCreateTopicListRequest({
      web3mq_signature,
      userid,
      timestamp,
      ...options,
    });
    if (this.myTopicList && options.page !== 1) {
      this.myTopicList = [...this.myTopicList, ...data];
    } else {
      this.myTopicList = data;
    }
    this._client.emit('notification.getMyTopicList', { type: 'notification.getMyTopicList' });
    
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
}
