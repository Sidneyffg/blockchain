import * as secp from "@noble/secp256k1";
import Crypto from "./crypto.js";
import Blockchain from "./blockchain.js";

export default class Wallet {
  /**
   * @param {Blockchain} blockchain
   * @param {*} privHex
   */
  constructor(blockchain, privHex = null) {
    this.blockchain = blockchain;

    if (!privHex) this.#genPriv();
    else this.#loadPrivHex(privHex);

    this.#genPub();
    this.updateHexKeys();
  }

  #genPub() {
    this.pub = secp.getPublicKey(this.priv, true);
  }
  #genPriv() {
    let priv;
    do {
      priv = Crypto.randomBytes(32);
    } while (!secp.utils.isValidSecretKey(priv));

    this.priv = priv;
  }
  #loadPrivHex(privHex) {
    const buf = Buffer.from(privHex, "hex");
    if (!secp.utils.isValidSecretKey(buf)) throw "Invalid priv key";

    this.priv = buf;
  }

  updateHexKeys() {
    this.privHex = this.priv.toString("hex");
    this.pubHex = Buffer.from(this.pub).toString("hex");
  }

  /**
   * @type {Blockchain}
   */
  blockchain;
  /**
   * @type {Buffer}
   */
  pub;
  /**
   * @type {string}
   */
  pubHex;
  /**
   * @type {Buffer}
   */
  priv;
  /**
   * @type {string}
   */
  privHex;
}
