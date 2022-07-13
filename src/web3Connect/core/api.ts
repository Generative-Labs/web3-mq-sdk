import request from './request';
import { ServiceResponse } from '../../types';

export async function savePublicKey(params: any): Promise<ServiceResponse> {
  //   return axios.post(url + '/api/pubkey/', params, {
  //     headers: { 'Content-Type': 'application/json' },
  //   });

  return request.get('/pubkey', params);
}

export async function createGroups(params: any): Promise<ServiceResponse> {
  return request.get('/pubkey', params);
}
