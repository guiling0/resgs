# 客户端设计决策（2026-07-19 LayaAir 方案）

## 方案变更说明

此前 ADR-0001 决定采用 PixiJS + Vue 3 方案。经过对 LayaAir 引擎的进一步了解和 IDE MCP 工具的配置，决定**改为 LayaAir 3.4 方案**。变更原因：

1. **旧项目参考**：`old/resgsv1/clientv0/` 是一个 LayaAir 三国杀客户端实现，其架构思路可作为设计参考，但新客户端从零开始使用 LayaAir 3.4 官方 API 重新构建
2. **IDE 集成效率**：LayaAir IDE + MCP 工具可以可视化搭建场景/UI/预制体，避免手写布局代码
3. **内置系统完整**：UI 系统（Button/Label/Panel/List）、补间动画（Tween）、骨骼动画（Spine）、音效管理（SoundManager）均为引擎内置，无需自建
4. **单一技术栈**：不再需要 PixiJS + Vue 3 双栈分离，LayaAir 本身即可同时承载游戏渲染和 UI 面板

---

## 一、技术栈

| 层 | 技术 |
|---|---|
| 游戏引擎 | LayaAir 3.4（含 UI 系统） |
| UI 体系 | **新版 UI**（`ui2`：GBox/GButton/GLabel/GImage/GList/GPanel） |
| 构建 | LayaAir IDE 编译（TypeScript → 引擎可执行） |
| 网络 | Colyseus 客户端 SDK（`colyseus.js`） |
| 动效 | LayaAir 内置（Tween + FrameAnimation + Spine） |
| 音效 | LayaAir SoundManager |
| 存储 | LayaAir LocalStorage + IndexedDB（录像） |
| 设计分辨率 | 1920×1080，`showall`，横屏 |

---

## 二、整体架构

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│  UI 层（LayaAir Scene + Widget）                         │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐     │
│  │ 加载场景 │ │ 大厅场景  │ │ 房间场景│ │ 对局场景  │     │
│  │ LoadScene│ │LobbyScene│ │RoomScene│ │GameScene │     │
│  └─────────┘ └──────────┘ └────────┘ └──────────┘     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 窗口层（GameWindow 弹窗栈）                        │   │
│  │  选牌窗口 │ 选将窗口 │ 确认窗口 │ 设置窗口 │ ...    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 提示层（Toast / Prompt / Tooltip）                │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  游戏逻辑层（纯 TypeScript，无引擎依赖）                   │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐              │
│  │ NetworkMgr│ │ GameState │ │ ReplayCtrl │              │
│  │ (Colyseus)│ │(Schema→UI)│ │(IndexedDB) │              │
│  └──────────┘ └──────────┘ └────────────┘              │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐              │
│  │ ResManager│ │ AudioMgr │ │  AniPlayer │              │
│  │ (Loader)  │ │(SoundMgr)│ │(Tween/Spine)│             │
│  └──────────┘ └──────────┘ └────────────┘              │
├─────────────────────────────────────────────────────────┤
│  共享引擎层（`shared/`，与旧 PixiJS 方案一致）              │
│  Colyseus Schema │ SelectTypes │ CardTypes │ sgs 全局   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 与 PixiJS 方案的关键差异

| 维度 | PixiJS 方案（旧） | LayaAir 方案（新） |
|---|---|---|
| 渲染引擎 | PixiJS 8.x（自建渲染器） | LayaAir 内置 Sprite/Scene |
| UI 系统 | Vue 3 DOM overlay | LayaAir UI2（GBox/GButton/...） |
| 场景管理 | 单 Canvas + Container 树切换 | LayaAir Scene.open/close |
| 动画 | 自建补间系统 | LayaAir Tween + FrameAnimation + Spine |
| 资源加载 | 自建加载器 | LayaAir Loader |
| 音效 | 自建 AudioContext | LayaAir SoundManager |
| 构建 | Vite | LayaAir IDE |
| UI 编辑 | 手写 Vue 模板 | IDE 可视化 + .ls/.lh 资源文件 |
| 组件复用 | Vue 组件 | LayaAir Prefab（.lh 预制体） |

---

## 三、新项目引擎对接（`shared/`）

> 新项目 `shared/` 引擎层是客户端要对接的后端逻辑。客户端是基于这套引擎之上从零搭建的 LayaAir 表现层。以下基于 LayaAir 3.4 官方 API 设计客户端架构。

### 3.1 引擎架构总览

`shared/` 引擎采用 **Room → Manager → EventProcess** 三层架构：

```
Room（游戏房间）
  ├── state: RoomState          ← Colyseus Schema 根（网络同步）
  ├── input: IPlayerInput       ← 向客户端通信的唯一接口
  ├── 9 个 Manager              ← 各司其职（Card/Player/General/Skill/Event/Choose/Broadcast/Area/VirtualCard）
  └── eventStack: EventProcess[] ← 事件栈
```

客户端通过两个通道与引擎交互：

| 通道 | 方向 | 协议 | LayaAir 侧处理 |
|---|---|---|---|
| **Schema 状态同步** | 服→客（自动增量） | Colyseus `onStateChange` | 监听变化 → 更新 LayaAir 显示对象 |
| **选择请求** | 服→客→服 | `choice_request` / `response` | 接收 `SelectSession` → 渲染 LayaAir UI2 界面 → 回传结果 |

### 3.2 静态数据访问

```typescript
import { sgs } from '@shared/core/sgs';

// 客户端启动时初始化
await sgs.init('client');

// 卡牌数据 → 用于渲染卡面
const cardData = sgs.cards.get(cardId);         // GameCardData
const cardMeta = sgs.carddatas.get(cardName);   // CardData（名称/类型/子类型/伤害/距离等）

// 武将数据 → 用于渲染武将牌
const generalData = sgs.generals.get(name);     // GeneralData

// 选择器预设 → 用于渲染选择 UI
const selectorPreset = sgs.selectors.get(name); // SelectorConfig

// 多语言 → UI 文案
const text = sgs.getTranslation('key');         // string
```

