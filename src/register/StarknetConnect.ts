import { StarknetWindowObject, connect } from 'get-starknet';
import { Contract, hash, num, RpcProvider, typedData, cairo } from 'starknet';
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
    const typedMessage = {
      domain: {
        name: 'Example DApp',
        chainId: this.starknet.chainId,
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
    const contractProvider = new RpcProvider({
      nodeUrl:
        this.starknet.chainId === 'SN_MAIN'
          ? 'https://starknet-mainnet.public.blastapi.io'
          : 'https://starknet-testnet.public.blastapi.io',
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
        const signer = await contact.getSigner();
        pubkey2 = signer.signer;
      }
      return {
        publicKey: num.toHex(pubkey2),
        sign: cairo.felt(messageText) + ',' + result.join(','),
      };
    }
  }
}
