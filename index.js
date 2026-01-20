import P2p from "./js/p2p.js";
import Blockchain from "./js/blockchain.js";
import Wallet from "./js/wallet.js";

const b = new Blockchain("node");
const w = new Wallet(b);
