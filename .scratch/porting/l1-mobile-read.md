# L1 大厅+房间 — 完整文档

> 手机阅读版 · 2026-07-24

---

## 一、里程碑总览

| 里程 | shared/ | 服务端 | 客户端 | 验收 |
|---|---|---|---|---|
| **L0** ✅ | — | 启动+DB+Auth+JWT | Load→Entry→登录 | 注册/登录 |
| **L1** 🔴 | RoomState+Schema | LobbyRoom+GameRoom | LobbyScene→RoomScene | 建房→加房→准备→开始 |
| **L2** | Turn+Phase+事件+Choose | startGame+回合 | 手牌+动画+选择 | 六阶段轮转 |
| **L3** | CardUse+UseCardEvent | 使用牌流程 | 出牌+目标选择 | 出杀→闪→结算 |
| **L4** | Damage+Hp+Dying | 伤害链→濒死 | 伤害动画+死亡UI | 生命链闭环 |
| **L5** | 27武将+40卡牌 | AI决策 | 技能动画+标记 | 单人完整对局 |
| **L6** | 录像+快照 | 断线重连+观战 | 回放+音效 | 多客户端联机 |

---

## 二、L1 工单概览

| # | 内容 | 状态 |
|---|---|---|
| L1-01 | RoomState + TableState + SeatState Schema (shared/) | ✅ |
| L1-02 | GameRoom 服务端（座位/准备/踢人/开始） | ✅ |
| L1-03 | LobbyRoom 配置（房间列表广播） | ✅ |
| L1-04 | 客户端 LobbyScene（房间列表+创建/加入） | ✅ |
| L1-05 | 客户端 RoomScene（座位+准备+聊天+等待） | 🔴 进行中 |

---

## 三、架构决策

1. **RoomState = 两个子 State**：`table: TableState`（等待房间） + `game: GameState | null`（L2 游戏中），setState() 只在 onCreate 调一次
2. **SeatState ≠ GamePlayer**：等房席位和游戏玩家是两个独立实体，AI 只存在于 GamePlayer
3. **Colyseus 0.17**：使用 `AuthContext`、`messages = {}`、`Client` 泛型
4. **LobbyRoom 内置**：`enableRealtimeListing()` 自动广播房间增删
5. **JWT 最小化**：TokenPayload 只存 userId+username，用户详情在 onAuth 中查 DB
6. **房间设置**：`RoomOptionsState` 是 Schema 同步，`RoomOption` 是创建入参 interface

---

## 四、数据结构（shared/core/schema/）

### RoomState
```
RoomState
  ├─ roomId, roomName
  ├─ options: RoomOptionsState   ← 房间设置
  ├─ table: TableState           ← L1 等待房间
  └─ game: GameState | null      ← L2
```

### TableState
```
TableState
  ├─ ownerId: string
  ├─ seats: MapSchema<SeatState>
  └─ seatTags: ArraySchema<string>  ← L5 填充
```

### SeatState
```
SeatState
  ├─ sessionId, username, nickname, avatar
  ├─ seat: number   ← -1=未就座
  ├─ ready: boolean
  └─ online: boolean
```

### RoomOptionsState
```
RoomOptionsState
  ├─ password, mode, playerCountMax
  ├─ responseTime, chooseGeneralTime, chooseGeneralCount
  ├─ luckyCardCount
  ├─ cards: string[], generals: string[]
  └─ settings: MapSchema<string>   ← 模式动态字段
```

---

## 五、服务端 GameRoom

**文件**：`server/src/rooms/GameRoom.ts`

### 生命周期
- `onCreate(options)` → 初始化 RoomState + metadata
- `onAuth(client, options, context)` → JWT 验证 + 查 DB 补全用户信息
- `onJoin(client)` → 分配座位 + 设置房主
- `onLeave(client)` → 释放座位 + 房主顺位

### 消息处理
| 消息 | 处理 |
|---|---|
| `ready` | toggle 准备状态（房主不可用） |
| `kick { username }` | 房主踢人 → target.leave() |
| `chat { message }` | 广播给所有人 |
| `start` | 全员 ready 检查 → broadcast game_start |

### Logger 级别
- `info`：房间创建、玩家加入/离开、游戏开始、踢人
- `warn`：leave 无 seat、踢人目标不存在、非房主点开始

### 座位分配
```ts
private _pickSeat(): number {
    // 从 1 开始找最小可用座位号
    // 满员返回 -1
}
```

---

## 六、客户端架构

