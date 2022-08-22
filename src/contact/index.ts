import { Client } from '../client';
import { ActionType, ClientKeyPaires, PageParams, ContactListItemType } from '../types';
import { getParams } from '../utils';
import {
  searchContactRequest,
  getContactListRequest,
  sendFriendRequest,
  getMyFriendListRequset,
  getRreceiveFriendListRequests,
  operationFriendRequest,
} from '../api';

export class Contact {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  contactList: ContactListItemType[] | null;
  myFriendRequestList: ContactListItemType[] | null;
  receiveFriendRequestList: ContactListItemType[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.contactList = null;
    this.myFriendRequestList = null;
    this.receiveFriendRequestList = null;
  }

  async searchContact(walletAddress: string) {
    const params = await getParams(this._keys);
    const data = await searchContactRequest({ ...params, keyword: walletAddress });
    return data;
  }

  async getContactList(option: PageParams) {
    const { emit } = this._client;
    const params = await getParams(this._keys);
    const { data } = await getContactListRequest({ ...params, ...option });
    this.contactList = data.result;
    emit('contact.getList', { type: 'contact.getList' });
  }

  async sendFriend(target_userid: string) {
    const params = await getParams(this._keys);
    const data = await sendFriendRequest({ ...params, target_userid });
    return data;
  }

  async getMyFriendRequestList(option: PageParams) {
    const { emit } = this._client;
    const params = await getParams(this._keys);
    const { data } = await getMyFriendListRequset({ ...params, ...option });
    this.myFriendRequestList = data.result;
    emit('contact.friendList', { type: 'contact.friendList' });
    // return data;
  }

  async getReceiveFriendRequestList(option: PageParams) {
    const { emit } = this._client;
    const params = await getParams(this._keys);
    const { data } = await getRreceiveFriendListRequests({ ...params, ...option });
    this.receiveFriendRequestList = data.result;
    emit('contact.reviceList', { type: 'contact.reviceList' });
    // return data;
  }

  async operationFriend(target_userid: string, action: ActionType = 'agree') {
    const params = await getParams(this._keys);
    const data = await operationFriendRequest({ ...params, target_userid, action });
    return data;
  }
}
