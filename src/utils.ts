import ed from '@noble/ed25519';
import jssha256 from 'js-sha256';
import axios from 'axios';

import type { Client } from './client';
import { DidType, EnvTypes, MessageItemType, SendMsgLoadingMap } from './types';
import { domainUrlList } from './core/config';
import { getUserInfoRequest, getUserPublicProfileRequest } from './api';
import { Web3MQMessageStatusResp, Web3MQRequestMessage } from './pb';

export {
  userLoginRequest,
  getUserInfoRequest,
  getUserPublicProfileRequest,
  getPublicFollowerListRequest,
  getPublicFollowingListRequest,
} from './api';

export const ByteArrayToHexString = (byteArray: Iterable<unknown> | ArrayLike<unknown>) => {
  return Array.from(byteArray, (byte: any) => ('0' + (byte & 0xff).toString(16)).slice(-2)).join(
    '',
  );
};

const Uint8ToBase64String = (u8a: any) => {
  return btoa(String.fromCharCode.apply(null, u8a));
};

export const GetContactBytes = (command: any, bytes: Uint8Array) => {
  // client category type
  const categoryType = 10;
  const concatArray = new Uint8Array([categoryType, command, ...bytes]);
  return concatArray;
};

export const GenerateEd25519KeyPair = async () => {
  let privateObj = ed.utils.randomPrivateKey();
  let pubkeyObj = await ed.getPublicKey(privateObj);
  let PrivateKey = ByteArrayToHexString(privateObj);
  let PublicKey = ByteArrayToHexString(pubkeyObj);
  return {
    PrivateKey,
    PublicKey,
  };
};

// export const GenerateQrCode = async (text: string) => {
//   try {
//     return await QRCode.toDataURL(text);
//   } catch (err: any) {
//     throw new Error(err.message);
//   }
// };

export const sha256 = (data: string | Uint8Array): Uint8Array => {
  return new Uint8Array(jssha256.sha256.digest(data));
};

export const DownloadKeyPair = (text: string, filename: string = 'KeyPairs') => {
  const aTag = document.createElement('a');
  aTag.download = filename;
  // @ts-ignore
  aTag.style = 'display: none';
  aTag.href = `data:text/txt;charset=utf-8,${text}`;
  document.body.appendChild(aTag);
  aTag.click();
};

export const GenerateRandomSixCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += String(Math.floor(Math.random() * 10));
  }
  return code;
};

export const getDataSignature = async (PrivateKey: string, signContent: string) => {
  if (!PrivateKey) {
    throw new Error('Ed25519PrivateKey not found');
  }
  const signature = await ed.sign(new TextEncoder().encode(signContent), PrivateKey);
  return Uint8ToBase64String(signature);
};

export const getCurrentDate = () => {
  const d = new Date();
  return (
    ('0' + d.getDate()).slice(-2) +
    '/' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '/' +
    d.getFullYear() +
    ' ' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2)
  );
};

const base64ToString = (str: string) => {
  const u = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(u);
};

export const selectUrl = (url: string, type: string = 'http') => {
  if (type === 'ws') {
    let Domain: string = url.split('://')[1];
    return `wss://${Domain}/messages`;
  }
  return url;
};

// eslint-disable-next-line no-unused-vars
const getServerList = async (arr: any[]) => {
  let serverList = [];
  for (let i = 0; i < arr.length; i++) {
    const domain = arr[i];
    try {
      // eslint-disable-next-line no-unused-vars
      serverList = await (await axios.get(`${domain}/api/server-list/`)).data.data;
      break;
    } catch (error) {
      continue;
    }
  }
  return serverList;
};

export const getAllDomainList = async (env: EnvTypes) => {
  const list = await getServerList(domainUrlList[env]);

  const timestamp = Date.now();
  let requestQueue = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i].endpoint;
    try {
      const { headers } = await axios.head(`${item}/api/ping/`);
      const timeDifference = new Date(headers.date).valueOf() - timestamp;
      requestQueue.push({
        time: timeDifference,
        url: item,
        serverRate: headers['server-rate'],
        nodeId: headers.nodeid,
      });
    } catch (error) {
      console.log(error);
    }
  }
  return requestQueue;
};

const handleSort = (key: string) => {
  return (a: any, b: any) => {
    const val1 = Number(a[key]);
    const val2 = Number(b[key]);
    return val1 - val2;
  };
};

export const getFastestUrl = async (env: EnvTypes = 'test') => {
  const list = await getAllDomainList(env);
  // Sorting strategy
  return list.sort(handleSort('time'))[0].url;
};

