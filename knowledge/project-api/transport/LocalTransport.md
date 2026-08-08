---
title: LocalTransport
type: api
id: api/transport/LocalTransport
tags: [API, 传输域（transport/）]
---

# LocalTransport（类）

- 签名：`export class LocalTransport extends ITransport`
- 位置：../../shared/core/transport/LocalTransport.ts#L13

> 单机直连传输——host 与 mirror 通过内存通道通信。
> deliver 经 serialize/deserialize 生成副本投递，镜像端不共享引用。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| _handlers | `private _handlers: MessageHandler[]` |  |  |
| _peer | `private _peer: LocalTransport \| null` |  |  |
| constructor | ` constructor(logger: ILogger = consoleLogger): void` |  |  |
| connect | ` connect(peer: LocalTransport): void` |  | 建立双向连接 |
| disconnect | ` disconnect(): void` |  | 断开连接 |
| onMessage | ` onMessage(handler: MessageHandler): () => void` |  | 注册消息处理器，返回取消注册函数 |
| deliver | ` protected deliver(msg: Message): void` |  | 实际投递：序列化副本交给对端 |
| _deliver | ` private _deliver(msg: Message): void` |  |  |
