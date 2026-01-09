import Block from "./block.js";
import Crypto from "./crypto.js";

export default class PendingBlock extends Block {
  constructor({ idx, prevHash, txs }) {
    const timestamp = Date.now();
    super({ idx, prevHash, txs, timestamp, hash: null, nonce: 0 });
  }

  genNewHash() {
    this.nonce++;
    const dataStr = `${this.idx}${this.timestamp}${this.prevHash}${this.nonce}`;

    this.hash = Crypto.SHA256(dataStr);
    return this.hash;
  }

  toBlock() {
    return new Block({ ...this });
  }
}
