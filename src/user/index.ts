import { Client } from '../client';
import { ClientKeyPaires, SearchUsersResponse, UpdateMyProfileResponse } from '../types';
import { searchUsersRequest, getMyProfileRequest, updateMyProfileRequest } from '../api';
import { getDataSignature } from '../utils';

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
}
