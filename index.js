import Blockchain from "./js/blockchain.js";
import Wallet from "./js/wallet.js";
import Miner from "./js/miner.js";

const b = new Blockchain("node");
const w = new Wallet(b);
const m = new Miner(b, w);
