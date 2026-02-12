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
    if (blockchain.p2p.node.type == "seed") return;
    this.blockchain.onInit(() => this.mine());
  }

  async mine() {
    this.logger.info("Starting to mine");
    let count = 0;
    while (true) {
      const pendingBlock = this.blockchain.pendingBlock;
      const hash = pendingBlock.tryNewHash();
      if (hash.startsWith("0".repeat(pendingBlock.difficulty))) {
        this.logger.info(
          "Block mined",
          "idx:",
          pendingBlock.idx,
          pendingBlock.timestamp -
            (this.blockchain.lastBlock?.timestamp
              ? this.blockchain.lastBlock.timestamp
              : pendingBlock.timestamp - 1e3) +
            "ms",
          hash,
        );
        this.blockchain.setPendingBlock();
        this.blockchain.p2p.filterNodes("node").forEach((node) => {
          node.emitMinedBlockData(this.blockchain.lastBlock);
        });
      }
      count++;
      if (count == 10000) {
        await new Promise((r) => setTimeout(r, 0));
        count = 0;
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
