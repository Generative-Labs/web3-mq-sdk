let Domain: string;

// Domain = '94.16.119.221:23333';
// Domain = "192.168.2.103:23333"
// Domain = "192.168.2.105:23333"

// Domain = "192.168.3.28:23333"

Domain = 'us-west-2.web3mq.com';
// Domain = 'ap-singapore-1.web3mq.com';

export const BASE_URL = `https://${Domain}`;
export const BASE_WS = `ws://${Domain}/messages`;
