---
title: ITransport
type: api
id: api/transport/ITransport
tags: [API, 传输域（transport/）]
---

# ITransport（类）

- 签名：`export abstract class ITransport`
- 位置：../../shared/core/transport/ITransport.ts#L12

> 传输层抽象类——承担发送控制：帧级 flush（16ms）+ 事务批次 + 待发队列。
> flush 时取出接入 StateStore 的补丁，与业务事件合并组消息投递；
> 同一事务批次可同时含状态变化（patches）与业务消息（event），合并为一条 batch 消息。
> 子类实现 deliver 完成实际投递。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _store | `protected _store?: StateStore` |  | 已接入的状态存储（flush 时自动取补丁） |
| _events | `private _events: Envelope[]` |  | 待发业务事件队列 |
| _timer | `private _timer: ReturnType<typeof setInterval> \| null` |  |  |
| logger | `protected logger: ILogger` |  | 日志接口（可由 Room 构造同步覆盖） |
| constructor | ` constructor(logger: ILogger = consoleLogger): void;` |  |  |
| deliver | ` protected abstract deliver(msg: Message): void;` |  | 子类实现：实际投递一条消息（应序列化副本，不共享引用） |
| attachLogger | ` attachLogger(logger: ILogger): void` |  | 覆盖日志接口（Room 构造时同步权威 logger） |
| attachStore | ` attachStore(store: StateStore): void` |  | 接入状态存储：此后 flush 时自动取 store 产出的补丁 |
| sendEvent | ` sendEvent(type: MessageType \| (string & {}): void` |  | 业务事件入队（自动赋业务序号 id） |
| beginBatch | ` beginBatch(): void` |  | 开启事务批次（帧 tick 遇批次跳过） |
| endBatch | ` endBatch(): void` |  | 结束事务批次：归零时强制发送（批内载荷合并为一条消息） |
| flush | ` flush(): void` |  | 立即发送：取状态补丁 + 出队业务事件，按载荷组合消息投递 |
| startTicking | ` startTicking(intervalMs: number = 16): void` |  | 启动帧级发送（默认 16ms，遇批次跳过） |
| stopTicking | ` stopTicking(): void` |  | 停止帧级发送 |
