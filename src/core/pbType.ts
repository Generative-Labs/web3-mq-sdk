const PbTypePubKeyReqCommand = 0b00000000;
const PbTypePubKeyRespCommand = 0b00000001;

// connect to node
const PbTypeConnectReqCommand = 0b00000010;
const PbTypeConnectRespCommand = 0b00000011;

const PbTypeUserTempConnectReqCommand = 0b00000101;
const PbTypeUserTempConnectResp = 0b00000110;

// contact
const PbTypeContactReqCommand = 0b00001000;
const PbTypeContactRespCommand = 0b00001001;
const PbTypeContactListRespCommand = 0b00001010;

// normally message
const PbTypeMessage = 0b00010000;
const PbTypeMessageListResp = 0b00010010;
const PbTypeHistoryMessagesRequest = 0b00010011;
const PbTypeMessageStatusResp = 0b00010101;
const PbTypeMessageChangeStatus = 0b00010110;
// notification
const PbTypeNotificationListResp = 0b00010100;

// group
const PbTypeGroupReqCommand = 0b00100000;
const PbTypeGroupRespCommand = 0b00100001;
const PbTypeGroupMembersListRespCommand = 0b00100010;

const PbTypeGroupListRespCommand = 0b00100011;
const PbTypeGroupInfoRespCommand = 0b00100100;

// chat list
const PbTypeChatReqCommand = 0b01000000;
const PbTypeChatListRespCommand = 0b01000001;

// heartbeat
const PbTypePingCommand = 0b10000000;
const PbTypePongCommand = 0b10000001;

// qrCode
const PbTypeWeb3MQBridgeConnectCommand = 0b1100100;
const PbTypeWeb3MQBridgeConnectResp = 0b1100101;

export {
  PbTypeChatReqCommand,
  PbTypeUserTempConnectReqCommand,
  PbTypeUserTempConnectResp,
  PbTypeChatListRespCommand,
  PbTypeGroupInfoRespCommand,
  PbTypePubKeyReqCommand,
  PbTypePubKeyRespCommand,
  PbTypeConnectReqCommand,
  PbTypeConnectRespCommand,
  PbTypeContactReqCommand,
  PbTypeContactRespCommand,
  PbTypeContactListRespCommand,
  PbTypeMessage,
  PbTypeMessageListResp,
  PbTypeNotificationListResp,
  PbTypeHistoryMessagesRequest,
  PbTypeMessageStatusResp,
  PbTypeMessageChangeStatus,
  PbTypeGroupReqCommand,
  PbTypeGroupRespCommand,
  PbTypeGroupMembersListRespCommand,
  PbTypeGroupListRespCommand,
  PbTypePingCommand,
  PbTypePongCommand,
  PbTypeWeb3MQBridgeConnectCommand,
  PbTypeWeb3MQBridgeConnectResp
};
