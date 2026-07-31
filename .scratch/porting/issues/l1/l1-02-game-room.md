# L1-02: GameRoom 服务端

**Type:** task
**Status:** pending
**Blocked by:** L1-01

## 问题

`server/src/rooms/GameRoom.ts` — 自定义 Colyseus Room，管理等待阶段的完整流程。

### 房间注册

在 `app.config.ts` 中注册 `game_room: defineRoom(GameRoom)`。

### onCreate

- 初始化 `RoomState`，设置 `roomId`、`ownerId`、`maxPlayers`（从 options 传入，默认 8）、`mode`
- `this.setState(state)`
- `this.setMetadata({ roomName, mode, players: 1, maxPlayers, owner })` — 供 LobbyRoom 广播

### onJoin

- 从 `client.auth` 获取 `userId`/`username`（通过 token 解析）
- 创建 `Player`，分配座位（从 1 开始自增，maxPlayers 满后拒入）
- 加入 `state.players`
- 更新 `metadata.players`
- 广播系统消息：`"xxx 加入了房间"`

### onLeave

- 从 `state.players` 移除
- 如果是房主 → 顺位给第一个剩余玩家
- 更新 `metadata.players`
- 广播：`"xxx 离开了房间"`

### 消息处理

```
"ready"        → state.players[sessionId].ready = true，广播 "xxx 已准备"
"unready"      → state.players[sessionId].ready = false，广播 "xxx 取消准备"
"kick"         → 仅房主，指定 seat → 踢出对应玩家（发 "kicked" 消息 + disconnect）
"chat"         → 广播消息给所有玩家 { sender, message }
"start_game"   → 仅房主，全员 ready 后 → broadcasting "game_start" → L2 接手
```

### onAuth

- 从 `options.accessToken` 解析 JWT，获取 `userId`/`username`
- 写入 `client.auth`
- L0 的 `verifyToken` 可复用（需要把 `jwt.ts` 移到一个共享路径，或 server 内直接 import）

### 座位管理

- 座位号 1 ~ maxPlayers
- `onJoin` 分配最小可用座位号
- `onLeave` 释放座位号
- 房主踢人释放座位号

## 验收

```bash
# 创建房间
curl -X POST http://localhost:12699/auth/login -d '{"username":"a","password":"1"}'
# 用 playground 或 SDK 测试 join 和 ready

# 或用两个 Colyseus 客户端模拟：
# A 创建 game_room → B 加入 → A ready → B ready → 收到 game_start
```

## Answer

（待实现）

## Comments

（待讨论）
