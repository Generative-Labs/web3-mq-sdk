/* eslint-disable indent */
import { LOCALSTORAGE_KEY_MAP } from './constants';
import { PLATFORM_ENUM, MemberUserInfo, MessageResponse, MsgTypeEnum } from '../../types';
export function byteArrayToHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

export const isExpired = () => {
  const token = localStorage.getItem(LOCALSTORAGE_KEY_MAP.ACCESS_TOKEN) || '';
  if (token === '') {
    return false;
  }
  const accessExpiredAt = getUserInfoFromToken().access_expired_at || 0;
  const timestamp = Math.floor(Date.now() / 1000);
  return timestamp >= accessExpiredAt;
};

export const parseJwt = (str: string) => {
  return JSON.parse(
    decodeURIComponent(escape(window.atob(str.replace(/-/g, '+').replace(/_/g, '/')))) || '{}',
  );
};

export const getToken = () => {
  let key = LOCALSTORAGE_KEY_MAP.ACCESS_TOKEN;
  if (localStorage.getItem(key)) {
    return `Bearer ${localStorage.getItem(key)}`;
  }
  return '';
};

export const setToken = (token: string) => {
  let key = LOCALSTORAGE_KEY_MAP.ACCESS_TOKEN;
  localStorage.setItem(key, token);
};

export const getUserAvatar = (userInfo: MemberUserInfo) => {
  let platforms = [PLATFORM_ENUM.TWITTER, PLATFORM_ENUM.OPENSEA, PLATFORM_ENUM.DISCORD];
  let platform = platforms.find((item) => !!userInfo[`${item}_username`]);
  if (platform) {
    return {
      avatar: userInfo[`${platform}_avatar`],
      userName: userInfo[`${platform}_username`],
    };
  }
  return {};
};

export const getUserInfoFromToken = () => {
  //   const token = localStorage.getItem(LOCALSTORAGE_KEY_MAP.ACCESS_TOKEN) || '';

  //   const tokenArr = token.substring(7).split('.');
  //   const userInfo = parseJwt(tokenArr[1]);
  //   userInfo.avatar = getUserAvatar(userInfo).avatar;
  //   userInfo.user_name = getUserAvatar(userInfo).userName;
  //   localStorage.setItem(LOCALSTORAGE_KEY_MAP.USER_INFO, JSON.stringify(userInfo));
  //   return userInfo;
  return {
    access_expired_at: 0,
    created_at: 0,
    discord_avatar: '',
    discord_username: '',
    eth_wallet_address: '',
    facebook_avatar: '',
    facebook_username: '',
    instagram_avatar: '',
    instagram_username: '',
    nick_name: '',
    opensea_avatar: '',
    opensea_username: '',
    refresh_expired_at: 0,
    status: '',
    twitter_avatar: '',
    twitter_username: '',
    user_id: '',
  };
};

export const hasNotifyPermission = async () => {
  if (!('Notification' in window)) {
    return false;
    // alert('This browser does not support desktop notification');
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return true;
    }
  }
  return false;
};

export const isCurrentWindow = () => {
  return document.visibilityState === 'visible';
};

export const notifyMessage = (message: MessageResponse) => {
  const { msg_type, msg_contents } = message;
  switch (msg_type) {
    case MsgTypeEnum.text:
      return msg_contents;
    case MsgTypeEnum.sudoSwapCard:
      return 'You receive a sudoSwap message';
    default:
      return '';
  }
};
