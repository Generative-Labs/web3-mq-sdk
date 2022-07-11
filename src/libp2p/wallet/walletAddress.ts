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
  let address = localStorage.getItem('WalletAddress');
  if (address == null) {
    let ethAccount = await getEthAccount();
    address = ethAccount.address;
    if (address !== null && address !== '' && address !== undefined) {
      localStorage.setItem('WalletAddress', address);
    }
  }

  return address;
};
