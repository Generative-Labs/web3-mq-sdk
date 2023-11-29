import { Client } from '../client';
import {
  approveJoinGroupRequest,
  createRoomRequest,
  getGroupMemberListRequest,
  getGroupPermissionsRequest,
  getGroupsRequest,
  getRoomListRequest,
  getUserPublicProfileRequest,
  inviteGroupMemberRequest,
  joinGroupRequest,
  requestJoinGroupRequest,
  syncNewMessagesRequest,
  updateGroupPermissionsRequest,
  updateRoomListRequest,
} from '../api';
import {
  ByteArrayToHexString,
  getDataSignature,
  getGroupId,
  getMessageUpdateDate,
  newDateFormat,
  sha256,
} from '../utils';
import {
  ApproveJoinGroupStatusEnum,
  BlockChainType,
  ChannelItemType,
  ClientKeyPaires,
  CreateRoomApiParams,
  CreateRoomParams,
  GroupPermissions,
  PageParams,
  ServiceResponse,
  UpdateGroupPermissionsApiParams,
  UpdateGroupPermissionsParams,
  UpdateRoomListParams,
  Web3MQDBValue,
} from '../types';
import { Web3MQMessageStatusResp, Web3MQRequestMessage } from '../pb';

export class Channel {
  private readonly _client: Client;
  private readonly _keys: ClientKeyPaires;
  channelList: ChannelItemType[] | null;
  activeChannel: ChannelItemType | null;

  constructor(client: Client) {
    this._client = client;
    this._keys = client.keys;
    this.channelList = null;
    this.activeChannel = null;
  }

  private handleUpdateChannel(msg: any, chatid: string) {
    if (!this.channelList) {
      return;
    }
    this.channelList.map((item) => {
      if (item.chatid === chatid) {
        item.lastMessage = msg.lastMessage;
        item.updatedAt = msg.updatedAt;
        item.unread = msg.unread || 0;
      }
    });

    this._client.emit('channel.updated', { type: 'channel.updated' });
  }

  private async syncNewMessages(): Promise<Record<string, any>> {
    const sync_timestamp = getMessageUpdateDate();
    if (!sync_timestamp) {
      return {};
    }
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + sync_timestamp + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await syncNewMessagesRequest({
      sync_timestamp,
      timestamp,
      userid,
      web3mq_user_signature: web3mq_signature,
    });
    return data;
  }

  async handleUnread(resp: Web3MQRequestMessage | Web3MQMessageStatusResp, msg: any) {
    if (!this.activeChannel) {
      return;
    }
    const { storage } = this._client;
    let count = 0;
    const comeFrom = getGroupId(resp, this._client) || this.activeChannel.chatid;
    const data = await storage.getData(comeFrom);
    const msglist = !data ? [msg] : [...data.payload.messageList, msg];

    if (comeFrom !== this.activeChannel?.chatid) {
      count = !data ? 1 : data.unread + 1;
    }

    const indexeddbData: Web3MQDBValue = {
      messageId: resp.messageId,
      from: comeFrom,
      contentTopic: resp.contentTopic,
      timestamp: Number(resp.timestamp),
      unread: count,
      lastMessage: msg.content,
      updatedAt: msg.date,
      payload: {
        messageList: msglist,
      },
    };

    await storage.setData(comeFrom, indexeddbData);

    return this.handleUpdateChannel(indexeddbData, comeFrom);
  }

  async setActiveChannel(channel: ChannelItemType | null) {
    this.activeChannel = channel;
    if (channel) {
      (this.activeChannel as ChannelItemType).unread = 0;
      const data = await this._client.storage.getData(channel.chatid);
      if (data && data.unread !== 0) {
        data.unread = 0;
        await this._client.storage.setData(channel?.chatid as string, data);
      }
    }
    this._client.emit('channel.activeChange', { type: 'channel.activeChange' });
    return this.activeChannel;
    // if (data && data.unread !== 0) {
    //   data.unread = 0;
    //   await this._client.storage.setData(channel?.chatid as string, data);
    //   this.channelList = (this.channelList as Array<ChannelItemType>).map((item) => {
    //     if (item.chatid === channel?.chatid) {
    //       item.unread = 0;
    //     }
    //     return item;
    //   });
    //   this._client.emit('channel.updated', { type: 'channel.updated' });
    // }
  }

