export const EVENT_MAP = {
  'channel.created': true,
  // query channel list
  'channel.getList': true,
  'channel.joined': true,
  // change active channel
  'channel.activeChange': true,
  // update channel
  'channel.updated': true,
  'channel.invited': true,
  // update contact
  'contact.activeChange': true,
  // get contacts list
  'contact.getList': true,
  // query contactlist
  'contact.getContactList': true,
  // get followerList
  'contact.getFollowerList': true,
  // get followingList
  'contact.getFollowingList': true,
  // List of my sent
  'contact.friendList': true,
  // My recive friend list
  'contact.receiveList': true,
  //update contacts list
  'contact.updateList': true,
  //update contactlist
  'contact.updateContactList': true,
  //update followerList
  'contact.updateFollowerList': true,
  //update followingList
  'contact.updateFollowingList': true,
  // connect state changed
  'connect.changeReadyStatus': true,
  // sent message
  'message.send': true,
  // message sent
  'message.delivered': true,
  // read message
  'message.read': true,
  'message.received': true,
  // send update message
  'message.updated': true,
  // get message list
  'message.getList': true,
  // get message thread list
  'message.getThreadList': true,
  'message.openAllThread': true,
  // new notification
  'notification.messageNew': true,
  // get notification List
  'notification.getList': true,
  'notification.getMyTopicList': true,
  'notification.getMySubscribeList': true,
  'notification.received': true,
};

const IS_VALID_EVENT_MAP_TYPE = { ...EVENT_MAP, all: true };

export const isValidEventType = (eventType: string): boolean =>
  IS_VALID_EVENT_MAP_TYPE[eventType as keyof typeof IS_VALID_EVENT_MAP_TYPE] || false;
