import { Web3MQ } from '../client';
import { UserInfo } from '../../types';
import { getUserAvatar, getUserInfoFromToken, getSignature, getUserId } from '../core/utils';

export class User {
  _client: Web3MQ;
  userInfo: UserInfo;

  constructor(client: Web3MQ) {
    this._client = client;
    this.userInfo = getUserInfoFromToken();
  }

  /**
   * 搜索所有联系人
   * @param userName
   */

  async queryUsers(walletAddress: string) {
    const signature = await getSignature();
    console.log('walletAddress', walletAddress);
    const {
      data: { result },
    } = await this._client.api.getSearchByWalletAddress({
      keyword: walletAddress,
      userid: getUserId(),
      timestamp: Date.now(),
      signature,
    });

    return result.map((user: UserInfo) => {
      return {
        ...user,
        ...getUserAvatar(user),
        userId: user.user_id,
      };
    });
  }
  async queryUsersByWalletAddress(walletAddress: string) {
    const signature = await getSignature();
    const {
      data: { result },
    } = await this._client.api.getSearchByWalletAddress({
      keyword: walletAddress,
      userid: getUserId(),
      timestamp: Date.now(),
      signature,
    });

    return result.map((user: UserInfo) => {
      return {
        ...user,
        ...getUserAvatar(user),
        userId: user.user_id,
      };
    });
  }
}