  async queryChannels(option: PageParams) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);

    const {
      data: { result = [] },
    } = await getRoomListRequest({ web3mq_signature, userid, timestamp, ...option });

    const allNewMessageData = await this.syncNewMessages();

    const list = await Promise.all(
      result.map(async (item: ChannelItemType) => {
        const data = await this._client.storage.getData(item.chatid);
        const currentNewMsgObj = allNewMessageData[item.chatid];
        let newMessageUnread = 0;
        for (let messageid in currentNewMsgObj) {
          if (
            currentNewMsgObj.hasOwnProperty(messageid) &&
            currentNewMsgObj[messageid] !== 'read'
          ) {
            newMessageUnread++;
          }
        }
        if (data) {
          if (newMessageUnread) {
            data.unread = newMessageUnread;
            await this._client.storage.setData(item.chatid, data);
          }
          const { unread, lastMessage, updatedAt } = data;
          item.unread = unread;
          item.lastMessage = lastMessage;
          item.updatedAt = updatedAt;
        }
        return item;
      }),
    );

    if (this.channelList && option.page !== 1) {
      this.channelList = [...this.channelList, ...list];
    } else {
      this.channelList = list;
    }
    this._client.emit('channel.getList', { type: 'channel.getList' });
    return list;
  }

  async updateChannels(params: UpdateRoomListParams): Promise<ServiceResponse> {
    const { chatid, chatType, topic, topicType } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + topic + topicType + timestamp;
    const web3mq_signature = await getDataSignature(PrivateKey, signContent);
    const data = await updateRoomListRequest({
      userid,
      web3mq_signature,
      timestamp,
      chatid,
      chat_type: chatType,
      topic,
      topic_type: topicType,
    });
    return data as any;
  }

  async createRoom(params: CreateRoomParams) {
    const {
      avatarUrl,
      avatarBase64,
      groupid = '',
      groupName,
      nfts,
      permissions = {
        'group:join': {
          type: 'enum',
          value: 'public',
        },
      },
    } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    let payload: CreateRoomApiParams;
    if (nfts && nfts.length > 0) {
      let permission: GroupPermissions = {
        'group:join': {
          type: 'enum',
          value: 'nft_validation',
        },
      };
      const payload_hash = sha256(
        userid + groupid + JSON.stringify(permission) + JSON.stringify(nfts) + timestamp,
      );
      const payloadSting = ByteArrayToHexString(payload_hash);
      const web3mq_signature = await getDataSignature(PrivateKey, payloadSting);
      payload = {
        version: 2,
        web3mq_signature,
        userid,
        timestamp,
        avatar_base64: avatarBase64,
        avatar_url: avatarUrl,
        group_name: groupName,
        ...params,
        payload_hash: payloadSting,
        permissions: permission,
      };
    } else {
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);
      payload = {
        web3mq_signature,
        userid,
        timestamp,
        avatar_base64: avatarBase64,
        avatar_url: avatarUrl,
        group_name: groupName,
        permissions,
        ...params,
      };
    }
    const { data = { groupid: '', group_name: '', avatar_base64: '', avatar_url: '' } } =
      await createRoomRequest(payload);
    if (this.channelList !== null) {
      this.channelList = [
        {
          chatid: data.groupid,
          chat_type: 'group',
          chat_name: data.group_name,
          avatar_base64: data.avatar_base64,
          avatar_url: data.avatar_url,
        },
        ...this.channelList,
      ];
      this._client.emit('channel.getList', { type: 'channel.getList' });
    }
    this._client.emit('channel.created', { type: 'channel.created' });
    return data;
  }

  // async updateRoom(topic: string, topic_type: string) {
  //   const { userid, PrivateKey } = this._keys;
  //   const timestamp = Date.now();
  //   const signContent = userid + timestamp;
  //   const web3mq_signature = await getDataSignature(PrivateKey, signContent);

  //   const data = await updateRoomListRequest({
  //     userid,
  //     timestamp,
  //     web3mq_signature,
  //     topic,
  //     topic_type,
  //   });
  //   return data;
  // }

  async getGroupMemberList(option: PageParams, chatId?: string) {
    const groupid = chatId || this.activeChannel?.chatid;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const { data } = await getGroupMemberListRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        ...option,
      });
      return data;
    }
  }

  async inviteGroupMember(members: string[], chatId?: string) {
    const groupid = chatId || this.activeChannel?.chatid;
    if (groupid) {
      const { userid, PrivateKey } = this._keys;
      const timestamp = Date.now();
      const signContent = userid + groupid + timestamp;
      const web3mq_signature = await getDataSignature(PrivateKey, signContent);

      const data = await inviteGroupMemberRequest({
        web3mq_signature,
        userid,
        timestamp,
        groupid,
        members,
      });
      return data;
    }
  }

  async joinGroup(groupid: string) {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + groupid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    const { data } = await joinGroupRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      groupid,
    });
    if (this.channelList !== null) {
      if (!this.channelList.find((item) => item.chatid !== groupid)) {
        const { groupid: group_id = '', group_name = '', avatar_base64 = '', avatar_url = '' } = data;
        this.channelList = [
          {
            chatid: group_id,
            chat_type: 'group',
            chat_name: group_name,
            avatar_base64: avatar_base64,
            avatar_url: avatar_url,
          },
          ...this.channelList,
        ];
        this._client.emit('channel.getList', { type: 'channel.getList' });
      }
    }
    this._client.emit('channel.joined', { type: 'channel.joined', data });
    return data;
  }

  async getGroupPermissions(groupid: string): Promise<{
    data: {
      groupid: string;
      permissions: GroupPermissions;
    };
  }> {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    const signContent = userid + groupid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
    return await getGroupPermissionsRequest({
      web3mq_user_signature,
      userid,
      timestamp,
      groupid,
    });
  }

  async updateGroupPermissions(params: UpdateGroupPermissionsParams) {
    const { groupid, permissions, nfts } = params;
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    let payload: UpdateGroupPermissionsApiParams;
    if (nfts && nfts.length > 0) {
      let permission = permissions || {
        'group:join': {
          type: 'enum',
          value: 'nft_validation',
        },
      };
      const payload_hash = sha256(
        userid + groupid + JSON.stringify(permission) + JSON.stringify(nfts) + timestamp,
      );
      const payloadSting = ByteArrayToHexString(payload_hash);
      const web3mq_user_signature = await getDataSignature(PrivateKey, payloadSting);
      payload = {
        version: 2,
        web3mq_user_signature,
        userid,
        groupid,
        timestamp,
        payload_hash: payloadSting,
        permissions: permission,
        nfts,
      };
    } else {
      const signContent = userid + groupid + timestamp;
      const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);
      payload = {
        web3mq_user_signature,
        userid,
        timestamp,
        ...params,
      };
    }
    const data = await updateGroupPermissionsRequest(payload);
    return data;
  }

  async queryGroups(
    ids: string[],
    withMetaData: boolean = false,
  ): Promise<
    {
      avatar_url: string;
      group_name: string;
      groupid: string;
      creator_id: string;
      is_group_member: boolean;
      permissions?: GroupPermissions;
      memberCount?: number;
      creatorInfo?: any;
    }[]
  > {
    const { userid, PrivateKey } = this._keys;
    const timestamp = Date.now();
    // const payload_hash = sha256(userid + timestamp);
    const signContent = userid + timestamp;
    const web3mq_user_signature = await getDataSignature(PrivateKey, signContent);

    try {
      const {
        data: { data_list = [] },
      } = await getGroupsRequest({
        groupid_list: ids,
        timestamp,
        userid,
        web3mq_user_signature,
      });
      if (withMetaData) {
        let groups = [];
        if (data_list.length > 0) {
          for (let i = 0; i < data_list.length; i++) {
            let item = data_list[i];
            const { data: permission } = await this.getGroupPermissions(item.groupid);
            const cacheUserInfo = localStorage.getItem(`user_info_${item.creator_id}`);
            let userInfo;
            if (cacheUserInfo) {
              userInfo = JSON.parse(cacheUserInfo);
            } else {
              const { data } = await getUserPublicProfileRequest({
                did_type: 'web3mq',
                did_value: item.creator_id,
                timestamp: Date.now(),
                my_userid: '',
              });
              localStorage.setItem(`user_info_${item.creator_id}`, JSON.stringify(data));
              userInfo = data;
            }
            const memberLists = await this.getGroupMemberList({ page: 1, size: 1 }, item.groupid);
            groups.push({
              ...item,
              ...permission,
              memberCount: memberLists?.total_count || 0,
              creatorInfo: userInfo,
            });
          }
        }
        return groups;
      }
      return data_list;
    } catch (e) {
      return [];
    }
  }

  async getRequestJoinGroupSignContent(params: {
    groupid: string;
    requestReason?: string;
    didType?: BlockChainType;
    walletAddress?: string;
  }): Promise<{
    signContent: string;
    requestTime: number;
  }> {
    const { groupid, requestReason = '', didType, walletAddress } = params;
    const { userid } = this._keys;
    const { user } = this._client;
    const timestamp = Date.now();
    let walletType = didType;
    let address = walletAddress;
    if (!walletType || !address) {
      const { wallet_type, wallet_address } = await user.getMyProfile();
      walletType = wallet_type as BlockChainType;
      address = wallet_address;
    }
    const payload_hash = sha256(userid + groupid + requestReason + timestamp);
    const nonce = ByteArrayToHexString(payload_hash);
    const signContent = `
    Web3MQ wants you to sign in with your ${walletType} account:
    ${address}
    
    For group join request signture
    
    Nonce: ${nonce}
    Issued At: ${newDateFormat(timestamp, 'Y/m/d h:i')}`;
    return { signContent, requestTime: timestamp };
  }

  async requestJoinGroupBySignature(params: {
    didPubkey?: string;
    signature: string;
    signContent: string;
    requestTimestamp: number;
    groupid: string;
    requestReason?: string;
    didType?: BlockChainType;
    walletAddress?: string;
  }): Promise<ServiceResponse> {
    const { userid } = this._keys;
    const { user } = this._client;
    const {
      didPubkey = '',
      signature,
      signContent,
      requestTimestamp,
      groupid,
      requestReason = '',
      didType,
      walletAddress,
    } = params;

    let walletType = didType;
    let address = walletAddress;
    if (!walletType || !address) {
      const { wallet_type, wallet_address } = await user.getMyProfile();
      walletType = wallet_type as BlockChainType;
      address = wallet_address;
    }

    const data = await requestJoinGroupRequest({
      did_pubkey: didPubkey,
      did_signature: signature,
      sign_content: signContent,
      userid,
      timestamp: requestTimestamp,
      wallet_address: address,
      did_type: walletType,
      groupid,
      request_reason: requestReason,
    });
    // this._client.emit('contact.updateList', { type: 'contact.updateList' });
    return data as any;
  }

  async getApproveJoinGroupRequestSignContent(params: {
    groupid: string;
    reason?: string;
    requestUserid: string;
    isApprove: boolean;
    didType?: BlockChainType;
    walletAddress?: string;
  }): Promise<{
    signContent: string;
    requestTime: number;
  }> {
    const { groupid, requestUserid, reason, isApprove, didType, walletAddress } = params;
    let status = isApprove
      ? ApproveJoinGroupStatusEnum.APPROVE
      : ApproveJoinGroupStatusEnum.REJECTTED;
    const { userid } = this._keys;
    const { user } = this._client;
    const timestamp = Date.now();
    let walletType = didType;
    let address = walletAddress;
    if (!walletType || !address) {
      const { wallet_type, wallet_address } = await user.getMyProfile();
      walletType = wallet_type as BlockChainType;
      address = wallet_address;
    }
    const payload_hash = sha256(userid + groupid + requestUserid + status + reason + timestamp);
    const nonce = ByteArrayToHexString(payload_hash);

    let signContent = `
Web3MQ wants you to sign in with your ${walletType} account:
${address}

For approve group join request signature

Nonce: ${nonce}
Issued At: ${newDateFormat(timestamp, 'Y/m/d h:i')}`;

    return { signContent, requestTime: timestamp };
  }

  async approveJoinGroupRequestBySignature(params: {
    didPubkey?: string;
    signature: string;
    signContent: string;
    requestUserid: string;
    requestTimestamp: number;
    isApprove: boolean;
    groupid: string;
    requestReason?: string;
    walletAddress?: string;
    didType?: BlockChainType;
  }): Promise<ServiceResponse> {
    const { userid } = this._keys;
    const { user } = this._client;
    const {
      didPubkey = '',
      signature,
      signContent,
      requestTimestamp,
      groupid,
      requestReason = '',
      requestUserid,
      isApprove,
      walletAddress,
      didType,
    } = params;
    let walletType = didType;
    let address = walletAddress;
    if (!walletType || !address) {
      const { wallet_type, wallet_address } = await user.getMyProfile();
      walletType = wallet_type as BlockChainType;
      address = wallet_address;
    }

    let status = isApprove
      ? ApproveJoinGroupStatusEnum.APPROVE
      : ApproveJoinGroupStatusEnum.REJECTTED;
    const data = await approveJoinGroupRequest({
      userid,
      did_type: walletType,
      did_signature: signature,
      sign_content: signContent,
      timestamp: requestTimestamp,
      groupid,
      request_userid: requestUserid,
      wallet_address: address,
      status,
      reason: requestReason,
      did_pubkey: didPubkey,
    });
    // this._client.emit('contact.updateList', { type: 'contact.updateList' });
    return data as any;
  }
}
