import fs from "fs";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import Node from "./node.js";
import Logger from "./logger.js";

export default class P2p {
  constructor() {
    this.logger = new Logger("P2p");
    this.setSeeds();

    //this.startSeed();
    this.startNode();
  }

  startSeed() {
    this.logger.info("Starting as seed");
    const wss = new Server(this.port, {
      cors: { origin: "*" },
    });

    wss.on("connection", (ws) => {
      this.logger.info("Establishing node connection");
      ws.on("init", (data) => {
        this.logger.info("Recieved init request");
        const nodeJSON = this.sanitizeData(data, "init");
        if (!nodeJSON) {
          this.logger.warn("Rejected node connection");
          return ws.disconnect(true);
        }

        ws.emit("connectionAccepted");
        const node = new Node({ ...nodeJSON, ws });
        this.nodes.push(node);
        this.logger.info("Established node connection");
      });
    });
  }

  startNode() {
    return new Promise(async () => {
      this.logger.info("Starting as node");
      await this.getSeedConnection().catch((e) => {
        this.logger.abortWithError(e);
      });
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
          ws = await this.trySeed(seed);
        } catch (err) {
          this.logger.warn(`Failed seed connection (${err})`);
          continue;
        }

        const node = new Node({ ...seed, ws });
        this.nodes.push(node);
        this.logger.info("Established seed connection");
        return resolve();
      }
      reject("Failed to get seed connection");
    });
  }

  /**
   * @param {Node} seed
   * @returns {Promise<WebSocket>}
   */
  trySeed(seed) {
    return new Promise((resolve, reject) => {
      const ws = io(`http://${seed.ip}:${seed.port}`);

      ws.on("connect", () => {
        this.logger.info("Established open connection");
        ws.emit(
          "init",
          JSON.stringify({ ip: "0.0.0.0", port: "12345", type: "node" })
        );
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

  setSeeds() {
    const data = fs.readFileSync(this.#seedsPath);
    const seedsJSON = JSON.parse(data);

    this.seeds = [];
    seedsJSON.forEach((seedJSON) => {
      this.seeds.push(new Node(seedJSON));
    });
  }
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
   * @type {WebSocketServer}
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
  port = 8334;

  /**
   * @type {Logger}
   */
  logger;
}
