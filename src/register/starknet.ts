import { StarknetWindowObject, connect } from 'get-starknet';
import { WalletId } from './StarknetConnect';
import { cairo, Contract, hash, num, RpcProvider, typedData } from 'starknet';
import { ArgentAbi, ArgentXAbi2, BraavosAbi } from '../abi';

export const signWithStarkNet = async (
  signContent: string,
  address: string,
  walletId: WalletId,
): Promise<{
  sign: string;
  publicKey: string;
}> => {
  let starknet: StarknetWindowObject | null = window.starknet || null;
  if (!starknet) {
    starknet = await connect({
      include: [walletId],
      modalMode: 'neverAsk',
    });
  }
  if (!starknet) {
    starknet = await connect({
      include: [walletId],
      modalMode: 'canAsk',
    });
  }
  if (!starknet || !starknet.isConnected) {
    return {
      publicKey: '',
      sign: '',
    };
  }
  const message = hash.starknetKeccak(signContent).toString(16).substring(0, 31);
  const typedMessage = {
    domain: {
      name: 'Example DApp',
      chainId: starknet.chainId,
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
    message: { message },
  };
  const result = await starknet.account.signMessage(typedMessage);
  let messageText = typedData.getMessageHash(typedMessage, address);
  const contractProvider = new RpcProvider({
    nodeUrl:
      starknet.chainId === 'SN_MAIN'
        ? 'https://starknet-mainnet.public.blastapi.io'
        : 'https://starknet-testnet.public.blastapi.io',
  });
  if (walletId === 'braavos') {
    const contact = new Contract(BraavosAbi, address, contractProvider);
    const { publicKey } = await contact.getPublicKey();
    return {
      publicKey: num.toHex(publicKey),
      sign: cairo.felt(messageText) + ',' + result.join(','),
    };
  } else {
    let pubkey2 = '';
    try {
      let contact = new Contract(ArgentXAbi2, address, contractProvider);
      pubkey2 = await contact.get_owner();
    } catch (e) {
      let contact = new Contract(ArgentAbi, address, contractProvider);
      const signer = await contact.getSigner();
      pubkey2 = signer.signer;
    }
    return {
      publicKey: num.toHex(pubkey2),
      sign: cairo.felt(messageText) + ',' + result.join(','),
    };
  }
};
//
export const getStarknetAccount = async (walletId: WalletId) => {
  const cacheStarknet = window.starknet;
  if (cacheStarknet && cacheStarknet.isConnected) {
    return {
      address: cacheStarknet.selectedAddress,
    };
  }
  let starknet = await connect({
    include: [walletId],
    modalMode: 'neverAsk',
  });
  if (!starknet) {
    starknet = await connect({
      include: [walletId],
      modalMode: 'canAsk',
    });
  }
  if (starknet) {
    const [add] = await starknet.enable();
    return {
      address: add,
    };
  }
  return {
    address: '',
  };
};