### 3.3 Colyseus Schema 状态同步

`RoomState` 是网络同步的根节点，包含以下 Schema 集合：

| Schema | 类型 | 说明 |
|---|---|---|
| `room.state.players` | `MapSchema<PlayerState>` | 玩家（座位/身份/体力/手牌数/武将/标记） |
| `room.state.cardAreas` | `MapSchema<ArraySchema<number>>` | 卡牌区域（手牌区/装备区/判定区/牌堆/弃牌堆/处理区） |
| `room.state.cardStates` | `MapSchema<CardState>` | 卡牌实例（名称/花色/点数/类型/所属区域） |
| `room.state.generalStates` | `MapSchema<GeneralState>` | 武将实例（名称/势力/体力上限/技能列表） |
| `room.state.skillStates` | `MapSchema<SkillState>` | 技能实例（可用/已用/禁用状态） |
| `room.state.effectStates` | `MapSchema<EffectState>` | 效果实例（触发条件/状态回调） |
| `room.state.markStates` | `MapSchema<MarkState>` | 标记（键值对，挂在任意实体上） |

**客户端订阅模式**：

```typescript
// 订阅 Schema 变化 → 驱动 LayaAir UI 更新
gameRoom.onStateChange((state: RoomState) => {
  // 增量同步已完成，state 是最新镜像
  // 各 UI 组件通过 Dirty Flag 按需更新
  this._onStateUpdated(state);
});
```

### 3.4 选择系统（核心交互协议）

`ChooseManager` 管理玩家选择会话，是客户端最主要的交互对接点。

**SelectSession 结构**：

```typescript
interface SelectSession {
  id: string;                        // 会话唯一 ID
  playerId: string;                  // 目标玩家
  steps: StepConfig[];               // 选择步骤（支持多步）
  context: SelectorContext;          // 上下文（当前回合/事件等）
  prompt: string;                    // 提示文本
  canCancel: boolean;                // 是否可取消
  timeout: number;                   // 超时（毫秒）
}
```

**SelectorType 枚举**（6 种类型）：

| 类型 | 说明 | 客户端 UI |
|---|---|---|
| `Card` | 选牌 | 高亮可选卡牌 + 已选计数 |
| `Player` | 选玩家 | 高亮可选玩家头像 |
| `General` | 选武将 | 武将牌列表 |
| `Option` | 选项按钮 | GButton 列表 |
| `Command` | 命令选择 | 技能/操作按钮 |
| `Confirm` | 确认/取消 | 确认对话框 |

**选择器预设（`sgs.selectors`）**：服务端只传选择器 `name`，客户端从 `sgs.selectors` 读取完整 UI 配置（最小/最大选择数、按钮文案、提示文本等），实现 UI 配置与业务逻辑分离。

### 3.5 客户端对接清单

| 对接点 | 方向 | 数据结构 | 客户端 LayaAir 处理 |
|---|---|---|---|
| Schema 状态 | 服→客（自动） | `RoomState` | `onStateChange` → Dirty Flag → 更新 Sprite/UI2 组件 |
| 选择请求 | 服→客（消息） | `SelectSession` | `ChoiceHandler` → 渲染选择 UI（UI2 组件） |
| 选择响应 | 客→服（消息） | `SelectResult` | 用户操作 → `room.send('response', result)` |
| 广播消息 | 服→客（消息） | log/toast/audio/animation | 日志面板、Toast 提示、音频播放、动效触发 |

---

## 四、场景管理

> 基于 LayaAir 3.4 `Laya.Scene` 官方 API。场景类是继承自 `Sprite` 的 2D 节点容器，负责场景创建、加载、销毁。场景从节点移除后不会被自动 GC，需要调用 `destroy()` 回收。

### 4.1 设计原则

- 场景通过 `Laya.Scene.open(url, closeOther, param, complete, progress)` 加载和切换
- 同时只保留一个活跃场景，`closeOther=true`（默认）自动关闭旧场景
- 场景层级：`场景根容器 → 弹窗层 → 提示层 → 确认层 → 加载层`

### 4.2 场景清单

| 场景 | LayaAir 资源 | 说明 |
|---|---|---|
| 加载场景 | `LoadScene.ls` | 资源预加载进度条 + 背景图 |
| 入口场景 | `EntryScene.ls` | 登录/注册表单 |
| 大厅场景 | `LobbyScene.ls` | 房间列表 + 创建/加入房间 |
| 房间场景 | `RoomScene.ls` | 等待房间（座位、准备、聊天） |
| 对局场景 | `GameScene.ls` | 游戏桌面（座位、手牌、武将、技能） |
| 武将详情 | `AboutGeneral.ls` | 武将信息展示（全屏覆盖层） |
| 卡牌详情 | `AboutCard.ls` | 卡牌信息展示 |
| 录像浏览 | `VideoScene.ls` | 录像列表、回放控制 |

### 4.3 场景层级

基于 LayaAir `Sprite` 节点层级（后添加的节点在上层）：

```
Stage
  └── GameScene（当前活跃场景）
        ├── layers      ← 场景主体内容
        ├── pool        ← 非活跃场景缓存（隐藏）
        ├── windows     ← 弹窗栈（mouseThrough = false 遮罩底层交互）
        ├── tips        ← Toast 通知
        ├── prompt      ← 确认对话框
        ├── loading     ← 加载遮罩
        └── tooltip     ← 悬浮提示
```

### 4.4 场景切换流程

基于 `Laya.Scene.open()` 官方 API：

