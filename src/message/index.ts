import { Client } from '../client';
import {
  ClientKeyPaires,
  PageParams,
  MessageStatus,
  DidType,
  MessageItemType,
  SendMsgLoadingMap,
} from '../types';
import {
  getDataSignature,
  transformAddress,
  saveMessageUpdateDate,
  updateMessageLoadStatus,
  newRenderMessagesList,
  renderReceiveMessage,
  getDateTimes,
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
  tempTopicId: string;
  messageList: MessageItemType[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.msg_text = '';
    this.tempTopicId = '';
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
      const data = newRenderMessagesList(result);
      const list = data.reverse() ?? [];
      if (this.messageList && option.page !== 1) {
        this.messageList = [...this.messageList, ...list];
      } else {
        this.messageList = list;
      }
      this._client.emit('message.getList', { type: 'message.getList' });
      return list;
    }
  }

  /**
   * if message from group chat: topic = group id
   * if message from one chat: topic = userid
   */
  async changeMessageStatus(
    messages: string[],
    status: MessageStatus = 'delivered',
    chatId: string,
  ) {
    const topic = chatId || this._client.channel.activeChannel?.chatid;
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
    const topicId = userId
      ? await transformAddress(userId, didType)
      : channel.activeChannel?.chatid;

    if (topicId) {
      this.tempTopicId = topicId;
      this.msg_text = msg;
      const { concatArray, msgid } = await sendMessageCommand(keys, topicId, msg, connect.nodeId);
      const timestamp = BigInt(Math.round(Date.now() / 1000));
      let date = new Date(Number(timestamp));
      let timeStr = date.getHours() + ':' + date.getMinutes();
      let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

      const tempMessageData: MessageItemType = {
        senderId: keys.userid,
        topic: topicId,
        chatId: topicId,
        content: msg,
        contentType: 'text',
        messageId: msgid,
        date: dateStr,
        time: timeStr,
        timestamp: Number(timestamp),
        msgLoading: SendMsgLoadingMap['loading'],
      };
      if (this.messageList) {
        this.messageList = [...this.messageList, { ...tempMessageData }];
      }

      this._client.emit('message.send', { type: 'message.send' });

      connect.send(concatArray);
    }
  }

  receive = async (pbType: number, bytes: Uint8Array) => {
    const { keys } = this._client;
    if (pbType === PbTypeMessage) {
      const resp: Web3MQRequestMessage = Web3MQRequestMessage.fromBinary(bytes);
      if (resp.messageType === 'dapp_bridge') {
        return;
      }
      saveMessageUpdateDate();
      const msg = renderReceiveMessage(resp);
      // if current channel is active, update msg list
      if (msg.topic === this._client.channel.activeChannel?.chatid) {
        if (this.messageList) {
          this.messageList = [...this.messageList, msg];
        }
        this._client.emit('message.getList', { type: 'message.getList', data: this.messageList });
      }
      this._client.emit('message.received', { type: 'message.received', data: msg });

      // unread
      await this._client.channel.handleUnread(msg);
    }
    if (pbType === PbTypeMessageStatusResp) {
      // send message success callback
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      saveMessageUpdateDate();
      if (this.messageList) {
        const msgList = updateMessageLoadStatus(this.messageList, resp);
        this.messageList = [...msgList];
        const msg = this.messageList.find((item) => item.messageId === resp.messageId);
        if (msg) {
          this._client.channel.handleUnread(msg);
        }
      } else {
        if (this.tempTopicId && this.msg_text) {
          const { dateStr, timeStr, timestamp } = getDateTimes(Number(resp.timestamp));
          const msg: MessageItemType = {
            senderId: keys.userid,
            topic: this.tempTopicId,
            chatId: this.tempTopicId,
            content: this.msg_text,
            contentType: 'text',
            messageId: resp.messageId,
            date: dateStr,
            time: timeStr,
            timestamp,
            msgLoading: SendMsgLoadingMap['success'],
          };
          this._client.channel.handleUnread(msg);
        }
      }
      this._client.emit('message.delivered', { type: 'message.delivered', data: resp });
    }
    if (pbType === PbTypeMessageChangeStatus) {
      const resp = Web3MQChangeMessageStatus.fromBinary(bytes);
      console.log('changeMsgStatus:', resp);
    }
  };
}
