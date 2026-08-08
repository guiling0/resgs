---
title: 回复体力事件
type: event
id: events/recover-hp
tags: [体力, 回复, 事件]
---

# 回复体力事件

角色回复体力的流程：

首先确定回复的体力点数（同回复值基数）。

回复结算中有：回复体力开始、回复体力后两个时机。

### 回复体力开始

### 回复体力后

然后其一次性回复X点体力，即将其武将牌以左移的方式增加min{其体力牌上未露出的勾玉数,X}个其体力牌上露出的勾玉数（X为确定的回复的体力点数）。

至此回复体力结算结束。

回复体力结算后有：回复体力结算结束后一个时机。

### 回复体力结算结束后


至此回复体力流程结束。

<!-- kb:refs:start -->

## 引用区

① API 实现：
- [ChangeMaxHpEvent](../../project-api/event/ChangeMaxHpEvent.md)
- [RecoverHpEvent](../../project-api/event/RecoverHpEvent.md)
- [EventTypes](../../project-api/types/EventTypes.md)

② 扩展信息：
  （暂无）

③ 编写指南：
  （暂无）


<!-- kb:refs:end -->
