import { Contract, hash, number, Provider, typedData } from 'starknet';
import { testNet } from '../abi';
import { connect } from 'get-starknet';
import { WalletSignRes } from '../types';

export const getStarkNetAccount = async () => {
  let res: any = {
    address: '',
    balance: 0,
    shortAddress: '',
  };
  res.address = await ((await getStarknetAccount()) as any).address;
  return res;
};

const networkId = (baseUrl: string) => {
  try {
    if (baseUrl.includes('alpha-mainnet.starknet.io')) {
      return 'mainnet-alpha';
    } else if (baseUrl.includes('alpha4.starknet.io')) {
      return 'goerli-alpha';
    }
  } catch {}
};

export const signWithStarkNet = async (
  signContent: string,
  address: string,
): Promise<WalletSignRes> => {
  const provider = await ((await getStarknetAccount()) as any)?.provider;
  const message = hash.starknetKeccak(signContent).toString('hex').substring(0, 31);
  const chainId = networkId(provider.provider.baseUrl) === 'mainnet-alpha' ? 'SN_MAIN' : 'SN_GOERLI';
  const typedMessage = {
    domain: {
      name: 'Example DApp',
      chainId,
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
      message,
    },
  };
  const result = await provider.account.signMessage(typedMessage);
  let messageText = typedData.getMessageHash(typedMessage, address);
  const network = networkId(provider.provider.baseUrl) || 'goerli-alpha';
  // get argent public key
  const contractProvider = new Provider({
    sequencer: {
      network, // or 'goerli-alpha'
    },
  });
  const contact = new Contract(testNet, address, contractProvider);
  const [pubKey] = await contact.call('getSigner');
  return {
    publicKey: number.toHex(pubKey),
    sign: number.toFelt(messageText) + ',' + result.join(','),
  };
};

const getStarknetAccount = async () => {
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
