---
title: 来源
type: term
id: terms/description-terms/source
tags: [牌面描述]
---

# 来源

造成伤害的角色。

```
A对B使用【借刀杀人】选择对司马懿使用【杀】，B对司马懿使用【杀】进行响应，司马懿受到伤害后发动〖反馈〗的目标是B。
```

```
刘备发动〖激将〗使用【杀】造成的伤害的来源为刘备。
```

```
角色对大乔使用【杀】，大乔发动〖流离〗将此【杀】转移给司马懿，司马懿受到伤害后发动〖反馈〗的目标是该角色。
```

◆伤害结算中若来源已死亡则视为此伤害没有来源。

```
孟获在其他角色使用【南蛮入侵】指定目标后发动〖祸首②〗，如果其在此【南蛮入侵】的结算过程中死亡，之后此【南蛮入侵】造成的伤害没有来源。
```

◆渠道为牌的伤害的来源受到技能的影响发生改变，不会改变此牌的使用者。

<!-- kb:refs:start -->

## 引用区

① API 实现：
- [DamageEvent](../../project-api/event/DamageEvent.md)
- [LoseHpEvent](../../project-api/event/LoseHpEvent.md)
- [ReduceHpEvent](../../project-api/event/ReduceHpEvent.md)

② 扩展信息：
  （暂无）

③ 编写指南：
  （暂无）


<!-- kb:refs:end -->
