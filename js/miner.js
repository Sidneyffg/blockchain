import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";
import Logger from "./logger.js";

export default class Miner {
  /**
   * @param {Blockchain} blockchain
   * @param {Wallet} wallet
   */
  constructor(blockchain, wallet) {
    this.blockchain = blockchain;
    this.wallet = wallet;
    this.mine();
  }

  mine() {
    while (true) {
      const pendingBlock = this.blockchain.pendingBlock;
      const hash = pendingBlock.tryNewHash();
      if (hash.startsWith("0".repeat(pendingBlock.difficulty))) {
        this.logger.info(
          "Block mined",
          pendingBlock.idx,
          Date.now() - pendingBlock.timestamp,
          hash,
        );
        this.blockchain.setPendingBlock();
      }
    }
  }

  /**
   * @type {Blockchain}
   */
  blockchain;
  /**
   * @type {Wallet}
   */
  wallet;
  /**
   * @type {Logger}
   */
  logger = new Logger("Miner");
}
