import { EthAccountType, WalletSignRes } from '../types';

export const getEthAccount = async () => {
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

export const signWithEth = async (
  signContent: string,
  didValue: string,
): Promise<WalletSignRes> => {
  // @ts-ignore metamask signature
  const sign = await window.ethereum.request({
    method: 'personal_sign',
    params: [signContent, didValue, 'web3mq'],
  });
  return {
    sign,
  };
};
