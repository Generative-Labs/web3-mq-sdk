export const PbTypes = {
  PbTypePubKeyReqCommand: 0b00000000,
  PbTypePubKeyRespCommand: 0b00000001,

  // connect to node
  PbTypeConnectReqCommand: 0b00000010,
  PbTypeConnectRespCommand: 0b00000011,

  // contact
  PbTypeContactReqCommand: 0b00001000,
  PbTypeContactRespCommand: 0b00001001,
  PbTypeContactListRespCommand: 0b00001010,

  // normally message
  PbTypeMessage: 0b00010000,
  PbTypeMessageListResp: 0b00010010,
  PbTypeHistoryMessagesRequest: 0b00010011,
  PbTypeMessageStatusResp: 0b00010101,
  PbTypeMessageChangeStatus: 0b00010110,
  // notification
  PbTypeNotificationListResp: 0b00010100,

  // group
  PbTypeGroupReqCommand: 0b00100000,
  PbTypeGroupRespCommand: 0b00100001,
  PbTypeGroupMembersListRespCommand: 0b00100010,

  PbTypeGroupListRespCommand: 0b00100011,
  PbTypeGroupInfoRespCommand: 0b00100100,

  // chat list
  PbTypeChatReqCommand: 0b01000000,
  PbTypeChatListRespCommand: 0b01000001,
};
