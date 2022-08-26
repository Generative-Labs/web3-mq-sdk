import { Client } from '../client';
import { ActionType, ClientKeyPaires, PageParams, ContactListItemType } from '../types';
import { getDataSignature } from '../utils';
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
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + walletAddress + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await searchContactRequest({
      web3mq_signature,
      userid,
      timestamp,
      keyword: walletAddress,
    });
    return data;
  }

  async getContactList(option: PageParams) {
    const { emit } = this._client;

    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getContactListRequest({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.contactList = data.result;
    emit('contact.getList', { type: 'contact.getList' });
  }

  async sendFriend(target_userid: string) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + target_userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await sendFriendRequest({ web3mq_signature, userid, timestamp, target_userid });
    return data;
  }

  async getMyFriendRequestList(option: PageParams) {
    const { emit } = this._client;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getMyFriendListRequset({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.myFriendRequestList = data.result;
    emit('contact.friendList', { type: 'contact.friendList' });
    // return data;
  }

  async getReceiveFriendRequestList(option: PageParams) {
    const { emit } = this._client;

    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getRreceiveFriendListRequests({
      web3mq_signature,
      userid,
      timestamp,
      ...option,
    });
    this.receiveFriendRequestList = data.result;
    emit('contact.reviceList', { type: 'contact.reviceList' });
    // return data;
  }

  async operationFriend(target_userid: string, action: ActionType = 'agree') {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + action + target_userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await operationFriendRequest({
      web3mq_signature,
      userid,
      timestamp,
      target_userid,
      action,
    });
    return data;
  }
}
