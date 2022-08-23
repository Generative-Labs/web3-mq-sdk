import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

import { selectUrl } from '../utils';
import { ServiceResponse } from '../types';

const request: AxiosInstance = axios.create({
  baseURL: selectUrl(),
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  timeout: 10000,
  // withCredentials: true,
});

request.interceptors.request.use(
  (config: AxiosRequestConfig) => config,
  (error: any) => {
    throw new Error(error);
  },
);

request.interceptors.response.use(
  (response: AxiosResponse<ServiceResponse>) => {
    const { data } = response;
    if (data.code !== 0) {
      throw new Error(data.msg);
    }
    return data;
  },
  (error: any) => {
    const { status, data } = error.response;
    if (status !== 200) {
      throw new Error(data.message);
    }
  },
);

export default request;
