import Block from "./block.js";
import PendingBlock from "./pendingBlock.js";
import fs from "fs";

export default class Blockchain {
  constructor() {
    this.load();
    this.#newPendingBlock();
  }

  /**
   * @param {Block} block
   */
  addBlock(block) {
    this.blocks.push(block);
  }

  setPendingBlock() {
    const block = this.pendingBlock.toBlock();
    this.blocks.push(block);
    this.save();

    this.#newPendingBlock();
  }

  #newPendingBlock() {
    const idx = this.lastBlock ? this.lastBlock.idx + 1 : 0;
    const prevHash = this.lastBlock ? this.lastBlock.hash : "";
    this.pendingBlock = new PendingBlock({ idx, prevHash, txs: [] });
  }

  load() {
    this.blocks = [];
    const data = fs.readFileSync(this.#blockchainDataPath);
    const blockJSONs = JSON.parse(data);

    blockJSONs.forEach((blockJSON) => {
      const block = new Block(blockJSON);
      this.blocks.push(block);
    });
  }

  save() {
    const blockJSONs = [];
    this.blocks.forEach((block) => {
      blockJSONs.push(block.toJSON());
    });

    const data = JSON.stringify(blockJSONs, null, 2);
    fs.writeFileSync(this.#blockchainDataPath, data);
  }

  get lastBlock() {
    return this.blocks[this.blocks.length - 1];
  }
  /**
   * @type {PendingBlock}
   */
  pendingBlock;
  /**
   * @type {Block[]}
   */
  blocks = [];
  #blockchainDataPath = `${process.cwd()}/blockchain.json`;
}
