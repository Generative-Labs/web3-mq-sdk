import { cairo, constants, Contract, hash, num, Provider, typedData } from 'starknet';
import { testNet } from '../abi';
import { connect } from 'get-starknet';
import { WalletSignRes } from '../types';

export const getStarkNetAccount = async () => {
  let res: any = {
    address: '',
  };
  res.address = await ((await getStarknetAccount()) as any).address;
  return res;
};

const networkId = (baseUrl: string) => {
  if (baseUrl.includes('alpha-mainnet.starknet.io')) {
    return {
      chainId: 'SN_MAIN',
      network: constants.NetworkName.SN_MAIN,
    };
  } else if (baseUrl.includes('alpha4-2.starknet.io')) {
    return {
      chainId: 'SN_GOERLI2',
      network: constants.NetworkName.SN_GOERLI2,
    };
  } else {
    return {
      chainId: 'SN_GOERLI',
      network: constants.NetworkName.SN_GOERLI,
    };
  }
};

export const signWithStarkNet = async (
  signContent: string,
  address: string,
): Promise<WalletSignRes> => {
  const provider = await ((await getStarknetAccount()) as any)?.provider;
  const message = hash.starknetKeccak(signContent).toString(16).substring(0, 31);
  const { chainId, network } = networkId(provider.provider.baseUrl);
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
  const contractProvider = new Provider({
    sequencer: { network },
  });
  const contact = new Contract(testNet, address, contractProvider);
  const { publicKey } = await contact.getPublicKey();
  return {
    publicKey: num.toHex(publicKey),
    sign: cairo.felt(messageText) + ',' + result.join(','),
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
