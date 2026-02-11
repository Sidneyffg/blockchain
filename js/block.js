import Crypto from "./crypto.js";
import Transaction from "./transaction.js";

export default class Block {
  constructor({ idx, txs, prevHash, hash, timestamp, nonce, difficulty }) {
    this.idx = idx;
    this.txs = txs;
    this.prevHash = prevHash;
    this.hash = hash;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  toJSON() {
    return {
      ...this,
    };
  }

  // genHash
  genHash() {
    const dataStr = `${this.idx}-${this.timestamp}-${this.prevHash}-${this.nonce}-${this.difficulty}`;
    this.hash = Crypto.SHA256Hex(dataStr);
    return this.hash;
  }

  // check hash validity
  isHashValid() {
    const hash = this.genHash();
    return hash === this.hash;
  }

  /**
   * @type {number}
   */
  difficulty;
  /**
   * @type {number}
   */
  idx;
  /**
   * @type {number}
   */
  timestamp;
  /**
   * @type {string}
   */
  prevHash;
  /**
   * @type {string}
   */
  hash;
  /**
   * @type {Transaction[]}
   */
  txs;
  /**
   * @type {number}
   */
  nonce;
}
