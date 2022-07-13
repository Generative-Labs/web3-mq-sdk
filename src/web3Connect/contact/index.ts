import { Web3MQ } from '../client';
import { PageParams, UserInfo } from '../../types';
import { getUserAvatar } from '../core/utils';

export class Contact {
  private _client: Web3MQ;
  public contactList?: UserInfo[] | null;
  public activeContact: UserInfo | null;

  constructor(client: Web3MQ) {
    this._client = client;
    this.activeContact = null;
    this.contactList = null;
  }

  /**
   * 用户改变焦点channel
   * @param contact
   */
  setActiveContact = async (contact: UserInfo) => {
    this.activeContact = contact;
    await this._client.channel.createRoom({ user_id: contact.user_id });
    this._client.emit('contact.activeChange', { type: 'contact.activeChange', data: contact });
  };

  async queryContacts(option?: PageParams) {
    const { data = [] } = await this._client.api.getContacts(option || { page: 1, size: 10 });
    this.contactList = data.map((item) => {
      item.avatar = getUserAvatar(item).avatar;
      item.user_name = getUserAvatar(item).userName;
      return item;
    });
    this._client.emit('contact.getList', { type: 'contact.getList', data });
  }

  async addContact(contact: UserInfo) {
    await this._client.api.getRoomInfoByTargetUserIdApi({
      user_id: contact.user_id,
    });
    if (!this.contactList?.some((c) => c.user_id === contact.user_id)) {
      this.contactList = [contact, ...(this.contactList || [])];
      this._client.emit('contact.updateList', {
        type: 'contact.updateList',
        data: this.contactList,
      });
    }
  }
}
