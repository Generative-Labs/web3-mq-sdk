import { sha3_224 } from 'js-sha3';
import ed from '@noble/ed25519';

import { Client } from '../client';
import { userLoginRequest, userRegisterRequest } from '../api';
import {
  ByteArrayToHexString,
  GenerateEd25519KeyPair,
  getCurrentDate,
  getDataSignature,
  sha256,
} from '../utils';
import {
  aesGCMDecrypt,
  aesGCMEncrypt,
  Base64StringToUint8,
  GetAESBase64Key,
  Uint8ToBase64String,
} from '../encryption';
import {
  GetMainKeypairParams,
  LoginParams,
  RegisterParams,
  SignMetaMaskParams,
  WalletNameMap,
  WalletType,
} from '../types';

export const getMainKeypairSignContent = async (options: GetMainKeypairParams): Promise<string> => {
  const { password, did_value, did_type } = options;
  const keyIndex = 1;
  const keyMSG = `${did_type}:${did_value}${keyIndex}${password}`;

  const magicString = Uint8ToBase64String(
    new TextEncoder().encode(sha3_224(`$web3mq${keyMSG}web3mq$`)),
  );

  const signContent = `Signing this message will allow this app to decrypt messages in the Web3MQ protocol for the following address: ${did_value}. This won’t cost you anything.

If your Web3MQ wallet-associated password and this signature is exposed to any malicious app, this would result in exposure of Web3MQ account access and encryption keys, and the attacker would be able to read your messages.

In the event of such an incident, don’t panic. You can call Web3MQ’s key revoke API and service to revoke access to the exposed encryption key and generate a new one!

Nonce: ${magicString}`;

  return signContent;
};

export const getMainKeypair = async (signature: string, password: string) => {
  const secretKey = sha256(signature);

  if (secretKey.length !== 32) {
    throw new Error('Secret key must have 32 bytes');
  }

  const publicKey = await ed.getPublicKey(secretKey);
  const AesKey = await GetAESBase64Key(password);
  const AesIv = AesKey.slice(0, 16);
  const encrytData = await aesGCMEncrypt(
    AesKey,
    AesIv,
    new TextEncoder().encode(ByteArrayToHexString(secretKey)),
  );
  const encrytDataStr = Uint8ToBase64String(new Uint8Array(encrytData));

  return {
    publicKey: ByteArrayToHexString(publicKey),
    secretKey: encrytDataStr,
  };
};

export const getRegisterSignContent = async (options: {
  mainPubkey: string;
  did_type: WalletType;
  did_value: string;
  userid: string;
  signContentURI?: string;
}) => {
  const {
    mainPubkey,
    did_type,
    did_value,
    userid,
    signContentURI = window.location.origin,
  } = options;

  const wallet_type_name = WalletNameMap[did_type];
  const pubkey_type = 'ed25519';
  const timestamp = Date.now();
  const NonceContent = sha3_224(
    userid + pubkey_type + mainPubkey + did_type + did_value + timestamp,
  );

  const signContent = `Web3MQ wants you to sign in with your ${wallet_type_name} account:
${did_value}
For Web3MQ register
URI: ${signContentURI}
Version: 1

Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

  return { signContent, pubkey_type, timestamp, NonceContent };
};

export const qrCodeRegister = async (options: any) => {
  const {
    signature,
    signContent,
    userid,
    did_type,
    did_value,
    did_pubkey,
    pubkey_type,
    pubkey_value,
    nickname,
    avatar_url,
    avatar_base64,
    timestamp,
    secretKey,
  } = options;

  const payload: RegisterParams = {
    userid,
    did_type,
    did_value,
    did_pubkey,
    did_signature: signature,
    signature_content: signContent,
    pubkey_type,
    pubkey_value,
    nickname,
    avatar_url,
    avatar_base64,
    timestamp: timestamp,
    testnet_access_key: Client.register.appKey,
  };

  try {
    const data = await userRegisterRequest(payload);
    return { mainPrivateKey: secretKey, mainPublicKey: pubkey_value, ...data };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const qrCodeLogin = async (options: SignMetaMaskParams) => {
  const {
    password,
    userid,
    did_value,
    did_type = 'eth',
    mainPrivateKey = '',
    mainPublicKey = '',
    pubkeyExpiredTimestamp = Date.now() + 86400 * 1000,
  } = options;

  if (!mainPrivateKey || !mainPublicKey) {
    throw new Error('The MainKeypair does not exist');
  }

  const timestamp = Date.now();

  const { PublicKey, PrivateKey } = await GenerateEd25519KeyPair();

  const signContent = sha3_224(userid + PublicKey + pubkeyExpiredTimestamp + timestamp);

  const AesKey = await GetAESBase64Key(password);
  const AesIv = AesKey.slice(0, 16);
  const decode_data = await aesGCMDecrypt(AesKey, AesIv, Base64StringToUint8(mainPrivateKey));
  const decode_dataStr = new TextDecoder().decode(new Uint8Array(decode_data));

  const login_signature = await getDataSignature(decode_dataStr, signContent);

  const payload: LoginParams = {
    userid,
    did_type,
    did_value,
    login_signature,
    signature_content: signContent,
    main_pubkey: mainPublicKey,
    pubkey_value: PublicKey,
    pubkey_type: 'ed25519',
    timestamp,
    pubkey_expired_timestamp: pubkeyExpiredTimestamp,
  };

  try {
    await userLoginRequest(payload);
    // @ts-ignore
    request.defaults.headers['web3mq-request-pubkey'] = PublicKey;
    // @ts-ignore
    request.defaults.headers['didkey'] = `${did_type}:${did_value}`;
    return {
      TempPrivateKey: PrivateKey,
      TempPublicKey: PublicKey,
      mainPrivateKey,
      mainPublicKey,
      pubkeyExpiredTimestamp,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signWithQrCode = (signContent: string, didValue: string): void => {
  Client.qrCodeClient.sendSignatureCommand({ signContent, didValue });
};
