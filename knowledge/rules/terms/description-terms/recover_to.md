---
title: <一名角色>将体力回复至<X>点
type: term
id: terms/description-terms/recover_to
tags: [牌面描述]
---

# <一名角色>将体力回复至<X>点

若Y：等于Z或不小于X，其不能执行此操作；小于Z且小于X，其执行此操作即回复(min{X,Z}-Y)点体力。（Y为其体力；Z为其体力上限）

```
马岱（旧将）对自己使用【酒】后，对体力上限为1的庞统使用【杀】，在此【杀】造成伤害时❷对庞统发动〖潜袭〗，判定结果为红桃，庞统受到2点伤害，进入濒死状态，在其处于濒死状态时能发动〖涅槃〗，回复2点体力（min{3,1}-(-1)）即将体力回复至1点。
```

<!-- kb:refs:start -->

## 引用区

① API 实现：
- [Player](../../project-api/entity/Player.md)
- [Room](../../project-api/entity/Room.md)
- [RoomHost](../../project-api/room/RoomHost.md)

② 扩展信息：
  （暂无）

③ 编写指南：
  （暂无）


<!-- kb:refs:end -->