export const newRenderMessagesList = (msglist: any) => {
  let messages = [];
  for (let idx = 0; idx < msglist.length; idx++) {
    let msg = msglist[idx];
    let content = '';
    let contentType: 'text';
    if (msg.cipher_suite === 'NONE') {
      content = base64ToString(msg.payload);
      contentType = 'text';
    } else {
      throw new Error('This message decode error');
    }
    const { dateStr, timeStr } = getDateTimes(Number(msg.timestamp));
    // const userInfo = await getUserPublicInfo(msg.from);
    const item: MessageItemType = {
      senderId: msg.from,
      topic: msg.topic,
      chatId: msg.topic,
      content,
      contentType,
      messageId: msg.messageid,
      date: dateStr,
      time: timeStr,
      timestamp: msg.timestamp,
      msgLoading: SendMsgLoadingMap['success'],
    };
    messages.push(item);
  }
  return messages;
};

export const getGroupId = (msg: any, client: Client): string => {
  const { comeFrom, contentTopic } = msg;
  const { userid } = client.keys;
  if (contentTopic === userid) {
    return comeFrom;
  }
  return contentTopic;
};

export const renderReceiveMessage = (msg: Web3MQRequestMessage): MessageItemType => {
  const { messageId, timestamp, payload, contentTopic, comeFrom } = msg;
  let content = new TextDecoder().decode(payload);
  const { dateStr, timeStr } = getDateTimes(Number(timestamp));
  // const userInfo = await getUserPublicInfo(comeFrom);
  const item: MessageItemType = {
    senderId: comeFrom,
    topic: contentTopic,
    chatId: contentTopic,
    content,
    contentType: 'text',
    messageId,
    date: dateStr,
    time: timeStr,
    timestamp: Number(timestamp),
    msgLoading: SendMsgLoadingMap['success'],
  };
  return item;
};

export const transformAddress = async (walletAddress: string, didType: DidType = 'eth') => {
  if (walletAddress.toLowerCase().startsWith('0x')) {
    const cacheUserId = localStorage.getItem(walletAddress);
    if (cacheUserId) {
      return cacheUserId;
    }
    const { data } = await getUserInfoRequest({
      did_type: didType,
      did_value: walletAddress,
      timestamp: Date.now(),
    });
    const userid = data.userid;
    localStorage.setItem(walletAddress, userid);
    return userid;
  }
  return walletAddress;
};

export const saveMessageUpdateDate = () => {
  localStorage.setItem('MESSAGEUPDATEDATE', String(Date.now()));
};

export const getMessageUpdateDate = () => {
  return Number(localStorage.getItem('MESSAGEUPDATEDATE'));
};

export const updateMessageLoadStatus = (
  msgList: MessageItemType[],
  msg: Web3MQMessageStatusResp,
  status = SendMsgLoadingMap['success'],
) => {
  const message = msgList.find((item: any) => item.messageId === msg.messageId);
  if (message) {
    (message as any).msgLoading = status;
  }
  return msgList;
};

export function newDateFormat(time: number, format?: string) {
  const t = new Date(time);
  format = format || 'Y-m-d h:i:s';
  let year = t.getFullYear();
  let month = t.getMonth() + 1;
  let day = t.getDate();
  let hours = t.getHours();
  let minutes = t.getMinutes();
  let seconds = t.getSeconds();

  const hash = {
    y: year,
    m: month,
    d: day,
    h: hours,
    i: minutes,
    s: seconds,
  };
  // is need  0
  const isAddZero = (o: string) => {
    return /M|D|H|I|S/.test(o);
  };
  return format.replace(/\w/g, (o) => {
    // @ts-ignore
    let rt = hash[o.toLocaleLowerCase()];
    if (typeof rt === 'string') return rt;
    return rt >= 10 || isAddZero(o) ? rt : `0${rt}`;
  });
}

export const getUserPublicInfo = async (userid: string) => {
  const cacheUserInfo = localStorage.getItem(`user_info_${userid}`);
  let userInfo;
  if (cacheUserInfo) {
    userInfo = JSON.parse(cacheUserInfo);
  } else {
    const { data } = await getUserPublicProfileRequest({
      did_type: 'web3mq',
      did_value: userid,
      timestamp: Date.now(),
      my_userid: '',
    });
    localStorage.setItem(`user_info_${userid}`, JSON.stringify(data));
    userInfo = data;
  }
  return userInfo;
};

export const getDateTimes = (timestamp: number) => {
  let date = new Date(timestamp);
  let timeStr = date.getHours() + ':' + date.getMinutes();
  let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  return {
    timeStr,
    timestamp,
    dateStr,
  };
};
