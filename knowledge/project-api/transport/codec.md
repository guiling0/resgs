---
title: codec
type: api
id: api/transport/codec
tags: [API, 传输域（transport/）]
---

# codec（传输域（transport/））

### serialize（函数）

- 签名：`export function serialize(msg: Message): string {`
- 位置：../../shared/core/transport/codec.ts#L4

> 序列化：消息 → JSON 字符串

### deserialize（函数）

- 签名：`export function deserialize(data: string): Message {`
- 位置：../../shared/core/transport/codec.ts#L9

> 反序列化：JSON 字符串 → 消息