### SceneManager
- `SceneManager.enter(name, data?)` → 切换场景，data 传给下一场景
- `SceneManager.enterData` → 场景内读取传入数据
- 场景生命周期：prefab 创建 → onAwake → onDestroy

### ApiClient
- `login(username, password)` → HTTP /auth/login
- `joinLobby()` → `sdk.joinOrCreate('lobby')`
- `create(roomType, options, rootSchema)` → `sdk.create()`
- `join(roomId, rootSchema)` → `sdk.joinById()`

### 客户端场景注册（Main.ts）
```ts
SCENE_CONFIGS = {
    load, entry, lobby, room, game
}
```

---

## 七、LobbyScene 客户端

### 连接大厅
```ts
this._lobbyRoom = await apiClient.joinLobby();

// 房间列表
this._lobbyRoom.onMessage('rooms', (rooms) => { ... });
this._lobbyRoom.onMessage('+', ([roomId, room]) => { ... });
this._lobbyRoom.onMessage('-', (roomId) => { ... });
```

### RoomItem 渲染
- 显示：roomId、模式名、房间名、人数(含旁观)、状态
- 等待中 = 绿色，游戏中 = 红色
- 有密码显示锁图标
- 加入/旁观/信息三个按钮

### TODO 清单（按里程碑）

**L1 后续**：建房弹窗、筛选逻辑、密码加入

**L2**：seatTags 实现，需创建 `shared/core/room/GameMode.ts`：
```ts
export type SeatInfoField = 'username'|'nickname'|'avatar'|'ready'|'seatTag';

export interface GameModeDef {
    name: string;
    maxPlayer: number;
    seatTags: string[];        // 按座位号索引的身份标签
    seatInfo: SeatInfoField[]; // 等待房间席位展示字段
}
```

**L5**：sgs 翻译 `sgs.getTranslation('@mode:...')`、`sgs.init('client')`、注册 GameModeDef

**L6**：旁观玩家数/加入、跨房间聊天转发

---

## 八、RoomScene 客户端

### 状态监听
```ts
room.onStateChange((state: RoomState) => {
    this._isOwner = state.table.ownerId === room.sessionId;
    this._refreshSeats(state);
    this._refreshButtons();
});
```

### 消息处理
- `chat` → 聊天面板追加
- `kicked` → 提示 + 返回大厅
- `game_start` → 跳转 GameScene（L2 占位）
- `toast` → 提示文本

### 操作
- 准备/取消准备 → `room.send('ready', {})`
- 开始游戏 → `room.send('start', {})`（仅房主）
- 聊天 → `room.send('chat', { message })`
- 离开 → `room.leave()` → 回到 LobbyScene

### 座位渲染
- 自己用 `SELF_SEAT_POS`（底部中央）
- 其他玩家用 `SEAT_POSITIONS[total]`
- seat 号 0 = 自己，1~N = 按坐标排

---

## 九、聊天系统

### 消息结构
```ts
type ChatSource = 'lobby' | 'room' | 'team' | 'system';

interface ChatMessage {
    source: ChatSource;
    sender: string;
    message: string;
    time: number;
}

// 来源颜色配置
lobby:  '#4FC3F7'  // 浅蓝
room:   '#81C784'  // 绿
team:   '#FFB74D'  // 橙
system: '#E57373'  // 红
```

### ChatPanel 组件

核心功能：
- 每条消息 = `[来源标签·有背景色]` + `发送者：内容`
- 来源筛选按钮：`[全部] [大厅] [房间] [队伍]`
- 自动滚底：新消息时若在底部 → 自动滚；若在看历史 → 显示跳底按钮
- cells 最大 200 条截断

判断是否在底部：
```ts
bar.value >= bar.max - threshold
```

### 大厅聊天
- 客户端在 LobbyScene 中 `room.send('lobby_chat', ...)`
- LobbyRoom 广播给所有在大厅的客户端
- 限制：切换到 GameRoom 后收不到 LobbyRoom 消息（L6 跨房间转发解决）

### 房间聊天
- `room.send('chat', { message })` → GameRoom 广播
- 房内所有人可见

---

## 十、性能方案

### 聊天卡顿问题
- **根因**：TextField 全量重排版，几千行后帧率从 60 掉到 10+
- **解决**：List + itemRenderer，不在视口内不渲染
- **战报面板同样适用**

### 弹窗自适应
- 内容先算自然尺寸 → clamp(0, maxSize) → 设置弹窗大小
- 宽度超限：压缩 item 间距（手牌效果）
- 高度超限：Panel.vScrollBar 滚动

---

## 十一、跨平台方案

