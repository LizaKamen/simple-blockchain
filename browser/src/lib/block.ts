import { Transaction } from "./transaction.js";
import { sha256 } from "./sha256.js";

export class Block {
  nonce: number = 0;
  hash: string = "";

  constructor(
    readonly previousHash: string,
    readonly timestamp: number,
    readonly transactions: Transaction[]
  ) {}

  async mine(): Promise<void> {
    do {
      this.hash = await this.calculateHash(++this.nonce);
    } while (this.hash.startsWith("0000") === false);
  }

  private async calculateHash(nonce: number): Promise<string> {
    const data =
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      nonce;
    return sha256(data);
  }
}
