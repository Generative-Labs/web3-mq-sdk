import { EVENT_MAP } from './core/events';

export type EventTypes = 'all' | keyof typeof EVENT_MAP;

export type SDKTypes = 'none' | 'web2' | 'web3';

export type OptionsType = {
  sdkType: SDKTypes;
  isNotify: boolean;
};
export interface ServiceResponse {
  data: any;
  msg: string;
  code: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}

export interface GetRoomsParams {
  user_id?: string;
  is_opensea_coll?: boolean;
  opensea_coll_slug?: string;
  item_contract_address?: string;
}

export interface GetChatsByUserIdResponse {
  created_at: string;
  creator: MemberUserInfo;
  creator_id: string;
  description: string;
  is_1v1: boolean;
  is_opensea_coll: boolean;
  latest_msg: MessageResponse;
  members: MemberUserInfo[];
  name: string;
  opensea_coll_cover: string;
  opensea_coll_name: string;
  opensea_coll_slug: string;
  room_id: string;
}

export interface GetMessageByIdParams {
  msg_id: string;
}

export type CreateThreadsParams = {
  msg_id?: string;
  is_opensea_item_thread?: boolean;
  opensea_item_contract_address?: string;
  opensea_item_token_id?: string;
};

export interface GetThreadsParams extends PageParams {
  room_id: string;
  belong_to_thread_id: string;
}

export interface RoomResponse {
  created_at: number;
  creator: MemberUserInfo;
  description: string;
  members: MemberUserInfo[];
  name: string;
  room_id: string;
  opensea_coll_cover?: string;
  is_1v1: boolean;
}

export interface GetRoomInfoParams extends PageParams {
  room_id: string;
}

export interface GetRoomInfoByTargetUserIdParams {
  user_id?: string;
  user_ids?: string[];
  is_opensea_coll?: boolean;
  opensea_coll_slug?: string;
  item_contract_address?: string;
  is_twitter_space?: boolean;
  space_id?: string;
  space_title?: string;
  target_user_avatar?: string;
}

export interface AddMemberToRoomParams {
  room_id: string;
  target_user_ids: string[];
}

export interface DelMemberFromRoomParams {
  room_id: string;
  member_id: string;
}

export interface GetMessageParams extends PageParams {
  room_id: string;
}
/* eslint-disable no-unused-vars */
export interface LoginRandomSecret {
  wallet_address: string;
}

