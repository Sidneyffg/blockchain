import Block from "./block.js";

export default class PendingBlock extends Block {
  /**
   * @param {object} obj
   * @param {number} obj.idx
   * @param {number} obj.prevHash
   * @param {number} obj.prevBlockDuration
   * @param {number} obj.prevBlockDifficulty
   * @param {object} obj.txs
   */
  constructor({ idx, prevHash, prevBlockDuration, prevBlockDifficulty, txs }) {
    const timestamp = Date.now();
    const difficulty = prevBlockDifficulty * (3e5 / prevBlockDuration);
    super({
      idx,
      prevHash,
      txs,
      timestamp,
      hash: null,
      nonce: 0,
      difficulty,
    });
  }

  tryNewHash() {
    this.nonce++;
    this.hash = this.genHash();
    return this.hash;
  }

  toBlock() {
    return new Block({ ...this });
  }

  /**
   *
   * @param {number} prevBlockDuration
   */
  calcDifficulty(prevBlockDuration) {}

  blockTimeMs = 3e5; //5min
}
