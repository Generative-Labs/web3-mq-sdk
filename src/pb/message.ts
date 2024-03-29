// @generated by protobuf-ts 2.7.0
// @generated from protobuf file "message.proto" (package "pb", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from '@protobuf-ts/runtime';
import type { IBinaryWriter } from '@protobuf-ts/runtime';
import { WireType } from '@protobuf-ts/runtime';
import type { BinaryReadOptions } from '@protobuf-ts/runtime';
import type { IBinaryReader } from '@protobuf-ts/runtime';
import { UnknownFieldHandler } from '@protobuf-ts/runtime';
import type { PartialMessage } from '@protobuf-ts/runtime';
import { reflectionMergePartial } from '@protobuf-ts/runtime';
import { MESSAGE_TYPE } from '@protobuf-ts/runtime';
import { MessageType } from '@protobuf-ts/runtime';
/**
 * @generated from protobuf message pb.Web3MQRequestMessage
 */
export interface Web3MQRequestMessage {
  /**
   * @generated from protobuf field: bytes payload = 1;
   */
  payload: Uint8Array;
  /**
   * @generated from protobuf field: string contentTopic = 2;
   */
  contentTopic: string;
  /**
   * @generated from protobuf field: uint32 version = 3;
   */
  version: number;
  /**
   * @generated from protobuf field: string comeFrom = 4;
   */
  comeFrom: string;
  /**
   * @generated from protobuf field: string fromSign = 5;
   */
  fromSign: string;
  /**
   * @generated from protobuf field: string payloadType = 6;
   */
  payloadType: string;
  /**
   * @generated from protobuf field: string cipherSuite = 7;
   */
  cipherSuite: string;
  /**
   * @generated from protobuf field: bool needStore = 8;
   */
  needStore: boolean;
  /**
   * @generated from protobuf field: uint64 timestamp = 9;
   */
  timestamp: bigint;
  /**
   * @generated from protobuf field: string messageId = 10;
   */
  messageId: string;
  /**
   * @generated from protobuf field: optional string messageType = 11;
   */
  messageType?: string;
  /**
   * @generated from protobuf field: string nodeId = 12;
   */
  nodeId: string;
  /**
   * user signing key <-> pubkey
   *
   * @generated from protobuf field: string validatePubKey = 13;
   */
  validatePubKey: string;
  /**
   * @generated from protobuf field: map<string, string> extraData = 14;
   */
  extraData: {
    [key: string]: string;
  };
}
/**
 * @generated from protobuf message pb.Web3MQMessageStatusResp
 */
export interface Web3MQMessageStatusResp {
  /**
   * @generated from protobuf field: string messageId = 1;
   */
  messageId: string;
  /**
   * @generated from protobuf field: string contentTopic = 2;
   */
  contentTopic: string;
  /**
   * @generated from protobuf field: string messageStatus = 3;
   */
  messageStatus: string; // received delivered read
  /**
   * @generated from protobuf field: string version = 4;
   */
  version: string;
  /**
   * @generated from protobuf field: string comeFrom = 5;
   */
  comeFrom: string;
  /**
   * @generated from protobuf field: string fromSign = 6;
   */
  fromSign: string;
  /**
   * @generated from protobuf field: uint64 timestamp = 7;
   */
  timestamp: bigint;
}
/**
 * @generated from protobuf message pb.Web3MQChangeMessageStatus
 */
export interface Web3MQChangeMessageStatus {
  /**
   * @generated from protobuf field: string messageId = 1;
   */
  messageId: string;
  /**
   * @generated from protobuf field: string contentTopic = 2;
   */
  contentTopic: string;
  /**
   * @generated from protobuf field: string messageStatus = 3;
   */
  messageStatus: string; // received delivered read
  /**
   * @generated from protobuf field: string version = 4;
   */
  version: string;
  /**
   * @generated from protobuf field: string comeFrom = 5;
   */
  comeFrom: string;
  /**
   * @generated from protobuf field: string fromSign = 6;
   */
  fromSign: string;
  /**
   * @generated from protobuf field: uint64 timestamp = 7;
   */
  timestamp: bigint;
}
/**
 * @generated from protobuf message pb.MessageItem
 */
