import sha3 from 'js-sha3';
import { PBTYPES } from '../core/constants';
import { WS_PROTOCOL, HostURL } from '../../core/config';
import { ConnectCommand } from './ctor/connect';
import { Web3MQRequestMessage } from './ctor/message';
import { getDataSignature, getUserId } from '../core/utils';

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

  const userId = getUserId();
  if (userId == null) {
    alert('GenreateAndSaveKeyPair first');
    return;
  }

  let nodeId = 'nodeId';
  let ts = BigInt(timestamp);
  let prestr = nodeId + userId + ts.toString();
  let signature = (await getDataSignature(prestr)) || '';

  let reqCmd: ConnectCommand = {
    nodeId: nodeId,
    userId: userId,
    timestamp: ts,
    msgSign: signature,
  };

  let bytes = ConnectCommand.toBinary(reqCmd);

  const concatArray = GetContactBytes(PBTYPES.PbTypeConnectReqCommand, bytes);

  return concatArray;
};

export const sendMsg = async (topic: string, msg: string) => {
  const timestamp = BigInt(Date.now());

  const userId = getUserId();

  var byteData = new TextEncoder().encode(msg);

  const msgid = await GenerateMessageID(userId, topic, timestamp, byteData);

  const prestr = userId + topic + msgid + timestamp.toString();
  const fromSign = await getDataSignature(prestr);

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

  let bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PBTYPES.PbTypeMessage, bytes);

  return concatArray;
};
