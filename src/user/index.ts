import { Client } from '../client';
import {
  ClientKeyPaires,
  SearchUsersResponse,
  ServiceResponse,
  UserBindDidParams,
  UserBindDidIdsResponse,
  UserPermissionsType,
  UpdateMyProfileResponse,
  UpdateUserPermissionsParams, ProtocolType,
} from '../types';
import {
  searchUsersRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
  getUserBindDidsRequest,
  userBindDidRequest,
  getUserPermissionsRequest,
  updateUserPermissionsRequest,
  getTargetUserPermissionsRequest,
  getMyAuthInfoRequest, searchUsersByHandleRequest,
} from '../api';
import { ByteArrayToHexString, getDataSignature, sha256, transformAddress } from '../utils';

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

  async searchUsersByHandle(handle: string, protocol: ProtocolType) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const payload_hash = sha256(protocol + userid + handle + timestamp);
    const payloadSting = ByteArrayToHexString(payload_hash);
    const web3mq_user_signature = await getDataSignature(PrivateKey, payloadSting);

    const { data } = await searchUsersByHandleRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      target_userid: handle,
      protocol,
      payload_hash: payloadSting
    });
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

  async getUserBindDids(): Promise<UserBindDidIdsResponse[]> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getUserBindDidsRequest({ web3mq_signature, userid, timestamp });
    return data;
  }

  async userBindDid(params: UserBindDidParams): Promise<ServiceResponse> {
    const { didAction, didContent, didType, didValue, providerId } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + didType + didValue + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const data = await userBindDidRequest({
      web3mq_signature,
      userid,
      timestamp,
      did_action: didAction,
      did_content: didContent,
      did_type: didType,
      did_value: didValue,
      provider_id: providerId,
    });
    return data as any;
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
      target_userid,
    });
    return data;
  }

  async updateUserPermissions(params: UpdateUserPermissionsParams) {
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

  async getMyAuthInfo(dappId: string) {
    const { PrivateKey, userid } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + dappId + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    return await getMyAuthInfoRequest({
      userid,
      web3mq_user_signature,
      timestamp,
      dapp_id: dappId,
    });
  }
}
