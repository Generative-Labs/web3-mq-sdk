import { Client } from '../client';
import {ClientKeyPaires, PageParams, MessageStatus, MessageListItem, DidType} from '../types';
import {
  getDataSignature,
  renderMessagesList,
  renderMessage,
  transformAddress,
  saveMessageUpdateDate,
  getGroupId,
  updateMessageLoadStatus,
} from '../utils';
import { getMessageListRequest, changeMessageStatusRequest } from '../api';
import { PbTypeMessage, PbTypeMessageStatusResp, PbTypeMessageChangeStatus } from '../core/pbType';
import {
  Web3MQRequestMessage,
  Web3MQChangeMessageStatus,
  Web3MQMessageStatusResp,
} from '../pb/message';
import { sendMessageCommand } from '../connect/wsCommand';

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

  async getMessageList(option: PageParams, chatId?: string) {
    const topic = chatId || this._client.channel.activeChannel?.chatid;
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
      if (this._client.listeners.events['message.getList']) {
        this._client.emit('message.getList', { type: 'message.getList' });
      }
      return list;
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

  async sendMessage(msg: string, userId?: string, didType?: DidType) {
    const { keys, connect, channel } = this._client;
    const topicId = userId ? await transformAddress(userId, didType) : channel.activeChannel?.chatid;

    if (topicId) {
      this.msg_text = msg;
      const { concatArray, msgid } = await sendMessageCommand(keys, topicId, msg, connect.nodeId);

      const tempMessageData = {
        messageId: msgid,
        timestamp: BigInt(Math.round(Date.now() / 1000)),
      };

      const tempMessage = renderMessage(PbTypeMessageStatusResp, tempMessageData, this._client);
      if (this.messageList) {
        this.messageList = [...this.messageList, { ...tempMessage }];
      }

      if (this._client.listeners.events['message.send']) {
        this._client.emit('message.send', { type: 'message.send' });
      }

      connect.send(concatArray);
    }
  }

  receive = async (pbType: number, bytes: Uint8Array) => {
    if (pbType === PbTypeMessage) {
      const resp = Web3MQRequestMessage.fromBinary(bytes);
      if (resp.messageType === 'dapp_bridge') {
        return;
      }
      saveMessageUpdateDate();
      const msg = renderMessage(pbType, resp, this._client);

      // if current channel is active, update msg list
      if (getGroupId(resp, this._client) === this._client.channel.activeChannel?.chatid) {
        if (this.messageList) {
          this.messageList = [...this.messageList, msg];
        }
        if (this._client.listeners.events['message.getList']) {
          this._client.emit('message.getList', { type: 'message.getList', data: resp });
        }
      }

      // unread
      await this._client.channel.handleUnread(resp, msg);
    }
    if (pbType === PbTypeMessageStatusResp) {
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      saveMessageUpdateDate();
      const msg = renderMessage(pbType, resp, this._client);
      this._client.channel.handleUnread(resp, msg);
      if (this.messageList) {
        const msgList = updateMessageLoadStatus(this.messageList, msg);
        this.messageList = [...msgList];
      }
      if (this._client.listeners.events['message.delivered']) {
        this._client.emit('message.delivered', { type: 'message.delivered', data: resp });
      }
    }
    if (pbType === PbTypeMessageChangeStatus) {
      const resp = Web3MQChangeMessageStatus.fromBinary(bytes);
      console.log('changeMsgStatus:', resp);
    }
  };
}
