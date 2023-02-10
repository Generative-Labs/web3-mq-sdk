import { describe, expect, it } from '@jest/globals';
import { WebSocket } from 'mock-socket';

global.WebSocket = WebSocket;
import { Client, GenerateEd25519KeyPair } from '../src';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
//@ts-ignore
const handleWeb3mqCallback = (event) => {
  console.log(event, 'event');
};

describe('init', function () {
  it('work', async function () {
    const fastestUrl = await Client.init({
      env: 'dev',
      app_key: '',
    });
    expect(typeof fastestUrl).toBe('string');
  });
});
describe('initGenerateEd25519KeyPair', function () {
  it('work', async function () {
    const { PublicKey, PrivateKey } = await GenerateEd25519KeyPair();
    console.log(PrivateKey, 'PrivateKey');
  });
});

describe('initDappConnectClient', function () {
  it('work', async function () {
    await Client.init({
      env: 'dev',
      app_key: '',
    });
    await Client.initDappConnectClient({ dAppID: 'SwapChat:im' }, handleWeb3mqCallback);
    expect(!!Client.dappConnectClient).toBe(true);
  });
});

describe('getConnectLink', function () {
  it('work', async function () {
    await Client.init({
      env: 'dev',
      app_key: '',
    });
    await Client.initDappConnectClient({ dAppID: 'SwapChat:im' }, handleWeb3mqCallback);
    const link = Client.dappConnectClient.getConnectLink();
    expect(typeof link).toBe('string');
  });
});
