import { Client } from '../client';
import { ClientKeyPaires, PageParams, MessageStatus, MessageListItem } from '../types';
import { sendMessageCommand, getDataSignature, renderMessagesList } from '../utils';
import { getMessageListRequest, changeMessageStatusRequest } from '../api';
import { PbTypeMessage, PbTypeMessageStatusResp, PbTypeMessageChangeStatus } from '../core/pbType';
import {
  Web3MQRequestMessage,
  Web3MQChangeMessageStatus,
  Web3MQMessageStatusResp,
} from '../pb/message';

export class Message {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  msg_text: string;
  messageList: MessageListItem[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.msg_text = '';
    client.connect.receive = this.receive;
    this.messageList = null;
  }

  async getMessageList(option: PageParams, userId?: string) {
    const topic = userId || this._client.channel.activeChannel?.chatid;
    if (topic) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const msg = userid + topic + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, msg);
      const {
        data: { result = [] },
      } = await getMessageListRequest({ userid, timestamp, web3mq_signature, topic, ...option });
      const data = await renderMessagesList(result);
      const list = data.reverse() ?? [];
      if (this.messageList && option.page !== 1) {
        this.messageList = [...this.messageList, ...list];
      } else {
        this.messageList = list;
      }
      this._client.emit('message.getList', { type: 'message.getList' });
      // return data;
    }
  }

  /**
   * if message from group chat: topic = group id
   * if message from one chat: topic = userid
   */
  async changeMessageStatus(messages: string[], status: MessageStatus = 'delivered') {
    const topic = this._client.channel.activeChannel?.chatid;
    if (topic) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + status + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await changeMessageStatusRequest({
        topic,
        web3mq_signature,
        timestamp,
        userid,
        messages,
        status,
      });
      return data;
    }
  }

  async sendMessage(msg: string, userId?: string) {
    const { keys, connect, channel } = this._client;
    const topicId = userId || channel.activeChannel?.chatid;
    if (topicId) {
      this.msg_text = msg;
      const concatArray = await sendMessageCommand(keys, topicId, msg, connect.nodeId);
      connect.send(concatArray);
    }
  }
  receive = (pbType: number, bytes: Uint8Array) => {
    if (pbType === PbTypeMessage) {
      const resp = Web3MQRequestMessage.fromBinary(bytes);
      console.log('msg:', resp);
      const list: any = [resp].map((item) => {
        const idx = this.messageList?.length || 0;

        let date = new Date(Number(item.timestamp));

        let timestampStr = date.getHours() + ':' + date.getMinutes();

        let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        let message = {
          _id: idx + 1,
          id: idx + 1,
          indexId: idx + 1,
          content: new TextDecoder().decode(item.payload),
          senderId: item.comeFrom,
          username: '',
          avatar: 'assets/imgs/doe.png',
          // date: "13 November",
          // timestamp: "10:20",
          date: dateStr,
          timestamp: timestampStr,
          system: false,
          saved: false,
          distributed: true,
          seen: true,
          failure: false,
        };
        return message;
      });
      if (this.messageList) {
        this.messageList = [...this.messageList, ...list];
      }
      this._client.emit('message.getList', { type: 'message.getList', data: resp });
    }
    if (pbType === PbTypeMessageStatusResp) {
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      console.log('msgStatus:', resp);
      this._client.emit('message.delivered', { type: 'message.delivered', data: resp });
    }
    if (pbType === PbTypeMessageChangeStatus) {
      const resp = Web3MQChangeMessageStatus.fromBinary(bytes);
      console.log('changeMsgStatus:', resp);
    }
  };
}
