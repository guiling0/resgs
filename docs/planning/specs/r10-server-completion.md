# R10 服务端追齐（Server Completion）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r10.md](../issues/r10.md)

## 需求

追齐 old/resgsv1 服务端能力：用户系统、DB、联机房间、录像存储、断线重连、管理接口；联机模式以「Colyseus 仅作传输通道与房间管理，状态走纯消息」接入。

1. **用户系统**：注册/登录/JWT 认证（参考旧 `middleware/auth.ts`、`UserManager.ts`、routes/app/auth/admin）
2. **DB（MongoDB）**：User 模型、MatchState（录像）模型（参考旧 `db/models/`）
3. **Colyseus 房间完整化**：LobbyRoom（大厅：列表/创建/加入/聊天）+ GameRoom（游戏：join/seat/ready/start/chat/托管/投降）——参考旧 `rooms/lobby.ts`、`rooms/game.ts`
4. **联机纯消息传输**：Colyseus `send('game', payload)` 转发 Envelope 消息（客户端→服务端→其他客户端），状态不同步 schema；房间内状态一致由消息协议保证
5. **录像存储与回放接口**：对局事件序列落库（MatchState），提供回放数据接口
6. **断线重连**：玩家重连后接收当前快照 + 待处理询问恢复
7. **管理接口**：admin 路由（用户/房间管理）

## 目标

- 联机多人对局端到端（两台浏览器互连完整一局）
- 断线重连可恢复状态；录像可回放；用户系统可用

## 前置依赖

- R4（单机闭环：核心可玩）+ R9（客户端体验）

## 验收标准

1. 注册/登录/JWT 流程可用（含错误分支）
2. 大厅：创建/加入房间、列表刷新、聊天可用
3. 游戏房：8 人 join/seat/ready/start，全流程多人对局跑完一局，状态经纯消息同步一致
4. 断线重连：中途断线重连后状态恢复（快照 + 询问恢复），可继续对局
5. 录像：对局结束自动落库，回放接口可重放完整事件序列
6. 托管/投降可用
7. 管理接口：可查用户/房间列表

## 产出物

- `server/`（rooms/db/middleware/routes/UserManager 完整化）
- 联机传输适配（Colyseus channel → Envelope）
- 录像存储与回放接口

## 备注

- 置于最后：R4 后单机已完整可玩，服务端联机失败不阻塞核心交付
- 静态数据不落库（见 plans「数据策略」）；DB 仅存用户/录像等运营数据
