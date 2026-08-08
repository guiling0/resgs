---
title: 失去体力事件
type: event
id: events/lose-hp
tags: [体力, 事件]
---

# 失去体力事件

角色失去体力的流程：

失去体力结算中有：失去体力开始、失去体力时两个时机。

### 失去体力开始

### 失去体力时

然后进行扣减体力结算。

至此失去体力结算结束。

失去体力结算后有：失去体力结算结束后一个时机。

### 失去体力结算结束后


至此失去体力流程结束。

<!-- kb:refs:start -->

## 引用区

① API 实现：
- [DamageEvent](../../project-api/event/DamageEvent.md)
- [LoseHpEvent](../../project-api/event/LoseHpEvent.md)
- [ReduceHpEvent](../../project-api/event/ReduceHpEvent.md)
- [EventTypes](../../project-api/types/EventTypes.md)

② 扩展信息：
  （暂无）

③ 编写指南：
  （暂无）


<!-- kb:refs:end -->
