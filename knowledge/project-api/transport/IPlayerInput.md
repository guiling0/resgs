---
title: IPlayerInput
type: api
id: api/transport/IPlayerInput
tags: [API, 传输域（transport/）]
---

# IPlayerInput（传输域（transport/））

### IPlayerInput（接口）

- 签名：`export interface IPlayerInput`
- 位置：../../shared/core/transport/IPlayerInput.ts#L7

> 玩家输入接口（传输层，入站方向）。
> 服务端经此接口向客户端发送选择请求；响应经 ChooseManager.respond() 回传（网络层收到客户端消息后调用）。