export interface LoginParams {
  login_random_secret: string;
  signature: string;
  wallet_address: string;
  appid?: string;
  user_avatar?: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface LoginRandomSecretParams {
  wallet_address: string;
}

export type PlatformType = 'invite_code' | 'twitter';

export enum PLATFORM_ENUM {
  TWITTER = 'twitter',
  DISCORD = 'discord',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  OPENSEA = 'opensea',
}

export enum PLATFORM_OTHER {
  USER_ID = 'user_id',
}

export interface RegisterParams {
  platform: PLATFORM_ENUM | PLATFORM_OTHER;
  user_name: string;
}

export interface UserInfo {
  access_expired_at: number;
  created_at: number;
  discord_avatar: string;
  discord_username: string;
  eth_wallet_address: string;
  facebook_avatar: string;
  facebook_username: string;
  instagram_avatar: string;
  instagram_username: string;
  nick_name: string;
  opensea_avatar: string;
  opensea_username: string;
  refresh_expired_at: number;
  status: string;
  twitter_avatar: string;
  twitter_username: string;
  user_id: string;
  avatar?: string;
  user_name?: string;
  ens_name?: string;
}

export interface CreateContractsParams {
  contract_id?: string;
  erc20s: string[];
  amounts: number[];
  NFTs: any[];
  NFTIDs: any[];
  recipient_id?: string; // userid
  expiration: number;
}

export interface UpdateWalletAddressParams {
  user_id: string;
  wallet_address: string;
}

export interface GetOpenSeaAssetParams {
  owner: string;
  offset: number;
  limit: number;
}

export interface GetOpenSeaAssetResponse {
  assets: any[];
}

export enum MsgTypeEnum {
  text = 'text',
  sudoSwapCard = 'sudo_swap_card',
}

export enum AssetDataTypeEnum {
  ERC20 = '1',
  ERC721 = '2',
  ERC1155 = '3',
}

export interface MsgContentsAssetData {
  address: string;
  amount: string;
  imgURL: string;
  name: string;
  symbol: string;
  type: AssetDataTypeEnum;
  id?: string;
}

export interface MsgContents {
  asset1Data: MsgContentsAssetData[];
  asset2Data: MsgContentsAssetData[];
  creatorAddress: string;
  expiryDate: string;
  jumpUrl: string;
  orderStatus: string;
  recipientAddress: string;
}

export interface ReplyMsgInfo {
  id?: string;
  from_uid?: string;
  user_name?: string;
  msg_contents?: string | MsgContents;
}

export interface MessageResponse {
  at_user_ids: any[];
  belong_to_thread_id: string;
  created_at: number;
  from_uid: string;
  id: string;
  is_opensea_item_thread: boolean;
  is_thread: boolean;
  msg_contents: string | MsgContents;
  msg_type: MsgTypeEnum;
  opensea_item_contract_address: string;
  opensea_item_description: string;
  opensea_item_image_url: string;
  opensea_item_name: string;
  opensea_item_token_id: string;
  reply_to_msg_id: string;
  reply_msg_info: ReplyMsgInfo;
  to_room_id: string;
}

export interface ChannelResponse {
  unreadCount?: number;
  created_at: number;
  creator: MemberUserInfo[];
  creator_id: number;
  description: string;
  is_1v1: boolean;
  is_opensea_coll: boolean;
  latest_msg: MessageResponse;
  members: MemberUserInfo[];
  name: string;
  opensea_coll_cover: string;
  opensea_coll_name: string;
  opensea_coll_slug: string;
  room_id: string;
}

export type SendMessageData = {
  from_uid: string;
  to: string;
  msg_contents: string;
  msg_type: MsgTypeEnum;
  is_thread?: boolean;
  is_opensea_item_thread: boolean;
  opensea_item_contract_address: string;
  opensea_item_token_id: string;
  opensea_item_name: string;
  opensea_item_description: string;
  opensea_item_image_url: string;
  belong_to_thread_id: string;
  reply_to_msg_id?: string;
  created_at: number;
  at_user_ids: any[];
  reply_msg_info?: ReplyMsgInfo | null;
};

export type MembersItem = Record<string, MemberUserInfo[] | undefined>;

export type ActiveMemberItem = Record<string, MemberUserInfo>;

export type MemberUserInfo = Omit<UserInfo, 'access_expired_at'>;

export type GetTwitterUserInfoParams = {
  twitter_user_name: string;
};
export type GetOpenseaUserInfoParams = {
  opensea_user_id: string;
};
export type GetNextIdUserInfoParams = {
  platform: string;
  identity: string;
};

export type SignToPubKeyParams = {
  sig: string;
  msg: string;
};

export type getNextIdSignPayloadParams = {
  action: string;
  platform: string;
  identity: string;
  public_key: string;
};
export type CreateNextIdUserParams = {
  action: string;
  platform: string;
  identity: string;
  proof_location: string;
  public_key: string;
  extra?: any;
  uuid: string;
  created_at: string;
};

export type GetFuzzySearchParams_web2 = {
  keyword: string;
};

export type GetFuzzySearchParams_web3 = {
  userid: string;
  keyword: string;
  timestamp: number;
  signature: string;
};

export type UserInfo_web3 = {
  avatar_url?: string;
  nickname?: string;
  userid: string;
  wallet_address: string;
  wallet_type?: string;
  avatar?: string;
  userName?: string;
  userId?: string;
  user_name?: string;
  user_id?: string;
  eth_wallet_address?: string;
};