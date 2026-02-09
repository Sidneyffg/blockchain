import Block from "./block.js";
import PendingBlock from "./pendingBlock.js";
import P2p from "./p2p.js";
import Logger from "./logger.js";
import fs from "fs";

export default class Blockchain {
  /**
   * @param {"node"|"seed"} type
   */
  constructor(type) {
    this.logger = new Logger("Blockchain");

    this.loadBlockChain();
    this.#newPendingBlock();

    this.p2p = new P2p(type, this);
    this.p2p.on("initialized", () => this.initNetwork());
  }

  async initNetwork() {
    const lastBlockDatas = await this.p2p.getDataFromMaxNodes(
      "getLastBlockData",
      5,
    );
    console.log(lastBlockDatas);
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

  loadBlockChain() {
    this.blocks = [];
    const data = fs.readFileSync(this.#blockchainDataPath);
    const blockJSONs = JSON.parse(data);

    blockJSONs.forEach((blockJSON) => {
      const block = new Block(blockJSON);
      this.blocks.push(block);
    });
    this.logger.info("Loaded blockchain");
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
   * @type {P2p}
   */
  p2p;
  /**
   * @type {PendingBlock}
   */
  pendingBlock;
  /**
   * @type {Block[]}
   */
  blocks = [];
  #blockchainDataPath = `${process.cwd()}/blockchain.json`;
  /**
   * @type {Logger}
   */
  logger;
}
