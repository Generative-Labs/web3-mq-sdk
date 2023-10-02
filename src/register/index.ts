import { sha3_224 } from 'js-sha3';
import ed from '@noble/ed25519';
import { request } from '../core/request';
import { getEthAccount, signWithEth } from './eth';
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
  getUserInfoRequest,
  resetPasswordRequest,
  userLoginRequest,
  userRegisterRequest,
} from '../api';
import {
  GetMainKeypairParams,
  GetUserInfoParams,
  LoginByKeysParams,
  LoginApiParams,
  RegisterBySignParams,
  RegisterApiParams,
  WalletNameMap,
  WalletSignRes,
  WalletType,
  LoginResponse,
  GetUserInfoResponse,
  GetSignContentResponse,
  GetRegisterSignContentParams,
  MainKeypairType,
  ResetPasswordParams,
  AccountType,
  BlockChainMap,
  BlockChainType, GetSignContentForRegisterParams, RegisterBySignatureParams,
} from '../types';
import { StarknetConnect, WalletId } from './StarknetConnect';

export class Register {
  appKey: string;
  pubicKeyType = 'ed25519';
  registerTime: number;
  registerSignContent: string;
  starknetConnect: StarknetConnect = new StarknetConnect();

  constructor(appKey?: string) {
    this.appKey = appKey || '';
    this.registerTime = 0;
    this.registerSignContent = '';
  }

  getUserInfo = async (
    options: Omit<GetUserInfoParams, 'timestamp'>,
  ): Promise<GetUserInfoResponse> => {
    let userid: string = '';
    let userExist: boolean = false;

    const { did_type, did_value } = options;
    const timestamp = Date.now();

    try {
      const { data } = await getUserInfoRequest({ did_type, did_value, timestamp });
      userid = data.userid;
      if (data.main_pubkey) {
        userExist = true;
      }
    } catch (error) {
      userid = `user:${sha3_224(did_type + did_value + timestamp)}`;
      userExist = false;
    }
    return {
      userid,
      userExist,
    };
  };

  getMainKeypair = async (
    options: GetMainKeypairParams,
  ): Promise<{ publicKey: string; secretKey: string }> => {
    const { password, did_value, did_type } = options;
    const { signContent } = await this.getMainKeypairSignContent(options);
    const { sign: signature } = await this.sign(signContent, did_value, did_type);
    return await this.getMainKeypairBySignature(signature, password);
  };

