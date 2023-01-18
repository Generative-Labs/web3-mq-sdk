import { sha3_224 } from 'js-sha3';
import ed from '@noble/ed25519';

import { Client } from '../client';
import { request } from '../core/request';
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
  QrCodeLoginParams,
  QrCodeRegisterParams,
  RegisterParams,
  WalletNameMap,
} from '../types';

export class QrCodeSign {
  private _options: GetMainKeypairParams;
  appKey: string;
  registerSingContent: string;
  mainKeypair: { publicKey: string; secretKey: string } | null;

  constructor(appKey?: string) {
    this.appKey = appKey || '';
    this.registerSingContent = '';
    this._options = { did_value: '', did_type: 'eth', password: '' };
    this.mainKeypair = null;
  }

  getMainKeypairSignContent = async (
    options: GetMainKeypairParams,
  ): Promise<Record<string, string>> => {
    const { password, did_value, did_type } = options;
    this._options = options;
    const keyIndex = 1;
    const keyMSG = `${did_type}:${did_value}${keyIndex}${password}`;

    const magicString = Uint8ToBase64String(
      new TextEncoder().encode(sha3_224(`$web3mq${keyMSG}web3mq$`)),
    );

    const signContent = `Signing this message will allow this app to decrypt messages in the Web3MQ protocol for the following address: ${did_value}. This won’t cost you anything.

If your Web3MQ wallet-associated password and this signature is exposed to any malicious app, this would result in exposure of Web3MQ account access and encryption keys, and the attacker would be able to read your messages.

In the event of such an incident, don’t panic. You can call Web3MQ’s key revoke API and service to revoke access to the exposed encryption key and generate a new one!

Nonce: ${magicString}`;

    return { signContent };
  };

  getMainKeypair = async (signature: string) => {
    const secretKey = sha256(signature);
    const { password } = this._options;

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

    const mainKeypair = {
      publicKey: ByteArrayToHexString(publicKey),
      secretKey: encrytDataStr,
    };
    this.mainKeypair = mainKeypair;
    return mainKeypair;
  };

  getRegisterSignContent = async (options: {
    userid: string;
    signContentURI?: string;
  }): Promise<Record<string, string>> => {
    if (!this.mainKeypair) {
      throw new Error('Then MainKeypair does not exist');
    }

    const { did_type, did_value } = this._options;
    const { publicKey: mainPubkey } = this.mainKeypair;
    const { userid, signContentURI = window.location.origin } = options;

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

    this.registerSingContent = signContent;
    return { signContent };
  };

  qrCodeRegister = async (options: QrCodeRegisterParams) => {
    const { userid, signature, did_pubkey = '', nickname, avatar_url, avatar_base64 } = options;

    if (!this.mainKeypair) {
      throw new Error('The MainKeypair does not exist');
    }

    const { publicKey: pubkey_value } = this.mainKeypair;
    const { did_type, did_value } = this._options;
    const pubkey_type = 'ed25519';
    const timestamp = Date.now();

    const payload: RegisterParams = {
      userid,
      did_type,
      did_value,
      did_pubkey,
      did_signature: signature,
      signature_content: this.registerSingContent,
      pubkey_type,
      pubkey_value,
      nickname,
      avatar_url,
      avatar_base64,
      timestamp: timestamp,
      testnet_access_key: this.appKey,
    };

    try {
      const data = await userRegisterRequest(payload);
      return { ...data };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  qrCodeLogin = async (options: QrCodeLoginParams) => {
    const {
      userid,
      did_type,
      did_value,
      password = this._options.password,
      mainPrivateKey,
      mainPublicKey,
      pubkeyExpiredTimestamp = Date.now() + 86400 * 1000,
    } = options;

    if (!password) {
      throw new Error('The Password does not exist');
    }
    
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

  signWithQrCode = (signContent: string, didValue: string): void => {
    Client.qrCodeClient.sendSignatureCommand({ signContent, didValue });
  };
}
