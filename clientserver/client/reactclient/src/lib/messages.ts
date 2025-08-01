export type UUID = string;

export interface Message {
  correlationId: UUID;
  type: string;
  payload?: unknown;
}

export enum MessageTypes {
  GetLongestChainRequest = "GET_LONGEST_CHAIN_REQUEST",
  GetLongestChainResponse = "GET_LONGEST_CHAIN_RESPONSE",
  NewBlockRequest = "NEW_BLOCK_REQUEST",
  NewBlockAnnouncement = "NEW_BLOCK_ANNOUNCEMENT",
}
