import { Client } from '../client';
import { ClientKeyPaires, SearchUsersResponse, UpdateMyProfileResponse } from '../types';
import { searchUsersRequest, getMyProfileRequest, updateMyProfileRequest } from '../api';
import { getParams } from '../utils';

export class User {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
  }

  async searchUsers(walletAddress: string): Promise<SearchUsersResponse> {
    const params = await getParams(this._keys);
    const data = await searchUsersRequest({ ...params, keyword: walletAddress });
    return data;
  }

  async getMyProfile(): Promise<SearchUsersResponse> {
    const params = await getParams(this._keys);
    const data = await getMyProfileRequest(params);
    return data;
  }

  async updateMyProfile(nickname: string, avatar_url: string): Promise<UpdateMyProfileResponse> {
    const params = await getParams(this._keys);
    const data = await updateMyProfileRequest({ ...params, nickname, avatar_url });
    return data;
  }
}
