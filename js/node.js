import WebSocket from "ws";
import P2p from "./p2p.js";

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
    ws.on("getRandomNode", (type, cb) => {
      const randomNode = this.p2p.getRandomNode(type, this);
      cb(randomNode);
    });
  }

  /**
   * @param {"node"|"seed"} type
   * @returns {Promise<Node|null>}
   */
  getRandomNode(type) {
    return new Promise((resolve) => {
      this.ws.emit("getRandomNode", type, (node) => {
        resolve(node);
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
