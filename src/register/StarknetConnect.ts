import { StarknetWindowObject, connect } from 'get-starknet';
import { Contract, hash, num, Provider, typedData, cairo } from 'starknet';
import { networkId } from './starknet';
import { ArgentAbi, ArgentXAbi2, BraavosAbi } from '../abi';
import { WalletSignRes, WalletType } from '../types';

export type WalletId = 'argentX' | 'braavos';

export class StarknetConnect {
  starknet: StarknetWindowObject | null = null;
  walletId?: WalletId;

  async connect(walletId: WalletId) {
    this.walletId = walletId;
    this.starknet = await connect({
      include: [walletId],
      modalMode: 'neverAsk',
    });
    if (!this.starknet) {
      this.starknet = await connect({
        include: [walletId],
        modalMode: 'canAsk',
      });
    }
    if (this.starknet) {
      const [address] = await this.starknet.enable();
      return { address };
    }
    return {
      address: '',
    };
  }

  async starknetSign(signContent: string, address: string): Promise<WalletSignRes> {
    if (!this.starknet || !this.starknet.isConnected) {
      this.starknet = await connect({
        modalMode: 'alwaysAsk',
        include: ['braavos', 'argentX'],
      });
    }
    if (this.starknet && this.starknet.isConnected) {
      return await this.sign(signContent, address);
    }
    return {
      publicKey: '',
      sign: '',
    };
  }

  async sign(
    signContent: string,
    address: string,
    walletType?: WalletType,
  ): Promise<WalletSignRes> {
    if (!this.starknet || !this.starknet.isConnected) {
      await this.connect((walletType as WalletId) || 'braavos');
    }
    if (!this.starknet || !this.starknet.isConnected) {
      return {
        publicKey: '',
        sign: '',
      };
    }
    const message = hash.starknetKeccak(signContent).toString(16).substring(0, 31);
    const { chainId, network } = networkId(
      this.starknet.provider?.baseUrl || this.starknet.provider?.provider?.baseUrl || '',
    );
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
      message: { message },
    };
    console.log(this.starknet.account, 'this.starknet.account');
    const result = await this.starknet.account.signMessage(typedMessage);
    console.log(this.starknet.account.signer);
    let messageText = typedData.getMessageHash(typedMessage, address);
    const contractProvider = new Provider({
      //@ts-ignore
      sequencer: { network },
    });
    if (this.walletId === 'braavos') {
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
        console.log(contact, 'contact');
        const signer = await contact.getSigner();
        pubkey2 = signer.signer;
        console.log(pubkey2, 'pubkey2');
      }
      return {
        publicKey: num.toHex(pubkey2),
        sign: cairo.felt(messageText) + ',' + result.join(','),
      };
    }
  }
}
