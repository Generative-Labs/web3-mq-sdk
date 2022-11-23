import { request } from '../core/request';

import {
  CreateRoomParams,
  CommonGetListPatams,
  getMessageListParams,
  BaseParams,
  NewBaseParams,
  getGroupMemberListParams,
  inviteGroupMemberParams,
  changeMessageStatusParams,
  searchParams,
  profileParams,
  sendFriendParams,
  operationFriendParams,
  UpdateMyProfileResponse,
  ChangeNotificationStatusParams,
  CreateTopicParams,
  SubscribeTopicParams,
  PublishTopicMessageParams,
  GetTopicListParams,
  getUserInfoParams,
  LoginParams,
  GetUserBindDidsParams,
  UserBindDidParams,
  FollowOperationParams,
  GetFollowerListParams,
  getUserPublicProfileParams,
  GetPublicFollowerListParams,
  PublishNotificationToFollowersParams,
  UpdateUserPermissionsParams,
} from '../types';

/**
 * @deprecated
 */
export const savePublicKeyRequest = async (payload: any) => {
  return await request.post('/api/pubkey/', payload);
};

/**
 * @API Channel
 */
export const createRoomRequest = async (payload: CreateRoomParams) => {
  return await request.post('/api/groups/', payload);
};

// export const getGroupListRequest = async (payload: createRoomParams) => {
//   return await request.get('/api/groups/', {
//     params: payload,
//   });
// };

export const getRoomListRequest = async (payload: CommonGetListPatams) => {
  return await request.get('/api/chats/', {
    params: payload,
  });
};

export const getGroupMemberListRequest = async (payload: getGroupMemberListParams) => {
  return await request.get('/api/group_members/', {
    params: payload,
  });
};

export const inviteGroupMemberRequest = async (payload: inviteGroupMemberParams) => {
  return await request.post('/api/group_invitation/', payload);
};

/**
 * @API Message
 */

export const getMessageListRequest = async (payload: getMessageListParams) => {
  return await request.get('/api/messages/history/', {
    params: payload,
  });
};

export const changeMessageStatusRequest = async (payload: changeMessageStatusParams) => {
  return await request.post('/api/messages/status/', payload);
};

/**
 * @API User
 */
export const searchUsersRequest = async (payload: searchParams) => {
  return await request.get('/api/users/search/', {
    params: payload,
  });
};

export const getMyProfileRequest = async (payload: BaseParams) => {
  return await request.get('/api/my_profile/', {
    params: payload,
  });
};

export const updateMyProfileRequest = async (
  payload: profileParams,
): Promise<UpdateMyProfileResponse> => {
  return await request.post('/api/my_profile/', payload);
};

export const getUserInfoRequest = async (payload: getUserInfoParams) => {
  return await request.post('/api/get_user_info/', payload);
};

export const userLoginRequest = async (payload: LoginParams) => {
  return await request.post('/api/user_login/', payload);
};

export const getUserBindDidsRequest = async (payload: GetUserBindDidsParams) => {
  return await request.post('/api/get_user_binddids/', payload);
};

export const userBindDidRequest = async (payload: UserBindDidParams) => {
  return await request.post('/api/user_binddid/', payload);
};

export const followOperationRequest = async (payload: FollowOperationParams) => {
  return await request.post('/api/following/', payload);
};

export const getFollowerListRequest = async (payload: GetFollowerListParams) => {
  return await request.get('/api/user_followers/', {
    params: payload,
  });
};

export const getFollowingListRequest = async (payload: GetFollowerListParams) => {
  return await request.get('/api/user_following/', {
    params: payload,
  });
};

export const getUserPublicProfileRequest = async (payload: getUserPublicProfileParams) => {
  return await request.get('/api/get_user_public_profile/', {
    params: payload,
  });
};

export const getPublicFollowerListRequest = async (payload: GetPublicFollowerListParams) => {
  return await request.get('/api/user_public_followers/', {
    params: payload,
  });
};

export const getPublicFollowingListRequest = async (payload: GetPublicFollowerListParams) => {
  return await request.get('/api/user_public_following/', {
    params: payload,
  });
};

export const publishNotificationToFollowersRequest = async (
  payload: PublishNotificationToFollowersParams,
) => {
  return await request.post('/api/publish_notification_to_followers/', payload);
};

export const getUserPermissionsRequest = async (payload: NewBaseParams) => {
  return await request.get('/api/get_user_permissions/', {
    params: payload,
  });
};

export const updateUserPermissionsRequest = async (payload: UpdateUserPermissionsParams) => {
  return await request.post('/api/update_user_permissions/', payload);
};

/**
 * @API Contact
 */
export const searchContactRequest = async (payload: searchParams) => {
  return await request.get('/api/contacts/search/', {
    params: payload,
  });
};

export const getContactListRequest = async (payload: CommonGetListPatams) => {
  return await request.get('/api/contacts/', {
    params: payload,
  });
};

export const sendFriendRequest = async (payload: sendFriendParams) => {
  return await request.post('/api/contacts/add_friends/', payload);
};

export const getMyFriendListRequset = async (payload: CommonGetListPatams) => {
  return await request.get('/api/contacts/add_friends/', {
    params: payload,
  });
};

export const getRreceiveFriendListRequests = async (payload: CommonGetListPatams) => {
  return await request.get('/api/contacts/friend_requests/', {
    params: payload,
  });
};

export const operationFriendRequest = async (payload: operationFriendParams) => {
  return await request.post('/api/contacts/friend_requests/', payload);
};

/**
 * @API Notification
 */
export const changeNotificationStatusRequest = async (payload: ChangeNotificationStatusParams) => {
  return await request.post('/api/notification/status/', payload);
};

export const createTopicRequest = async (payload: CreateTopicParams) => {
  return await request.post('/api/create_topic/', payload);
};

export const subscribeTopicRequest = async (payload: SubscribeTopicParams) => {
  return await request.post('/api/subscribe_topic/', payload);
};

export const publishTopicMessageRequest = async (payload: PublishTopicMessageParams) => {
  return await request.post('/api/publish_topic_message/', payload);
};

export const myCreateTopicListRequest = async (payload: GetTopicListParams) => {
  return await request.get('/api/my_create_topic_list/', { params: payload });
};

export const mySubscribeTopicListRequest = async (payload: GetTopicListParams) => {
  return await request.get('/api/my_subscribe_topic_list/', { params: payload });
};
