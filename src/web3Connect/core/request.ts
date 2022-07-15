import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

import { HostURL } from './config';
import { ServiceResponse } from '../../types';

const baseURL = 'http://' + HostURL + ':23333';

const request: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  timeout: 10000,
  // withCredentials: true,
});

request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return new Promise((resolve) => {
      const newConfig = { ...config };
      resolve(newConfig);
    });
  },
  (error: any) => {
    throw new Error(error);
  },
);

request.interceptors.response.use(
  (response: AxiosResponse<ServiceResponse>) => {
    const { data } = response;
    if (data.code !== 200) {
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
