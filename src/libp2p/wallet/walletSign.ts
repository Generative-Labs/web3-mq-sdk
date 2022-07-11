import sha3 from 'js-sha3';

import { formatTime } from '../../core/utils';
import { savePublicKey } from '../core/api';
import { getWalletAddress } from './walletAddress';
import { generateEd25519KeyPair, generateRsaKeyPair } from './generateKey';

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

export async function savePubkeyAndUserInfoToRegister() {
  //Generate two key pairs
  let pubkey = await generateEd25519KeyPair();

  //   let rsa_pubkey = 'TODO';
  let rsa_pubkey = await generateRsaKeyPair();

  let wallet_address = await getWalletAddress();

  const userId = localStorage.getItem('UserId') || '';

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
