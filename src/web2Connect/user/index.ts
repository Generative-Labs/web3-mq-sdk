import { Web2MQ } from '../client';
import { UserInfo } from '../../types';
import { getUserAvatar, getUserInfoFromToken } from '../core/utils';

export class User {
  _client: Web2MQ;
  userInfo: UserInfo;

  constructor(client: Web2MQ) {
    this._client = client;
    this.userInfo = getUserInfoFromToken();
  }

  /**
   * 搜索所有联系人
   * @param userName
   */

  async queryUsers(userName: string) {
    const { data: users } = await this._client.api.searchUsersByName({
      keyword: userName,
    });
    return users.map((user: UserInfo) => {
      return {
        ...user,
        ...getUserAvatar(user),
        userId: user.user_id,
      };
    });
  }
}
