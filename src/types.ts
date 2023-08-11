import { EVENT_MAP } from './core/events';

export type EventTypes = 'all' | keyof typeof EVENT_MAP;

export type ServiceResponse = {
  data: any;
  msg: string;
  code: number;
};

export type PageParams = {
  page?: number;
  size?: number;
};
export type Web3MQDBValuePayload = {
  [key: string]: any;
};

export type DappConnectSignParams = { signContent: string; didValue: string; signType: string };

export type Web3MQDBValue = {
  messageId: string;
  from: string;
  contentTopic: string;
  timestamp: number;
  unread: number;
  lastMessage: string;
  updatedAt: string;
  payload: Web3MQDBValuePayload;
};

export type KeyPairsType = {
  PrivateKey: string;
  PublicKey: string;
  userid: string;
};

export type AccountType = {
  address: string;
};

export type RegisterBySignParams = {
  userid: string;
  didValue: string;
  mainPublicKey: string;
  signature: string;
  did_pubkey?: string;
  didType?: WalletType;
  signContentURI?: string;
  nickname?: string;
  avatar_url?: string;
  avatar_base64?: string;
};

export type LoginByKeysParams = {
  mainPrivateKey: string;
  mainPublicKey: string;
  didType: WalletType;
  didValue: string;
  userid: string;
  password: string;
  pubkeyExpiredTimestamp?: number;
};

export type InitOptions = {
  connectUrl?: string | null;
  app_key?: string;
  env?: EnvTypes;
  tempPubkey?: string;
  didKey?: string;
};

export type SignClientCallBackType = {
  type: 'createQrcode' | 'connect' | 'messageStatus' | 'keys' | 'dapp-connect';
  data: any;
};

export type WalletUserInfoType = {
  did_signature: string;
  did_type: string;
  did_value: string;
  pubkey: string;
  pubkey_type: string;
  signature_content: string;
  timestamp: number;
  userid: string;
  wallet_address: string;
  wallet_type: string;
};

export type SendTempConnectOptions = {
  dAppID: string;
  topicID: string;
  signatureTimestamp: number;
  dAppSignature: string;
};

export type SendWeb3MQBridgeOptions = {
  dAppID: string;
  topicID: string;
  nodeID: string;
  signatureTimestamp?: number;
  dAppSignature?: string;
};

export type GetUserInfoParams = {
  did_type: DidType;
  did_value: string;
  timestamp: number;
};

export type GetUserInfoResponse = { userid: string; userExist: boolean };

export type GetMainKeypairParams = {
  password: string;
  did_type: WalletType;
  did_value: string;
};

export interface SignConnectOptions extends SendTempConnectOptions {
  wsUrl: string;
}

export interface Web3MQBridgeOptions {
  wsUrl: string;
  dAppID: string;
  nodeID?: string;
}

export type EnvTypes = 'dev' | 'test';

export interface ClientKeyPaires extends KeyPairsType {
  userid: string;
}

export type RegisterApiParams = {
  userid: string;
  did_type: BlockChainType;
  did_value: string;
  did_signature: string;
  pubkey_type: string;
  pubkey_value: string;
  signature_content: string;
  timestamp: number;
  nickname?: string;
  avatar_base64?: string;
  avatar_url?: string;
  testnet_access_key?: string;
  did_pubkey?: string;
};

export type RegisterApiResponse = {
  did_type: string;
  did_value: string;
  userid: string;
};

export type LoginResponse = {
  tempPrivateKey: string;
  tempPublicKey: string;
  mainPrivateKey: string;
  mainPublicKey: string;
  pubkeyExpiredTimestamp: number;
};

export type LoginApiParams = {
  userid: string;
  did_type: BlockChainType;
  did_value: string;
  login_signature: string;
  signature_content: string;
  main_pubkey: string;
  pubkey_value: string;
  pubkey_type: string;
  timestamp: number;
  pubkey_expired_timestamp: number;
};

export type BaseParams = {
  userid: string;
  web3mq_signature: string;
  timestamp: number;
};

export type NewBaseParams = {
  userid: string;
  web3mq_user_signature: string;
  timestamp: number;
};
export type WalletBaseParams = {
  userid: string;
  did_pubkey?: string;
  did_signature: string;
  sign_content: string;
  timestamp: number;
};

