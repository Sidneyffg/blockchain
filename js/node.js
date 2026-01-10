import WebSocket from "ws";

export default class Node {
  /**
   * @param {Object} options
   * @param {string} options.ip
   * @param {string} options.port
   * @param {"node"|"seed"} options.type
   * @param {WebSocket} options.ws
   */
  constructor({ ip, port, type, ws }) {
    this.ip = ip;
    this.port = port;
    this.type = type;
    this.ws = ws;
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
}
