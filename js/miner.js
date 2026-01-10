import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";

export default class Miner {
  /**
   * @param {Blockchain} blockchain
   * @param {Wallet} wallet
   */
  constructor(blockchain, wallet) {
    this.blockchain = blockchain;
    this.wallet = wallet;
  }

  /**
   * @type {Blockchain}
   */
  blockchain;
  /**
   * @type {Wallet}
   */
  wallet;
}
