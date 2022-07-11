import Wsconn from './wsconn';
import { savePubkeyAndUserInfoToRegister } from './wallet/walletSign';

class Livep2p {
  wsconn: any | undefined;
  constructor() {
    this.init();
  }

  async init() {
    await savePubkeyAndUserInfoToRegister();
    this.wsconn = new Wsconn();
  }
}

export default Livep2p;
