// import request3 from '../core/request';
import request2 from '../../web2Connect/core/request';
import {
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
    return request2.post('/my_chats', params);
  };

  getRoomInfoByRoomIdApi = (roomId: string): Promise<{ data: ChannelResponse }> => {
    return request2.get(`/rooms/${roomId}`);
  };

  getRoomInfoByTargetUserIdApi = (params: GetRoomInfoByTargetUserIdParams): Promise<any> => {
    return request2.post<string>('/rooms', params);
  };

  addMemberToRoom = (params: AddMemberToRoomParams): Promise<any> => {
    return request2.post<RoomResponse>(`/rooms/${params.room_id}/members`, params);
  };

  getContacts = (params: PageParams): Promise<{ data: UserInfo[] }> => {
    return request2.get(`/contacts/${params.page}/${params.size}`);
  };
  getMessages = (params: GetMessageParams): Promise<any> => {
    return request2.post('/messages', { ...params, size: PAGE_SIZE });
  };

  getMessageById = (params: GetMessageByIdParams): Promise<ServiceResponse> => {
    return request2.get(`/messages/${params.msg_id}`);
  };

  getMessageListByThread = (params: GetThreadsParams): Promise<any> => {
    const { room_id, page = 1, size = PAGE_SIZE, belong_to_thread_id } = params;
    return request2.get(
      `/threads/${room_id}/${page}/${size}?belong_to_thread_id=${belong_to_thread_id}&page=${page}&size=${size}`,
    );
  };

  getAllThreadsList = (params: GetMessageParams): Promise<any> => {
    return request2.get(`/threads/${params.room_id}/${params.page}/${params.size}`);
  };

  searchUsersByName = (params: { keyword: string }): Promise<any> => {
    return request2.post('/search', params);
  };
}
