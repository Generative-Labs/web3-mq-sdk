import { request } from '../core/request';

import {
  CreateRoomApiParams,
  CommonGetListParams,
  GetMessageListParams,
  BaseParams,
  NewBaseParams,
  GetGroupMemberListParams,
  InviteGroupMemberParams,
  JoinGroupParams,
  GetMyCreateDappListApiParmas,
  GetGroupPermissionsParams,
  ChangeMessageStatusParams,
  SearchParams,
  ProfileParams,
  SendFriendParams,
  OperationFriendParams,
  NewCommonGetListParams,
  UpdateMyProfileResponse,
  ChangeNotificationStatusParams,
  SyncNewMessagesParams,
  CreateTopicParams,
  SubscribeTopicParams,
  PublishTopicMessageParams,
  GetTopicListParams,
  GetUserInfoParams,
  LoginApiParams,
  GetUserBindDidsParams,
  FollowOperationApiParams,
  GetUserPublicProfileParams,
  GetPublicFollowerListParams,
  PublishNotificationToFollowersApiParams,
  GetTargetUserPermissionsParams,
  UpdateGroupPermissionsApiParams,
  UpdateRoomListApiParams,
  UpdateUserPermissionsApiParams,
  UserBindDidApiParams,
  RegisterApiResponse,
  CreateDappApiParams,
  QueryNotificationsApiParams,
  GetMyAuthInfoParams,
  GetMyAuthInfoResponse,
  RegisterApiParams,
  SearchUsersByHandleParams,
  getActivePubUsersDetailParams,
  ProtocolType,
  ActivityPubPostItemType,
  getMyFollowingFeedsParams,
  followActivePubUserParams,
  GetUserKeypairParams,
  UploadUserKeypairParams, getFollowActivePubUserParams, activityPubUserType,
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
export const createRoomRequest = async (payload: CreateRoomApiParams) => {
  return await request.post('/api/groups/', payload);
};

// export const getGroupListRequest = async (payload: createRoomParams) => {
//   return await request.get('/api/groups/', {
//     params: payload,
//   });
// };

export const getRoomListRequest = async (payload: CommonGetListParams) => {
  return await request.get('/api/chats/', {
    params: payload,
  });
};
export const updateRoomListRequest = async (payload: UpdateRoomListApiParams) => {
  return await request.post('/api/chats/', payload);
};

export const getGroupMemberListRequest = async (payload: GetGroupMemberListParams) => {
  return await request.get('/api/group_members/', {
    params: payload,
  });
};

export const inviteGroupMemberRequest = async (payload: InviteGroupMemberParams) => {
  return await request.post('/api/group_invitation/', payload);
};

export const joinGroupRequest = async (payload: JoinGroupParams) => {
  return await request.post('/api/user_join_group/', payload);
};

export const updateGroupPermissionsRequest = async (payload: UpdateGroupPermissionsApiParams) => {
  return await request.post('/api/update_group_permissions/', payload);
};

export const getGroupPermissionsRequest = async (payload: GetGroupPermissionsParams) => {
  return await request.get('/api/get_group_permissions/', {
    params: payload,
  });
};

/**
 * @API Message
 */

export const getMessageListRequest = async (payload: GetMessageListParams) => {
  return await request.get('/api/messages/history/', {
    params: payload,
  });
};

export const changeMessageStatusRequest = async (payload: ChangeMessageStatusParams) => {
  return await request.post('/api/messages/status/', payload);
};

export const syncNewMessagesRequest = async (payload: SyncNewMessagesParams) => {
  return await request.post('/api/get_new_messages/', payload);
};
/**
 * @API User
 */
export const searchUsersRequest = async (payload: SearchParams) => {
  return await request.get('/api/users/search/', {
    params: payload,
  });
};
export const searchUsersByHandleRequest = async (payload: SearchUsersByHandleParams) => {
  return await request.get('/api/fediverse/users/search/', {
    params: payload,
  });
};

export const getMyProfileRequest = async (payload: BaseParams) => {
  return await request.get('/api/my_profile/', {
    params: payload,
  });
};

export const updateMyProfileRequest = async (
  payload: ProfileParams,
): Promise<UpdateMyProfileResponse> => {
  return await request.post('/api/my_profile/', payload);
};

export const getUserInfoRequest = async (payload: GetUserInfoParams) => {
  return await request.post('/api/get_user_info/', payload);
};

export const userRegisterRequest = async (
  payload: RegisterApiParams,
): Promise<RegisterApiResponse> => {
  return await request.post('/api/user_register_v2/', payload);
};

export const resetPasswordRequest = async (payload: RegisterApiParams) => {
  return await request.post('/api/user_reset_password_v2/', payload);
};

export const userLoginRequest = async (payload: LoginApiParams) => {
  return await request.post('/api/user_login_v2/', payload);
};

export const getUserBindDidsRequest = async (payload: GetUserBindDidsParams) => {
  return await request.post('/api/get_user_binddids/', payload);
};

export const userBindDidRequest = async (payload: UserBindDidApiParams) => {
  return await request.post('/api/user_binddid/', payload);
};

export const followOperationRequest = async (payload: FollowOperationApiParams) => {
  return await request.post('/api/following/', payload);
};

export const getFollowerListRequest = async (payload: NewCommonGetListParams) => {
  return await request.get('/api/user_followers/', {
    params: payload,
  });
};

export const getFollowingListRequest = async (payload: NewCommonGetListParams) => {
  return await request.get('/api/user_following/', {
    params: payload,
  });
};

export const getUserPublicProfileRequest = async (payload: GetUserPublicProfileParams) => {
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
  payload: PublishNotificationToFollowersApiParams,
) => {
  return await request.post('/api/publish_notification_to_followers/', payload);
};

export const getTargetUserPermissionsRequest = async (payload: GetTargetUserPermissionsParams) => {
  return await request.post('/api/get_target_user_permissions/', payload);
};

export const getUserPermissionsRequest = async (payload: NewBaseParams) => {
  return await request.get('/api/get_user_permissions/', {
    params: payload,
  });
};

export const updateUserPermissionsRequest = async (payload: UpdateUserPermissionsApiParams) => {
  return await request.post('/api/update_user_permissions/', payload);
};

/**
 * @API Contact
 */
export const searchContactRequest = async (payload: SearchParams) => {
  return await request.get('/api/contacts/search/', {
    params: payload,
  });
};

export const getContactListRequest = async (payload: NewCommonGetListParams) => {
  return await request.get('/api/user_follow_contacts/', {
    params: payload,
  });
};

export const sendFriendRequest = async (payload: SendFriendParams) => {
  return await request.post('/api/contacts/add_friends/', payload);
};

export const getMyAuthInfoRequest = async (
  payload: GetMyAuthInfoParams,
): Promise<GetMyAuthInfoResponse> => {
  return await request.post('/api/dapp/user_auth_info/', payload);
};

export const getMyFriendListRequset = async (payload: CommonGetListParams) => {
  return await request.get('/api/contacts/add_friends/', {
    params: payload,
  });
};

export const getRreceiveFriendListRequests = async (payload: CommonGetListParams) => {
  return await request.get('/api/contacts/friend_requests/', {
    params: payload,
  });
};

export const operationFriendRequest = async (payload: OperationFriendParams) => {
  return await request.post('/api/contacts/friend_requests/', payload);
};

/**
 * @API Notification
 */
export const changeNotificationStatusRequest = async (payload: ChangeNotificationStatusParams) => {
  return await request.post('/api/notification/status/', payload);
};
export const queryNotificationsRequest = async (payload: QueryNotificationsApiParams) => {
  return await request.get('/api/notification/history/', {
    params: payload,
  });
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

export const getMyCreateDappListRequest = async (payload: GetMyCreateDappListApiParmas) => {
  return await request.get('/api/my_create_dapps/', {
    params: payload,
  });
};

export const createDappRequest = async (payload: CreateDappApiParams) => {
  return await request.post('/api/create_dapp/', payload);
};

export const updateDappRequest = async (payload: CreateDappApiParams) => {
  return await request.post('/api/update_dapp/', payload);
};

export const getActivePubProfileRequest = async (
  payload: getActivePubUsersDetailParams,
): Promise<activityPubUserType> => {
  return await request.post('/api/fediverse/userinfo/', payload);
};
export const getActivePubPostRequest = async (payload: getActivePubUsersDetailParams) => {
  return await request.post('/api/fediverse/user/outbox/', payload);
};
export const getMyFollowActivePubUserRequest = async (
  payload: getFollowActivePubUserParams,
): Promise<{
  data_list: {
    userid: string;
    protocol: ProtocolType;
  }[];
}> => {
  return await request.post('/api/fediverse/my_following/', payload);
};
export const checkIsMyFollowRequest = async (payload: getActivePubUsersDetailParams) => {
  return await request.post('/api/fediverse/isfollowing/', payload);
};


export const uploadUserKeypairRequest = async (payload: UploadUserKeypairParams) => {
  return await request.post('/api/fediverse/keypair/', payload);
};

export const getUserKeypairRequest = async (
  payload: GetUserKeypairParams,
): Promise<{
  key_type: string;
  protocol: ProtocolType;
  pubkey: string;
  timestamp: number;
}> => {
  return await request.get('/api/fediverse/keypair/', { params: payload });
};

export const followActivePubUserRequest = async (payload: followActivePubUserParams) => {
  return await request.post('/api/fediverse/follow/', payload);
};



export const getMyFollowingFeeds = async (
  payload: getMyFollowingFeedsParams,
): Promise<
  {
    orderedItems: ActivityPubPostItemType[];
  }[]
> => {
  return await request.post('/api/fediverse/user/timelines/home/', payload);
};
