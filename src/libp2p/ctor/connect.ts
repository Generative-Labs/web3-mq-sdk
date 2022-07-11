/* eslint-disable indent */
import {
  MessageType,
  PartialMessage,
  MESSAGE_TYPE,
  reflectionMergePartial,
  IBinaryReader,
  BinaryReadOptions,
  UnknownFieldHandler,
  IBinaryWriter,
  BinaryWriteOptions,
  WireType,
} from '@protobuf-ts/runtime';

export interface ConnectCommand {
  nodeId: string;
  userId: string;
  timestamp: bigint;
  msgSign: string;
}

class ConnectCommand$Type extends MessageType<ConnectCommand> {
  constructor() {
    super('pb.ConnectCommand', [
      { no: 1, name: 'nodeId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      { no: 2, name: 'userId', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
      {
        no: 3,
        name: 'timestamp',
        kind: 'scalar',
        T: 4 /*ScalarType.UINT64*/,
        L: 0 /*LongType.BIGINT*/,
      },
      { no: 4, name: 'msgSign', kind: 'scalar', T: 9 /*ScalarType.STRING*/ },
    ]);
  }
  create(value?: PartialMessage<ConnectCommand>): ConnectCommand {
    const message = { nodeId: '', userId: '', timestamp: 0n, msgSign: '' };
    globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
    if (value !== undefined) reflectionMergePartial<ConnectCommand>(this, message, value);
    return message;
  }
  internalBinaryRead(
    reader: IBinaryReader,
    length: number,
    options: BinaryReadOptions,
    target?: ConnectCommand,
  ): ConnectCommand {
    let message = target ?? this.create(),
      end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.nodeId = reader.string();
          break;
        case 2:
          message.userId = reader.string();
          break;
        case 3:
          message.timestamp = reader.uint64().toBigInt();
          break;
        case 4:
          message.msgSign = reader.string();
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
    message: ConnectCommand,
    writer: IBinaryWriter,
    options: BinaryWriteOptions,
  ): IBinaryWriter {
    if (message.nodeId !== '') writer.tag(1, WireType.LengthDelimited).string(message.nodeId);

    if (message.userId !== '') writer.tag(2, WireType.LengthDelimited).string(message.userId);

    if (message.timestamp !== 0n) writer.tag(3, WireType.Varint).uint64(message.timestamp);

    if (message.msgSign !== '') writer.tag(4, WireType.LengthDelimited).string(message.msgSign);
    let u = options.writeUnknownFields;
    if (u !== false) (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}

export const ConnectCommand = new ConnectCommand$Type();
