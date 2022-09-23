import { Client } from '../client';
import {
  createRoomRequest,
  getRoomListRequest,
  getGroupMemberListRequest,
  inviteGroupMemberRequest,
} from '../api';
import { getDataSignature } from '../utils';
import { PageParams, ActiveChannelType, ClientKeyPaires, CreateRoomParams } from '../types';

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

  async createRoom(params: Pick<CreateRoomParams, 'group_name' | 'avatar_url' | 'avatar_base64'>) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data = { groupid: '', group_name: '', avatar_base64: '', avatar_url: '' } } =
      await createRoomRequest({
        web3mq_signature,
        userid,
        timestamp,
        ...params,
      });
    if (!this.channelList) {
      return;
    }
    this.channelList = [
      {
        chatid: data.groupid,
        chat_type: 'group',
        chat_name: data.group_name,
        avatar_base64: data.avatar_base64,
        avatar_url: data.avatar_url,
      },
      ...this.channelList,
    ];
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  // async updateRoom(topic: string, topic_type: string) {
  //   const { userid, PrivateKey } = this._keys;
  //   const timestamp = Date.now();
  //   const signContent = userid + timestamp;
  //   const web3mq_signature = await getDataSignature(PrivateKey, signContent);

  //   const data = await updateRoomListRequest({
  //     userid,
  //     timestamp,
  //     web3mq_signature,
  //     topic,
  //     topic_type,
  //   });
  //   return data;
  // }

  async getGroupMemberList(option: PageParams) {
    const groupid = this.activeChannel?.chatid;
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
    const groupid = this.activeChannel?.chatid;
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
