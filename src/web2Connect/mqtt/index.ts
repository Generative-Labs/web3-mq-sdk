import mqtt, { MqttClient, PacketCallback } from 'mqtt';
import { BASE_MQTT_URL } from '../core/config';
import request from '../core/request';
import {
  getUserInfoFromToken,
  hasNotifyPermission,
  isCurrentWindow,
  notifyMessage,
  getToken,
} from '../core/utils';
import type { SendMessageData, GetRoomsParams } from '../../types';

export default class Mqtt {
  hasNotifyPermission: boolean;
  mqtt: MqttClient | undefined;

  constructor() {
    this.hasNotifyPermission = false;
    this.init();
  }

  init() {
    if (!('WebSocket' in window)) {
      throw new Error('Browser not supported WebSocket');
    }

    // if (!this.token) {
    //   throw new Error('The Token is required!');
    // }

    hasNotifyPermission().then((res: boolean) => {
      this.hasNotifyPermission = res;
    });

    this.mqtt = mqtt.connect(BASE_MQTT_URL, {
      username: getUserInfoFromToken().user_id,
      clientId: getUserInfoFromToken().user_id,
      password: getToken(),
      reconnectPeriod: 3000,
    });

    if (this.mqtt) {
      this.mqtt.on('connect', function () {
        console.log('连接成功');
      });

      this.mqtt.on('message', (topic: string, message: string) => {
        const messageObj = JSON.parse(message.toString() || '{}');
        if (window && this.hasNotifyPermission && !isCurrentWindow()) {
          const notifyMsg = notifyMessage(messageObj);
          new Notification(notifyMsg as string);
        }
        this.receive(messageObj);
      });
    }
  }

  async subscribe() {
    if (!this.mqtt) {
      throw new Error('websocket Initialization failed');
    }
    const { data } = await this.getMyRooms();
    data.forEach((room_id) => this.mqtt?.subscribe(`chat/${room_id}`));
  }

  send(data: SendMessageData, callback?: PacketCallback) {
    if (!this.mqtt) {
      throw new Error('websocket Initialization failed');
    }
    this.mqtt.publish(`msg/${getUserInfoFromToken().user_id}`, JSON.stringify(data), callback);
  }
  // eslint-disable-next-line no-unused-vars
  receive(message: any) {}

  /**
   *
   * @param params
   * @returns
   */
  getMyRooms = (params?: GetRoomsParams): Promise<{ data: string[] }> => {
    return request.get('/my_rooms', params as any);
  };
}
