# L1-01: RoomState + Player Schema

**Type:** task
**Status:** pending
**Blocked by:** —

## 问题

在 `shared/` 下创建 Colyseus Schema 类型，定义房间和玩家的同步状态。这是 L1 的核心数据结构，server 和 client 共用。

### RoomState — `shared/core/schema/RoomState.ts`

继承 `Schema`，字段：

```ts
class RoomState extends Schema {
    @type("string")  roomId: string;          // 房间 ID
    @type("string")  ownerId: string;         // 房主 sessionId
    @type("uint8")   maxPlayers: number;      // 最大人数
    @type("string")  mode: string;            // 游戏模式（L1 默认 "standard"）
    @type({ map: Player })  players: MapSchema<Player>;  // key = sessionId
}
```

### Player — `shared/core/schema/Player.ts`

```ts
class Player extends Schema {
    @type("string")  sessionId: string;
    @type("string")  username: string;
    @type("string")  nickname: string;
    @type("string")  avatarUrl: string;
    @type("uint8")   seat: number;            // 0 = 未就座
    @type("boolean") ready: boolean;
    @type("boolean") online: boolean;
}
```

### 扩展包 `shared/core/schema/index.ts`

统一导出。

## 验收

- `RoomState` 和 `Player` 编译通过（`tsc --noEmit`）
- server 端 `new RoomState()` 可正常创建
- 字段类型注解正确（`@type` 装饰器）

## Answer

（待实现）

## Comments

（待讨论）
