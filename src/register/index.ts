import { sha3_224 } from 'js-sha3';
import { GenerateEd25519KeyPair, getCurrentDate } from '../utils';
import { savePublicKeyRequest } from '../api';
import { SavePublicKeyParams, EthAccountType, signMetaMaskParams } from '../types';

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
    const { signContentURI, EthAddress } = options;
    const address = EthAddress || (await (await this.getEthAccount()).address);
    const { PrivateKey, PublicKey } = await GenerateEd25519KeyPair();
    const userid = `user:${PublicKey}`;
    const timestamp = Date.now();
    const wallet_type = 'eth';
    const NonceContent = sha3_224(
      userid + address + wallet_type + PublicKey + timestamp.toString(),
    );

    let signContent = `Web3MQ wants you to sign in with your Ethereum account:
${address}
For Web3MQ registration
URI: ${signContentURI}
Version: 1
Nonce: ${NonceContent}
Issued At: ${getCurrentDate()}`;

    // @ts-ignore metamask signature
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [signContent, address, 'web3mq'],
    });

    let payload: SavePublicKeyParams = {
      userid: userid,
      pubkey: PublicKey,
      metamask_signature: signature,
      sign_content: signContent,
      wallet_address: address,
      wallet_type: 'eth',
      timestamp: timestamp,
      app_key: this.appKey,
    };

    await savePublicKeyRequest(payload);

    return { PrivateKey, PublicKey };
  };
}