```typescript
// SceneManager.ts — 场景管理器
class SceneManager {
  private _current: Laya.Scene | null = null;

  async open(url: string, param?: any): Promise<Laya.Scene> {
    // 1. 显示 loading 页（延迟 500ms，避免闪烁）
    Laya.Scene.showLoadingPage(param, 500);
    // 2. 加载并打开场景（默认关闭其他场景）
    const scene = await Laya.Scene.open(url, true, param);
    this._current = scene;
    // 3. 隐藏 loading 页
    Laya.Scene.hideLoadingPage();
    return scene;
  }

  // 手动关闭场景并回收资源
  close(url: string) {
    Laya.Scene.destroy(url);  // 销毁场景及其子节点
  }
}
```

`Laya.Scene.open()` 关键参数说明：
- `url`：场景资源路径（如 `"resources/scenes/GameScene.ls"`）
- `closeOther`：默认 `true`，关闭其他场景。设为 `false` 用于弹窗叠加场景
- `param`：传递给 `onOpened(param)` 的参数
- `complete`：`Laya.Handler` 回调，场景打开完成后调用

---

## 五、UI 系统

### 5.1 组件体系（新版 UI / `ui2`）

根据 `PlayerSettings.json` 中 `"laya.ui": "ui2"` 配置，使用新版 UI 组件：

| 组件 | LayaAir 类 | 用途 |
|---|---|---|
| 容器 | `Laya.GBox` | 通用容器、布局容器 |
| 按钮 | `Laya.GButton` | 三态按钮（normal/hover/pressed） |
| 标签 | `Laya.GLabel` | 带图标和文字的标签 |
| 图片 | `Laya.GImage` | 单图显示 |
| 列表 | `Laya.GList` | 可滚动列表（房间列表、录像列表、卡牌列表） |
| 面板 | `Laya.GPanel` | 带裁剪的面板容器 |
| 进度条 | `Laya.GProgressBar` | 加载进度、倒计时条 |
| 滑动条 | `Laya.GSlider` | 音量调节、回放进度拖拽 |
| 输入框 | `Laya.GTextInput` | 聊天输入、搜索 |
| 弹窗 | `Laya.Dialog`（基于 GWindow） | 模态弹窗 |

### 5.2 开发模式：Prefab 优先

基于 LayaAir IDE 工作流：

1. **在 LayaAir IDE 中创建 .lh 预制体**（通过 IDE MCP `PrefabManagement.create*` / `AssetManagement.create`）
2. **IDE 自动生成 `*.generated.ts`**（声明所有子节点变量引用）
3. **手写逻辑脚本**，使用 `@regClass()` 装饰器注册为 LayaAir 组件类，继承生成的基类

```
示例：卡牌组件
  CardItem.lh              ← IDE 创建预制体（GBox + GImage + GLabel）
  CardItem.generated.ts    ← IDE 自动生成（声明 bg、suitIcon、numberLabel 等变量）
  CardItem.ts              ← 手写逻辑（@regClass() class CardItem extends CardItem.generated）
```

脚本组件通过 `onAwake()` 进行初始化，在 IDE 中将脚本拖拽到节点上即可关联。

### 5.3 UI 文件组织

```
client/src/ui/
  ├── scenes/                 ← 场景脚本（每个 .ls 场景对应一个脚本）
  │   ├── LoadScene.ts
  │   ├── EntryScene.ts
  │   ├── LobbyScene.ts
  │   ├── RoomScene.ts
  │   ├── GameScene.ts
  │   └── VideoScene.ts
  ├── room/                   ← 游戏桌面相关组件
  │   ├── RoomTableComp.ts    ← 桌面总控
  │   ├── GameWindowComp.ts   ← 弹窗栈管理
  │   └── GameAniComp.ts      ← 全局动画播放
  ├── player/                 ← 玩家/武将渲染
  │   ├── SeatComp.ts         ← 其他玩家座位
  │   ├── SelfSeatComp.ts     ← 自己座位
  │   ├── PlayerComp.ts       ← 玩家通用渲染
  │   └── GeneralComp.ts      ← 武将牌渲染
  ├── card/                   ← 卡牌渲染
  │   ├── CardItem.ts         ← 卡牌组件
  │   ├── CardPool.ts         ← 卡牌对象池
  │   └── EquipSlot.ts        ← 装备槽
  ├── choose/                 ← 选择 UI
  │   ├── ChooseCards.ts      ← 选牌
  │   ├── ChoosePlayers.ts    ← 选目标
  │   ├── ChooseGenerals.ts   ← 选将
  │   └── ChooseOptions.ts    ← 选项对话框
  ├── marks/                  ← 标记渲染
  │   ├── MarkIcon.ts
  │   └── TextMark.ts
  └── common/                 ← 通用 UI 组件
      ├── Toast.ts            ← 提示
      ├── GameWindow.ts       ← 通用弹窗（基于 Laya.Dialog）
      ├── ConfirmDialog.ts    ← 确认对话框
      ├── CountdownBar.ts     ← 倒计时条
      ├── SkillButton.ts      ← 技能按钮
      ├── Avatar.ts           ← 头像
      └── ChatBubble.ts       ← 聊天气泡
```

### 5.4 布局方案

- **设计分辨率**：1920×1080
- **自适应模式**：`showall`（等比缩放、居中显示、留黑边）
- **玩家座位布局**：预设 `playerPos` 配置（支持 2-12 人，默认布局和 3v3 布局）
- **UI 锚点系统**：使用 `left`/`right`/`top`/`bottom`/`centerX`/`centerY` 进行相对布局

---

## 六、游戏桌面渲染

### 6.1 对局场景结构（GameScene.ls 节点树）

