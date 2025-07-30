import type { Transaction } from "./transaction";

export interface Block {
  readonly hash: string;
  readonly nonce: number;
  readonly previousHash: string;
  readonly timestamp: number;
  readonly transactions: Transaction[];
}
