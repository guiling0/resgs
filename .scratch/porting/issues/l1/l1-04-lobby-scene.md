# L1-04: 客户端 LobbyScene

**Type:** task
**Status:** pending
**Blocked by:** L1-03

## 问题

客户端 LobbyScene — 显示房间列表、创建/加入房间。

### 场景入口

EntryScene 登录成功 → `SceneManager.enter('lobby')`

### 连接 LobbyRoom

```ts
const room = await sdk.joinOrCreate('lobby');
room.onMessage('rooms', (rooms) => { /* 渲染列表 */ });
room.onMessage('+', (roomId, room) => { /* 加入列表 */ });
room.onMessage('-', (roomId) => { /* 移除 */ });
```

### UI 元素

- 房间列表（滚动列表），每项显示：房间名、模式、人数(3/8)、房主
- 筛选下拉（全部/标准/PK）
- "创建房间"按钮 → 弹出创建面板（房间名、最大人数、模式）
- "加入房间"按钮 → `sdk.joinById(roomId)` → 跳转 RoomScene
- "刷新"按钮 → 重新获取列表
- 在线人数 / 房间数（可复用 L0 `/status` 的轮询）

### 创建房间

```ts
const room = await sdk.create('game_room', {
    roomName: 'xxx',
    maxPlayers: 8,
    mode: 'standard',
});
SceneManager.enter('room', { room });
```

### 场景切换

进入 RoomScene 时，客户端自动离开 LobbyRoom（Colyseus 一个客户端只能在一个房间）。

## 验收

- 登录后进入 LobbyScene，显示房间列表
- 创建房间 → 列表中出现新房间 → 自动进入 RoomScene
- 加入已有房间 → 进入 RoomScene
- 筛选功能正常

## Answer

（待实现）

## Comments

（待讨论）
