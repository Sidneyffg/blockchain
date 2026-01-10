import P2p from "./js/p2p.js";
import Blockchain from "./js/blockchain.js";
import Wallet from "./js/wallet.js";

const p = new P2p()
const b = new Blockchain();
const w = new Wallet(b);
