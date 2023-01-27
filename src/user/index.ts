import { sha3_224 } from 'js-sha3';
import { Client } from '../client';
import {
  ClientKeyPaires,
  FollowOperationParams,
  PageParams,
  PublishNotificationToFollowersParams,
  SearchUsersResponse,
  ServiceResponse,
  UserBindDidParams,
  UserBindDidIdsResponse,
  UserPermissionsType,
  UpdateMyProfileResponse,
  UpdateUserPermissionsParams,
} from '../types';
import {
  searchUsersRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
  getUserBindDidsRequest,
  userBindDidRequest,
  followOperationRequest,
  getFollowerListRequest,
  getFollowingListRequest,
  publishNotificationToFollowersRequest,
  getUserPermissionsRequest,
  updateUserPermissionsRequest,
  getTargetUserPermissionsRequest,
} from '../api';
import { getDataSignature, transformAddress, newDateFormat } from '../utils';

export class User {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  userInfo: SearchUsersResponse | null;
  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.userInfo = null;
  }

  async searchUsers(walletAddress: string): Promise<SearchUsersResponse> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + walletAddress + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await searchUsersRequest({
      web3mq_signature,
      userid,
      timestamp,
      keyword: walletAddress,
    });

    this.userInfo = data;
    return data;
  }

  async getMyProfile(): Promise<SearchUsersResponse> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const { data } = await getMyProfileRequest({ web3mq_signature, userid, timestamp });
    return data;
  }

  async updateMyProfile(nickname: string, avatar_url: string): Promise<UpdateMyProfileResponse> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const data = await updateMyProfileRequest({
      web3mq_signature,
      userid,
      timestamp,
      nickname,
      avatar_url,
    });
    return data;
  }

  async getUserBindDids(): Promise<UserBindDidIdsResponse> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getUserBindDidsRequest({ web3mq_signature, userid, timestamp });
    return data;
  }

  async userBindDid(
    params: Omit<UserBindDidParams, 'userid' | 'web3mq_signature' | 'timestamp'>,
  ): Promise<ServiceResponse> {
    const { did_type, did_value } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + did_type + did_value + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const data = await userBindDidRequest({ web3mq_signature, userid, timestamp, ...params });
    return data as any;
  }

  async followOperation(
    params: Pick<FollowOperationParams, 'address' | 'target_userid' | 'action' | 'did_type'>,
  ): Promise<any> {
    const { address, target_userid, action, did_type } = params;
    const { userid, PublicKey } = this._keys;
    const did_pubkey = did_type === 'starknet' ? PublicKey : undefined;
    const timestamp = Date.now();
    let nonce = sha3_224(userid + action + target_userid + timestamp);
    const sign_content = `
    Web3MQ wants you to sign in with your ${did_type} account:
    ${address}
    
    For follow signature
    
    Nonce: ${nonce}
    Issued At: ${newDateFormat(timestamp, 'Y/m/d h:i')}`;
    const { sign: did_signature } = await Client.register.sign(sign_content, address, did_type);
    const data = await followOperationRequest({
      did_pubkey,
      did_signature,
      sign_content,
      userid,
      timestamp, 
      ...params,
    });
    return data;
  }

  async getFollowerList(params: PageParams): Promise<any> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getFollowerListRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...params,
    });
    return data;
  }

  async getFollowingList(params: PageParams): Promise<any> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getFollowingListRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...params,
    });
    return data;
  }

  async publishNotificationToFollowers(
    params: Pick<PublishNotificationToFollowersParams, 'title' | 'content'>,
  ): Promise<any> {
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
    return data;
  }

  async getUserPermissions(): Promise<UserPermissionsType> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getUserPermissionsRequest({
      web3mq_user_signature,
      userid,
      timestamp,
    });
    return data;
  }

  async getTargetUserPermissions(userId: string) {
    const target_userid = await transformAddress(userId);
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + target_userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const data = await getTargetUserPermissionsRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      target_userid
    });
    return data;
  }

  async updateUserPermissions(params: Pick<UpdateUserPermissionsParams, 'permissions'>) {
    const { permissions } = params;
    const permissionsStr = JSON.stringify(permissions);
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + permissionsStr + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const data = await updateUserPermissionsRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      ...params,
    });
    return data;
  }
}
