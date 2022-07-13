import { getWSConn, sendConnectReq, sendMsg } from './conn';
import { PBTYPES } from '../core/constants';

class Wsconn {
  wsconn: WebSocket | undefined;
  constructor() {
    this.init();
  }

  async init() {
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }
    //Create Websocket Connect
    this.wsconn = getWSConn();

    //Send connect command
    this.wsconn.send((await sendConnectReq()) as Uint8Array);

    this.wsconn.onopen = function () {
      console.log('Successfully connected to the echo websocket server...');
    };

    //Receive
    this.wsconn.onmessage = function (event) {
      var respData = new Uint8Array(event.data);

      const pbType = respData[0];
      //   const bytes = respData.slice(1, respData.length);

      //Receive connect response
      if (pbType == PBTYPES.PbTypeConnectRespCommand) {
        console.log('Connect success');
      }
      //Receive message
      if (pbType == PBTYPES.PbTypeMessage) {
        console.log('Receive message');
      }
    };
  }
  async send(topic: string, msg: string) {
    if (!this.wsconn) {
      throw new Error('websocket Initialization failed');
    }

    //Send message
    this.wsconn.send((await sendMsg(topic, msg)) as Uint8Array);
  }
}

export default Wsconn;
