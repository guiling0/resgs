import type { Message } from './types';
import type { ITransport } from './ITransport';
import { serialize, deserialize } from './codec';

type MessageHandler = (msg: Message) => void;

/**
 * 单机直连传输——host 与 mirror 通过内存通道通信。
 * 内部用 serialize/deserialize 切断引用共享。
 */
export class LocalTransport implements ITransport {
  private _handlers: MessageHandler[] = [];
  private _peer: LocalTransport | null = null;

  /** 建立双向连接 */
  connect(peer: LocalTransport): void {
    this._peer = peer;
    peer._peer = this;
  }

  /** 断开连接 */
  disconnect(): void {
    if (this._peer) {
      this._peer._peer = null;
      this._peer = null;
    }
  }

  send(msg: Message): void {
    if (!this._peer) return;
    const copy = deserialize(serialize(msg));
    this._peer._deliver(copy);
  }

  onMessage(handler: MessageHandler): () => void {
    this._handlers.push(handler);
    return () => {
      const idx = this._handlers.indexOf(handler);
      if (idx !== -1) this._handlers.splice(idx, 1);
    };
  }

  private _deliver(msg: Message): void {
    for (const handler of this._handlers) {
      try {
        handler(msg);
      } catch (e) {
        console.error('[LocalTransport] handler error:', e);
      }
    }
  }
}
