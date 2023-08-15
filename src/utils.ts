import ed from '@noble/ed25519';
import jssha256 from 'js-sha256';
import axios from 'axios';

import type { Client } from './client';
import { DidType, EnvTypes, SendMsgLoadingMap} from './types';
import { PbTypeMessage, PbTypeMessageStatusResp } from './core/pbType';
import { domainUrlList } from './core/config';
import { getUserInfoRequest } from './api';

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

export const renderMessagesList = async (msglist: any) => {
  return msglist.map((msg: any, idx: number) => {
    let content = '';
    if (msg.cipher_suite == 'NONE') {
      content = decodeURIComponent(escape(window.atob(msg.payload)));
    }
    // else if (msg.cipher_suite == 'RSA_OAEP') {
    //   if (msg.payload) {
    //     let byteContent = Uint8Array.from(atob(msg.payload), (c) => c.charCodeAt(0));

    //     let decodeBytes = await getRsaDecryptData(RsaPrivateKeyStr ?? '', byteContent);
    //     content = new TextDecoder().decode(decodeBytes);
    //   } else {
    //     content = '';
    //   }
    // }
    else {
      content = '不支持的加密类型 ' + msg.cipher_suite;
    }
    let date = new Date(msg.timestamp);

    let timestampStr = date.getHours() + ':' + date.getMinutes();

    let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    let message = {
      _id: idx + 1,
      id: idx + 1,
      indexId: idx + 1,
      content: content,
      senderId: msg.from,
      username: '',
      avatar: 'assets/imgs/doe.png',
      // date: "13 November",
      // timestamp: "10:20",
      date: dateStr,
      timestamp: timestampStr,
      system: false,
      saved: false,
      distributed: true,
      seen: true,
      failure: false,
    };
    return message;
  });
};

export const getGroupId = (msg: any, client: Client): string => {
  const { comeFrom, contentTopic } = msg;
  const { userid } = client.keys;
  if (contentTopic === userid) {
    return comeFrom;
  }
  return contentTopic;
};

export const renderMessage = (
  pbType: number,
  msg: { messageId: string; timestamp: bigint; payload?: any },
  client: Client,
) => {
  const { messageId, timestamp, payload } = msg;

  let content = '';
  let senderId = '';
  if (pbType === PbTypeMessage) {
    // received message
    content = new TextDecoder().decode(payload);
    senderId = getGroupId(msg, client);
  }
  if (pbType === PbTypeMessageStatusResp) {
    // send message
    content = client.message.msg_text;
    senderId = client.keys.userid;
  }

  let date =
    pbType === PbTypeMessage ? new Date(Number(timestamp)) : new Date(Number(timestamp) * 1000);

  let timestampStr = date.getHours() + ':' + date.getMinutes();

  let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

  let message: any = {
    _id: messageId,
    id: messageId,
    indexId: messageId,
    // 只有receive时为success
    msgLoading: pbType === PbTypeMessage ? SendMsgLoadingMap['success'] : SendMsgLoadingMap['loading'],
    content,
    senderId,
    username: '',
    avatar: 'assets/imgs/doe.png',
    // date: "13 November",
    // timestamp: "10:20",
    date: dateStr,
    timestamp: timestampStr,
    system: false,
    saved: false,
    distributed: true,
    seen: true,
    failure: false,
  };
  return message;
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
  msgList: Array<any>,
  msg: any,
  status = SendMsgLoadingMap['success'],
) => {
  const message = msgList.find((item: any) => item.id === msg.id);
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
  // 是否补 0
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
