import { sha3_224 } from 'js-sha3';
import { Client } from '../client';
import { 
  ActionType,
  ClientKeyPaires,
  ContactListItemType,
  FollowOperationParams,
  PageParams, 
  PublishNotificationToFollowersParams,
  ServiceResponse
} from '../types';
import { getDataSignature, newDateFormat, transformAddress } from '../utils';
import {
  followOperationRequest,
  getFollowAndContactListRequest,
  getFollowerListRequest,
  getFollowingListRequest,
  getMyFriendListRequset,
  getRreceiveFriendListRequests,
  operationFriendRequest,
  publishNotificationToFollowersRequest,
  searchContactRequest,
  sendFriendRequest,
} from '../api';

export class Contact {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  contactList: ContactListItemType[] | null;
  followerList: ContactListItemType[] | null;
  followingList: ContactListItemType[] | null;
  myFriendRequestList: ContactListItemType[] | null;
  receiveFriendRequestList: ContactListItemType[] | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.contactList = null;
    this.followerList = null;
    this.followingList = null;
    this.myFriendRequestList = null;
    this.receiveFriendRequestList = null;
  }

  /**
   * @deprecated
   */
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
  
  async getFollowerAndFollowingList(option: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getFollowAndContactListRequest({
      userid,
      web3mq_user_signature,
      timestamp,
      ...option,
    });
    return data.user_list;
  }

  async getContactList(option: PageParams): Promise<ContactListItemType[]> {
    const { emit } = this._client;

    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getFollowAndContactListRequest({
      userid,
      web3mq_user_signature,
      timestamp,
      follow_status: 'follow_each',
      ...option,
    });
    if (this.contactList && option.page !== 1) {
      this.contactList = [...this.contactList, ...data.user_list];
    } else {
      this.contactList = data.user_list;
    }
    if (this._client.listeners.events['contact.getContactList']) {
      emit('contact.getContactList', { type: 'contact.getContactList' });
    }
    return data.user_list;
  }

  async getFollowerList(option: PageParams): Promise<ContactListItemType[]> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getFollowerListRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...option,
    });
    if (this.followerList && option.page !== 1) {
      this.followerList = [...this.followerList, ...data.user_list];
    } else {
      this.followerList = data.user_list;
    };
    if (this._client.listeners.events['contact.getFollowerList']) {
      this._client.emit('contact.getFollowerList', { type: 'contact.getFollowerList' });
    };
    return data.user_list;
  }

  async getFollowingList(option: PageParams): Promise<ContactListItemType[]> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getFollowingListRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...option,
    });
    if (this.followingList && option.page !== 1) {
      this.followingList = [...this.followingList, ...data.user_list];
    } else {
      this.followingList = data.user_list;
    };
    if (this._client.listeners.events['contact.getFollowingList']) {
      this._client.emit('contact.getFollowingList', { type: 'contact.getFollowingList' });
    };
    return data.user_list;
  }

  async sendFriend(target_id: string, content: string = ''): Promise<ServiceResponse> {
    const { userid, PrivateKey } = this._keys;
    const target_userid = await transformAddress(target_id);
    const timestamp = Date.now();
    const signContent = userid + target_userid + content + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await sendFriendRequest({
      content,
      web3mq_signature,
      userid,
      timestamp,
      target_userid,
    });
    return data as any;
  }

  async followOperation(params: FollowOperationParams): Promise<ServiceResponse> {
    const { address, targetUserid, action, didType } = params;
    const { userid, PublicKey } = this._keys;
    const did_pubkey = didType === 'starknet' ? PublicKey : undefined;
    const timestamp = Date.now();
    let nonce = sha3_224(userid + action + targetUserid + timestamp);
    const sign_content = `Web3MQ wants you to sign in with your ${didType} account:
${address}

For follow signature

Nonce: ${nonce}
Issued At: ${newDateFormat(timestamp, 'Y/m/d h:i')}`;
    const { sign: did_signature } = await Client.register.sign(sign_content, address, didType);
    const data = await followOperationRequest({
      did_pubkey,
      did_signature,
      sign_content,
      userid,
      timestamp, 
      address,
      action,
      did_type: didType,
      target_userid: targetUserid
    });
    if (this._client.listeners.events['contact.updateList']) {
      this._client.emit('contact.updateList', { type: 'contact.updateList' });
    };
    return data as any;
  }

  async publishNotificationToFollowers(
    params: PublishNotificationToFollowersParams
  ): Promise<ServiceResponse> {
    const { title } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + title + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const data = await publishNotificationToFollowersRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...params,
    });
    return data as any;
  }
  /**
  * @deprecated
  */
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
  /**
  * @deprecated
  */
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
  /**
  * @deprecated
  */
  async operationFriend(target_userid: string, action: ActionType = 'agree') {
    const { userid, PrivateKey } = this._keys;
    const { emit } = this._client;
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

    emit('contact.getList', { type: 'contact.getList' });
    return data;
  }
}
