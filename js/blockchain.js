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

    /*this.pendingBlock.tryNewHash();
    this.setPendingBlock();
    this.pendingBlock.tryNewHash();
    this.setPendingBlock();
    this.pendingBlock.tryNewHash();
    this.setPendingBlock();*/

    this.p2p = new P2p(type, this);
    this.p2p.on("initialized", () => this.initNetwork());
  }

  async initNetwork() {
    const peerLastBlockDatas = await this.p2p.getDataFromMaxNodes(
      "getLastBlockData",
      5,
    );
    if (peerLastBlockDatas.length == 0) {
      this.logger.info("No blocks found in network, starting new blockchain");
      return;
    }

    const peerLastBlockData = this.getMostCommonBlock(peerLastBlockDatas);
    if (this.compareBlocks(peerLastBlockData, this.lastBlock)) {
      this.logger.info("Blockchain is up to date");
      return;
    }

    const selfLastBlockIdx = this.lastBlock ? this.lastBlock.idx : 0;
    const lastKnownPeerBlockDatas = await this.p2p.getDataFromMaxNodes(
      "getBlockDataByIdx",
      5,
      selfLastBlockIdx,
    );

    const lastKnownPeerBlockData = this.getMostCommonBlock(
      lastKnownPeerBlockDatas,
    );
    if (this.compareBlocks(lastKnownPeerBlockData, this.lastBlock)) {
      this.logger.info("Last block found in network, adding missing blocks");
      const newBlocksDatas = await this.getBlocksFromPeers(
        selfLastBlockIdx + 1,
        peerLastBlockData.idx - 1,
      );
      console.log(
        "newBlocksDatas",
        newBlocksDatas,
        selfLastBlockIdx + 1,
        peerLastBlockData.idx - 1,
      );
      newBlocksDatas.forEach((blockData) => {
        this.addBlock(new Block(blockData));
      });
      this.save();
    }
  }

  /**
   * @param {number} startIdx
   * @param {number} endIdx
   * @returns
   */
  getBlocksFromPeers(startIdx, endIdx) {
    return new Promise(async (resolve) => {
      const newBlockDataList = [];
      for (let i = startIdx; i <= endIdx; i++) {
        const blockDataList = await this.p2p.getDataFromMaxNodes(
          "getBlockDataByIdx",
          5,
          i,
        );
        if (blockDataList.length == 0) {
          return this.logger.abortWithError("No block data found for index", i);
        }
        const mostCommonBlockData = this.getMostCommonBlock(blockDataList);
        newBlockDataList.push(mostCommonBlockData);
      }
      resolve(newBlockDataList);
    });
  }

  /**
   * @param {Block[]} blocks
   * @returns {Block|null}
   */
  getMostCommonBlock(blocks) {
    const blockCountMap = {};
    let highestCount = 0;
    let mostCommonBlock = null;

    blocks.forEach((block) => {
      const key = `${block.idx}-${block.hash}`;
      if (!blockCountMap[key]) blockCountMap[key] = { count: 0, data: block };
      blockCountMap[key].count++;
      if (blockCountMap[key].count > highestCount) {
        highestCount = blockCountMap[key].count;
        mostCommonBlock = blockCountMap[key].data;
      }
    });
    return mostCommonBlock;
  }

  compareBlocks(blockA, blockB) {
    try {
      if (blockA.hash == blockB.hash && blockA.idx == blockB.idx) return true;
      else return false;
    } catch (err) {
      return false;
    }
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
    return;
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
