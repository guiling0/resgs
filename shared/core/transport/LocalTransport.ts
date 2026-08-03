import { ITransport } from './ITransport';
import type { Message } from './messages';
import { serialize, deserialize } from './codec';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';

type MessageHandler = (msg: Message) => void;

/**
 * 单机直连传输——host 与 mirror 通过内存通道通信。
 * deliver 经 serialize/deserialize 生成副本投递，镜像端不共享引用。
 */
export class LocalTransport extends ITransport {
    private _handlers: MessageHandler[] = [];
    private _peer: LocalTransport | null = null;

    constructor(logger: ILogger = consoleLogger) {
        super(logger);
    }

    /** 建立双向连接 */
    connect(peer: LocalTransport): void {
        this._peer = peer;
        peer._peer = this;
        this.logger.debug('建立本地连接');
    }

    /** 断开连接 */
    disconnect(): void {
        if (this._peer) {
            this._peer._peer = null;
            this._peer = null;
            this.logger.debug('断开本地连接');
        }
    }

    /** 注册消息处理器，返回取消注册函数 */
    onMessage(handler: MessageHandler): () => void {
        this._handlers.push(handler);
        return () => {
            const idx = this._handlers.indexOf(handler);
            if (idx !== -1) this._handlers.splice(idx, 1);
        };
    }

    /** 实际投递：序列化副本交给对端 */
    protected deliver(msg: Message): void {
        if (!this._peer) return;
        const copy = deserialize(serialize(msg));
        this._peer._deliver(copy);
        this.logger.debug('投递消息', { kind: msg.kind });
    }

    private _deliver(msg: Message): void {
        for (const handler of this._handlers) {
            handler(msg);
        }
    }
}
