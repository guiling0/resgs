# R1 对局骨架（Room Skeleton / 端到端 v0）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r1.md](../issues/r1.md)

## 需求

建立**对局可运行的最小闭环**：Room + Manager + 回合/牌移动 + 消息通道 + 观察台 v0，全 AI 能跑完一局（摸牌/弃牌/结束），客户端能看到状态变化。

1. **Room 重写**：新构造签名（`Room(roomId, options)`），持有 9 个 Manager（card/player/general/skill/event/choose/broadcast/area/vcard）+ GameState
2. **Turn / Phase**：回合六阶段流转（开始→判定→摸牌→出牌→弃牌→结束），Phase 事件全时机（见 [phase.md](../../domain/events/phase.md)、[turn.md](../../domain/events/turn.md)）
3. **MoveCard 与区域管理**：手牌区/装备区/判定区/处理区/牌堆/弃牌堆，移动事件五时机（见 [move-card.md](../../domain/events/move-card.md)）
4. **GameClient v0**：snapshot/patches 应用 + event 路由（收到 `kind:'snapshot'|'patches'|'event'` 分发处理）
5. **传输层落地**：LocalTransport 直投（serialize 副本、apply 镜像、不共享引用）+ codec + messages.ts 基础消息（snapshot/patches/log/game.start/game.over）
6. **观察台 v0**（Laya UI）：座位面板（座位/血量/手牌数/牌堆/弃牌堆，收 game.start 构建）+ 日志流 + 消息流视图 + 控制按钮（开始/重开/AI 速度）
7. **AutoInput 初版**：AI 摸牌/弃牌/结束阶段的自动决策

## 目标

- 全 AI 对局可跑完一局：回合流转、摸牌 2、弃牌超上限、game.over
- 客户端监听 game.start 构建座位 UI，patches 实时更新
- 为 R2（战斗）提供稳定的事件/状态管道

## 前置依赖

- R0（状态层/实体/事件框架/传输层）

## 验收标准

1. 全 AI 对局完整跑完：六阶段正确流转 / 摸牌 2 张 / 弃牌超上限弃至上限 / game.over 正常，无挂死
2. 观察台：收 game.start 构建座位面板；回合/血量/手牌数随 patches 实时更新；日志流显示事件序列；消息流可见 snapshot/patches/event
3. 「询问前状态先行」：任何选择/业务消息发出前，相关状态 patch 已 flush（观察台消息流顺序验证）
4. LocalTransport 回放一致：host 状态序列化副本与 client 镜像最终一致
5. client/ 与 shared/ 引用关系明确（观察台位于 client/ 内，通过传输层接 shared）

## 产出物

- `shared/core/room/`（Room/GameMode/GameState/9 Manager）
- `shared/core/event/`（TurnEvent/PhaseEvent/MoveCardEvent）
- `shared/core/transport/messages.ts`（MessageType/Envelope 基础消息）
- `client/`（观察台 v0：座位面板/日志流/消息流/控制按钮）
- `shared/core/ai/`（AutoInput 初版）
