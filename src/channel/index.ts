import { Client } from '../client';
import {
  createRoomRequest,
  getRoomListRequest,
  getGroupMemberListRequest,
  inviteGroupMemberRequest,
} from '../api';
import { getParams } from '../utils';
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

  setActiveChannel(channel: ActiveChannelType) {
    this.activeChannel = channel;
    this._client.emit('channel.activeChange', { type: 'channel.activeChange' });
  }

  async queryChannels(option: PageParams) {
    const params = await getParams(this._keys);
    const {
      data: { result = [] },
    } = await getRoomListRequest({ ...params, ...option });
    if (this.channelList && option.page !== 1) {
      this.channelList = [...this.channelList, ...result];
    } else {
      this.channelList = result;
    }
    if (this.channelList) {
      this.setActiveChannel(this.channelList[0]);
    }
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async createRoom() {
    const params = await getParams(this._keys);
    const { data = { groupid: '' } } = await createRoomRequest(params);
    if (!this.channelList) {
      return;
    }
    this.channelList = [{ topic: data.groupid, topic_type: 'group' }, ...this.channelList];
    this._client.emit('channel.getList', { type: 'channel.getList' });
  }

  async getGroupMemberList(option: PageParams) {
    const params = await getParams(this._keys);
    const groupid = this.activeChannel?.topic || '';
    const data = await getGroupMemberListRequest({ ...params, groupid, ...option });
    return data;
  }

  async inviteGroupMember(members: string[]) {
    const params = await getParams(this._keys);
    const groupid = this.activeChannel?.topic || '';
    const data = await inviteGroupMemberRequest({ ...params, groupid, members });
    return data;
  }
}
