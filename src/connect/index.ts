export * from './signConnect';

import { Client } from '../client';
import { sendConnectCommand, GetContactBytes } from '../utils';
import {
  PbTypeConnectRespCommand,
  PbTypePingCommand,
  PbTypePongCommand,
  PbTypeNotificationListResp,
} from '../core/pbType';
import { ConnectCommand, WebsocketPingCommand } from '../pb';
export class Connect {
  private _client: Client;
  private timeout: number;
  private timeoutObj: null | NodeJS.Timeout;
  ws: WebSocket | null;
  nodeId: string;

  constructor(client: Client) {
    this._client = client;
    this.ws = null;
    this.nodeId = '';
    this.timeout = 55000;
    this.timeoutObj = null;
    this.init();
  }
  init() {
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }
    if (!Client.wsUrl) {
      throw new Error('The url is required!');
    }
    const wsconn = new WebSocket(Client.wsUrl);
    wsconn.binaryType = 'arraybuffer';

    if (this._client.listeners.events['connect.changeReadyStatus']) {
      this._client.emit('connect.changeReadyStatus', { type: 'connect.changeReadyStatus' });
    }

    wsconn.onopen = async () => {
      console.log('connection is successful');
      this.start();
      const concatArray = await sendConnectCommand(this._client.keys);
      wsconn.send(concatArray);
      if (this._client.listeners.events['connect.changeReadyStatus']) {
        this._client.emit('connect.changeReadyStatus', { type: 'connect.changeReadyStatus' });
      }
    };

    wsconn.onmessage = (event) => {
      this.reset();
      var respData = new Uint8Array(event.data);
      const PbType = respData[1];
      const bytes = respData.slice(2, respData.length);
      this.onMessageCallback(PbType, bytes);
    };
    wsconn.onclose = () => {
      if (this._client.listeners.events['connect.changeReadyStatus']) {
        this._client.emit('connect.changeReadyStatus', { type: 'connect.changeReadyStatus' });
      }
    };
    this.ws = wsconn;
  }
  onMessageCallback(PbType: number, bytes: Uint8Array) {
    switch (PbType) {
      case PbTypeConnectRespCommand:
        const { nodeId } = ConnectCommand.fromBinary(bytes);
        this.nodeId = nodeId;
        break;
      case PbTypePongCommand:
        return WebsocketPingCommand.fromBinary(bytes);
      case PbTypeNotificationListResp:
        this.receiveNotify(PbType, bytes);
        break;
      default:
        this.receive(PbType, bytes);
        break;
    }
  }
  sendPing() {
    const { userid } = this._client.keys;
    if (this.ws === null) {
      throw new Error('WebSocket is not initialized');
    }
    if (userid == null) {
      throw new Error('GenreateAndSaveKeyPair first');
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
  send(arr: Uint8Array) {
    if (!this.ws) {
      throw new Error('websocket Initialization failed');
    }
    return this.ws.send(arr);
  }
  // eslint-disable-next-line no-unused-vars
  receive(pbType: number, bytes?: Uint8Array) {}
  // eslint-disable-next-line no-unused-vars
  receiveNotify(pbType: number, bytes?: Uint8Array) {}
}
