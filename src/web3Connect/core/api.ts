import request from './request';
import { ServiceResponse } from '../../types';

export async function savePublicKey(params: any): Promise<ServiceResponse> {
  return request.post('/api/pubkey/', params);
}
