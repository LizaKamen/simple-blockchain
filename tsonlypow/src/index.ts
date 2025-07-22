import { Blockchain } from "./blockchain";

console.log("Creating the blockchain with the genesis block...");
const blockchain = new Blockchain();
console.log("Mining block #1...");
blockchain.addBlock("First block");
console.log("Mining block #2...");
blockchain.addBlock("Second block");
console.log(JSON.stringify(blockchain, null, 2));
