import { Block } from "../lib/block.js";
import { Blockchain } from "../lib/blockchain.js";

enum Status {
  Initialization = "Initializing the blockchain, creating the genesis block...",
  AddTransaction = "Add one or more transactions.",
  ReadyToMine = "Ready to mine a new block.",
  MineInProgress = "Mining a new block...",
}

const amount = document.getElementById("amount") as HTMLInputElement;
const blocks = document.getElementById("blocks") as HTMLDivElement;
const confirmBtn = document.getElementById("confirm") as HTMLButtonElement;
const pendingTransactions = document.getElementById(
  "pending-transactions"
) as HTMLPreElement;
const recipient = document.getElementById("recipient") as HTMLInputElement;
const sender = document.getElementById("sender") as HTMLInputElement;
const statusP = document.getElementById("status") as HTMLParagraphElement;
const transferBtn = document.getElementById("transfer") as HTMLButtonElement;

(async function main(): Promise<void> {
  transferBtn.addEventListener("click", addTransaction);
  confirmBtn.addEventListener("click", mineBlock);

  statusP.textContent = Status.Initialization;

  const blockchain = new Blockchain();
  await blockchain.createGenesisBlock();
  blocks.innerHTML = blockchain.chain
    .map((b, i) => generateBlockHtml(b, i))
    .join("");
  statusP.textContent = Status.AddTransaction;
  toggleState(true, false);

  function addTransaction() {
    blockchain.createTransaction({
      sender: sender.value,
      recipient: recipient.value,
      amount: parseInt(amount.value),
    });

    toggleState(false, false);
    pendingTransactions.textContent = blockchain.pendingTransactions
      .map((t) => `${t.sender} * ${t.recipient}: $${t.amount}`)
      .join("\n");
    statusP.textContent = Status.ReadyToMine;

    sender.value = "";
    recipient.value = "";
    amount.value = "0";
  }

  async function mineBlock() {
    statusP.textContent = Status.MineInProgress;
    toggleState(true, true);
    await blockchain.minePendingTransactions();

    pendingTransactions.textContent = "No pending transactions at the moment.";
    statusP.textContent = Status.AddTransaction;
    blocks.innerHTML = blockchain.chain
      .map((b, i) => generateBlockHtml(b, i))
      .join("");
    toggleState(true, false);
  }
})();

function toggleState(confirmation: boolean, transferForm: boolean): void {
  transferBtn.disabled =
    amount.disabled =
    sender.disabled =
    recipient.disabled =
      transferForm;
  confirmBtn.disabled = confirmation;
}

function generateBlockHtml(block: Block, index: number) {
  return `
    <div class="block">
      <span class="block__index">#${index}</span>
      <span class="block__timestamp">${new Date(
        block.timestamp
      ).toLocaleTimeString()}</span>
      <div class="prev-hash">
        <div class="hash-title">← PREV HASH</div>
        <div class="hash-value">${block.previousHash}</div>
      </div>
      <div class="this-hash">
        <div class="hash-title">THIS HASH</div>
        <div class="hash-value">${block.hash}</div>
      </div>
      <div class="block__transactions">
        <div class="hash-title">TRANSACTIONS</div>
        <pre class="transactions-value">${block.transactions.map(
          (t) => `${t.sender} → ${t.recipient} - $${t.amount}`
        )}</pre>
      </div>
    </div>
  `;
}
