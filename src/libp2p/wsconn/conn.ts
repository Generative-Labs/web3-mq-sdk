import { PbTypes } from '../core/constants';
import { WS_PROTOCOL, HostURL } from '../../core/config';
import { ConnectCommand } from '../ctor/connect';
import { Web3MQRequestMessage } from '../ctor/message';
import { GetContactBytes, GenerateMessageID, getDataSignature } from './util';

//Create Websocket Connect
export const getWSConn = () => {
  const wsurl = WS_PROTOCOL + '://' + HostURL + ':23333/messages';
  const wsconn = new WebSocket(wsurl);
  wsconn.binaryType = 'arraybuffer';
  return wsconn;
};

export const sendConnectReq = async () => {
  const timestamp = Date.now();

  const userId = localStorage.getItem('UserId');
  if (userId == null) {
    alert('GenreateAndSaveKeyPair first');
    return;
  }

  let signature = '';

  let nodeId = 'nodeId';
  let ts = BigInt(timestamp);
  let prestr = nodeId + userId + ts.toString();
  signature = await getDataSignature(prestr);

  let reqCmd: ConnectCommand = {
    nodeId: nodeId,
    userId: userId,
    timestamp: ts,
    msgSign: signature,
  };

  console.log('ConnectCommand', ConnectCommand);

  let bytes = ConnectCommand.toBinary(reqCmd);

  const concatArray = GetContactBytes(PbTypes.PbTypeConnectReqCommand, bytes);
  console.log(concatArray);

  return concatArray;
};

export const sendMsg = async (topic: string, msg: string) => {
  const timestamp = BigInt(Date.now());

  const userId = localStorage.getItem('UserId');
  if (userId == null) {
    alert('GenreateAndSaveKeyPair first');
    return;
  }

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
  console.log('SendMsg: ', msgReq);

  let bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PbTypes.PbTypeMessage, bytes);

  return concatArray;
};
