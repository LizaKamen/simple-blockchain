import { Block } from "./block.js";
import { Transaction } from "./transaction.js";

export class Blockchain {
  private readonly _chain: Block[] = [];
  private _pendingTransactions: Transaction[] = [];
  private get latestBlock(): Block {
    return this._chain[this._chain.length - 1];
  }
  get chain(): Block[] {
    return [...this._chain];
  }
  get pendingTransactions(): Transaction[] {
    return [...this._pendingTransactions];
  }

  async createGenesisBlock(): Promise<void> {
    const genesisBlock = new Block("0", Date.now(), []);
    await genesisBlock.mine();
    this._chain.push(genesisBlock);
  }

  createTransaction(transaction: Transaction): void {
    this._pendingTransactions.push(transaction);
  }

  async minePendingTransactions(): Promise<void> {
    const block = new Block(
      this.latestBlock.hash,
      Date.now(),
      this._pendingTransactions
    );
    await block.mine();
    this._chain.push(block);
    this._pendingTransactions = [];
  }
}
