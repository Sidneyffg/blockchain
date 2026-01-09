import Crypto from "./crypto.js";
import Transaction from "./transaction.js";

export default class Block {
  constructor({ idx, txs, prevHash, hash, timestamp, nonce }) {
    this.idx = idx;
    this.txs = txs;
    this.prevHash = prevHash;
    this.hash = hash;
    this.timestamp = timestamp;
    this.nonce = nonce;
  }

  toJSON() {
    return {
      ...this,
    };
  }

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
