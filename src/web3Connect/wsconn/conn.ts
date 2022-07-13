import sha3 from 'js-sha3';
import { PBTYPES } from '../core/constants';
import { WS_PROTOCOL, HostURL } from '../../core/config';
import { ConnectCommand } from './ctor/connect';
import { Web3MQRequestMessage } from './ctor/message';
import { byteArrayToHexString } from '../core/utils';
import { LOCALSTORAGE_KEY_MAP } from '../core/constants';
import { sign } from '../core/noble';

async function getDataSignature(msg: string) {
  //   let signature = localStorage.getItem(LOCALSTORAGE_KEY_MAP.SIGNATIRE);
  //   if (!signature) {
  //     const privateKey = localStorage.getItem(LOCALSTORAGE_KEY_MAP.PRIVATEKEY) || '';

  //     //   let signature = await ed.sign(new TextEncoder().encode(msg), PrivateKey);
  //     let bytes = await sign(new TextEncoder().encode(msg), privateKey);

  //     signature = byteArrayToHexString(bytes);

  //     localStorage.setItem(LOCALSTORAGE_KEY_MAP.SIGNATIRE, signature);
  //   }
  const privateKey = localStorage.getItem(LOCALSTORAGE_KEY_MAP.PRIVATEKEY) || '';

  //   let signature = await ed.sign(new TextEncoder().encode(msg), PrivateKey);
  const bytes = await sign(new TextEncoder().encode(msg), privateKey);

  const signature = byteArrayToHexString(bytes);

  return signature;
}

function GetContactBytes(command: any, bytes: Uint8Array) {
  const concatArray = new Uint8Array(bytes.length + 1);
  concatArray[0] = command;
  for (var i = 0; i < bytes.length; i++) {
    concatArray[i + 1] = bytes[i];
  }
  return concatArray;
}

function GenerateMessageID(from: string, topic: string, timestamp: bigint, payload: Uint8Array) {
  return sha3.sha3_224
    .update(from)
    .update(topic)
    .update(timestamp.toString())
    .update(payload)
    .hex();
  return '';
}

//Create Websocket Connect
export const getWSConn = () => {
  const wsurl = WS_PROTOCOL + '://' + HostURL + ':23333/messages';
  const wsconn = new WebSocket(wsurl);
  wsconn.binaryType = 'arraybuffer';
  return wsconn;
};

export const sendConnectReq = async () => {
  const timestamp = Date.now();

  const userId = localStorage.getItem(LOCALSTORAGE_KEY_MAP.USERID);
  if (userId == null) {
    alert('GenreateAndSaveKeyPair first');
    return;
  }

  let nodeId = 'nodeId';
  let ts = BigInt(timestamp);
  let prestr = nodeId + userId + ts.toString();
  let signature = (await getDataSignature(prestr)) || '';
  console.log('======sendConnectReq', signature);

  let reqCmd: ConnectCommand = {
    nodeId: nodeId,
    userId: userId,
    timestamp: ts,
    msgSign: signature,
  };

  console.log('ConnectCommand', ConnectCommand);

  let bytes = ConnectCommand.toBinary(reqCmd);

  const concatArray = GetContactBytes(PBTYPES.PbTypeConnectReqCommand, bytes);
  console.log(concatArray);

  return concatArray;
};

export const sendMsg = async (topic: string, msg: string) => {
  const timestamp = BigInt(Date.now());

  const userId = localStorage.getItem(LOCALSTORAGE_KEY_MAP.USERID) || '';

  var byteData = new TextEncoder().encode(msg);

  const msgid = await GenerateMessageID(userId, topic, timestamp, byteData);

  const prestr = userId + topic + msgid + timestamp.toString();
  const fromSign = await getDataSignature(prestr);
  console.log('======sendMsg', fromSign);

  var needStore = true;
  let msgReq: Web3MQRequestMessage = {
    payload: byteData,
    contentTopic: topic,
    version: 1,
    from: userId,
    fromSign: fromSign,
    payloadType: 'text/plain; charset=utf-8',
    cipherSuite: 'NONE',
    needStore: needStore,
    timestamp: BigInt(timestamp),
    messageId: msgid,
  };
  console.log('SendMsg: ', msgReq);

  let bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PBTYPES.PbTypeMessage, bytes);

  return concatArray;
};
