import { sha3_224 } from 'js-sha3';

import {
  ConnectCommand,
  UserTempConnectCommand,
  Web3MQBridgeConnectCommand,
  Web3MQRequestMessage,
} from '../pb';
import {
  PbTypeConnectReqCommand,
  PbTypeMessage,
  PbTypeUserTempConnectReqCommand,
  PbTypeWeb3MQBridgeConnectCommand,
} from '../core/pbType';
import { GetContactBytes, getDataSignature } from '../utils';
import { ClientKeyPaires, SendTempConnectOptions, SendWeb3MQBridgeOptions } from '../types';

const GenerateMessageID = async (
  from: string,
  topic: string,
  timestamp: number,
  payload: Uint8Array,
) => {
  return sha3_224.update(from).update(topic).update(timestamp.toString()).update(payload).hex();
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

export const sendTempConnectCommand = async (
  options: SendTempConnectOptions,
): Promise<Uint8Array> => {
  const { dAppID, topicID, signatureTimestamp, dAppSignature } = options;

  const reqCmd: UserTempConnectCommand = {
    nodeID: '',
    dAppID,
    topicID: topicID.toLowerCase(),
    signatureTimestamp: BigInt(signatureTimestamp),
    dAppSignature,
  };

  const bytes = UserTempConnectCommand.toBinary(reqCmd);
  const concatArray = GetContactBytes(PbTypeUserTempConnectReqCommand, bytes);

  return concatArray;
};

export const sendDappBridgeCommand = async (options: any) => {
  const { nodeId, payload, contentTopic, comeFrom } = options;

  const timestamp = Date.now();
  const cipherSuite = 'NONE';
  const needStore = true;

  const reqCmd: Web3MQRequestMessage = {
    payload,
    contentTopic,
    version: 1,
    comeFrom,
    fromSign: '',
    payloadType: 'application/json',
    cipherSuite,
    needStore,
    timestamp: BigInt(timestamp),
    messageId: '',
    nodeId,
    messageType: 'dapp_bridge',
    validatePubKey: '',
    extraData: {},
  };

  const bytes = Web3MQRequestMessage.toBinary(reqCmd);
  const concatArray = GetContactBytes(PbTypeMessage, bytes);

  return concatArray;
};

export const sendMessageCommand = async (
  keys: ClientKeyPaires,
  topic: string,
  msg: string,
  nodeId: string,
): Promise<{ concatArray: Uint8Array; msgid: string }> => {
  const { userid, PrivateKey, PublicKey } = keys;
  const timestamp = Date.now();
  const cipherSuite = 'NONE';
  const byteData = new TextEncoder().encode(msg);

  const msgid = await GenerateMessageID(userid, topic, timestamp, byteData);

  const signContent = msgid + userid + topic + nodeId + timestamp.toString();
  const fromSign = await getDataSignature(PrivateKey, signContent);

  const needStore = true;

  const msgReq: Web3MQRequestMessage = {
    payload: byteData,
    contentTopic: topic,
    version: 1,
    comeFrom: userid,
    fromSign,
    payloadType: 'text/plain; charset=utf-8',
    cipherSuite: cipherSuite,
    needStore: needStore,
    timestamp: BigInt(timestamp),
    messageId: msgid,
    nodeId,
    validatePubKey: PublicKey,
    extraData: {},
  };

  const bytes = Web3MQRequestMessage.toBinary(msgReq);

  const concatArray = GetContactBytes(PbTypeMessage, bytes);
  return { concatArray, msgid };
};

export const sendWeb3mqBridgeCommand = async (
  options: SendWeb3MQBridgeOptions,
): Promise<Uint8Array> => {
  const { nodeID, dAppID, topicID, signatureTimestamp = 0, dAppSignature = '' } = options;

  const reqCmd: UserTempConnectCommand = {
    nodeID,
    dAppID,
    topicID,
    signatureTimestamp: BigInt(signatureTimestamp),
    dAppSignature,
  };

  const bytes = Web3MQBridgeConnectCommand.toBinary(reqCmd);
  const concatArray = GetContactBytes(PbTypeWeb3MQBridgeConnectCommand, bytes);

  return concatArray;
};

export const sendWeb3mqSignatureCommand = async (options: any) => {
  const { nodeId, payload, contentTopic, comeFrom, validatePubKey, PrivateKey } = options;

  const timestamp = Date.now();
  const cipherSuite = 'NONE';
  const needStore = true;
  const msgid = await GenerateMessageID(contentTopic, contentTopic, timestamp, payload);

  const signContent = msgid + contentTopic + contentTopic + nodeId + timestamp.toString();

  const fromSign = await getDataSignature(PrivateKey, signContent);

  const reqCmd: Web3MQRequestMessage = {
    payload,
    contentTopic,
    version: 1,
    comeFrom,
    fromSign,
    payloadType: 'application/json',
    cipherSuite,
    needStore,
    timestamp: BigInt(timestamp),
    messageId: msgid,
    nodeId,
    messageType: 'Web3MQ/bridge',
    validatePubKey,
    extraData: {},
  };

  console.log(reqCmd);

  const bytes = Web3MQRequestMessage.toBinary(reqCmd);
  const concatArray = GetContactBytes(PbTypeMessage, bytes);

  return concatArray;
};