```
GameScene
  ├── bgLayer                 ← 背景图
  │   └── bgImage
  ├── tableLayer              ← 桌面中央区域
  │   ├── drawPile            ← 牌堆
  │   ├── discardPile         ← 弃牌堆
  │   └── playArea            ← 出牌区（打出牌的展示位置）
  ├── seatLayer               ← 座位（其他玩家）
  │   ├── Seat_0              ← Prefab 实例（SeatComp.lh）
  │   ├── Seat_1
  │   ├── Seat_2
  │   └── ...
  ├── selfLayer               ← 自己操作区
  │   ├── handCards           ← 手牌容器（CardItem 列表）
  │   ├── equipArea           ← 装备区（武器/防具/+1/-1/宝物）
  │   ├── judgeArea           ← 判定区
  │   ├── skillButtons        ← 技能按钮容器
  │   └── phaseIndicator      ← 阶段指示器
  ├── playerInfoLayer         ← 玩家信息覆盖层
  │   ├── PlayerInfo_0        ← 体力/手牌数/武将/标记
  │   └── ...
  ├── controlLayer            ← 全局控制
  │   ├── btnEndPhase         ← 结束阶段按钮
  │   ├── btnCancel           ← 取消按钮
  │   ├── btnConfirm          ← 确定按钮
  │   └── countdownBar        ← 倒计时条
  ├── windowLayer             ← 弹窗栈层
  └── tipLayer                ← 提示层
```

### 6.2 渲染驱动：Schema onChange → UI 更新

基于 Colyseus `onStateChange` + 脏标记模式驱动 LayaAir 显示对象更新：

```typescript
// RoomTableComp.ts — 游戏桌面总控
class RoomTableComp {
  private _room: RoomState; // Colyseus Schema 根

  onAwake() {
    // 监听 Schema 变化 → 驱动 UI 更新
    this._room.players.onAdd = (player, key) => this.onPlayerAdd(player);
    this._room.players.onRemove = (player, key) => this.onPlayerRemove(player);

    // 卡牌区域变化
    this._room.cardAreas.onChange = (changes) => this.onCardAreaChange(changes);

    // 每帧仅更新标记为脏的组件
    Laya.timer.frameLoop(1, this, this.onFrameUpdate);
  }

  onFrameUpdate() {
    // 仅更新已标记 dirty 的组件，避免无效计算
    for (const seat of this._seats) {
      if (seat.dirty) seat.render();
    }
  }
}
```

**脏标记模式**：

```typescript
// PlayerComp.ts
class PlayerComp {
  private _dirtyFlags: Record<string, boolean> = {
    handCardCount: false, hp: false, maxHp: false,
    head: false, deputy: false, kingdom: false,
    role: false, chain: false, turn: false,
    dead: false, marks: false,
  };

  onHpChange() { this._dirtyFlags.hp = true; }

  render() {
    if (this._dirtyFlags.hp) {
      this._renderHp();       // 更新 LayaAir Sprite 显示
      this._dirtyFlags.hp = false;
    }
    if (this._dirtyFlags.handCardCount) {
      this._renderHandCount();
      this._dirtyFlags.handCardCount = false;
    }
  }
}
```

每帧通过 `Laya.timer.frameLoop(1, this, this.render)` 驱动渲染，仅更新标记为脏的属性。

### 6.3 卡牌渲染

- 卡牌底图：从 `sgs.cards` 加载牌面纹理（花色图标 + 点数）
- 手牌区：CardItem Prefab 按弧形/线性排列，使用 `Laya.Tween` 做补间动画
- 装备区：固定的 5 个卡槽（武器/防具/+1/-1/宝物），使用 EquipSlot Prefab
- 判定区：动态卡牌列表
- 选中高亮：`Laya.Tween` 改变卡牌 y 偏移 + `Laya.GlowFilter` 外发光
- 对象池：使用 `Laya.Pool` 管理频繁创建/销毁的 CardItem、Toast 等

### 6.4 武将渲染

- 武将牌使用 GeneralComp Prefab
- 双将模式（国战）：左右排列两张武将牌
- 体力勾玉：HpBar 组件，Laya.Tween 驱动扣血/回血动画
- 翻面/横置/连环：Laya.Tween 驱动 transform 动画

---

## 七、交互系统

### 7.1 选择系统对接

**核心接口**：`IPlayerInput.requestChoice(playerId, SelectSession)` → 客户端渲染选择 UI → 用户选择 → `ChooseManager.respond(sessionId, result)`

```typescript
// ChoiceHandler.ts — 选择请求处理器
class ChoiceHandler {
  onChoiceRequest(session: SelectSession) {
    switch (session.steps[0].selector.type) {
      case 'Card':
        this._showCardSelector(session);
        break;
      case 'Player':
        this._showPlayerSelector(session);
        break;
      case 'General':
        this._showGeneralSelector(session);
        break;
      case 'Option':
        this._showOptionDialog(session);
        break;
      case 'Confirm':
        this._showConfirmDialog(session);
        break;
    }
  }

  private _showCardSelector(session: SelectSession) {
    // 1. 读取 SelectorConfig 预设（从 sgs.selectors）
    // 2. 高亮可选卡牌范围
    // 3. 限制最大/最小选择数
    // 4. 确定按钮 → respond(sessionId, result)
    // 5. 取消按钮 → cancel(sessionId)
  }
}
```

**选择 UI 组件**：

- `ChooseCards`：手牌高亮可选 + 已选计数 + 确定/取消
- `ChoosePlayers`：玩家头像/名字高亮可选
- `ChooseGenerals`：武将牌列表选择（支持单选/多选）
- `ChooseOptions`：选项按钮列表
- `ConfirmDialog`：确认/取消对话框

### 7.2 技能按钮

- 位置：自己操作区上方，武将牌旁边
- 布局：每行最多 2 个，从下到上排列
- 状态：可用（亮色）、不可用（灰色）、已使用（暗色 + 标记）
- 交互：点击触发技能使用 → 进入选牌/选目标流程

### 7.3 通用交互

- **卡牌悬停**：`Laya.Tween.to(card, {scaleX: 1.1, scaleY: 1.1, y: card.y - 20}, 100)`
- **右键查看**：`Laya.stage.on(Laya.Event.RIGHT_CLICK, ...)` → 弹出详情面板
- **聊天**：`Laya.GTextInput` + 聊天气泡组件

---

## 八、动画系统

### 8.1 补间动画（Laya.Tween）

