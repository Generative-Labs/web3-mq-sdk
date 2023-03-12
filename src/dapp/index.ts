import { Client } from '../client';
import {ClientKeyPaires, CreateDappListResponse, CreateDappParams, ServiceResponse} from '../types';
import { createDappRequest, getMyCreateDappListRequest, updateDappRequest } from '../api';
import { getDataSignature } from '../utils';

export class Dapp {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
  }

  async getMyCreateDappList(): Promise<CreateDappListResponse> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await getMyCreateDappListRequest({
      creator_id: userid,
      timestamp,
      web3mq_user_signature,
    });
    return data;
  }

  async createDapp(params: CreateDappParams): Promise<ServiceResponse> {
    const { dapp_id, dapp_type, dapp_name, dapp_pubkey, domain = '' } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + dapp_id + dapp_type + dapp_name + dapp_pubkey + domain + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await createDappRequest({
      ...params,
      creator_id: userid,
      timestamp,
      web3mq_user_signature,
    });
    return data;
  }

  async updateDapp(params: CreateDappParams): Promise<ServiceResponse> {
    const { userid, PrivateKey } = this._keys;
    const { dapp_id, dapp_type, dapp_name, dapp_pubkey, domain = '' } = params;
    const timestamp = Date.now();
    const signContent = userid + dapp_id + dapp_type + dapp_name + dapp_pubkey + domain + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await updateDappRequest({
      ...params,
      creator_id: userid,
      timestamp,
      web3mq_user_signature,
    });
    return data;
  }
}
