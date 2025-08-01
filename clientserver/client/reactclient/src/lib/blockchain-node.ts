import type { Block } from "./block";
import { sha256 } from "./cryptography";
import type { Transaction } from "./transaction";

const HASH_REQUIREMENT = "0000";

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type WithoutHash<T> = Omit<T, "hash">;
export type NotMinedBlock = Omit<Block, "hash" | "nonce">;

export class BlockchainNode {
  private _chain: Block[] = [];
  private _pendingTransactions: Transaction[] = [];
  private _isMining = false;

  initializeWith(blocks: Block[]): void {
    this._chain = [...blocks];
  }

  async initializeWithGenesisBlock(): Promise<void> {
    const genesisBlock = await this.mineBlock({
      previousHash: "0",
      timestamp: Date.now(),
      transactions: [],
    });
    this._chain.push(genesisBlock);
  }

  async mineBlock(block: NotMinedBlock): Promise<Block> {
    this._isMining = true;
    let hash = "";
    let nonce = 0;

    do {
      hash = await this.calculateHash({ ...block, nonce: ++nonce });
    } while (!hash.startsWith(HASH_REQUIREMENT));

    this._isMining = false;
    this._pendingTransactions = [];
    return { ...block, hash, nonce };
  }

  async mineBlockWith(transactions: Transaction[]): Promise<Block> {
    const block = {
      previousHash: this.latestBlock.hash,
      timestamp: Date.now(),
      transactions,
    };
    return this.mineBlock(block);
  }

  get isMining(): boolean {
    return this._isMining;
  }

  get chain(): Block[] {
    return [...this._chain];
  }

  get chainIsEmpty(): boolean {
    return this._chain.length === 0;
  }

  get latestBlock(): Block {
    return this._chain[this._chain.length - 1];
  }

  get pendingTransactions(): Transaction[] {
    return [...this._pendingTransactions];
  }

  get hasPendingTransactions(): boolean {
    return this.pendingTransactions.length > 0;
  }

  get noPendingTransactions(): boolean {
    return this.pendingTransactions.length === 0;
  }

  addTransaction(transaction: Transaction): void {
    this._pendingTransactions.push(transaction);
  }

  async addBlock(newBlock: Block): Promise<void> {
    const errorMessagePrefix = `⚠️ Block "${newBlock.hash.substr(
      0,
      8
    )}" is rejected`;

    const previousBlockIndex = this._chain.findIndex(
      (b) => b.hash === newBlock.previousHash
    );
    if (previousBlockIndex < 0) {
      throw new Error(
        `${errorMessagePrefix} - there is no block in the chain with the specified previous hash "${newBlock.previousHash.substr(
          0,
          8
        )}".`
      );
    }

    const tail = this._chain.slice(previousBlockIndex + 1);
    if (tail.length >= 1) {
      throw new Error(
        `${errorMessagePrefix} - the longer tail of the current node takes precedence over the new block.`
      );
    }

    const newBlockHash = await this.calculateHash(newBlock);
    const prevBlockHash = this._chain[previousBlockIndex].hash;
    const newBlockValid =
      newBlockHash.startsWith(HASH_REQUIREMENT) &&
      newBlock.previousHash === prevBlockHash &&
      newBlock.hash === newBlockHash;
    if (!newBlockValid) {
      throw new Error(`${errorMessagePrefix} - hash verification has failed.`);
    }

    this._chain = [...this._chain, newBlock];
  }

  private async calculateHash(block: WithoutHash<Block>): Promise<string> {
    const data =
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.transactions) +
      block.nonce;
    return sha256(data);
  }
}

export function randomDelay(maxMilliseconds: number = 100): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(),
      Math.floor(Math.random() * Math.floor(maxMilliseconds))
    );
  });
}
