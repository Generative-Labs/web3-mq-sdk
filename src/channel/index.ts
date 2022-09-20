import { Client } from '../client';
import {
  createRoomRequest,
  getRoomListRequest,
  getGroupMemberListRequest,
  inviteGroupMemberRequest,
} from '../api';
import { getDataSignature } from '../utils';
import { PageParams, ActiveChannelType, ClientKeyPaires } from '../types';

export class Channel {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  channelList: ActiveChannelType[] | null;
  activeChannel: ActiveChannelType | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.channelList = null;
    this.activeChannel = null;
  }

  setActiveChannel(channel: ActiveChannelType | null) {
    this.activeChannel = channel;
    this._client.emit('channel.activeChange', { type: 'channel.activeChange' });
  }

  async queryChannels(option: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const {
      data: { result = [] },
    } = await getRoomListRequest({ web3mq_signature, userid, timestamp, ...option });
    if (this.channelList && option.page !== 1) {
      this.channelList = [...this.channelList, ...result];
    } else {
      this.channelList = result;
    }

    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async createRoom(group_name?: string, avatar_url?: string) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data = { groupid: '' } } = await createRoomRequest({
      web3mq_signature,
      userid,
      timestamp,
      group_name,
      avatar_url,
    });
    if (!this.channelList) {
      return;
    }
    this.channelList = [{ topic: data.groupid, topic_type: 'group' }, ...this.channelList];
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async getGroupMemberList(option: PageParams) {
    const groupid = this.activeChannel?.topic;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await getGroupMemberListRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        ...option,
      });
      return data;
    }
  }

  async inviteGroupMember(members: string[]) {
    const groupid = this.activeChannel?.topic;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await inviteGroupMemberRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        members,
      });
      return data;
    }
  }
}
