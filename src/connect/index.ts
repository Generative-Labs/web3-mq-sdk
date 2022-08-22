import { Client } from '../client';
import { sendConnectCommand, selectUrl } from '../utils';
import { PbTypeConnectRespCommand } from '../core/pbType';

export class Connect {
  private _client: Client;
  ws: WebSocket | null;

  constructor(client: Client) {
    this._client = client;
    this.ws = null;
    this.init();
  }
  init() {
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }
    if (!this._client.wsUrl) {
      throw new Error('The url is required!');
    }
    const wsconn = new WebSocket(selectUrl('ws'));
    wsconn.binaryType = 'arraybuffer';

    wsconn.onopen = async () => {
      console.log('connection is successful');
      const concatArray = await sendConnectCommand(this._client.keys);
      wsconn.send(concatArray);
    };

    wsconn.onmessage = (event) => {
      var respData = new Uint8Array(event.data);
      const PbType = respData[0];
      const bytes = respData.slice(1, respData.length);
      if (PbType !== PbTypeConnectRespCommand) {
        this.receive(PbType, bytes);
      }
    };
    this.ws = wsconn;
  }
  send(arr: Uint8Array) {
    if (!this.ws) {
      throw new Error('websocket Initialization failed');
    }
    return this.ws.send(arr);
  }
  // eslint-disable-next-line no-unused-vars
  receive(pbType: number, bytes?: Uint8Array) {}
}