| 动画 | 实现 |
|---|---|
| 卡牌发牌/飞牌 | `Laya.Tween.to(card, {x, y, rotation}, duration, ease)` |
| 卡牌选中高亮 | `Laya.Tween.to(card, {y: -20}, 200, Laya.Ease.backOut)` |
| 伤害数字飘字 | `Laya.Tween.to(dmgText, {y: -80, alpha: 0}, 800, Laya.Ease.quadOut)` |
| 体力扣减 | `Laya.Tween.to(hpBar, {width: newWidth}, 300)` |
| 弹窗出入 | `Laya.Tween.from(window, {scaleX: 0.5, scaleY: 0.5, alpha: 0}, 200)` |

### 8.2 帧动画（Laya.FrameAnimation）

基于 `Laya.FrameAnimation` 实现序列帧特效。通过 `frames` 属性设置纹理数组，`play()` 播放：
- 卡牌打出特效、判定转圈、闪电链等

### 8.3 骨骼动画（Spine）

LayaAir 3.4 支持 Spine 骨骼动画。`Laya.SpineTemplet` 加载 `.sk` 文件，`buildArmature()` 创建骨骼实例：
- 武将出场、技能释放、觉醒特效

通过 `Laya.loader.load("res/spine/xxx.sk")` 加载 Spine 资源。

### 8.4 动效资源组织

```
assets/animation/
  ├── spine/           ← Spine 骨骼动画（.sk）
  ├── frame/           ← 序列帧图集
  ├── tween/           ← Tween 配置（可选：JSON 驱动的补间动画）
  └── generals/        ← 武将专属动效
```

---

## 九、音效系统

### 9.1 Laya.SoundManager

LayaAir 封装了 WebAudio 和 Audio 标签，通过 `Laya.SoundManager` 统一 API（官方文档 `basics/common/device/media`）：

```typescript
// AudioManager.ts
class AudioManager {
  private _bgmVolume: number = 0.5;
  private _sfxVolume: number = 1.0;
  private _bgmChannel: Laya.SoundChannel;

  playBGM(url: string, loop: boolean = true) {
    this._bgmChannel = Laya.SoundManager.playMusic(url, loop ? 0 : 1);
    Laya.SoundManager.musicVolume = this._bgmVolume;
  }

  playSFX(url: string, complete?: Laya.Handler) {
    Laya.SoundManager.playSound(url, 1, complete);
    Laya.SoundManager.soundVolume = this._sfxVolume;
  }

  stopBGM() { Laya.SoundManager.stopMusic(); }
  stopAll() { Laya.SoundManager.stopAllSound(); }

  // 音量持久化
  save() {
    Laya.LocalStorage.setJSON('audioSettings', {
      bgmVolume: this._bgmVolume, sfxVolume: this._sfxVolume
    });
  }
  load() {
    const s = Laya.LocalStorage.getJSON('audioSettings');
    if (s) { this._bgmVolume = s.bgmVolume; this._sfxVolume = s.sfxVolume; }
  }
}
```

### 9.2 音效分类

| 分类 | API | 触发时机 |
|---|---|---|
| BGM | `SoundManager.playMusic()` | 场景切换（大厅/对局/结算） |
| 武将语音 | `SoundManager.playSound()` | 技能发动/出场/死亡 |
| 卡牌音效 | `SoundManager.playSound()` | 出牌/判定/装备/伤害 |
| 系统音效 | `SoundManager.playSound()` | 回合开始/结束/倒计时 |

### 9.3 音量设置

- 通过 `Laya.LocalStorage.setJSON()` / `getJSON()` 持久化
- UI 使用 `Laya.GSlider` 提供音量滑块

---

## 十、网络通信

### 10.1 Colyseus SDK

**不使用 LayaAir 的 Socket 类**。直接使用 `colyseus.js` 客户端 SDK：

```typescript
// NetworkManager.ts
import { Client, Room } from 'colyseus.js';

class NetworkManager {
  private _client: Client;
  private _lobby: Room | null = null;
  private _gameRoom: Room | null = null;

  constructor() {
    this._client = new Client(`ws://${host}:${port}`);
  }

  // 登录 → 大厅
  async login(username: string, token: string) {
    this._lobby = await this._client.joinOrCreate('lobby', { username, token });
    this._bindLobbyEvents();
  }

  // 创建/加入游戏房间
  async createRoom(options: RoomOption) {
    this._gameRoom = await this._client.create('game', options);
    this._bindGameEvents();
  }

  async joinRoom(roomId: string) {
    this._gameRoom = await this._client.joinById(roomId);
    this._bindGameEvents();
  }

  private _bindGameEvents() {
    // Schema 状态同步 — 核心
    this._gameRoom.onStateChange((state: RoomState) => {
      this._onStateChange(state);
    });

    // 自定义消息 — 选择请求
    this._gameRoom.onMessage('choice_request', (session: SelectSession) => {
      this._onChoiceRequest(session);
    });

    // 广播消息
    this._gameRoom.onMessage('broadcast', (msg) => {
      this._onBroadcast(msg);
    });
  }
}
```

### 10.2 消息流

```
服务端                             客户端
  │                                  │
  │ ─── Schema onChange (自动同步) ──→ │ → UI 更新（Dirty Flag）
  │ ─── choice_request ──────────────→ │ → ChoiceHandler → 选择 UI
  │ ←─── respond(sessionId, result) ──│── 用户完成选择
  │ ─── broadcast (log/toast/ani) ──→ │ → 日志/提示/动效
