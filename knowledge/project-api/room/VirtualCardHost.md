---
title: VirtualCardHost
type: api
id: api/room/VirtualCardHost
tags: [API, 房间宿主域（logic/room/）]
---

# VirtualCardHost（类）

- 签名：`export class VirtualCardHost`
- 位置：../../shared/core/logic/room/VirtualCardHost.ts#L22

> 虚拟牌宿主——权威端虚拟牌创建/销毁能力实现（结算瞬态对象）。
> 不维护全局列表：实例由事件/调用方持有引用，结算完调用 destroyVirtualCard。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| constructor | ` constructor(readonly room: Room): VirtualCard` |  |  |
| create | ` create(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard` |  |  |
| createFromCard | ` createFromCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard` |  |  |
| createByNone | ` createByNone(name: string, overrides?: VirtualCardOverrides): VirtualCard` |  |  |
| createFromData | ` createFromData(data: VirtualCardData): VirtualCard` |  |  |
| destroyVirtualCard | ` destroyVirtualCard(vc: VirtualCard): void` |  |  |

### VirtualCardAbility（接口）

- 签名：`export interface VirtualCardAbility`
- 位置：../../shared/core/logic/room/VirtualCardHost.ts#L8

> 虚拟牌能力接口——宿主（如 RoomHost）经此声明 vCard 能力
