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
    const nonce = Math.round(Math.random() * 1e9);
    const targetPercentage = prevBlockDuration / 1e3;
    let difficulty;
    if (targetPercentage > 8) difficulty = prevBlockDifficulty - 1;
    else if (targetPercentage < 0.125) difficulty = prevBlockDifficulty + 1;
    else difficulty = prevBlockDifficulty;
    super({
      idx,
      prevHash,
      txs,
      timestamp,
      hash: null,
      nonce,
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

  blockTimeMs = 1e3; //5min
}
