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

export type KeyPairsType = {
  PrivateKey: string;
  PublicKey: string;
};

export type EthAccountType = {
  address: string;
  balance: number;
  shortAddress: string;
};

export type initOptions = {
  connectUrl?: string | null;
  app_key?: string;
  env?: EnvTypes;
};

export type EnvTypes = 'dev' | 'test';

export interface ClientKeyPaires extends KeyPairsType {
  userid: string;
}

export type SavePublicKeyParams = {
  userid: string;
  pubkey: string;
  metamask_signature: string;
  sign_content: string;
  wallet_address: string;
  wallet_type: 'eth';
  timestamp: number;
  app_key?: string;
};

export type BaseParams = {
  userid: string;
  web3mq_signature: string;
  timestamp: number;
};

export interface createRoomParams extends PageParams, BaseParams {}

export type ActiveChannelType = {
  topic: string;
  topic_type: string;
};

export interface getMessageListParams extends createRoomParams {
  topic: string;
}

export interface getGroupMemberListParams extends createRoomParams {
  groupid: string;
}

export interface inviteGroupMemberParams extends BaseParams {
  groupid: string;
  members: string[];
}

export type MessageStatus = 'delivered' | 'read';

export interface changeMessageStatusParams extends BaseParams {
  topic: string;
  messages: string[];
  status: MessageStatus;
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

export interface searchParams extends BaseParams {
  keyword: string;
}

export interface profileParams extends BaseParams {
  nickname: string;
  avatar_url: string;
}

export interface sendFriendParams extends BaseParams {
  target_userid: string;
}

export type ActionType = 'agree';

export interface operationFriendParams extends BaseParams {
  target_userid: string;
  action: ActionType;
}

export type ContactListItemType = {
  userid: string;
};

export type SearchUsersResponse = {
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