```

### 10.3 断线重连

使用 Colyseus SDK 内置的 `reconnect()` 方法：

```typescript
async reconnect() {
  const maxAttempts = 10;
  let delay = 1000;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      this._gameRoom = await this._client.reconnect(token);
      return;
    } catch {
      await sleep(delay);
      delay *= 2; // 1s → 2s → 4s → ...
    }
  }
}
```

---

## 十一、录像回放

### 11.1 架构设计

录像系统基于 **IndexedDB 存储 + 事件日志 + 定期快照** 方案：

- **存储**：浏览器 IndexedDB（`GameReplayDB` / `replays` store）
- **压缩**：Pako (gzip) 压缩消息数据
- **数据结构**：

```typescript
interface ReplayData {
  name: string;           // 房间名/对局名
  self: string;           // 自己玩家 ID
  date: number;           // 对局时间戳
  messages: GameMessage[];// 全部游戏消息（时序）
  chats: ChatMessage[];   // 全部聊天消息
  snapshots: Snapshot[];  // 定期状态快照（每 30s 一个，用于快速跳转）
}
```

### 11.2 回放控制条

使用 LayaAir UI2 组件实现回放控制栏：

```
┌────────────────────────────────────────────────────┐
│  [⏮] [⏪] [▶/⏸] [⏩] [⏭]  ●━━━━━━━○━━━━━ [1x ▼]   │
│  GButton                    GSlider          00:15 / 12:30  │
└────────────────────────────────────────────────────┘
```

- **播放/暂停**：控制消息处理循环的启停
- **速度调节**：0.5x / 1x / 2x / 4x，使用 `Laya.GButton` 切换
- **进度条**：`Laya.GSlider` 拖拽 → 寻找最近快照 → 快进消息到目标时间
- **快进/快退**：`Laya.GButton` ±10s 跳跃

### 11.3 回放循环

```typescript
// ReplayController.ts
class ReplayController {
  private _messages: GameMessage[];
  private _currentIndex: number = 0;
  private _startTime: number = 0;
  private _paused: boolean = false;
  private _speed: number = 1;

  onUpdate() {
    if (this._paused) return;
    const elapsed = (Laya.Browser.now() - this._startTime) * this._speed;
    while (this._currentIndex < this._messages.length) {
      const msg = this._messages[this._currentIndex];
      if (msg.time > elapsed) break;
      this._execMessage(msg);
      this._currentIndex++;
    }
    if (this._currentIndex >= this._messages.length) {
      this._onReplayEnd();
    }
  }

  seek(targetTime: number) {
    const snapshot = this._findNearestSnapshot(targetTime);
    this._loadSnapshot(snapshot);
    this._currentIndex = snapshot.messageIndex;
    this._startTime = Laya.Browser.now() - targetTime / this._speed;
  }
}
```

### 11.4 录像保存与播放

- **保存**：游戏结束 → 自动保存到 IndexedDB
- **播放**：`VideoScene` 场景读取 IndexedDB → 启动 `ReplayController` → `Laya.timer.frameLoop` 驱动回放
- **删除**：提供列表管理，支持删除/清空

---

## 十二、资源管理

### 12.1 资源加载策略

基于 `Laya.loader.load()` 官方 API（文档 `basics/common/Loader`）：

```typescript
// ResManager.ts
class ResManager {
  async preload(onProgress: (p: number) => void) {
    // 方式1：单个加载
    await Laya.loader.load("resources/scenes/LoadScene.ls", Laya.Loader.SCENE);

    // 方式2：批量加载（数组）
    const assets = [
      { url: "resources/scenes/LobbyScene.ls", type: Laya.Loader.SCENE },
      { url: "resources/atlas/cards.atlas", type: Laya.Loader.ATLAS },
      { url: "resources/fonts/game.ttf", type: Laya.Loader.FONT },
    ];
    await Laya.loader.load(assets, Laya.Handler.create(this, null, onProgress));
  }
}
```

**加载类型枚举**（`Laya.Loader`）：`IMAGE`、`ATLAS`、`FONT`、`SCENE`、`PREFAB`、`SOUND`、`SPINE` 等。

### 12.2 对象池

使用 `Laya.Pool` 管理频繁创建/销毁的对象：

```typescript
// 从池中获取
const card = Laya.Pool.getItemByCreateFun("CardItem", () => new CardItem());
// 使用完毕回收
Laya.Pool.recover("CardItem", card);
```

需要对象池的类型：CardItem、Toast、DamageText、MarkIcon、SkillButton。

### 12.3 资源路径约定

```
assets/
  resources/               ← LayaAir 引擎资源（构建时处理）
    scenes/                 ← .ls 场景文件
    prefabs/                ← .lh 预制体
    textures/               ← 图片素材
      cards/                ← 卡牌素材
      generals/             ← 武将头像
      ui/                   ← UI 素材
    atlas/                  ← 图集
    animation/              ← 动效资源（Spine/帧动画）
    fonts/                  ← 字体
  bin/                      ← 非构建资源（raw copy）
    audio/                  ← 音频文件（bgm/sfx/generals）
```

---

## 十三、全局单例

```typescript
// singleton.ts
class App {
  static scene: SceneManager;
  static network: NetworkManager;
  static res: ResManager;
  static audio: AudioManager;
  static replay: ReplayController;
  static choice: ChoiceHandler;

