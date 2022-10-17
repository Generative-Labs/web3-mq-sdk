import { sendTempConnectCommand, sendDappBridgeCommand } from '../utils';
import { PbTypeUserTempConnectResp, PbTypeMessageStatusResp } from '../core/pbType';
import { UserTempConnectResp, Web3MQMessageStatusResp } from '../pb';
import { SignConnectOptions, SendTempConnectOptions, SendDappBridgeOptions } from '../types';

export class SignConnect {
  private _options: SendTempConnectOptions;
  ws: WebSocket | null;
  wsUrl: string;
  nodeId: string;

  constructor(options: SignConnectOptions) {
    this._options = options;
    this.wsUrl = options.wsUrl;
    this.ws = null;
    this.nodeId = '';
    this.init();
  }

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
      const concatArray = await sendTempConnectCommand(this._options);
      wsconn.send(concatArray);
    };

    wsconn.onmessage = (event) => {
      var respData = new Uint8Array(event.data);
      const PbType = respData[1];
      const bytes = respData.slice(2, respData.length);
      this.onMessageCallback(PbType, bytes);
    };
    this.ws = wsconn;
  }

  onMessageCallback(PbType: number, bytes: Uint8Array) {
    console.log(PbType);
    switch (PbType) {
      case PbTypeUserTempConnectResp:
        const resp = UserTempConnectResp.fromBinary(bytes);
        console.log(resp);
        break;
      case PbTypeMessageStatusResp:
        const msgResp = Web3MQMessageStatusResp.fromBinary(bytes);
        console.log('msgStatus:', msgResp);
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

  sendDappBridge = async (options: SendDappBridgeOptions) => {
    const concatArray = await sendDappBridgeCommand(options);
    this.send(concatArray);
  };

  // eslint-disable-next-line no-unused-vars
  receive(pbType: number, bytes?: Uint8Array) {}
}
