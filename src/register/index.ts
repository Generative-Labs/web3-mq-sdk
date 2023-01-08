import { sha3_224 } from 'js-sha3';
import ed from '@noble/ed25519';
import { connect } from 'get-starknet';
import { hash } from 'starknet';
import { request } from '../core/request';
import {
  ByteArrayToHexString,
  GenerateEd25519KeyPair,
  getCurrentDate,
  getDataSignature,
  sha256,
} from '../utils';
import {
  Uint8ToBase64String,
  aesGCMEncrypt,
  GetAESBase64Key,
  aesGCMDecrypt,
  Base64StringToUint8,
} from '../encryption';
import {
  getUserInfoRequest,
  userRegisterRequest,
  userLoginRequest,
  resetPasswordRequest,
} from '../api';
import {
  LoginParams,
  EthAccountType,
  RegisterParams,
  getUserInfoParams,
  GetMainKeypairParams,
  RegisterMetaMaskParams,
  SignMetaMaskParams,
} from '../types';
export class Register {
  appKey: string;

  constructor(appKey?: string) {
    this.appKey = appKey || '';
  }

  getEthAccount = async () => {
    let res: EthAccountType = {
      address: '',
      balance: 0,
      shortAddress: '',
    };
    let reqParams = {
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    };
    // @ts-ignore
    const requestPermissionsRes = await window.ethereum.request(reqParams).catch((e: any) => {
      console.log(e, 'err');
    });

    if (!requestPermissionsRes) {
      return res;
    }

    try {
      //@ts-ignore
      let address = await window.ethereum.request({
        method: 'eth_accounts',
      });
      if (address && address.length > 0) {
        res.address = address[0];
        const strLength = address[0].length;
        res.shortAddress =
          address[0].substring(0, 5) + '...' + address[0].substring(strLength - 4, strLength);

        //@ts-ignore
        let balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address[0], 'latest'],
        });
        if (balance) {
          let realMoney = balance.toString(10);
          res.balance = realMoney / 1000000000000000000;
        }
      }
    } catch (err) {
      console.log(err);
    }
    return res;
  };

  getUserInfo = async (
    options: Omit<getUserInfoParams, 'timestamp'>,
  ): Promise<{ userid: string; userExist: boolean }> => {
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
    const keyIndex = 1;
    const keyMSG = `${did_type}:${did_value}${keyIndex}${password}`;

    const magicString = Uint8ToBase64String(
      new TextEncoder().encode(sha3_224(`$web3mq${keyMSG}web3mq$`)),
    );

    const signContent = `Signing this message will allow this app to decrypt messages in the Web3MQ protocol for the following address: ${did_value}. This won’t cost you anything.

If your Web3MQ wallet-associated password and this signature is exposed to any malicious app, this would result in exposure of Web3MQ account access and encryption keys, and the attacker would be able to read your messages.

In the event of such an incident, don’t panic. You can call Web3MQ’s key revoke API and service to revoke access to the exposed encryption key and generate a new one!

Nonce: ${magicString}`;

    // @ts-ignore metamask signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [signContent, did_value, 'web3mq'],
    });

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

  registerMetaMask = async (options: RegisterMetaMaskParams) => {
    const {
      password,
      userid,
      did_value,
      signContentURI = window.location.origin,
      did_type = 'eth',
      nickname = '',
      avatar_url = '',
      avatar_base64 = '',
    } = options;

    const mainKeyPairStr = await this.getMainKeypair({ password, did_value, did_type });

    const { publicKey: pubkey_value, secretKey } = mainKeyPairStr;

    const wallet_type_name = 'Ethereum';
    const pubkey_type = 'ed25519';
    const timestamp = Date.now();
    const NonceContent = sha3_224(
      userid + pubkey_type + pubkey_value + did_type + did_value + timestamp,
    );

    const signContent = `Web3MQ wants you to sign in with your ${wallet_type_name} account:
${did_value}
For Web3MQ register
URI: ${signContentURI}
Version: 1

Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    // @ts-ignore metamask signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [signContent, did_value, 'web3mq'],
    });

    const payload: RegisterParams = {
      userid,
      did_type,
      did_value,
      did_signature: signature,
      signature_content: signContent,
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
      return { mainPrivateKey: secretKey, mainPublicKey: pubkey_value, ...data };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  signMetaMask = async (options: SignMetaMaskParams) => {
    const {
      password,
      userid,
      did_value,
      did_type = 'eth',
      mainPrivateKey = '',
      mainPublicKey = '',
      pubkeyExpiredTimestamp = Date.now() + 86400 * 1000,
    } = options;

    let secretKey = mainPrivateKey;
    let publicKey = mainPublicKey;

    if (!mainPrivateKey || !mainPublicKey) {
      const mainKeyPair = await this.getMainKeypair({ password, did_type, did_value });
      secretKey = mainKeyPair.secretKey;
      publicKey = mainKeyPair.publicKey;
    }

    const timestamp = Date.now();

    const { PublicKey, PrivateKey } = await GenerateEd25519KeyPair();

    const signContent = sha3_224(userid + PublicKey + pubkeyExpiredTimestamp + timestamp);

    const AesKey = await GetAESBase64Key(password);
    const AesIv = AesKey.slice(0, 16);
    const decode_data = await aesGCMDecrypt(AesKey, AesIv, Base64StringToUint8(secretKey));
    const decode_dataStr = new TextDecoder().decode(new Uint8Array(decode_data));

    const login_signature = await getDataSignature(decode_dataStr, signContent);

    const payload: LoginParams = {
      userid,
      did_type,
      did_value,
      login_signature,
      signature_content: signContent,
      main_pubkey: publicKey,
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
        mainPrivateKey: secretKey,
        mainPublicKey: publicKey,
        pubkeyExpiredTimestamp,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  resetPassword = async (options: RegisterMetaMaskParams) => {
    const {
      password,
      userid,
      did_value,
      signContentURI = window.location.origin,
      did_type = 'eth',
      nickname = '',
      avatar_url = '',
      avatar_base64 = '',
    } = options;

    const mainKeyPairStr = await this.getMainKeypair({ password, did_value, did_type });

    const { publicKey: pubkey_value, secretKey } = mainKeyPairStr;

    const wallet_type_name = 'Ethereum';
    const pubkey_type = 'ed25519';
    const timestamp = Date.now();
    const NonceContent = sha3_224(
      userid + pubkey_type + pubkey_value + did_type + did_value + timestamp,
    );

    const signContent = `Web3MQ wants you to sign in with your ${wallet_type_name} account:
${did_value}
For Web3MQ register
URI: ${signContentURI}
Version: 1

Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    // @ts-ignore metamask signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [signContent, did_value, 'web3mq'],
    });

    const payload: RegisterParams = {
      userid,
      did_type,
      did_value,
      did_signature: signature,
      signature_content: signContent,
      pubkey_type,
      pubkey_value,
      nickname,
      avatar_url,
      avatar_base64,
      timestamp: timestamp,
      testnet_access_key: this.appKey,
    };

    try {
      const data = await resetPasswordRequest(payload);
      return { mainPrivateKey: secretKey, mainPublicKey: pubkey_value, ...data };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  getStarknetAccount = async () => {
    const starknet = await connect();
    if (!starknet) {
      return;
    }
    const [add] = await starknet.enable();
    return {
      address: add,
      provider: starknet,
    };
  };

  networkId = async () => {
    const starknet = await connect();
    console.log(starknet);
    if (!starknet?.isConnected) {
      return;
    }
    // try {
    //   const { baseUrl } = starknet.provider
    //   if (baseUrl.includes("alpha-mainnet.starknet.io")) {
    //     return "mainnet-alpha"
    //   } else if (baseUrl.includes("alpha4.starknet.io")) {
    //     return "goerli-alpha"
    //   } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
    //     return "localhost"
    //   }
    // } catch {}
  };

  signArgentX = async () => {
    const did_value = await ((await this.getStarknetAccount()) as any).address;
    const provider = await ((await this.getStarknetAccount()) as any)?.provider;
    const timestamp = Date.now();
    const did_type = 'starknet';
    const pubkey_type = 'ed25519';
    let userid: string = '';
    try {
      const { data } = await getUserInfoRequest({ did_type, did_value, timestamp });
      userid = data.userid;
    } catch (error) {
      userid = `user:${sha3_224(did_type + did_value + timestamp)}`;
    }

    const { PrivateKey, PublicKey } = await GenerateEd25519KeyPair();

    const NonceContent = sha3_224(
      userid + pubkey_type + PublicKey + did_type + did_value + timestamp.toString(),
    );

    const message = `
    ${window.location.host} wants you to sign in with your Starkware account:
    ${did_value}
    Sign in with Starkware to the app.
    URI: ${window.location.origin}
    Version: 1
    Chain ID: 1
    Nonce: ${NonceContent}
    Issued At: ${new Date().toISOString()}`;

    const hasMessage = hash.starknetKeccak(message).toString('hex').substring(0, 31);

    const typedMessage = {
      domain: {
        name: 'Example DApp',
        chainId: 'SN_MAIN',
        version: '0.0.1',
      },
      types: {
        StarkNetDomain: [
          { name: 'name', type: 'felt' },
          { name: 'chainId', type: 'felt' },
          { name: 'version', type: 'felt' },
        ],
        Message: [{ name: 'message', type: 'felt' }],
      },
      primaryType: 'Message',
      message: {
        hasMessage,
      },
    };
    const signature = provider.account.signMessage(typedMessage);
    console.log(signature, 123123213);
    console.log(userid, PrivateKey, PublicKey);
    // let payload: LoginParams = {
    //   userid,
    //   // did_type,
    //   did_value,
    //   did_signature: signature,
    //   signature_content: signContent,
    //   pubkey_type,
    //   pubkey_value: PublicKey,
    //   nickname,
    //   avatar_url,
    //   avatar_base64,
    //   timestamp: timestamp,
    //   testnet_access_key: this.appKey,
    // };

    // try {
    //   const { data } = await userLoginRequest(payload);
    //   return { PrivateKey, PublicKey, ...data };
    // } catch (error) {
    //   return { PrivateKey, PublicKey, userid };
    // }
  };
}
