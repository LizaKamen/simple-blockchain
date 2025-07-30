import type { Block } from "./block";
import { uuid } from "./cryptography";
import { type Message, MessageTypes, type UUID } from "./messages";
import * as signalR from "@microsoft/signalr";
import type { Transaction } from "./transaction";

interface PromiseExecutor<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
}

export class SignalRController {
  private connection!: signalR.HubConnection;
  private readonly messagesAwaitingReply = new Map<
    UUID,
    PromiseExecutor<Message>
  >();
  private messagesCallback!: (messages: Message) => void;

  private get url(): string {
    return import.meta.env.VITE_API_URL;
  }

  async connect(messagesCallback: (messages: Message) => void): Promise<void> {
    this.messagesCallback = messagesCallback;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on("HandleMessage", (message: Message) => {
      this.onMessageReceived(message);
    });

    try {
      await this.connection.start();
      console.log("SignalR Connected.");
    } catch (err) {
      console.log("Error while establishing SignalR connection: ", err);
      throw err;
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
    }
  }

  private readonly onMessageReceived = (message: Message) => {
    if (this.messagesAwaitingReply.has(message.correlationId)) {
      this.messagesAwaitingReply.get(message.correlationId)!.resolve(message);
      this.messagesAwaitingReply.delete(message.correlationId);
    } else {
      this.messagesCallback(message);
    }
  };

  async send(
    message: Partial<Message>,
    awaitForReply: boolean = false
  ): Promise<Message> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<Message>(async (resolve, reject) => {
      if (awaitForReply) {
        this.messagesAwaitingReply.set(message.correlationId!, {
          resolve,
          reject,
        });
      }

      try {
        await this.connection.invoke("SendMessage", JSON.stringify(message));
      } catch (err) {
        this.messagesAwaitingReply.delete(message.correlationId!);
        reject(err);
      }
    });
  }

  async requestLongestChain(): Promise<Block[]> {
    const reply = await this.send(
      {
        type: MessageTypes.GetLongestChainRequest,
        correlationId: uuid(),
      },
      true
    );
    return reply.payload as Block[];
  }

  requestNewBlock(transactions: Transaction[]): void {
    this.send({
      type: MessageTypes.NewBlockRequest,
      correlationId: uuid(),
      payload: transactions,
    });
  }

  announceNewBlock(block: Block): void {
    this.send({
      type: MessageTypes.NewBlockAnnouncement,
      correlationId: uuid(),
      payload: block,
    });
  }
}