export interface MessageItem {
  /**
   * @generated from protobuf field: string messageId = 1;
   */
  messageId: string;
  /**
   * @generated from protobuf field: uint32 version = 2;
   */
  version: number;
  /**
   * @generated from protobuf field: bytes payload = 3;
   */
  payload: Uint8Array;
  /**
   * @generated from protobuf field: string payloadType = 4;
   */
  payloadType: string;
  /**
   * @generated from protobuf field: string comeFrom = 5;
   */
  comeFrom: string;
  /**
   * @generated from protobuf field: string fromSign = 6;
   */
  fromSign: string;
  /**
   * @generated from protobuf field: string contentTopic = 7;
   */
  contentTopic: string;
  /**
   * @generated from protobuf field: string cipherSuite = 8;
   */
  cipherSuite: string;
  /**
   * @generated from protobuf field: uint64 timestamp = 9;
   */
  timestamp: bigint;
  /**
   * @generated from protobuf field: bool read = 10;
   */
  read: boolean;
  /**
   * @generated from protobuf field: uint64 readTimestamp = 11;
   */
  readTimestamp: bigint;
}
/**
 * @generated from protobuf message pb.Web3MQMessageListResponse
 */
export interface Web3MQMessageListResponse {
  /**
   * @generated from protobuf field: repeated pb.MessageItem data = 1;
   */
  data: MessageItem[];
}
/**
 * @generated from protobuf message pb.GetHistoryMessagesRequest
 */
