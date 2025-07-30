import { useCallback, useEffect, useState } from "react";
import "./App.css";
import TransactionForm from "./TransactionForm";
import PendingTransactionsPanel from "./PendingTransactionsPanel";
import BlocksPanel from "./BlocksPanel";
import { MessageTypes, type Message } from "../lib/messages";
import { SignalRController } from "../lib/signalr-controller";
import { BlockchainNode } from "../lib/blockchain-node";
import type { Transaction } from "../lib/Transaction";
import type { Block } from "../lib/block";

const server = new SignalRController();
const node = new BlockchainNode();

const App: React.FC = () => {
  const [status, setStatus] = useState<string>("");

  const handleGetLongestChainRequest = useCallback((message: Message) => {
    server.send({
      type: MessageTypes.GetLongestChainResponse,
      correlationId: message.correlationId,
      payload: node.chain,
    });
  }, []);

  const handleNewBlockRequest = useCallback(async (message: Message) => {
    const transactions = message.payload as Transaction[];
    const miningProcessIsDone = node.mineBlockWith(transactions);

    setStatus(getStatus(node));

    const newBlock = await miningProcessIsDone;
    addBlock(newBlock);
  }, []);

  const handleNewBlockAnnouncement = useCallback(async (message: Message) => {
    const newBlock = message.payload as Block;
    addBlock(newBlock, false);
  }, []);

  const handleServerMessages = useCallback(
    (message: Message) => {
      switch (message.type) {
        case MessageTypes.GetLongestChainRequest:
          return handleGetLongestChainRequest(message);
        case MessageTypes.NewBlockRequest:
          return handleNewBlockRequest(message);
        case MessageTypes.NewBlockAnnouncement:
          return handleNewBlockAnnouncement(message);
        default: {
          console.log(`Received message of unknown type: "${message.type}"`);
        }
      }
    },
    [
      handleGetLongestChainRequest,
      handleNewBlockAnnouncement,
      handleNewBlockRequest,
    ]
  );

  useEffect(() => {
    async function initializeBlockchainNode() {
      await server.connect(handleServerMessages);
      const blocks = await server.requestLongestChain();
      if (blocks.length > 0) {
        node.initializeWith(blocks);
      } else {
        await node.initializeWithGenesisBlock();
      }
      setStatus(getStatus(node));
    }

    initializeBlockchainNode();
    console.log(node.latestBlock);
    return () => server.disconnect();
  }, [handleServerMessages]);

  useEffect(() => {
    setStatus(getStatus(node));
  }, []);

  function addTransaction(transaction: Transaction): void {
    node.addTransaction(transaction);
    setStatus(getStatus(node));
  }

  async function generateBlock() {
    server.requestNewBlock(node.pendingTransactions);
    const miningProcessIsDone = node.mineBlockWith(node.pendingTransactions);

    setStatus(getStatus(node));

    const newBlock = await miningProcessIsDone;
    addBlock(newBlock);
  }

  async function addBlock(block: Block, notifyOthers = true): Promise<void> {
    try {
      await node.addBlock(block);
      if (notifyOthers) {
        server.announceNewBlock(block);
      }
    } catch (error) {
      console.log(error);
    }
    setStatus(getStatus(node));
  }

  return (
    <main>
      <h1>Blockchain node</h1>
      <aside>
        <p>{status}</p>
      </aside>
      <section>
        <TransactionForm
          onAddTransaction={addTransaction}
          disabled={node.isMining || node.chainIsEmpty}
        />
      </section>
      <section>
        <PendingTransactionsPanel
          formattedTransactions={formatTransactions(node.pendingTransactions)}
          onGenerateBlock={generateBlock}
          disabled={node.isMining || node.noPendingTransactions}
        />
      </section>
      <section>
        <BlocksPanel blocks={node.chain} />
      </section>
    </main>
  );
};

function getStatus(node: BlockchainNode): string {
  return node.chainIsEmpty
    ? "⏳ Initializing the blockchain..."
    : node.isMining
    ? "⏳ Mining a new block..."
    : node.noPendingTransactions
    ? "📩 Add one or more transactions."
    : `✅ Ready to mine a new block (transactions: ${node.pendingTransactions.length}).`;
}

function formatTransactions(transactions: Transaction[]): string {
  return transactions
    .map((t) => `${t.sender} → ${t.recipient}: $${t.amount}`)
    .join("\n");
}

export default App;
