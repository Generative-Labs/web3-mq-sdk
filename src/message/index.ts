import { Client } from '../client';
import {
  ClientKeyPaires,
  PageParams,
  MessageStatus,
  MessageListItem,
  Web3MQDBValue,
} from '../types';
import {
  sendMessageCommand,
  getDataSignature,
  renderMessagesList,
  renderMessage,
  transformAddress,
} from '../utils';
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

  private async handleUnread(resp: Web3MQRequestMessage, msg: any) {
    const { channel, storage, emit } = this._client;
    if (resp.comeFrom === channel.activeChannel?.chatid) {
      if (this.messageList) {
        this.messageList = [...this.messageList, msg];
      }
      this._client.emit('message.getList', { type: 'message.getList', data: resp });
      return;
    }
    const data = await storage.getData(resp.comeFrom);
    const msglist = !data ? [msg] : [...data.payload.messageList, msg];

    const indexeddbData: Web3MQDBValue = {
      messageId: resp.messageId,
      from: resp.comeFrom,
      contentTopic: resp.contentTopic,
      timestamp: Number(resp.timestamp),
      unread: !data ? 1 : data.unread + 1,
      payload: {
        messageList: msglist,
      },
    };

    await storage.setData(resp.comeFrom, indexeddbData);
    if (channel.channelList) {
      channel.channelList = channel.channelList?.map((channel) => {
        if (channel.chatid === resp.comeFrom) {
          channel.unread = indexeddbData.unread;
        }
        return channel;
      });
    }
    emit('channel.updated', { type: 'channel.updated' });
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
    const topicId = userId ? await transformAddress(userId) : channel.activeChannel?.chatid;

    if (topicId) {
      this.msg_text = msg;
      const concatArray = await sendMessageCommand(keys, topicId, msg, connect.nodeId);
      connect.send(concatArray);
    }
  }
  receive = async (pbType: number, bytes: Uint8Array) => {
    if (pbType === PbTypeMessage) {
      const resp = Web3MQRequestMessage.fromBinary(bytes);
      console.log('msg:', resp);
      if (resp.messageType === 'dapp_bridge') {
        return;
      }
      const msg = renderMessage(pbType, resp, this._client);

      // unread
      await this.handleUnread(resp, msg);
    }
    if (pbType === PbTypeMessageStatusResp) {
      const resp = Web3MQMessageStatusResp.fromBinary(bytes);
      console.log('msgStatus:', resp);
      const msg = renderMessage(pbType, resp, this._client);
      if (this.messageList) {
        this.messageList = [...this.messageList, { ...msg }];
      }
      this._client.emit('message.delivered', { type: 'message.delivered', data: resp });
    }
    if (pbType === PbTypeMessageChangeStatus) {
      const resp = Web3MQChangeMessageStatus.fromBinary(bytes);
      console.log('changeMsgStatus:', resp);
    }
  };
}
