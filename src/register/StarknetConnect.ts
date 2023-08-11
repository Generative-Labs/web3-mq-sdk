import { StarknetWindowObject, connect } from 'get-starknet';
import { Contract, hash, number, Provider, typedData } from 'starknet';
import { networkId } from './starknet';
import { ArgentAbi, BraavosAbi } from '../abi';
import { WalletSignRes, WalletType } from '../types';

export type WalletId = 'argent' | 'braavos';

export class StarknetConnect {
  starknet: StarknetWindowObject | null = null;
  walletId?: WalletId;

  async connect(walletId: WalletId) {
    this.walletId = walletId;
    this.starknet = await connect({
      include: [walletId],
    });
    if (this.starknet) {
      const [address] = await this.starknet.enable();
      return { address };
    }
    return {
      address: '',
    };
  }

  async sign(
    signContent: string,
    address: string,
    walletType?: WalletType,
  ): Promise<WalletSignRes> {
    if (!this.starknet || this.starknet.isConnected) {
      await this.connect((walletType as WalletId) || 'braavos');
    }
    if (!this.starknet || this.starknet.isConnected) {
      return {
        publicKey: '',
        sign: '',
      };
    }
    const [add] = await this.starknet.enable();
    console.log(add, 'add');
    console.log(address, 'address');
    const message = hash.starknetKeccak(signContent).toString(16).substring(0, 31);
    const { chainId, network } = networkId(this.starknet.provider?.baseUrl);
    const typedMessage = {
      domain: {
        name: 'Web3MQ APP',
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
      message: { message },
    };
    const result = await this.starknet.account.signMessage(typedMessage);
    let messageText = typedData.getMessageHash(typedMessage, address);
    const contractProvider = new Provider({
      sequencer: { network },
    });
    if (this.walletId === 'braavos') {
      const contact = new Contract(BraavosAbi, address, contractProvider);
      const { publicKey } = await contact.getPublicKey();
      return {
        publicKey: number.toHex(publicKey),
        sign: number.toFelt(messageText) + ',' + result.join(','),
      };
    } else {
      const contact = new Contract(ArgentAbi, address, contractProvider);
      const [pubKey] = await contact.call('getSigner');
      return {
        publicKey: number.toHex(pubKey),
        sign: number.toFelt(messageText) + ',' + result.join(','),
      };
    }
  }
}
