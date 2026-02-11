import Block from "./block.js";
import Crypto from "./crypto.js";

export default class PendingBlock extends Block {
  constructor({ idx, prevHash, txs }) {
    const timestamp = Date.now();
    super({ idx, prevHash, txs, timestamp, hash: null, nonce: 0 });
  }

  tryNewHash() {
    this.nonce++;
    this.hash = this.genHash();
    return this.hash;
  }

  toBlock() {
    return new Block({ ...this });
  }
}
