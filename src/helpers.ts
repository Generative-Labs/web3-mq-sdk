import { BlockChainMap, BlockChainType, WalletSignRes, WalletType } from './types';
import { WalletId } from './register/StarknetConnect';
import { getEthAccount, signWithEth } from './register/eth';
import { getStarknetAccount, signWithStarkNet } from './register/starknet';
import { Client } from './client';

export const walletTypes: WalletType[] = ['metamask', 'argentX', 'braavos'];
/**
 * @desc help to connect wallet
 * @param walletType
 */
export const connectWallet = async (
  walletType: WalletType,
): Promise<{
  address: string;
  chain: BlockChainType;
}> => {
  let address = '';
  switch (walletType) {
    case 'argentX':
    case 'braavos':
      const starknetAddress = await getStarknetAccount(walletType as WalletId);
      address = starknetAddress.address;
      break;
    default:
      const ethAddress = await getEthAccount();
      address = ethAddress.address;
  }

  return {
    address,
    chain: BlockChainMap[walletType],
  };
};
/**
 * @desc help to  sign message
 * @param signContent
 * @param address
 * @param walletType
 */
export const signMessage = async (
  signContent: string,
  address: string,
  walletType: WalletType,
): Promise<WalletSignRes> => {
  switch (walletType) {
    case 'argentX':
    case 'braavos':
      return signWithStarkNet(signContent, address, walletType);
    default:
      return signWithEth(signContent, address);
  }
};

/**
 * @desc help to  generate main keypair by wallets
 * @param password
 * @param walletAddress
 * @param walletType
 */
export const generateMainKeypair = async (
  password: string,
  walletAddress: string,
  walletType: WalletType,
) => {
  const chain = BlockChainMap[walletType];
  const { signContent } = await Client.register.getMainKeypairSignContent({
    password,
    did_type: chain,
    did_value: walletAddress,
  });
  const { sign: signature } = await signMessage(signContent, walletAddress, walletType);
  return await Client.register.getMainKeypairBySignature(signature, password);
};
