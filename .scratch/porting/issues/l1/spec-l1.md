# L1 Spec：大厅 + 房间

> 里程碑：建房 → 加房 → 准备 → 开始

## 范围

| 层 | 内容 |
|---|---|
| shared/ | RoomState Schema + Player Schema（Colyseus `@colyseus/schema`，服务端/客户端共享） |
| 服务端 | GameRoom（创建/加入/座位/准备/踢人/开始）+ LobbyRoom 房间列表广播 |
| 客户端 | LobbyScene（房间列表+筛选+创建/加入）→ RoomScene（座位+准备+聊天+等待开始） |

## 两个场景

- **RoomScene（等待房间）**：玩家准备/取消准备、房主踢人/开始、聊天。L1 实现。
- **GameScene（游戏场景）**：回合/出牌/技能。L2+ 实现。L1 开始后先跳转占位。

## 数据流

```
客户端 A                          服务端                           客户端 B
  │                                │                                │
  ├─ joinOrCreate("lobby") ───────▶│ LobbyRoom（内置）               │
  │◀── rooms: [...] ──────────────┤ 房间列表广播                    │
  │                                │                                │
  ├─ create("game_room") ─────────▶│ GameRoom.onCreate()            │
  │◀── state 全量同步 ─────────────┤   state.players = {}           │
  │                                │   state.ownerId = A            │
  │                                │                                │
  │                                │◀── join("game_room", roomId) ──┤
  │                                │── state.players[B] = {...} ──▶│
  │                                │                                │
  ├─ send("ready") ───────────────▶│ state.players[A].ready = true  │
  │◀── state 变更 ─────────────────┤                                │
  │                                │◀── 同步 ───────────────────────┤
  │                                │                                │
  │                                │  所有玩家 ready                  │
  │                                │  → 广播 "game_start"            │
  │◀── game_start ────────────────┤── game_start ─────────────────▶│
  │  跳转 GameScene(占位)          │                                 │
```

## 架构决策

- **RoomState 放在 shared/**：`@colyseus/schema` 的 Schema 类，server 和 client 共用同一份类型定义
- **GameRoom 内部不区分 phase**：L1 只有 waiting 阶段，start 后直接跳到 L2 的 GameRoom 逻辑
- **座位管理**：固定座位数（创建房间时指定），先到先坐，房主可踢人
- **LobbyRoom 用内置的**：Colyseus `LobbyRoom` 自动广播房间增删
- **客户端两个场景独立**：RoomScene（等待）→ GameScene（游戏中），不在同一个 UI 里切换

## 不在此范围

- 游戏逻辑（L2+）
- AI（L5）
- 断线重连（L6）
