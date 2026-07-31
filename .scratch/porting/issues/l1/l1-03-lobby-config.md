# L1-03: LobbyRoom 配置 + 房间列表

**Type:** task
**Status:** pending
**Blocked by:** L1-02

## 问题

配置 Colyseus 内置 `LobbyRoom`，使客户端可以查看、筛选、创建、加入房间。

### LobbyRoom 配置

- L0 已在 `app.config.ts` 注册 `lobby: defineRoom(LobbyRoom)`
- LobbyRoom 自动将 matchmaker 中的房间同步给客户端（`rooms` / `+` / `-` 事件）
- `GameRoom` 创建/销毁时自动触发广播
- 客户端可发 `filter` 消息按 `mode` 筛选

### metadata 规范

GameRoom 在 `onCreate` 中设置 metadata，LobbyRoom 自动广播：

```ts
{
    roomName: string;   // 房间名称（创建时指定）
    mode: string;       // "standard" | "pk" | ...
    players: number;    // 当前人数
    maxPlayers: number; // 最大人数
    owner: string;      // 房主 username
    hasPassword: boolean; // 是否有密码（L1 暂不实现，预留）
}
```

### 无需额外服务端代码

Colyseus 内置 LobbyRoom 已经完成房间列表同步。只需在 GameRoom 的生命周期中正确更新 metadata 即可。

## 验收

- 客户端连接 LobbyRoom → 收到 `rooms` 消息（空列表或已有房间）
- 创建 GameRoom → LobbyRoom 广播 `+` 事件
- 销毁 GameRoom → LobbyRoom 广播 `-` 事件
- 发送 `filter: { mode: "standard" }` → 仅返回对应模式的房间

## Answer

（待实现）

## Comments

（待讨论）
