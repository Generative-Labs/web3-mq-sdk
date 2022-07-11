import axios from 'axios';

import { SavePublicKeyParams } from './type';
import { HostURL } from '../../core/config';
import { ServiceResponse } from '../../types';

const url = 'http://' + HostURL + ':23333';

export async function savePublicKey(params: any): Promise<ServiceResponse> {
  return axios.post(url + '/api/pubkey/', params, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function createGroups(params: SavePublicKeyParams): Promise<ServiceResponse> {
  return axios.post(url + '/api/pubkey/', params, {
    headers: { 'Content-Type': 'application/json' },
  });
}
