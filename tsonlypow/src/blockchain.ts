import { Block } from "./block";

export class Blockchain {
  private readonly chain: Block[] = [];

  private get latestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  constructor() {
    this.chain.push(new Block(0, "0", Date.now(), "Genesis block"));
  }

  addBlock(data: string): void {
    const block = new Block(
      this.latestBlock.index + 1,
      this.latestBlock.hash,
      Date.now(),
      data
    );

    this.chain.push(block);
  }
}
