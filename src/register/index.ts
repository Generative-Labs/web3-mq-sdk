import { sha3_224 } from 'js-sha3';
import { connect } from 'get-starknet';
import { hash } from 'starknet';
import { GenerateEd25519KeyPair, getCurrentDate } from '../utils';
import { getUserInfoRequest, userLoginRequest } from '../api';
import { LoginParams, EthAccountType, signMetaMaskParams } from '../types';
export class Register {
  appKey: string;

  constructor(appKey?: string) {
    this.appKey = appKey || '';
  }

  getEthAccount = async () => {
    let res: EthAccountType = {
      address: '',
      balance: 0,
      shortAddress: '',
    };
    let reqParams = {
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    };
    // @ts-ignore
    const requestPermissionsRes = await window.ethereum.request(reqParams).catch((e: any) => {
      console.log(e, 'err');
    });

    if (!requestPermissionsRes) {
      return res;
    }

    try {
      //@ts-ignore
      let address = await window.ethereum.request({
        method: 'eth_accounts',
      });
      if (address && address.length > 0) {
        res.address = address[0];
        const strLength = address[0].length;
        res.shortAddress =
          address[0].substring(0, 5) + '...' + address[0].substring(strLength - 4, strLength);

        //@ts-ignore
        let balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address[0], 'latest'],
        });
        if (balance) {
          let realMoney = balance.toString(10);
          res.balance = realMoney / 1000000000000000000;
        }
      }
    } catch (err) {
      console.log(err);
    }
    return res;
  };

  signMetaMask = async (options: signMetaMaskParams) => {
    const { signContentURI, EthAddress, nickname, avatar_url, avatar_base64 } = options;
    const did_value = EthAddress || (await (await this.getEthAccount()).address);
    const timestamp = Date.now();
    const did_type = 'eth';
    const pubkey_type = 'ed25519';
    let userid: string = '';
    try {
      const { data } = await getUserInfoRequest({ did_type, did_value, timestamp });
      userid = data.userid;
    } catch (error) {
      userid = `user:${sha3_224(did_type + did_value + timestamp)}`;
    }

    const { PrivateKey, PublicKey } = await GenerateEd25519KeyPair();

    const NonceContent = sha3_224(
      userid + pubkey_type + PublicKey + did_type + did_value + timestamp.toString(),
    );

    let signContent = `Web3MQ wants you to sign in with your Ethereum account:
${did_value}
For Web3MQ login
URI: ${signContentURI}
Version: 1
Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    // @ts-ignore metamask signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [signContent, did_value, 'web3mq'],
    });

    let payload: LoginParams = {
      userid,
      did_type,
      did_value,
      did_signature: signature,
      signature_content: signContent,
      pubkey_type,
      pubkey_value: PublicKey,
      nickname,
      avatar_url,
      avatar_base64,
      timestamp: timestamp,
      testnet_access_key: this.appKey,
    };

    try {
      const { data } = await userLoginRequest(payload);
      return { PrivateKey, PublicKey, ...data };
    } catch (error) {
      return { PrivateKey, PublicKey, userid };
    }
  };

  getStarknetAccount = async () => {
    const starknet = await connect();
    if (!starknet) {
      return;
    }
    const [add] = await starknet.enable();
    return {
      address: add,
      provider: starknet,
    };
  };

  networkId = async () => {
    const starknet = await connect();
    console.log(starknet);
    if (!starknet?.isConnected) {
      return;
    }
    // try {
    //   const { baseUrl } = starknet.provider
    //   if (baseUrl.includes("alpha-mainnet.starknet.io")) {
    //     return "mainnet-alpha"
    //   } else if (baseUrl.includes("alpha4.starknet.io")) {
    //     return "goerli-alpha"
    //   } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
    //     return "localhost"
    //   }
    // } catch {}
  };

  signArgentX = async () => {
    const did_value = await ((await this.getStarknetAccount()) as any).address;
    const provider = await ((await this.getStarknetAccount()) as any)?.provider;
    const timestamp = Date.now();
    const did_type = 'starknet';
    const pubkey_type = 'ed25519';
    let userid: string = '';
    try {
      const { data } = await getUserInfoRequest({ did_type, did_value, timestamp });
      userid = data.userid;
    } catch (error) {
      userid = `user:${sha3_224(did_type + did_value + timestamp)}`;
    }

    const { PrivateKey, PublicKey } = await GenerateEd25519KeyPair();

    const NonceContent = sha3_224(
      userid + pubkey_type + PublicKey + did_type + did_value + timestamp.toString(),
    );

    const message = `
    ${window.location.host} wants you to sign in with your Starkware account:
    ${did_value}
    Sign in with Starkware to the app.
    URI: ${window.location.origin}
    Version: 1
    Chain ID: 1
    Nonce: ${NonceContent}
    Issued At: ${new Date().toISOString()}`;

    const hasMessage = hash.starknetKeccak(message).toString('hex').substring(0, 31);

    const typedMessage = {
      domain: {
        name: 'Example DApp',
        chainId: 'SN_MAIN',
        version: '0.0.1',
      },
      types: {
        StarkNetDomain: [
          { name: 'name', type: 'felt' },
          { name: 'chainId', type: 'felt' },
          { name: 'version', type: 'felt' },
        ],
        Message: [{ name: 'message', type: 'felt' }],
      },
      primaryType: 'Message',
      message: {
        hasMessage,
      },
    };
    const signature = provider.account.signMessage(typedMessage);
    console.log(signature, 123123213);
    console.log(userid, PrivateKey, PublicKey);
    // let payload: LoginParams = {
    //   userid,
    //   // did_type,
    //   did_value,
    //   did_signature: signature,
    //   signature_content: signContent,
    //   pubkey_type,
    //   pubkey_value: PublicKey,
    //   nickname,
    //   avatar_url,
    //   avatar_base64,
    //   timestamp: timestamp,
    //   testnet_access_key: this.appKey,
    // };

    // try {
    //   const { data } = await userLoginRequest(payload);
    //   return { PrivateKey, PublicKey, ...data };
    // } catch (error) {
    //   return { PrivateKey, PublicKey, userid };
    // }
  };
}