  register = async (options: RegisterBySignParams) => {
    const {
      userid,
      didValue,
      mainPublicKey,
      signature,
      did_pubkey = '',
      didType = 'metamask',
      nickname = '',
      avatar_url = '',
      avatar_base64 = '',
    } = options;
    if (!this.registerTime || !this.registerSignContent) {
      throw new Error('Please create register sign content first!');
    }

    const payload: RegisterApiParams = {
      userid,
      did_type: BlockChainMap[didType],
      did_value: didValue,
      did_pubkey,
      did_signature: signature,
      signature_content: this.registerSignContent,
      pubkey_type: this.pubicKeyType,
      pubkey_value: mainPublicKey,
      nickname,
      avatar_url,
      avatar_base64,
      timestamp: this.registerTime,
      testnet_access_key: this.appKey,
    };

    try {
      return await userRegisterRequest(payload);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  login = async (options: LoginByKeysParams): Promise<LoginResponse> => {
    const {
      password,
      userid,
      didValue,
      didType = 'metamask',
      mainPrivateKey,
      mainPublicKey,
      pubkeyExpiredTimestamp = Date.now() + 86400 * 1000,
    } = options;
    try {
      const timestamp = Date.now();

      const { PublicKey, PrivateKey } = await GenerateEd25519KeyPair();

      const signContent = sha3_224(userid + PublicKey + pubkeyExpiredTimestamp + timestamp);
      const AesKey = await GetAESBase64Key(password);
      const AesIv = AesKey.slice(0, 16);
      const decode_data = await aesGCMDecrypt(AesKey, AesIv, Base64StringToUint8(mainPrivateKey));
      const decode_dataStr = new TextDecoder().decode(new Uint8Array(decode_data));
      const login_signature = await getDataSignature(decode_dataStr, signContent);

      const payload: LoginApiParams = {
        userid,
        did_type: BlockChainMap[didType],
        did_value: didValue,
        login_signature,
        signature_content: signContent,
        main_pubkey: mainPublicKey,
        pubkey_value: PublicKey,
        pubkey_type: 'ed25519',
        timestamp,
        pubkey_expired_timestamp: pubkeyExpiredTimestamp,
      };
      await userLoginRequest(payload);
      // @ts-ignore
      request.defaults.headers['web3mq-request-pubkey'] = PublicKey;
      // @ts-ignore
      request.defaults.headers['didkey'] = `${didType}:${didValue}`;
      return {
        tempPrivateKey: PrivateKey,
        tempPublicKey: PublicKey,
        mainPrivateKey,
        mainPublicKey,
        pubkeyExpiredTimestamp,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  resetPassword = async (options: ResetPasswordParams) => {
    const {
      userid,
      didValue,
      mainPublicKey,
      signature,
      did_pubkey = '',
      didType = 'metamask',
      nickname = '',
      avatar_url = '',
    } = options;

    if (!this.registerTime || !this.registerSignContent) {
      throw new Error('Please create register sign content first!');
    }
    const payload: RegisterApiParams = {
      userid,
      did_type: BlockChainMap[didType],
      did_value: didValue,
      did_pubkey,
      did_signature: signature,
      signature_content: this.registerSignContent,
      pubkey_type: this.pubicKeyType,
      pubkey_value: mainPublicKey,
      nickname,
      avatar_url,
      timestamp: this.registerTime,
      testnet_access_key: this.appKey,
    };

    try {
      return await resetPasswordRequest(payload);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  sign = async (
    signContent: string,
    address: string,
    walletType: WalletType | BlockChainType,
  ): Promise<WalletSignRes> => {
    switch (walletType) {
      case 'argentX':
      case 'braavos':
        return this.starknetConnect.sign(signContent, address, walletType);
      case 'starknet':
        return this.starknetConnect.starknetSign(signContent, address);
      default:
        return signWithEth(signContent, address);
    }
  };

  getAccount = async (walletType: WalletType): Promise<AccountType> => {
    switch (walletType) {
      case 'argentX':
      case 'braavos':
        return await this.starknetConnect.connect(walletType as WalletId);
      default:
        return await getEthAccount();
    }
  };

  connectWallet = async (walletType: WalletType): Promise<AccountType> => {
    switch (walletType) {
      case 'argentX':
      case 'braavos':
        return await this.starknetConnect.connect(walletType as WalletId);
      default:
        return await getEthAccount();
    }
  };

  getMainKeypairSignContent = async (
    options: GetMainKeypairParams,
  ): Promise<GetSignContentResponse> => {
    const { password, did_value, did_type } = options;
    const didType = BlockChainMap[did_type];
    const keyIndex = 1;
    const keyMSG = `${didType}:${did_value}${keyIndex}${password}`;

    const magicString = Uint8ToBase64String(
      new TextEncoder().encode(sha3_224(`$web3mq${keyMSG}web3mq$`)),
    );

    const signContent = `Signing this message will allow this app to decrypt messages in the Web3MQ protocol for the following address: ${did_value}. This won’t cost you anything.

If your Web3MQ wallet-associated password and this signature is exposed to any malicious app, this would result in exposure of Web3MQ account access and encryption keys, and the attacker would be able to read your messages.

In the event of such an incident, don’t panic. You can call Web3MQ’s key revoke API and service to revoke access to the exposed encryption key and generate a new one!

Nonce: ${magicString}`;

    return { signContent };
  };
  getSignContentForMainKeys = async (options: {
    password: string;
    didValue: string;
    didType: BlockChainType;
  }): Promise<GetSignContentResponse> => {
    const { password, didType, didValue } = options;
    const keyIndex = 1;
    const keyMSG = `${didType}:${didValue}${keyIndex}${password}`;

    const magicString = Uint8ToBase64String(
      new TextEncoder().encode(sha3_224(`$web3mq${keyMSG}web3mq$`)),
    );

    const signContent = `Signing this message will allow this app to decrypt messages in the Web3MQ protocol for the following address: ${didValue}. This won’t cost you anything.

If your Web3MQ wallet-associated password and this signature is exposed to any malicious app, this would result in exposure of Web3MQ account access and encryption keys, and the attacker would be able to read your messages.

In the event of such an incident, don’t panic. You can call Web3MQ’s key revoke API and service to revoke access to the exposed encryption key and generate a new one!

Nonce: ${magicString}`;

    return { signContent };
  };

  getMainKeypairBySignature = async (
    signature: string,
    password: string,
  ): Promise<MainKeypairType> => {
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

  getRegisterSignContent = async (
    options: GetRegisterSignContentParams,
  ): Promise<GetSignContentResponse> => {
    const {
      mainPublicKey,
      didType,
      didValue,
      userid,
      signContentURI = window.location.origin,
    } = options;

    const pubkey_type = this.pubicKeyType;
    const timestamp = Date.now();
    const NonceContent = sha3_224(
      userid + pubkey_type + mainPublicKey + BlockChainMap[didType] + didValue + timestamp,
    );

    const signContent = `Web3MQ wants you to sign in with your ${WalletNameMap[didType]} account:
${didValue}
For Web3MQ register
URI: ${signContentURI}
Version: 1

Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    this.registerSignContent = signContent;
    this.registerTime = timestamp;
    return { signContent };
  };
  getSignContentForRegister = async (
    options: GetSignContentForRegisterParams,
  ): Promise<GetSignContentResponse> => {
    const {
      mainPublicKey,
      didType,
      didValue,
      userid,
      signContentURI = window.location.origin,
    } = options;

    const pubkey_type = this.pubicKeyType;
    const timestamp = Date.now();
    const NonceContent = sha3_224(
      userid + pubkey_type + mainPublicKey + didType + didValue + timestamp,
    );

    const signContent = `Web3MQ wants you to sign in with your ${didType} account:
${didValue}
For Web3MQ register
URI: ${signContentURI}
Version: 1

Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    this.registerSignContent = signContent;
    this.registerTime = timestamp;
    return { signContent, registerTime: timestamp };
  };


  registerBySign = async (options: RegisterBySignatureParams) => {
    const {
      userid,
      didValue,
      mainPublicKey,
      signature,
      did_pubkey = '',
      didType = 'eth',
      nickname = '',
      avatar_url = '',
      avatar_base64 = '',
    } = options;
    if (!this.registerTime || !this.registerSignContent) {
      throw new Error('Please create register sign content first!');
    }

    const payload: RegisterApiParams = {
      userid,
      did_type: didType,
      did_value: didValue,
      did_pubkey,
      did_signature: signature,
      signature_content: this.registerSignContent,
      pubkey_type: this.pubicKeyType,
      pubkey_value: mainPublicKey,
      nickname,
      avatar_url,
      avatar_base64,
      timestamp: this.registerTime,
      testnet_access_key: this.appKey,
    };

    try {
      return await userRegisterRequest(payload);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

}
