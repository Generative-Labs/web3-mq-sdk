import request from '../core/request';
import {
  // DelMemberFromRoomParams,
  // GetMessageParams,
  // GetRoomInfoParams,
  AddMemberToRoomParams,
  PageParams,
  ChannelResponse,
  GetRoomInfoByTargetUserIdParams,
  RoomResponse,
  UserInfo,
  GetMessageParams,
  GetMessageByIdParams,
  ServiceResponse,
  GetThreadsParams,
} from '../../types';

import { PAGE_SIZE } from '../core/constants';

export class Api {
  getChatsByUserId = (params: PageParams): Promise<{ data: ChannelResponse[] }> => {
    return request.post('/my_chats', params);
  };

  getRoomInfoByRoomIdApi = (roomId: string): Promise<{ data: ChannelResponse }> => {
    return request.get(`/rooms/${roomId}`);
  };

  getRoomInfoByTargetUserIdApi = (params: GetRoomInfoByTargetUserIdParams): Promise<any> => {
    return request.post<string>('/rooms', params);
  };

  addMemberToRoom = (params: AddMemberToRoomParams): Promise<any> => {
    return request.post<RoomResponse>(`/rooms/${params.room_id}/members`, params);
  };

  getContacts = (params: PageParams): Promise<{ data: UserInfo[] }> => {
    return request.get(`/contacts/${params.page}/${params.size}`);
  };
  getMessages = (params: GetMessageParams): Promise<any> => {
    return request.post('/messages', { ...params, size: PAGE_SIZE });
  };

  getMessageById = (params: GetMessageByIdParams): Promise<ServiceResponse> => {
    return request.get(`/messages/${params.msg_id}`);
  };

  getMessageListByThread = (params: GetThreadsParams): Promise<any> => {
    const { room_id, page = 1, size = PAGE_SIZE, belong_to_thread_id } = params;
    return request.get(
      `/threads/${room_id}/${page}/${size}?belong_to_thread_id=${belong_to_thread_id}&page=${page}&size=${size}`,
    );
  };

  getAllThreadsList = (params: GetMessageParams): Promise<any> => {
    return request.get(`/threads/${params.room_id}/${params.page}/${params.size}`);
  };

  searchUsersByName = (params: { keyword: string }): Promise<any> => {
    return request.post('/search', params);
  };
}
