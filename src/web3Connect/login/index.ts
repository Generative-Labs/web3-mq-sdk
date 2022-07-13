import sha3 from 'js-sha3';

import { formatTime } from '../../core/utils';
import { savePublicKey } from '../core/api';
import { generateEd25519KeyPair, generateRsaKeyPair } from './generateKey';
import { LOCALSTORAGE_KEY_MAP } from '../core/constants';

const getEthAccount = async () => {
  let res = {
    address: '',
    balance: 0,
    shortAddress: '',
  };
  // @ts-ignore
  const requestPermissionsRes = await window.ethereum
    .request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    })
    .catch((e: any) => {
      console.log(e, 'e');
    });
  if (!requestPermissionsRes) return res;
  try {
    //@ts-ignore
    let address = await window.ethereum.request({
      method: 'eth_accounts',
    });
    if (address && address.length > 0) {
      res.address = address[0];
      let strLength = address[0].length;
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
  } catch (e) {
    console.log(e);
  }
  return res;
};

export const getWalletAddress = async () => {
  let ethAccount = await getEthAccount();
  let address = ethAccount.address;
  return address;
};

const getMetaMaskSign = async (
  userId: string,
  ed25519_pubkey: string,
  rsa_pubkey: string,
  walletAddress: string,
  timestamp: bigint,
) => {
  let wallet_type = 'eth';

  let your_domain_url = 'https://www.web3mq.com';

  let NonceContent = sha3.sha3_224(
    userId + walletAddress + wallet_type + ed25519_pubkey + rsa_pubkey + timestamp.toString(),
  );

  let signContent = `Web3MQ wants you to sign in with your Ethereum account:
						${walletAddress}
						For Web3MQ registration
						URI: ${your_domain_url}
						Version: 1

						Nonce: ${NonceContent}
						Issued At: ${formatTime(new Date())}`;
  //moment().utc().local().format('DD/MM/YYYY hh:mm')

  // @ts-ignore metamask signature
  let signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [signContent, walletAddress, 'web3mq'],
  });
  return { signContent, signature };
};

export async function saveToRegister() {
  //Generate two key pairs
  let pubkey = await generateEd25519KeyPair();

  //   let rsa_pubkey = 'TODO';
  let rsa_pubkey = await generateRsaKeyPair();

  let wallet_address = await getWalletAddress();

  const userId = localStorage.getItem(LOCALSTORAGE_KEY_MAP.USERID) || '';

  if (!pubkey) {
    throw new Error('pubkey empty');
  }
  if (!userId) {
    console.log('userId empty');
    return;
  }

  let timestamp = BigInt(Date.now());

  //Signing data with MetaMask
  const { signContent, signature } = await getMetaMaskSign(
    userId,
    pubkey,
    rsa_pubkey,
    wallet_address,
    timestamp,
  );

  let payload = {
    userid: userId,
    pubkey,
    rsa_pubkey: rsa_pubkey,
    signature: signature,
    sign_content: signContent,
    timestamp: timestamp,
    wallet_address: wallet_address,
    wallet_type: 'eth',
  };

  //Save public key
  try {
    const response = await savePublicKey(payload);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
