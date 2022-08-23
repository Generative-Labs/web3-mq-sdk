import { Client } from '../client';
import {
  ClientKeyPaires,
  PageParams,
  MessageStatus,
  MessageListItem,
  NotifyResponse,
} from '../types';
import { sendMessageCommand, getParams, renderMessagesList } from '../utils';
import { getMessageListRequest, changeMessageStatusRequest } from '../api';
import { PbTypeNotificationListResp, PbTypeMessageStatusResp } from '../core/pbType';
import { Web3MQMessageListResponse, Web3MQMessageStatusResp } from '../pb/message';

export class Message {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  messageList: MessageListItem[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    client.connect.receive = this.receive;
    this.messageList = null;
  }

  async getMessageList(option: PageParams) {
    const params = await getParams(this._keys);
    const topic = this._client.channel.activeChannel?.topic;
    if (topic) {
      const {
        data: { result = [] },
      } = await getMessageListRequest({ ...params, topic, ...option });
      const data = await renderMessagesList(result);
      this.messageList = data.reverse() ?? [];
      this._client.emit('message.getList', { type: 'message.getList' });
      // return data;
    }
  }

  /**
   * if message from group chat: topic = group id
   * if message from one chat: topic = userid
   */
  async changeMessageStatus(messages: string[], status: MessageStatus = 'delivered') {
    const params = await getParams(this._keys);
    const topic = this._client.channel.activeChannel?.topic || '';
    const data = await changeMessageStatusRequest({ topic, ...params, messages, status });
    return data;
  }

  async sendMessage(msg: string) {
    const { keys, connect, channel } = this._client;
    if (channel.activeChannel) {
      const { topic } = channel.activeChannel;
      const concatArray = await sendMessageCommand(keys, topic, msg);
      connect.send(concatArray);
    }
  }
  receive(pbType: number, bytes: Uint8Array) {
    // if (pbType === PbTypeMessage) {
    //   const resp = Web3MQRequestMessage.fromBinary(bytes);
    //   const content = new TextDecoder().decode(resp.payload);
    //   let message = {
    //     id: this.messageList.length + 1,
    //     sender_id: resp.from,
    //     content,
    //     timestamp: new Date(),
    //   };
    //   console.log(message);
    //   this.messageList.push(message);
    //   this._client.emit('message.new', { type: 'message.new', data: message });
    // }
    if (pbType === PbTypeNotificationListResp) {
      console.log('Receive notification');
      const notificationList = Web3MQMessageListResponse.fromBinary(bytes);
      console.log('Receive notification----------', notificationList);
      this._client.notify.receiveNotify(notificationList as unknown as NotifyResponse);
    }
    if (pbType === PbTypeMessageStatusResp) {
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      console.log('msgStatus:', resp);
      this._client.emit('message.new', { type: 'message.new' });
    }
  }
}
