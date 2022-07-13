import { LOCALSTORAGE_KEY_MAP } from './constants';
import request from './request';
import {
  LoginParams,
  LoginRandomSecret,
  LoginRandomSecretParams,
  LoginResponse,
  RegisterParams,
} from '../../types';

export const register = (params: RegisterParams): Promise<any> => {
  return request.post('/register', params);
};

export const login = async (params: LoginParams): Promise<LoginResponse> => {
  const { data } = await request.post<LoginResponse>('/login', params);
  localStorage.setItem(LOCALSTORAGE_KEY_MAP.ACCESS_TOKEN, data.access_token);
  return data;
};

export const getLoginRandomSecret = (params: LoginRandomSecretParams): Promise<any> => {
  return request.post<LoginRandomSecret>('/login_random_secret', params);
};