| 平台 | 方案 | WebView |
|---|---|---|
| Windows | Electron | Chromium |
| macOS | Electron | Chromium |
| iOS | Capacitor | WKWebView |
| Android | Capacitor | Android WebView |

- 横屏锁定：`ScreenOrientation.lock({ orientation: 'landscape' })`
- 项目结构：`client/`（LayaAir Vite）+ `platforms/desktop/` + `platforms/mobile/`

---

## 十二、通用 UI 组件清单

| 组件 | 用途 | 状态 |
|---|---|---|
| ToastUI | 提示文本 | ✅ 已有 |
| LoadingUI | 加载遮罩 | ✅ 已有 |
| ChatPanel | 多来源聊天面板 | L1-05 |
| TabPanel | 多标签切换 | L1-05 |
| Popup | 自适应弹窗 | L1 后续 |

### TabPanel 使用
```ts
const tabs = new TabPanel();
tabs.addTab(btn_chat, panel_chat);
tabs.addTab(btn_log, panel_log);
tabs.init(0);
```

### Popup 自适应
```
内容自然尺寸 → +padding → clamp(0, max) → 设置 Popup
宽度超限：压缩 item 间距
高度超限：Panel.vScrollBar
```

---

## 十三、技术笔记

### LayaAir
- 发光：`GlowEffect2D('#FFCC00', 6, 0, 0)` + `PostProcess2D.addEffect()`
- `GlowFilter` 已 deprecated
- 列表滚动：`list.vScrollBar.value` / `max` / `changeHandler`

### TypeScript 7.0.2
- `baseUrl` 已移除，用 `"paths": { "*": ["./*"] }` 替代
- `moduleResolution: "node"` 已移除，改为 `"bundler"`
- `module` 和 `moduleResolution` 必须配对：`"ESNext"` + `"bundler"`

### MongoDB
- `createIndex()` 幂等，每次启动调用安全
- 索引已存在则跳过，新增索引自动补齐

### Colyseus 0.17
- `onAuth` 签名：`(client, options, context: AuthContext)` ← 不是 0.16 的 `(client, options, request)`
- 消息注册：`messages = { ready: this._onReady, ... }`
- Client 泛型：`Client<{ userData, auth }>`
- Token 过期：onAuth 在 join 时只调用一次，客户端 ApiClient lazy token 保证过期前刷新

---

## 十四、关键 TODO（跨里程碑）

| 位置 | 内容 | 里程 |
|---|---|---|
| Lobby.ts:79 | 建房选项弹窗 | L1 后续 |
| Lobby.ts:102 | 更多筛选逻辑 | L1 后续 |
| RoomItem.ts:67 | 密码加入房间 | L1 后续 |
| GameRoom.ts:67 | seatTags 从 GameModeDef 填充 | L2 |
| RoomItem.ts:42 | 翻译 `@mode:` | L5 |
| Main.ts:47 | `sgs.init('client')` | L5 |
| RoomItem.ts:49 | 旁观玩家数量 | L6 |
| RoomItem.ts:84 | 旁观玩家加入 | L6 |
| ChatPanel | 大厅跨房间转发 | L6 |

---

## 十五、关键文件索引

```
shared/core/schema/
  RoomState.ts           ← 根状态
  TableState.ts          ← 等房子状态
  SeatState.ts           ← 等房席位
  RoomOptionsState.ts    ← 房间设置 Schema
  GameState.ts           ← L2 游戏状态（空壳）
  PlayerState.ts         ← L2 游戏玩家（空壳）
  index.ts

shared/core/room/
  RoomTypes.ts           ← RoomOption interface
  IdGenerator.ts         ← roomId/gameId 生成
  index.ts

server/src/
  rooms/GameRoom.ts      ← GameRoom 服务端
  app.config.ts          ← lobby + game 注册
  auth/jwt.ts            ← JWT + TokenPayload
  auth/routes.ts         ← /auth/login
  db/services/UserService.ts
  db/models/user.ts
  logger/index.ts        ← Winston + 彩色控制台

client/src/
  Main.ts                ← 场景注册入口
  SceneManager.ts        ← 场景切换
  api/ApiClient.ts       ← ColyseusSDK 封装
  config.ts              ← 服务器配置 + SEAT_POSITIONS
  types.ts               ← ChatMessage, RoomListItem
  scenes/lobby/Lobby.ts  ← 大厅场景
  scenes/room/Room.ts    ← 房间场景（进行中）
  components/ChatPanel.ts ← 聊天面板
  prefabs/lobby/RoomItem.ts ← 房间列表项
  components/ToastUI.ts
  components/LoadingUI.ts
```
