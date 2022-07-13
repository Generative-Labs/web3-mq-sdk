import { getLoginRandomSecret, login } from '../core/api';
import { setToken } from '../core/utils';

export const signMetaMask = async () => {
  let address: string = '';
  //@ts-ignore
  const requestPermissionsRes = await window.ethereum.request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  });
  if (!requestPermissionsRes) {
    return null;
  }

  //@ts-ignore
  let accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });
  if (!accounts) {
    return null;
  }
  address = accounts[0];

  const { data: secret } = await getLoginRandomSecret({
    wallet_address: address,
  });
  const msg = `0x${Buffer.from(secret, 'utf8').toString('hex')}`;
  // @ts-ignore
  const signRes = await ethereum.request({
    method: 'personal_sign',
    params: [msg, address, 'swapchat'],
  });
  //
  // login_random_secret: string;
  // signature: string;
  // wallet_address: string;
  // appid?: string;

  const { access_token } = await login({
    login_random_secret: secret,
    signature: signRes,
    wallet_address: address,
  });
  console.log('========setToken', access_token);
  setToken(access_token);
  return access_token;
};
