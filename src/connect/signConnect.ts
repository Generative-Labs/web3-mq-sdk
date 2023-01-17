import { GenerateEd25519KeyPair, GenerateRandomSixCode, GetContactBytes } from '../utils';
import { sendDappBridgeCommand, sendTempConnectCommand } from './wsCommand';
import {
  PbTypeUserTempConnectResp,
  PbTypeMessageStatusResp,
  PbTypeMessage,
  PbTypePingCommand,
  PbTypePongCommand,
} from '../core/pbType';
import {
  UserTempConnectResp,
  Web3MQMessageStatusResp,
  Web3MQRequestMessage,
  WebsocketPingCommand,
} from '../pb';
import { getUserInfoRequest } from '../api';
import {
  getMessageSharedSecret,
  GetAESBase64Key,
  aesGCMEncrypt,
  Uint8ToBase64String,
  aesGCMDecrypt,
  Base64StringToUint8,
} from '../encryption';
import {
  getUserInfoParams,
  SignConnectOptions,
  SendTempConnectOptions,
  SignClientCallBackType,
  KeyPairsType,
  WalletUserInfoType,
} from '../types';

export class SignConnect {
  private _options: SendTempConnectOptions;
  private timeout: number;
  private timeoutObj: null | NodeJS.Timeout;
  ws: WebSocket | null;
  wsUrl: string;
  nodeId: string;
  walletUserInfo: WalletUserInfoType | null;
  tempKeys: Omit<KeyPairsType, 'userid'> | null;
  tempCode: string;
  shareKey: string;
  AesKey: string;
  AesIv: string;
  // eslint-disable-next-line no-unused-vars
  callback: (params: SignClientCallBackType) => void;

  // eslint-disable-next-line no-unused-vars
  constructor(options: SignConnectOptions, callback: (params: SignClientCallBackType) => void) {
    this._options = options;
    this.timeout = 55000;
    this.timeoutObj = null;
    this.wsUrl = options.wsUrl;
    this.callback = callback;
    this.ws = null;
    this.nodeId = '';
    this.walletUserInfo = null;
    this.tempKeys = null;
    this.tempCode = '';
    this.shareKey = '';
    this.AesKey = '';
    this.AesIv = '';
    this.init();
  }

  private getWalletUserInfo = async (params: Omit<getUserInfoParams, 'timestamp'>) => {
    const { did_type, did_value } = params;
    const timestamp = Date.now();
    try {
      const { data } = await getUserInfoRequest({ did_type, did_value, timestamp });
      this.walletUserInfo = data;
    } catch (error) {
      throw new Error('get wallte user info error');
    }
  };

  private handleExchangeKey = async () => {
    const keys = await GenerateEd25519KeyPair();
    this.tempKeys = keys;
    const { PrivateKey } = keys;
    if (this.walletUserInfo) {
      const targetPubkey = this.walletUserInfo.pubkey;
      const shareKey = await getMessageSharedSecret(PrivateKey, targetPubkey);
      this.shareKey = shareKey;
      const AesKey = await GetAESBase64Key(this.shareKey);
      const AesIv = AesKey.slice(0, 16);
      this.AesKey = AesKey;
      this.AesIv = AesIv;
    }
  };

  private handleGetEncryptData = async () => {
    const encrytData = await aesGCMEncrypt(
      this.AesKey,
      this.AesIv,
      new TextEncoder().encode(JSON.stringify({ code: this.tempCode })),
    );
    return encrytData;
  };

  init() {
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }
    if (!this.wsUrl) {
      throw new Error('The url is required!');
    }
    const wsconn = new WebSocket(this.wsUrl);
    wsconn.binaryType = 'arraybuffer';

    wsconn.onopen = async () => {
      console.log('connection is successful');
      this.start();
      const concatArray = await sendTempConnectCommand(this._options);
      wsconn.send(concatArray);
    };

    wsconn.onmessage = (event) => {
      this.reset();
      var respData = new Uint8Array(event.data);
      const PbType = respData[1];
      const bytes = respData.slice(2, respData.length);
      this.onMessageCallback(PbType, bytes);
    };
    this.ws = wsconn;
  }

  async onMessageCallback(PbType: number, bytes: Uint8Array) {
    switch (PbType) {
      case PbTypeUserTempConnectResp:
        const resp = UserTempConnectResp.fromBinary(bytes);
        this.nodeId = resp.nodeID;
        this.callback({ type: 'connect', data: 'success' });
        break;
      case PbTypePongCommand:
        WebsocketPingCommand.fromBinary(bytes);
        break;
      case PbTypeMessageStatusResp:
        Web3MQMessageStatusResp.fromBinary(bytes);
        this.callback({ type: 'messageStatus', data: 'success' });
        break;
      case PbTypeMessage:
        const msgRes = Web3MQRequestMessage.fromBinary(bytes);
        const { content } = JSON.parse(new TextDecoder().decode(msgRes.payload) || '{content:""}');
        const decode_data = await aesGCMDecrypt(
          this.AesKey,
          this.AesIv,
          Base64StringToUint8(content),
        );
        console.log(JSON.parse(new TextDecoder().decode(new Uint8Array(decode_data))));
        if (this.walletUserInfo) {
          const keys = JSON.parse(new TextDecoder().decode(new Uint8Array(decode_data)));
          this.callback({ type: 'keys', data: { ...keys, userid: this.walletUserInfo.userid } });
        }
        break;
      default:
        throw new Error('This type is not supported');
    }
  }

  send(arr: Uint8Array) {
    if (!this.ws) {
      throw new Error('websocket Initialization failed');
    }
    return this.ws.send(arr);
  }

  sendDappBridge = async (options: Omit<getUserInfoParams, 'timestamp'>) => {
    const { did_type, did_value } = options;
    const { dAppID } = this._options;
    this.tempCode = GenerateRandomSixCode();
    await this.getWalletUserInfo({ did_type, did_value });
    await this.handleExchangeKey();
    const encrytData = await this.handleGetEncryptData();
    if (!this.walletUserInfo) {
      return;
    }
    const params = {
      nodeId: this.nodeId,
      payload: new TextEncoder().encode(
        JSON.stringify({
          action: 'sync_key_pairs_request',
          pubkey: this.tempKeys?.PublicKey,
          content: Uint8ToBase64String(new Uint8Array(encrytData)),
        }),
      ),
      comeFrom: `${dAppID}@${did_type}:${did_value.toLowerCase()}`,
      contentTopic: this.walletUserInfo.userid,
    };

    const concatArray = await sendDappBridgeCommand(params);
    this.send(concatArray);
  };

  sendPing() {
    if (this.ws === null) {
      throw new Error('WebSocket is not initialized');
    }
    const timestamp = Date.now();
    const reqCommand: WebsocketPingCommand = {
      timestamp: BigInt(timestamp),
    };
    let bytes = WebsocketPingCommand.toBinary(reqCommand);

    const concatArray = GetContactBytes(PbTypePingCommand, bytes);

    this.ws.send(concatArray);
  }

  reset() {
    if (this.timeoutObj !== null) {
      clearTimeout(this.timeoutObj);
      this.start();
    }
  }

  start() {
    this.timeoutObj = setTimeout(() => {
      this.sendPing();
    }, this.timeout);
  }

  // eslint-disable-next-line no-unused-vars
  receive(pbType: number, bytes?: Uint8Array) {}
}
