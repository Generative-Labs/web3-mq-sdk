import ed from '@noble/ed25519';
import { sha3_224 } from 'js-sha3';
import { ClientKeyPaires } from './types';
import { ConnectCommand, Web3MQRequestMessage } from './pb';
import { PbTypeConnectReqCommand, PbTypeMessage } from './core/pbType';

const ByteArrayToHexString = (byteArray: Iterable<unknown> | ArrayLike<unknown>) => {
  return Array.from(byteArray, (byte: any) => ('0' + (byte & 0xff).toString(16)).slice(-2)).join(
    '',
  );
};

const Uint8ToBase64String = (u8a: any) => {
  return btoa(String.fromCharCode.apply(null, u8a));
};

const GenerateMessageID = async (
  from: string,
  topic: string,
  timestamp: number,
  payload: Uint8Array,
) => {
  return sha3_224.update(from).update(topic).update(timestamp.toString()).update(payload).hex();
};

export const GetContactBytes = (command: any, bytes: Uint8Array) => {
  const concatArray = new Uint8Array(bytes.length + 1);
  concatArray[0] = command;
  for (let i = 0; i < bytes.length; i++) {
    concatArray[i + 1] = bytes[i];
  }
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

export const DownloadKeyPair = (text: string, filename: string = 'KeyPairs') => {
  const aTag = document.createElement('a');
  aTag.download = filename;
  // @ts-ignore
  aTag.style = 'display: none';
  aTag.href = `data:text/txt;charset=utf-8,${text}`;
  document.body.appendChild(aTag);
  aTag.click();
};

export const getDataSignature = async (PrivateKey: string, msg: string) => {
  if (!PrivateKey) {
    throw new Error('Ed25519PrivateKey not found');
  }
  const signature = await ed.sign(new TextEncoder().encode(msg), PrivateKey);
  return Uint8ToBase64String(signature);
};

export const getParams = async (keys: ClientKeyPaires) => {
  const { userid, PrivateKey } = keys;
  const timestamp = Date.now();
  const signature = await getDataSignature(PrivateKey, userid + timestamp);
  return {
    userid,
    signature,
    timestamp,
  };
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

export const sendConnectCommand = async (keys: ClientKeyPaires): Promise<Uint8Array> => {
  const { PrivateKey, userid } = keys;
  const timestamp = Date.now();
  let nodeId = 'nodeId';
  let ts = BigInt(timestamp);

  let prestr = nodeId + userid + ts.toString();

  const signature = await getDataSignature(PrivateKey, prestr);

  const reqCmd: ConnectCommand = {
    nodeId,
    userId: userid,
    timestamp: ts,
    msgSign: signature,
  };

  const bytes = ConnectCommand.toBinary(reqCmd);
  const concatArray = GetContactBytes(PbTypeConnectReqCommand, bytes);

  return concatArray;
};

export const sendMessageCommand = async (
  keys: ClientKeyPaires,
  topic: string,
  msg: string,
): Promise<Uint8Array> => {
  const { userid, PrivateKey } = keys;
  const timestamp = Date.now();
  const cipherSuite = 'NONE';
  const NodeId = '';
  var byteData = new TextEncoder().encode(msg);

  const msgid = await GenerateMessageID(userid, topic, timestamp, byteData);

  const prestr = msgid + userid + topic + NodeId + timestamp.toString();
  const fromSign = await getDataSignature(PrivateKey, prestr);

  const needStore = true;

  const msgReq: Web3MQRequestMessage = {
    payload: byteData,
    contentTopic: topic,
    version: 1,
    comeFrom: userid,
    fromSign: fromSign,
    payloadType: 'text/plain; charset=utf-8',
    cipherSuite: cipherSuite,
    needStore: needStore,
    timestamp: BigInt(timestamp),
    messageId: msgid,
    nodeId: NodeId,
  };

  const bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PbTypeMessage, bytes);
  return concatArray;
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

export const selectUrl = (type: string = 'http', url: string = 'us-west-2.web3mq.com') => {
  let Domain: string = url;
  // Domain = 'ap-singapore-1.web3mq.com';

  const BASE_URL = `https://${Domain}`;
  const BASE_WS = `ws://${Domain}/messages`;

  if (type === 'ws') {
    return BASE_WS;
  }
  return BASE_URL;
};