  static init() {
    // 初始化顺序：res → audio → network → scene → replay
  }
}
```

---

## 十四、目录结构

```
client/
├── package.json                 ← 依赖：colyseus.js, pako, shared（本地引用）
├── tsconfig.json                ← 引用 shared/，@shared/* 别名
├── Entry.ts                     ← LayaAir 入口（main 函数）
├── settings/
│   ├── PlayerSettings.json      ← 设计分辨率、UI 模式、模块开关
│   ├── BuildSettings.json       ← 构建配置
│   └── CompilerSettings.json    ← 编译配置
├── assets/
│   ├── resources/               ← 引擎资源
│   │   ├── scenes/              ← 场景文件（.ls）
│   │   │   ├── LoadScene.ls
│   │   │   ├── EntryScene.ls
│   │   │   ├── LobbyScene.ls
│   │   │   ├── RoomScene.ls
│   │   │   ├── GameScene.ls
│   │   │   ├── AboutGeneral.ls
│   │   │   ├── AboutCard.ls
│   │   │   └── VideoScene.ls
│   │   ├── prefabs/             ← 预制体（.lh）
│   │   │   ├── card/
│   │   │   │   ├── CardItem.lh
│   │   │   │   └── EquipSlot.lh
│   │   │   ├── player/
│   │   │   │   ├── SeatComp.lh
│   │   │   │   ├── SelfSeatComp.lh
│   │   │   │   ├── GeneralComp.lh
│   │   │   │   └── HpBar.lh
│   │   │   ├── choose/
│   │   │   │   ├── ChooseCards.lh
│   │   │   │   ├── ChoosePlayers.lh
│   │   │   │   └── ChooseGenerals.lh
│   │   │   ├── common/
│   │   │   │   ├── Toast.lh
│   │   │   │   ├── GameWindow.lh
│   │   │   │   ├── ConfirmDialog.lh
│   │   │   │   ├── CountdownBar.lh
│   │   │   │   ├── SkillButton.lh
│   │   │   │   └── ChatBubble.lh
│   │   │   └── window/
│   │   │       └── UIWindow.lh
│   │   ├── textures/            ← 图片纹理
│   │   ├── atlas/               ← 图集
│   │   ├── animation/           ← 动效资源
│   │   └── fonts/               ← 字体
│   └── bin/                     ← 非构建资源
│       ├── audio/
│       └── generals/
├── src/                         ← 手写 TypeScript 逻辑
│   ├── singleton.ts             ← 全局单例 App
│   ├── config.ts                ← 服务器地址、座位布局等配置
│   ├── enums.ts                 ← 场景枚举、对象池类型枚举
│   ├── urlmap.ts                ← 资源 URL 映射
│   ├── types.ts                 ← 客户端私有类型
│   ├── mgr/
│   │   ├── SceneManager.ts      ← 场景管理
│   │   ├── NetworkManager.ts    ← Colyseus 连接管理
│   │   ├── ResManager.ts        ← 资源预加载
│   │   ├── AudioManager.ts      ← 音效管理
│   │   ├── ObjectPool.ts        ← 对象池管理
│   │   ├── ReplayController.ts  ← 录像回放控制
│   │   └── ChoiceHandler.ts     ← 选择请求处理
│   ├── ui/
│   │   ├── scenes/
│   │   │   ├── LoadScene.ts
│   │   │   ├── EntryScene.ts
│   │   │   ├── LobbyScene.ts
│   │   │   ├── RoomScene.ts
│   │   │   ├── GameScene.ts
│   │   │   └── VideoScene.ts
│   │   ├── room/
│   │   │   ├── RoomTableComp.ts
│   │   │   ├── GameWindowComp.ts
│   │   │   └── GameAniComp.ts
│   │   ├── player/
│   │   │   ├── SeatComp.ts
│   │   │   ├── SelfSeatComp.ts
│   │   │   ├── PlayerComp.ts
│   │   │   └── GeneralComp.ts
│   │   ├── card/
│   │   │   ├── CardItem.ts
│   │   │   ├── CardPool.ts
│   │   │   └── EquipSlot.ts
│   │   ├── choose/
│   │   │   ├── ChooseCards.ts
│   │   │   ├── ChoosePlayers.ts
│   │   │   ├── ChooseGenerals.ts
│   │   │   └── ChooseOptions.ts
│   │   ├── marks/
│   │   │   ├── MarkIcon.ts
│   │   │   └── TextMark.ts
│   │   ├── common/
│   │   │   ├── Toast.ts
│   │   │   ├── GameWindow.ts
│   │   │   ├── ConfirmDialog.ts
│   │   │   ├── CountdownBar.ts
│   │   │   ├── Avatar.ts
│   │   │   └── ChatBubble.ts
│   │   └── window/
│   │       └── UIWindow.ts
│   ├── effects/                 ← 武将专属动画脚本
│   │   └── (generals).ts
│   └── models/
│       └── RoomState.ts         ← Colyseus Schema 类型声明
├── engine/                      ← LayaAir 引擎运行时（IDE 提供）
└── library/                     ← LayaAir 库缓存（IDE 维护）
```

---

## 十五、里程碑（更新）

| 里程碑 | 内容 | 交付物 | 状态 |
|---|---|---|---|
| C0 项目骨架 | LayaAir IDE 项目创建 + `shared/` 引入 + 入口场景 | `Entry.ts`，加载场景可见 | **新** |
| C1 场景+UI骨架 | 全部场景 .ls 搭建 + 核心 Prefab .lh 创建 + 场景切换 | 场景切换流：Load→Entry→Lobby→Room→Game | 重定义 |
| C2 网络+大厅 | Colyseus SDK 集成 + 登录/大厅/房间 Schema 绑定 | 能进入房间、看到其他玩家 | - |
| C3 游戏桌面渲染 | GameScene 完整渲染：座位/手牌/武将/装备/体力 | Schema onChange 驱动 UI 正确更新 | - |
| C4 交互系统 | 选牌/选将/选目标 UI + 技能按钮 + 出牌操作 | 可以完成一局游戏的操作 | - |
| C5 动画+音效 | 飞牌/伤害/恢复动画 + BGM/音效 | 游戏动起来 | - |
| C6 录像回放 | IndexedDB + 快照 + 回放控制条 | 进度条拖拽回放 | 新增 |
| C7 联机完善 | 断线重连 + 观战 + 聊天 + 托管 | 完整联机体验 | - |
| C8 武将动效 | 武将专属动画（Spine） + 出场/技能特效 | 武将个性化动效 | - |

---

## 十六、关键架构决策（新版 9 项）

1. **LayaAir 引擎 + IDE 驱动 UI**：UI 通过 IDE 搭建 .ls/.lh 资源文件，代码只负责逻辑。手写布局禁止。

2. **纯 Colyseus Schema 同步**：Colyseus Schema 是唯一状态同步通道。所有游戏状态由 Schema 自动推到客户端。动效/音效通过 BroadcastManager 消息触发。

3. **Dirty Flag 渲染**：PlayerComp 使用脏标记模式，每帧仅更新变化的属性，避免无效的全量刷新。

4. **消息驱动回放**：录像 = 游戏消息日志 + 定期快照。回放 = 加载快照 → 按时序执行消息。不存储视频帧。

5. **对象池管理**：CardItem、Toast、DamageText 等频繁创建/销毁的对象使用 `Laya.Pool` 管理。

6. **场景层级分离**：场景内容 → 弹窗栈 → 提示层 → 确认层 → 加载层，层级间通过 `mouseThrough` / `mouseEnabled` 控制交互阻挡。

7. **技能按钮内联**：技能按钮渲染在武将牌旁边（LayaAir GButton），每行最多 2 个、从下到上排列。

8. **选牌/选目标内联**：在 Canvas 内通过手牌高亮/玩家高亮完成选择交互，不使用外部弹窗。

9. **Colyseus SDK 直连**：不使用 LayaAir Socket 封装，直接用 `colyseus.js` 客户端，保证与 `shared/` 的 Schema 定义一致。

---

## 十七、C0 落地计划

### 17.1 在 LayaAir IDE 中创建项目

1. 使用 IDE MCP `ProjectManagement.getProjectInfo` 确认当前工作区
2. 通过 `AssetManagement.create` 创建 `assets/resources/scenes/`、`prefabs/` 等目录结构
3. 通过 `AssetManagement.createScene` 创建起始场景 `LoadScene.ls`

### 17.2 引入 shared/

- `tsconfig.json` 配置 `@shared/*` 别名指向 `../../shared/`
- 客户端不导入 Colyseus Schema 运行时依赖（`@colyseus/schema`），仅使用类型
- `sgs` 全局数据由 `shared/core/sgs.ts` 提供，客户端启动时调用 `sgs.init('client')`

### 17.3 Entry.ts

```typescript
// Entry.ts — LayaAir 入口
import { sgs } from '@shared/core/sgs';
import { App } from './singleton';

export async function main() {
  // 1. 初始化全局单例
  App.init();
  // 2. 加载 sgs 静态数据（卡牌/武将/技能定义）
  await sgs.init('client');
  // 3. 预加载资源
  await App.res.preload();
  // 4. 进入加载场景
  await App.scene.open('resources/scenes/LoadScene.ls');
}
```

---

## 十八、LayaAir 组件参考清单

以下列出本客户端使用的主要 LayaAir 3.4 API 和组件（基于官方文档）：

| 用途 | LayaAir API / 组件 | 说明 |
|---|---|---|
| 引擎初始化 | `Laya.init(width, height)` | 初始化引擎画布 |
| 场景管理 | `Laya.Scene.open/load/close/destroy` | 场景加载、切换、回收 |
| 容器 | `Laya.GBox` | 通用布局容器（UI2） |
| 按钮 | `Laya.GButton` | 支持 Common/Check/Radio 模式，三态显示 |
| 标签 | `Laya.GLabel` | 带图标和文字的标签 |
| 图片 | `Laya.GImage` | 轻量图片显示 |
| 列表 | `Laya.GList` | 支持虚拟列表、对象池、Selection |
| 面板 | `Laya.GPanel` | 带裁剪的面板容器 |
| 进度条 | `Laya.GProgressBar` | 加载进度、倒计时 |
| 滑动条 | `Laya.GSlider` | 音量调节、回放进度 |
| 输入框 | `Laya.GTextInput` | 文本输入 |
| 弹窗 | `Laya.Dialog` | 模态弹窗 |
| 资源加载 | `Laya.loader.load(url, type)` | 单资源/批量加载，支持 Scene/Image/Atlas/Font/Sound/Spine 类型 |
| 对象池 | `Laya.Pool.getItemByCreateFun/recover` | 对象复用 |
| 补间动画 | `Laya.Tween.to/from` + `Laya.Ease` | 缓动动画 |
| 帧动画 | `Laya.FrameAnimation` | 序列帧播放 |
| 骨骼动画 | `Laya.SpineTemplet/Skeleton` | Spine 骨骼动画加载与播放 |
| 音效 | `Laya.SoundManager.playSound/playMusic` | 音效和背景音乐 |
| 定时器 | `Laya.timer.frameLoop/once/callLater` | 帧循环和延时回调 |
| 网络 | `Laya.Socket` | WebSocket 通信（备选：Colyseus SDK） |
| 本地存储 | `Laya.LocalStorage` | 键值存储 |
| 事件 | `Laya.Event.CLICK/MOUSE_DOWN/KEY_PRESS...` | 输入事件监听 |

---

## 十九、风险与注意事项

1. **`shared/` 与 Colyseus Schema 类型**：`shared/` 是纯 TypeScript，不依赖 `@colyseus/schema` 运行时。客户端 Colyseus Schema 实例由 `colyseus.js` SDK 提供。需要确保 `tsconfig.json` 中 `@shared/*` 别名正确指向 `../../shared/`。

2. **LayaAir IDE 依赖**：`.ls`/`.lh` 文件必须通过 IDE MCP 创建和编辑，不直接用文件写入工具。IDE MCP 服务器需确保已配置和运行。

3. **构建流程**：LayaAir 3.4 使用 IDE 自带编译，通过 `ProjectManagement.build` MCP 接口触发。CI/CD 集成需要额外确认。

4. **UI 体系一致性**：本项目使用新版 UI（`ui2`），组件名前缀为 `G`（`Laya.GBox`/`Laya.GButton`/`Laya.GLabel`/`Laya.GImage`/`Laya.GList`/`Laya.GPanel`）。绝对不可在新版 UI 中混用经典 UI 组件（`Laya.Box`/`Laya.Button`/`Laya.Label`）。

5. **WebSocket 方案选择**：优先使用 Colyseus SDK（与 `shared/` Schema 定义一致），`Laya.Socket` 仅在特殊场景（如自定义协议通信）作为备选。
