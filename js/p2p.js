import fs from "fs";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import Blockchain from "./blockchain.js";
import Node from "./node.js";
import Logger from "./logger.js";

export default class P2p {
  /**
   * @param {"node"|"seed"} type
   * @param {Blockchain} blockchain
   */
  constructor(type, blockchain) {
    this.logger = new Logger("P2p");
    this.blockchain = blockchain;
    this.setSeeds();

    const port = String(Math.floor(Math.random() * (8999 - 8335 + 1)) + 8335);
    if (type == "seed")
      this.node = new Node({ p2p: this, port: "8334", ip: "localhost", type });
    else this.node = new Node({ p2p: this, port, ip: "localhost", type });
    this.logger.info(
      "Initialized node:\n" + JSON.stringify(this.node.toJSON(), null, 2)
    );
    if (type == "node") this.startNode();
    else this.startSeed();
  }

  startSeed() {
    this.logger.info("Starting as seed");
    this.startWSS();
  }

  startNode() {
    return new Promise(async () => {
      this.logger.info("Starting as node");
      this.startWSS();

      await this.getSeedConnection().catch((e) => {
        this.logger.abortWithError(e);
      });
      const nodeDataList = await this.getRandomNode("seed").getNodeDataList(
        "node"
      );
      if (nodeDataList.length == 0)
        this.logger.warn("No active node found, starting network");
      else this.logger.info(`Recieved node list (${nodeDataList.length})`);

      await this.connectNodeList(nodeDataList);

      this.logger.info("Finished node setup");

      this.#emit("initialized");
    });
  }

  getSeedConnection() {
    return new Promise(async (resolve, reject) => {
      const shuffledSeeds = this.getShuffledSeeds();
      for (let i = 0; i < shuffledSeeds.length; i++) {
        const seed = shuffledSeeds[i];
        this.logger.info(
          `Establishing seed connection (${seed.ip}:${seed.port})`
        );

        let ws;
        try {
          ws = await this.tryNode(seed);
        } catch (err) {
          this.logger.warn(`Failed seed connection (${err})`);
          continue;
        }

        const node = new Node({ ...seed, ws, p2p: this });
        this.nodes.push(node);
        this.logger.info("Established seed connection");
        return resolve();
      }
      reject("Failed to get seed connection");
    });
  }

  /**
   * @param {Node[]} nodeList
   */
  connectNodeList(nodeList) {
    return new Promise((resolve) => {
      if (nodeList.length == 0) return resolve();
      let finishedNodes = 0;
      nodeList.forEach(async (nodeData) => {
        const ws = await this.tryNode(nodeData).catch((err) => {
          finishedNodes++;
          this.logger.info(
            `Failed to connected to node (${finishedNodes}/${nodeList.length})`
          );
          if (finishedNodes == nodeList.length) resolve();
        });
        finishedNodes++;
        this.logger.info(
          `Successfully connected to node (${finishedNodes}/${nodeList.length})`
        );
        const node = new Node({ ...nodeData, ws, p2p: this });
        this.nodes.push(node);
        if (finishedNodes == nodeList.length) resolve();
      });
    });
  }

  /**
   * @param {Node} seed
   * @returns {Promise<WebSocket>}
   */
  tryNode(node) {
    return new Promise((resolve, reject) => {
      const ws = io(`http://${node.ip}:${node.port}`, {
        reconnection: false,
      });

      ws.on("connect", () => {
        ws.emit("init", JSON.stringify(this.node.toJSON()));
        ws.on("connectionAccepted", () => {
          resolve(ws);
        });
      });
      ws.on("disconnect", () => {
        reject("connection closed");
      });
      ws.on("connect_error", (e) => {
        reject(e.message);
      });
    });
  }

  //getLastNode

  setSeeds() {
    const data = fs.readFileSync(this.#seedsPath);
    const seedsJSON = JSON.parse(data);

    this.seeds = [];
    seedsJSON.forEach((seedJSON) => {
      this.seeds.push(new Node(seedJSON));
    });
  }
  /**
   * @param {"initialized"} type
   * @param  {...any} data
   */
  #emit(type, ...data) {
    this.callbacks.forEach((callback) => {
      if (callback.type == type) callback.cb(...data);
    });
  }
  /**
   * @param {"initialized"} type
   * @param {() => void} cb
   */
  on(type, cb) {
    this.callbacks.push({ type, cb });
  }
  /**
   * @type {{type:"initialized",cb:()=> void}[]}
   */
  callbacks = [];
  /**
   * @param {string} data
   * @param {"init"} type
   * @returns
   */
  sanitizeData(data, type) {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return null;
    }
    if (typeof data !== "object") return null;

    switch (type) {
      case "init":
        return {
          ip: data.ip,
          port: data.port,
          type: data.type,
        };
    }
    return null;
  }

  getShuffledSeeds() {
    const shuffledSeeds = [...this.seeds];
    for (let i = shuffledSeeds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      shuffledSeeds[i], (shuffledSeeds[j] = shuffledSeeds[j]), shuffledSeeds[i];
    }
    return shuffledSeeds;
  }
  /**
   * @param {"node"|"seed"} type
   * @param  {...Node} exclusionNodes
   * @returns {Node[]}
   */
  filterNodes(type = null, ...exclusionNodes) {
    return this.nodes.filter(
      (node) => (node.type == type || !type) && !exclusionNodes.includes(node)
    );
  }
  /**
   * @param {"node"|"seed"} type
   * @param  {...Node} exclusionNodes
   * @returns {Node|null}
   */
  getRandomNode(type = null, ...exclusionNodes) {
    const selectedNodes = this.filterNodes(type, ...exclusionNodes);

    if (selectedNodes.length == 0) return null;
    return selectedNodes[Math.floor(Math.random() * selectedNodes.length)];
  }
  /**
   * @param {Node} node
   */
  removeNode(node) {
    const idx = this.nodes.indexOf(node);
    if (idx == -1) return this.logger.warn("Tried removeing nonexistent node");

    this.nodes.splice(idx, 1);
    this.logger.info("Closed connection with node");

    if (node.type !== "seed") return;
    this.logger.warn("Seed disconnected");
    this.getSeedConnection().catch((err) => {
      this.logger.abortWithError(err);
    });
  }
  startWSS() {
    this.wss = new Server(this.node.port, {
      cors: { origin: "*" },
    });

    this.wss.on("connection", (ws) => {
      this.logger.info("Establishing node connection");
      ws.on("init", (data) => {
        this.logger.info("Recieved init request");
        const nodeData = this.sanitizeData(data, "init");
        if (!nodeData) {
          this.logger.warn("Rejected node connection");
          return ws.disconnect(true);
        }

        ws.emit("connectionAccepted");
        const node = new Node({ ...nodeData, ws, p2p: this });
        this.nodes.push(node);
        this.logger.info("Established node connection");
      });
    });
  }
  /**
   * @type {Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>}
   */
  wss;
  #seedsPath = `${process.cwd()}/seeds.json`;
  /**
   * @type {Node[]}
   */
  seeds;
  /**
   * @type {Node[]}
   */
  nodes = [];
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {Blockchain}
   */
  blockchain;
  /**
   * @type {Logger}
   */
  logger;
}