export type GroupPermissions = {
  [key: string]: {
    type: string;
    value: 'ceator_invite_friends' | 'public' | 'nft_validation';
  };
};

export interface CreateRoomApiParams extends BaseParams {
  group_name?: string;
  groupid?: string;
  avatar_url?: string;
  avatar_base64?: string;
  permissions?: GroupPermissions;
}

export interface CreateRoomParams {
  groupName?: string;
  groupid?: string;
  avatarUrl?: string;
  avatarBase64?: string;
  permissions?: GroupPermissions;
}

export interface CommonGetListParams extends BaseParams, PageParams {}

export interface NewCommonGetListParams extends NewBaseParams, PageParams {}

export type ChannelItemType = {
  avatar_base64: string;
  avatar_url: string;
  chat_name: string;
  chat_type: string;
  chatid: string;
  updatedAt?: string;
  unread?: number;
  lastMessage?: string;
  // topic: string;
  // topic_type: string;
};

export interface UpdateRoomListParams {
  chatid: string;
  chatType: string;
  topic: string;
  topicType: string;
}

export interface UpdateRoomListApiParams extends BaseParams {
  chatid: string;
  chat_type: string;
  topic: string;
  topic_type: string;
}

export interface GetMessageListParams extends BaseParams, PageParams {
  topic: string;
}

export interface GetGroupMemberListParams extends BaseParams, PageParams {
  groupid: string;
}

export interface InviteGroupMemberParams extends BaseParams {
  groupid: string;
  members: string[];
}

export interface JoinGroupParams extends NewBaseParams {
  groupid: string;
}

export interface UpdateGroupPermissionsApiParams
  extends NewBaseParams,
    UpdateGroupPermissionsParams {}

export interface UpdateGroupPermissionsParams {
  groupid: string;
  permissions: GroupPermissions;
}

export interface GetGroupPermissionsParams extends NewBaseParams {
  groupid: string;
}

export type MessageStatus = 'delivered' | 'read';

export interface ChangeMessageStatusParams extends BaseParams {
  topic: string;
  messages: string[];
  status: MessageStatus;
}

export interface SyncNewMessagesParams {
  sync_timestamp: number;
  timestamp: number;
  userid: string;
  web3mq_user_signature: string;
}

export type MessageListItem = {
  cipher_suite: string;
  from: string;
  topic: string;
  from_sign: string;
  messageid: string;
  payload_type: string;
  timestamp: number;
  message_status: {
    status: MessageStatus;
    timestamp: number;
  };
  payload: string;
  version: number;
};

export interface SearchParams extends BaseParams {
  keyword: string;
}

export interface ProfileParams extends BaseParams {
  nickname: string;
  avatar_url: string;
}

export interface SendFriendParams extends BaseParams {
  content: string;
  target_userid: string;
}

export interface GetUserBindDidsParams extends BaseParams {}

export interface UserBindDidApiParams extends BaseParams {
  provider_id: string;
  did_type: string;
  did_value: string;
  did_action?: string;
  did_content?: string;
}

export interface UserBindDidParams {
  providerId: string;
  didType: string;
  didValue: string;
  didAction?: string;
  didContent?: string;
}

export interface UserBindDidIdsResponse {
  did_type: string;
  did_value: string;
  provider_id: string;
  metadata: any;
}

export interface FollowOperationApiParams extends WalletBaseParams {
  address: string;
  target_userid: string;
  action: 'follow' | 'cancel';
  did_type: BlockChainType;
}

export interface FollowOperationParams {
  address: string;
  targetUserid: string;
  action: 'follow' | 'cancel';
  didType: WalletType;
}

export interface GetUserPublicProfileParams {
  did_type: string;
  did_value: string;
  timestamp: number;
  my_userid: string;
}

export interface GetPublicFollowerListParams extends PageParams {
  userid: string;
  timestamp: number;
}

export interface PublishNotificationToFollowersApiParams
  extends NewBaseParams,
    PublishNotificationToFollowersParams {}

export interface PublishNotificationToFollowersParams {
  title: string;
  content: string;
}

export interface GetTargetUserPermissionsParams extends NewBaseParams {
  target_userid: string;
}

export type UserPermissionsType = Record<string, { type: string; value: boolean }>;

export interface UpdateUserPermissionsApiParams
  extends NewBaseParams,
    UpdateUserPermissionsParams {}