export interface GetHistoryMessagesRequest {
  /**
   * @generated from protobuf field: string comeFrom = 1;
   */
  comeFrom: string;
  /**
   * @generated from protobuf field: string fromSign = 2;
   */
  fromSign: string;
  /**
   * @generated from protobuf field: uint32 version = 3;
   */
  version: number;
  /**
   * @generated from protobuf field: uint64 timestamp = 4;
   */
  timestamp: bigint;
}
// @generated message type with reflection information, may provide speed optimized methods
class Web3MQRequestMessage$Type extends MessageType<Web3MQRequestMessage> {
  constructor() {
    super('pb.Web3MQRequestMessage', [
      { no: 1, name: 'payload', kind: 'scalar', T: 12 /*ScalarType.BYTES*/ },
      { no: 2, name: 'contentTopic', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 3, name: 'version', kind: 'scalar', T: 13 /*ScalarType.UINT32*/ },
      { no: 4, name: 'comeFrom', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 5, name: 'fromSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 6, name: 'payloadType', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 7, name: 'cipherSuite', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 8, name: 'needStore', kind: 'scalar', T: 8 /*ScalarType.BOOL*/ },
      {
        no: 9,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
      { no: 10, name: 'messageId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 11, name: 'messageType', kind: 'scalar', opt: true, T: 9 /*ScalarType.STRING*/ },
      { no: 12, name: 'nodeId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 13, name: 'validatePubKey', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      {
        no: 14,
        name: 'extraData',
        kind: 'map',
        K: 9 /*ScalarType.STRING*/,
        V: { kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      },
    ]);
  }
  create(value?: PartialMessage<Web3MQRequestMessage>): Web3MQRequestMessage {
    const message = {
      payload: new Uint8Array(0),
      contentTopic: '',
      version: 0,
      comeFrom: '',
      fromSign: '',
      payloadType: '',
      cipherSuite: '',
      needStore: false,
      timestamp: 0n,
      messageId: '',
      nodeId: '',
      validatePubKey: '',
      extraData: {},
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined) reflectionMergePartial<Web3MQRequestMessage>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Web3MQRequestMessage,
  ): Web3MQRequestMessage {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* bytes payload */ 1:
          message.payload = reader.bytes();
          break;
        case /* string contentTopic */ 2:
          message.contentTopic = reader.string();
          break;
        case /* uint32 version */ 3:
          message.version = reader.uint32();
          break;
        case /* string comeFrom */ 4:
          message.comeFrom = reader.string();
          break;
        case /* string fromSign */ 5:
          message.fromSign = reader.string();
          break;
        case /* string payloadType */ 6:
          message.payloadType = reader.string();
          break;
        case /* string cipherSuite */ 7:
          message.cipherSuite = reader.string();
          break;
        case /* bool needStore */ 8:
          message.needStore = reader.bool();
          break;
        case /* uint64 timestamp */ 9:
          message.timestamp = reader.uint64().toBigInt();
          break;
        case /* string messageId */ 10:
          message.messageId = reader.string();
          break;
        case /* optional string messageType */ 11:
          message.messageType = reader.string();
          break;
        case /* string nodeId */ 12:
          message.nodeId = reader.string();
          break;
        case /* string validatePubKey */ 13:
          message.validatePubKey = reader.string();
          break;
        case /* map<string, string> extraData */ 14:
          this.binaryReadMap14(message.extraData, reader);
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  private binaryReadMap14(map: Web3MQRequestMessage['extraData'], reader: IBinaryReader): void {
    let len = reader.uint32(),
      end = reader.pos + len,
      key: keyof Web3MQRequestMessage['extraData'] | undefined,
      val: Web3MQRequestMessage['extraData'][any] | undefined;
    while (reader.pos < end) {
      let [fieldNo] = reader.tag();
      switch (fieldNo) {
        case 1:
          key = reader.string();
          break;
        case 2:
          val = reader.string();
          break;
        default:
          throw new globalThis.Error(
            'unknown map entry field for field pb.Web3MQRequestMessage.extraData',
          );
      }
    }
    map[key ?? ''] = val ?? '';
  }
  internalBinaryWrite(
    message: Web3MQRequestMessage,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* bytes payload = 1; */
    if (message.payload.length) writer.tag(1, WireType.LengthDelimited).bytes(message.payload);
    /* string contentTopic = 2; */
    if (message.contentTopic !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.contentTopic);
    /* uint32 version = 3; */
    if (message.version !== 0) writer.tag(3, WireType.Varint).uint32(message.version);
    /* string comeFrom = 4; */
    if (message.comeFrom !== '') writer.tag(4, WireType.LengthDelimited).string(message.comeFrom);
    /* string fromSign = 5; */
    if (message.fromSign !== '') writer.tag(5, WireType.LengthDelimited).string(message.fromSign);
    /* string payloadType = 6; */
    if (message.payloadType !== '')
      writer.tag(6, WireType.LengthDelimited).string(message.payloadType);
    /* string cipherSuite = 7; */
    if (message.cipherSuite !== '')
      writer.tag(7, WireType.LengthDelimited).string(message.cipherSuite);
    /* bool needStore = 8; */
    if (message.needStore !== false) writer.tag(8, WireType.Varint).bool(message.needStore);
    /* uint64 timestamp = 9; */
    if (message.timestamp !== 0n) writer.tag(9, WireType.Varint).uint64(message.timestamp);
    /* string messageId = 10; */
    if (message.messageId !== '')
      writer.tag(10, WireType.LengthDelimited).string(message.messageId);
    /* optional string messageType = 11; */
    if (message.messageType !== undefined)
      writer.tag(11, WireType.LengthDelimited).string(message.messageType);
    /* string nodeId = 12; */
    if (message.nodeId !== '') writer.tag(12, WireType.LengthDelimited).string(message.nodeId);
    /* string validatePubKey = 13; */
    if (message.validatePubKey !== '')
      writer.tag(13, WireType.LengthDelimited).string(message.validatePubKey);
    /* map<string, string> extraData = 14; */
    for (let k of Object.keys(message.extraData))
      writer
        .tag(14, WireType.LengthDelimited)
        .fork()
        .tag(1, WireType.LengthDelimited)
        .string(k)
        .tag(2, WireType.LengthDelimited)
        .string(message.extraData[k])
        .join();
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.Web3MQRequestMessage
 */
export const Web3MQRequestMessage = new Web3MQRequestMessage$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Web3MQMessageStatusResp$Type extends MessageType<Web3MQMessageStatusResp> {
  constructor() {
    super('pb.Web3MQMessageStatusResp', [
      { no: 1, name: 'messageId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 2, name: 'contentTopic', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 3, name: 'messageStatus', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 4, name: 'version', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 5, name: 'comeFrom', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 6, name: 'fromSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      {
        no: 7,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<Web3MQMessageStatusResp>): Web3MQMessageStatusResp {
    const message = {
      messageId: '',
      contentTopic: '',
      messageStatus: '',
      version: '',
      comeFrom: '',
      fromSign: '',
      timestamp: 0n,
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined) reflectionMergePartial<Web3MQMessageStatusResp>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Web3MQMessageStatusResp,
  ): Web3MQMessageStatusResp {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string messageId */ 1:
          message.messageId = reader.string();
          break;
        case /* string contentTopic */ 2:
          message.contentTopic = reader.string();
          break;
        case /* string messageStatus */ 3:
          message.messageStatus = reader.string();
          break;
        case /* string version */ 4:
          message.version = reader.string();
          break;
        case /* string comeFrom */ 5:
          message.comeFrom = reader.string();
          break;
        case /* string fromSign */ 6:
          message.fromSign = reader.string();
          break;
        case /* uint64 timestamp */ 7:
          message.timestamp = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Web3MQMessageStatusResp,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string messageId = 1; */
    if (message.messageId !== '') writer.tag(1, WireType.LengthDelimited).string(message.messageId);
    /* string contentTopic = 2; */
    if (message.contentTopic !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.contentTopic);
    /* string messageStatus = 3; */
    if (message.messageStatus !== '')
      writer.tag(3, WireType.LengthDelimited).string(message.messageStatus);
    /* string version = 4; */
    if (message.version !== '') writer.tag(4, WireType.LengthDelimited).string(message.version);
    /* string comeFrom = 5; */
    if (message.comeFrom !== '') writer.tag(5, WireType.LengthDelimited).string(message.comeFrom);
    /* string fromSign = 6; */
    if (message.fromSign !== '') writer.tag(6, WireType.LengthDelimited).string(message.fromSign);
    /* uint64 timestamp = 7; */
    if (message.timestamp !== 0n) writer.tag(7, WireType.Varint).uint64(message.timestamp);
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.Web3MQMessageStatusResp
 */
export const Web3MQMessageStatusResp = new Web3MQMessageStatusResp$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Web3MQChangeMessageStatus$Type extends MessageType<Web3MQChangeMessageStatus> {
  constructor() {
    super('pb.Web3MQChangeMessageStatus', [
      { no: 1, name: 'messageId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 2, name: 'contentTopic', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 3, name: 'messageStatus', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 4, name: 'version', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 5, name: 'comeFrom', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 6, name: 'fromSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      {
        no: 7,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<Web3MQChangeMessageStatus>): Web3MQChangeMessageStatus {
    const message = {
      messageId: '',
      contentTopic: '',
      messageStatus: '',
      version: '',
      comeFrom: '',
      fromSign: '',
      timestamp: 0n,
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined)
      reflectionMergePartial<Web3MQChangeMessageStatus>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Web3MQChangeMessageStatus,
  ): Web3MQChangeMessageStatus {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string messageId */ 1:
          message.messageId = reader.string();
          break;
        case /* string contentTopic */ 2:
          message.contentTopic = reader.string();
          break;
        case /* string messageStatus */ 3:
          message.messageStatus = reader.string();
          break;
        case /* string version */ 4:
          message.version = reader.string();
          break;
        case /* string comeFrom */ 5:
          message.comeFrom = reader.string();
          break;
        case /* string fromSign */ 6:
          message.fromSign = reader.string();
          break;
        case /* uint64 timestamp */ 7:
          message.timestamp = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Web3MQChangeMessageStatus,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string messageId = 1; */
    if (message.messageId !== '') writer.tag(1, WireType.LengthDelimited).string(message.messageId);
    /* string contentTopic = 2; */
    if (message.contentTopic !== '')
      writer.tag(2, WireType.LengthDelimited).string(message.contentTopic);
    /* string messageStatus = 3; */
    if (message.messageStatus !== '')
      writer.tag(3, WireType.LengthDelimited).string(message.messageStatus);
    /* string version = 4; */
    if (message.version !== '') writer.tag(4, WireType.LengthDelimited).string(message.version);
    /* string comeFrom = 5; */
    if (message.comeFrom !== '') writer.tag(5, WireType.LengthDelimited).string(message.comeFrom);
    /* string fromSign = 6; */
    if (message.fromSign !== '') writer.tag(6, WireType.LengthDelimited).string(message.fromSign);
    /* uint64 timestamp = 7; */
    if (message.timestamp !== 0n) writer.tag(7, WireType.Varint).uint64(message.timestamp);
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.Web3MQChangeMessageStatus
 */
export const Web3MQChangeMessageStatus = new Web3MQChangeMessageStatus$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MessageItem$Type extends MessageType<MessageItem> {
  constructor() {
    super('pb.MessageItem', [
      { no: 1, name: 'messageId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 2, name: 'version', kind: 'scalar', T: 13 /*ScalarType.UINT32*/ },
      { no: 3, name: 'payload', kind: 'scalar', T: 12 /*ScalarType.BYTES*/ },
      { no: 4, name: 'payloadType', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 5, name: 'comeFrom', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 6, name: 'fromSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 7, name: 'contentTopic', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 8, name: 'cipherSuite', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      {
        no: 9,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
      { no: 10, name: 'read', kind: 'scalar', T: 8 /*ScalarType.BOOL*/ },
      {
        no: 11,
        name: 'readTimestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<MessageItem>): MessageItem {
    const message = {
      messageId: '',
      version: 0,
      payload: new Uint8Array(0),
      payloadType: '',
      comeFrom: '',
      fromSign: '',
      contentTopic: '',
      cipherSuite: '',
      timestamp: 0n,
      read: false,
      readTimestamp: 0n,
    };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined) reflectionMergePartial<MessageItem>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: MessageItem,
  ): MessageItem {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string messageId */ 1:
          message.messageId = reader.string();
          break;
        case /* uint32 version */ 2:
          message.version = reader.uint32();
          break;
        case /* bytes payload */ 3:
          message.payload = reader.bytes();
          break;
        case /* string payloadType */ 4:
          message.payloadType = reader.string();
          break;
        case /* string comeFrom */ 5:
          message.comeFrom = reader.string();
          break;
        case /* string fromSign */ 6:
          message.fromSign = reader.string();
          break;
        case /* string contentTopic */ 7:
          message.contentTopic = reader.string();
          break;
        case /* string cipherSuite */ 8:
          message.cipherSuite = reader.string();
          break;
        case /* uint64 timestamp */ 9:
          message.timestamp = reader.uint64().toBigInt();
          break;
        case /* bool read */ 10:
          message.read = reader.bool();
          break;
        case /* uint64 readTimestamp */ 11:
          message.readTimestamp = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: MessageItem,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string messageId = 1; */
    if (message.messageId !== '') writer.tag(1, WireType.LengthDelimited).string(message.messageId);
    /* uint32 version = 2; */
    if (message.version !== 0) writer.tag(2, WireType.Varint).uint32(message.version);
    /* bytes payload = 3; */
    if (message.payload.length) writer.tag(3, WireType.LengthDelimited).bytes(message.payload);
    /* string payloadType = 4; */
    if (message.payloadType !== '')
      writer.tag(4, WireType.LengthDelimited).string(message.payloadType);
    /* string comeFrom = 5; */
    if (message.comeFrom !== '') writer.tag(5, WireType.LengthDelimited).string(message.comeFrom);
    /* string fromSign = 6; */
    if (message.fromSign !== '') writer.tag(6, WireType.LengthDelimited).string(message.fromSign);
    /* string contentTopic = 7; */
    if (message.contentTopic !== '')
      writer.tag(7, WireType.LengthDelimited).string(message.contentTopic);
    /* string cipherSuite = 8; */
    if (message.cipherSuite !== '')
      writer.tag(8, WireType.LengthDelimited).string(message.cipherSuite);
    /* uint64 timestamp = 9; */
    if (message.timestamp !== 0n) writer.tag(9, WireType.Varint).uint64(message.timestamp);
    /* bool read = 10; */
    if (message.read !== false) writer.tag(10, WireType.Varint).bool(message.read);
    /* uint64 readTimestamp = 11; */
    if (message.readTimestamp !== 0n) writer.tag(11, WireType.Varint).uint64(message.readTimestamp);
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.MessageItem
 */
export const MessageItem = new MessageItem$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Web3MQMessageListResponse$Type extends MessageType<Web3MQMessageListResponse> {
  constructor() {
    super('pb.Web3MQMessageListResponse', [
      {
        no: 1,
        name: 'data',
        kind: 'message',
        repeat: 1 /*RepeatType.PACKED*/,
        T: () => MessageItem,
      },
    ]);
  }
  create(value?: PartialMessage<Web3MQMessageListResponse>): Web3MQMessageListResponse {
    const message = { data: [] };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined)
      reflectionMergePartial<Web3MQMessageListResponse>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: Web3MQMessageListResponse,
  ): Web3MQMessageListResponse {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* repeated pb.MessageItem data */ 1:
          message.data.push(MessageItem.internalBinaryRead(reader, reader.uint32(), options));
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: Web3MQMessageListResponse,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* repeated pb.MessageItem data = 1; */
    for (let i = 0; i < message.data.length; i++)
      MessageItem.internalBinaryWrite(
        message.data[i],
        writer.tag(1, WireType.LengthDelimited).fork(),
        options,
      ).join();
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.Web3MQMessageListResponse
 */
export const Web3MQMessageListResponse = new Web3MQMessageListResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetHistoryMessagesRequest$Type extends MessageType<GetHistoryMessagesRequest> {
  constructor() {
    super('pb.GetHistoryMessagesRequest', [
      { no: 1, name: 'comeFrom', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 2, name: 'fromSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 3, name: 'version', kind: 'scalar', T: 13 /*ScalarType.UINT32*/ },
      {
        no: 4,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
    ]);
  }
  create(value?: PartialMessage<GetHistoryMessagesRequest>): GetHistoryMessagesRequest {
    const message = { comeFrom: '', fromSign: '', version: 0, timestamp: 0n };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined)
      reflectionMergePartial<GetHistoryMessagesRequest>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: GetHistoryMessagesRequest,
  ): GetHistoryMessagesRequest {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case /* string comeFrom */ 1:
          message.comeFrom = reader.string();
          break;
        case /* string fromSign */ 2:
          message.fromSign = reader.string();
          break;
        case /* uint32 version */ 3:
          message.version = reader.uint32();
          break;
        case /* uint64 timestamp */ 4:
          message.timestamp = reader.uint64().toBigInt();
          break;
        default:
          let u = options.readUnknownField;
          if (u === 'throw')
            throw new globalThis.Error(
              `Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`,
            );
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(
              this.typeName,
              message,
              fieldNo,
              wireType,
              d,
            );
      }
    }
    return message;
  }
  internalBinaryWrite(
    message: GetHistoryMessagesRequest,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    /* string comeFrom = 1; */
    if (message.comeFrom !== '') writer.tag(1, WireType.LengthDelimited).string(message.comeFrom);
    /* string fromSign = 2; */
    if (message.fromSign !== '') writer.tag(2, WireType.LengthDelimited).string(message.fromSign);
    /* uint32 version = 3; */
    if (message.version !== 0) writer.tag(3, WireType.Varint).uint32(message.version);
    /* uint64 timestamp = 4; */
    if (message.timestamp !== 0n) writer.tag(4, WireType.Varint).uint64(message.timestamp);
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
/**
 * @generated MessageType for protobuf message pb.GetHistoryMessagesRequest
 */
export const GetHistoryMessagesRequest = new GetHistoryMessagesRequest$Type();
