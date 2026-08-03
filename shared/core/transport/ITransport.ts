import { StateStore } from '../state/StateStore';
import type { Envelope, EnvelopePayload, Message, MessageType } from './messages';
import type { ILogger } from '../ILogger';
import { consoleLogger } from '../ConsoleLogger';

/**
 * 传输层抽象类——承担发送控制：帧级 flush（16ms）+ 事务批次 + 待发队列。
 * flush 时取出接入 StateStore 的补丁，与业务事件合并组消息投递；
 * 同一事务批次可同时含状态变化（patches）与业务消息（event），合并为一条 batch 消息。
 * 子类实现 deliver 完成实际投递。
 */
export abstract class ITransport {
    /** 已接入的状态存储（flush 时自动取补丁） */
    protected _store?: StateStore;
    /** 待发业务事件队列 */
    private _events: Envelope[] = [];
    private _inBatch = 0;
    private _seq = 0;
    private _eventId = 0;
    private _timer: ReturnType<typeof setInterval> | null = null;
    /** 日志接口（可由 Room 构造同步覆盖） */
    protected logger: ILogger;

    constructor(logger: ILogger = consoleLogger) {
        this.logger = logger;
    }

    /** 子类实现：实际投递一条消息（应序列化副本，不共享引用） */
    protected abstract deliver(msg: Message): void;

    /** 覆盖日志接口（Room 构造时同步权威 logger） */
    attachLogger(logger: ILogger): void {
        this.logger = logger;
    }

    /** 接入状态存储：此后 flush 时自动取 store 产出的补丁 */
    attachStore(store: StateStore): void {
        this._store = store;
    }

    /** 业务事件入队（自动赋业务序号 id） */
    sendEvent(type: MessageType | (string & {}), data: EnvelopePayload): void {
        this._events.push({ type, id: ++this._eventId, data });
        this.logger.debug('业务事件入队', { type, id: this._eventId });
    }

    /** 开启事务批次（帧 tick 遇批次跳过） */
    beginBatch(): void {
        this._inBatch++;
        this.logger.debug('开启事务批次', { depth: this._inBatch });
    }

    /** 结束事务批次：归零时强制发送（批内载荷合并为一条消息） */
    endBatch(): void {
        if (this._inBatch > 0) {
            this._inBatch--;
            if (this._inBatch === 0) this.flush();
        }
    }

    /** 立即发送：取状态补丁 + 出队业务事件，按载荷组合消息投递 */
    flush(): void {
        if (this._inBatch > 0) return;
        const patches = this._store?.flush() ?? [];
        const events = this._events;
        this._events = [];
        if (patches.length === 0 && events.length === 0) return;
        const seq = ++this._seq;
        if (patches.length > 0 && events.length > 0) {
            this.deliver({ kind: 'batch', seq, patches, events });
            this.logger.debug('发送消息', { kind: 'batch', seq, patches: patches.length, events: events.length });
        } else if (patches.length > 0) {
            this.deliver({ kind: 'patches', seq, patches });
            this.logger.debug('发送消息', { kind: 'patches', seq, patches: patches.length });
        } else if (events.length === 1) {
            this.deliver({ kind: 'event', seq, event: events[0] });
            this.logger.debug('发送消息', { kind: 'event', seq, type: events[0].type });
        } else {
            this.deliver({ kind: 'batch', seq, events });
            this.logger.debug('发送消息', { kind: 'batch', seq, events: events.length });
        }
    }

    /** 启动帧级发送（默认 16ms，遇批次跳过） */
    startTicking(intervalMs: number = 16): void {
        if (this._timer) return;
        this._timer = setInterval(() => {
            if (this._inBatch === 0) this.flush();
        }, intervalMs);
    }

    /** 停止帧级发送 */
    stopTicking(): void {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    }
}