export interface UpdateUserPermissionsParams {
  permissions: UserPermissionsType;
}

export type ActionType = 'agree';

export interface OperationFriendParams extends BaseParams {
  target_userid: string;
  action: ActionType;
}

export type FollowStatus = 'following' | 'follower' | 'follow_each';

export type ContactListItemType = {
  avatar_url: string;
  follow_status: FollowStatus;
  nickname: string;
  permissions: UserPermissionsType;
  userid: string;
  wallet_address: string;
  wallet_type: BlockChainType;
};

export type SearchUsersResponse = {
  avatar_url: string;
  nickname: string;
  userid: string;
  wallet_address: string;
  wallet_type: string;
};

export type UpdateMyProfileResponse = {
  userid: string;
  wallet_address: string;
  wallet_type: string;
  nickname: string;
  avatar_url: string;
};

export interface ChangeNotificationStatusParams extends BaseParams {
  messages: string[];
  status: MessageStatus;
}

export type NotifyResponse = {
  come_from?: string;
  title: string;
  content: string;
  type: string;
  version: number;
  timestamp: number;
};

export interface CreateTopicParams extends BaseParams {
  topic_name: string;
}

export interface SubscribeTopicParams extends BaseParams {
  topicid: string;
}

export interface PublishTopicMessageParams extends SubscribeTopicParams {
  title: string;
  content: string;
}

export interface GetTopicListParams extends PageParams, BaseParams {}

export type SubscribeListType = {
  topicid: string;
  create_at: number;
};

export interface TopicListType extends SubscribeListType {
  topic_name: string;
}

export type WalletSignRes = {
  sign: string;
  publicKey?: string;
};

export type GetSignContentResponse = {
  signContent: string;
};

export type GetRegisterSignContentParams = {
  userid: string;
  mainPublicKey: string;
  didType: WalletType;
  didValue: string;
  signContentURI?: string;
};

export type MainKeypairType = {
  publicKey: string;
  secretKey: string;
};

export type ResetPasswordParams = {
  userid: string;
  didValue: string;
  mainPublicKey: string;
  signature: string;
  did_pubkey?: string;
  didType?: WalletType;
  signContentURI?: string;
  nickname?: string;
  avatar_url?: string;
};

export type WalletType = 'metamask' | 'qrcode' | 'argent' | 'braavos';

export type WalletNameType = 'MetaMask' | 'Argent X' | 'Braavos' | 'Web3MQ';

export type BlockChainType = 'eth' | 'starknet';

export type DidType = 'web3mq' | BlockChainType;

export const WalletNameMap: Record<WalletType, WalletNameType> = {
  metamask: 'MetaMask',
  argent: 'Argent X',
  braavos: 'Braavos',
  qrcode: 'Web3MQ',
};

export const BlockChainMap: Record<WalletType, BlockChainType> = {
  metamask: 'eth',
  braavos: 'starknet',
  argent: 'starknet',
  qrcode: 'eth',
};

export const SendMsgLoadingMap = {
  success: 'success',
  error: 'error',
  loading: 'loading',
};

export interface GetMyCreateDappListApiParmas {
  creator_id: string;
  timestamp: number;
  web3mq_user_signature: string;
}

export interface CreateDappApiParams {
  creator_id: string;
  dapp_id: string;
  dapp_name: string;
  dapp_description: string;
  dapp_type: string;
  dapp_pubkey: string;
  domain?: string;
  timestamp: number;
  web3mq_user_signature: string;
}

export interface CreateDappParams {
  dapp_id: string;
  dapp_name: string;
  dapp_description: string;
  dapp_type: string;
  dapp_pubkey: string;
  domain?: string;
}

export interface CreateDappListResponse {
  data_list: any[];
  total_count: number;
}

export interface QueryNotificationsApiParams extends BaseParams {
  topic?: string;
  notice_type?: string;
  size: number;
  page: number;
}

export type QueryNotificationsParams = {
  topic?: string;
  notice_type?: string;
  size: number;
  page: number;
};

export type GetMyAuthInfoParams = {
  userid: string;
  dapp_id: string;
  timestamp: number;
  web3mq_user_signature: string;
};

export type GetMyAuthInfoResponse = {
  auth_status: number;
  create_at: number;
  dapp_id: string;
  scopes: any;
  userid: string;
};
