// import {Contract, hash, number, Provider, typedData} from 'starknet';
// import { testNet } from '../abi';
// import {connect, StarknetWindowObject} from 'get-starknet';
// import {WalletSignRes, WalletType} from '../types';
type NetworkName = 'SN_MAIN' | 'SN_GOERLI' | 'SN_GOERLI2';

// enum NetworkName {
//   SN_MAIN = 'SN_MAIN',
//   SN_GOERLI = 'SN_GOERLI',
//   SN_GOERLI2 = 'SN_GOERLI2',
// }

//
//
// export const getStarkNetAccount = async () => {
//   let res: any = {
//     address: '',
//   };
//   res.address = await ((await getStarknetAccount()) as any).address;
//   return res;
// };
//
export const networkId = (
  baseUrl: string,
): {
  chainId: string;
  network: NetworkName;
} => {
  if (baseUrl.includes('alpha-mainnet.starknet.io')) {
    return {
      chainId: 'SN_MAIN',
      network: 'SN_MAIN',
    };
  } else if (baseUrl.includes('alpha4-2.starknet.io')) {
    return {
      chainId: 'SN_GOERLI2',
      network: 'SN_GOERLI2',
    };
  } else {
    return {
      chainId: 'SN_GOERLI',
      network: 'SN_GOERLI',
    };
  }
};

// export const signWithStarkNet = async (
//   signContent: string,
//   address: string,
// ): Promise<WalletSignRes> => {
//   const provider = await ((await getStarknetAccount()) as any)?.provider;
//   const message = hash.starknetKeccak(signContent).toString(16).substring(0, 31);
//   const { chainId, network } = networkId(provider.provider.baseUrl);
//   const typedMessage = {
//     domain: {
//       name: 'Example DApp',
//       chainId,
//       version: '0.0.1',
//     },
//     types: {
//       StarkNetDomain: [
//         { name: 'name', type: 'felt' },
//         { name: 'chainId', type: 'felt' },
//         { name: 'version', type: 'felt' },
//       ],
//       Message: [{ name: 'message', type: 'felt' }],
//     },
//     primaryType: 'Message',
//     message: {
//       message,
//     },
//   };
//   const result = await provider.account.signMessage(typedMessage);
//   let messageText = typedData.getMessageHash(typedMessage, address);
//   const contractProvider = new Provider({
//     sequencer: { network },
//   });
//   const contact = new Contract(testNet, address, contractProvider);
//   const { publicKey } = await contact.getPublicKey();
//   return {
//     publicKey: number.toHex(publicKey),
//     sign: number.toFelt(messageText) + ',' + result.join(','),
//   };
// };
//
// const getStarknetAccount = async () => {
//   const starknet = await connect();
//   if (!starknet) {
//     return;
//   }
//   const [add] = await starknet.enable();
//   return {
//     address: add,
//     provider: starknet,
//   };
// };
