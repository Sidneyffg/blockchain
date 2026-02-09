import WebSocket from "ws";
import P2p from "./p2p.js";
import Block from "./block.js";

export default class Node {
  /**
   * @param {Object} options
   * @param {P2p} options.p2p
   * @param {string} options.ip
   * @param {string} options.port
   * @param {"node"|"seed"} options.type
   * @param {WebSocket} options.ws
   */
  constructor({ p2p, ip, port, type, ws }) {
    this.p2p = p2p;
    this.ip = ip;
    this.port = port;
    this.type = type;
    this.ws = ws;

    if (!ws) return;
    ws.on("disconnect", () => {
      this.p2p.removeNode(this);
    });
    ws.on("getRandomNodeData", (type, cb) => {
      const randomNode = this.p2p.getRandomNode(type, this);
      if (!randomNode) return cb(null);
      cb(randomNode.toJSON());
    });
    ws.on("getNodeDataList", (type, cb) => {
      const nodeList = this.p2p.filterNodes(type, this);
      const nodeDataList = nodeList.map((node) => node.toJSON());
      cb(nodeDataList);
    });
    ws.on("getLastBlockData", (cb) => {
      const lastBlock = this.p2p.blockchain.lastBlock;
      if (!lastBlock) return cb(null);
      cb(JSON.stringify(lastBlock));
    });
  }

  /**
   * @param {"node"|"seed"} type
   * @returns {Promise<Node|null>}
   */
  getRandomNodeData(type) {
    return new Promise((resolve) => {
      this.ws.emit("getRandomNodeData", type, (nodeData) => {
        if (!nodeData) return resolve(null);
        else resolve(nodeData);
      });
    });
  }
  /**
   * @param {"node"|"seed"} type
   * @returns {Promise<Node[]>}
   */
  getNodeDataList(type) {
    return new Promise((resolve) => {
      this.ws.emit("getNodeDataList", type, (nodes) => {
        resolve(nodes);
      });
    });
  }

  /**
   * @returns {Promise<Block|null>}
   */
  getLastBlockData() {
    return new Promise((resolve) => {
      console.log(this.port);
      this.ws.emit("getLastBlockData", (block) => {
        if (!block) return resolve(null);
        try {
          const blockData = JSON.parse(block);
          resolve(blockData);
        } catch (err) {
          resolve(null);
        }
      });
    });
  }

  toJSON() {
    return {
      ip: this.ip,
      port: this.port,
      type: this.type,
    };
  }
  /**
   * @type {string}
   */
  ip;
  /**
   * @type {"node"|"seed"}
   */
  type;
  /**
   * @type {WebSocket}
   */
  ws;
  /**
   * @type {P2p}
   */
  p2p;
}
