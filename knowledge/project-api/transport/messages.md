---
title: messages
type: api
id: api/transport/messages
tags: [API, 传输域（transport/）]
---

# messages（传输域（transport/））

### MessageType（枚举）

- 签名：`export enum MessageType`
- 位置：../../shared/core/transport/messages.ts#L4

> 业务消息类型常量（Envelope 路由判别符，与 EnvelopePayload 联合成员对应）

### EnvelopePayload（类型别名）

- 签名：`export type EnvelopePayload =`
- 位置：../../shared/core/transport/messages.ts#L9

> 业务消息体联合（判别联合；成员带 type 判别符，Envelope.data 使用）

### Envelope（接口）

- 签名：`export interface Envelope`
- 位置：../../shared/core/transport/messages.ts#L13

> 业务消息信封：{type: 业务类型, id: 序号, data: 消息体}

### Message（类型别名）

- 签名：`export type Message =`
- 位置：../../shared/core/transport/messages.ts#L26

> 传输消息联合（host↔client 通道消息）：snapshot / patches / event / batch。
> batch 为事务批次产物，一条消息携带混合载荷（patches + events）。
