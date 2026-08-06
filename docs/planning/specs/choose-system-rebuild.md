# 选择系统重建（Choose System Rebuild）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r2.md](../issues/r2.md)

## 需求

完整重建玩家交互选择系统：类型定义、会话管理、序列化、便捷 API、客户端驱动。

1. **类型定义**：`ChooseTypes.ts` 完整版（`ChooseSession` / `ChooseData` / `ChooseResult` / `SelectorConfig` / `SelectorLifecycle` 等）
2. **会话管理**：`ChooseManager`（`request` / `race` / `all` 三种发送模式 + 超时链 + `_autoSelect`）
3. **序列化**：`toWire` / `fromWire`（函数剥离与恢复 + hash 缓存 + 多步级联）
4. **便捷 API**：`chooseDiscard` / `chooseTargetToUse` 等语法糖，三种行为分支（直接执行 / 权威端构造 / 镜像端替换）
5. **函数序列化**：压缩 + hash + 服务端按玩家追踪首次发送

## 目标

- 选择系统完整可用，R3 技能框架直接复用
- 函数序列化可跨线传输选择逻辑，同一选择模式不重复发送函数体

## 前置依赖

- R1（对局骨架 + ITransport 传输通道）
- 当前 `shared/core/types/SelectTypes.ts` 最小集（将被完整替换）

## 命名定案

以 **Choose** 为主。`Selector` 保留给 UI 层概念（选择器配置、选择器类型、选择器生命周期）。

| 命名 | 说明 |
|---|---|
| `ChooseTypes.ts` | 类型文件（替换 `SelectTypes.ts`） |
| `ChooseCount` | 选择数量约束（替换 `SelectCount`） |
| `ChooseSession` | 选择会话（旧 `SelectSession`） |
| `ChooseData` | 选择数据（新独立类型，一次选择步骤） |
| `ChooseResult` | 选择结果（旧 `SelectResult`） |
| `ChooseManager` | 选择管理器 |
| `SelectorConfig` | 选择器配置（UI 层概念，保留） |
| `SelectorType` | 选择器类型（保留） |
| `SelectorLifecycle` | 选择器生命周期回调（保留） |
| `SelectorWindow` | 选择器窗口配置（保留） |
| `SelectorContext` | 选择器上下文（保留） |
| `StepConfig` | 废弃（消灭 selectors 预设机制） |
| `PlayPhaseResult` | 出牌阶段结果枚举（保留） |

---

## 详细设计

### 1. 核心对象

#### 1.1 ChooseCount

```ts
/** 选择数量约束：精确数量 或 [最小, 最大]（负数 max = 无上限） */
export type ChooseCount = number | [number, number];
```

#### 1.2 SelectorConfig

```ts
export enum SelectorType {
    Card = 'Card',
    Player = 'Player',
    General = 'General',
    Option = 'Option',
    Command = 'Command',
    Confirm = 'Confirm',
}

export interface SelectorConfig<T = any> {
    name: string;
    type: SelectorType;
    count: ChooseCount;
    auto?: boolean;
    /** 可选项列表（函数，需序列化） */
    selectable: (ctx: SelectorContext) => T[];
    /** 过滤条件（函数，需序列化） */
    filter?: (item: T, selected: T[], ctx: SelectorContext) => boolean;
    /** 生命周期回调（函数，需序列化） */
    life?: SelectorLifecycle<T>;
    /** 窗口配置 */
    window?: SelectorWindow;
}
```

#### 1.3 SelectorLifecycle

```ts
export interface SelectorLifecycle<T = any> {
    onInit?: (ctx: SelectorContext, validCandidates: T[]) => Partial<SelectorConfig>;
    onSelect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    onDeselect?: (item: T, selected: T[], ctx: SelectorContext) => Partial<SelectorConfig>;
    onComplete?: (selected: T[], ctx: SelectorContext) => boolean;
}
```

#### 1.4 SelectorWindow

```ts
export interface SelectorWindow {
    type: string;
    options?: any;
    filter?: (item: string, selected: string[], ctx: SelectorContext) => boolean;
    isAllShow?: boolean;
}
```

#### 1.5 SelectorContext

```ts
export interface SelectorContext {
    player: Player;
    room: Room;
    /** 已完成步骤的选择结果 */
    results?: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResults?: Record<string, string[]>;
    /** 触发选择的事件数据 */
    eventData?: any;
    /** 技能名 */
    skillName?: string;
    [key: string]: any;
}
```

#### 1.6 ChooseData（新独立类型）

一次选择步骤，可同时包含多个不同类型的选择器（如使用牌 = Card 选择器 + Player 选择器同时渲染）。

```ts
export interface ChooseData {
    /** 选择器列表（多类型并存） */
    selectors: SelectorConfig[];
}
```

#### 1.7 ChooseSession

```ts
export interface ChooseSession {
    id: string;
    player: string;
    /** 有序选择步骤 */
    data: ChooseData[];
    /** 上下文（含 player/room 引用，toWire 时剥离） */
    context: SelectorContext;

    /** 提示文本 */
    prompt?: {
        main?: RichString;
        side?: RichString;
    };
    /** 是否可取消 */
    canCancel?: boolean;
    /** 是否显示确认/取消按钮 */
    showConfirmButton?: boolean;
    /** 是否显示倒计时 UI */
    showTimer?: boolean;
    /** 超时时间（秒）。未设置时使用 room.options.responseTime，仍未设置则默认 15 秒 */
    timeout?: number;
    /** 多段选择时当前会话的剩余时间（秒），由 ChooseManager 自动计算 */
    remaining?: number;
    /** 是否自动选择第一个可选项 */
    autoSelectFirst?: boolean;
    /** 是否为出牌阶段询问 */
    isPlayPhase?: boolean;
    /** 是否为使用牌询问 */
    isUseCard?: boolean;
    /** 是否为打出牌询问 */
    isPlayCard?: boolean;
    /** 是否为技能选择询问 */
    isSkillSelect?: boolean;
}
```

#### 1.8 ChooseResult

```ts
export interface ChooseResult {
    id: string;
    cancelled: boolean;
    timeout?: boolean;
    /** 各选择器的结果（key = SelectorConfig.name） */
    results: Record<string, any[]>;
    /** 窗口选择结果 */
    windowResult?: Record<string, string[]>;
    /** 出牌阶段操作类型 */
    playPhaseResult?: PlayPhaseResult;
    useCard?: VirtualCardData;
    playCard?: VirtualCardData;
    skillName?: string;
}

export enum PlayPhaseResult {
    None,
    UseCard,
    UseSkill,
    Recast,
    OpenHead,
    OpenDeputy,
    End,
}
```

#### 1.9 ChooseTypes 文件结构

`shared/core/types/ChooseTypes.ts` 包含上述全部类型定义。旧 `SelectTypes.ts` 删除，所有引用更新。

---

### 2. ChooseSession 生命周期与超时链

#### 2.1 超时优先级

```
session.timeout (秒) → room.options.responseTime (秒) → 15 (秒)
```

逻辑：`timeoutSec = session.timeout ?? room.options.responseTime ?? 15`，然后 `* 1000` 转毫秒。

#### 2.2 单玩家互斥

同一玩家同时只能有一个进行中的选择会话。新请求到来时，自动取消该玩家的旧会话（`cancel(oldId)` → `pending.resolve({ cancelled: true })`）。

#### 2.3 单次选择（单步）

`ChooseSession.data` 只有一项 `ChooseData`。发一次会话，等玩家响应后 resolve。

#### 2.4 多步选择

`ChooseSession.data` 有多项 `ChooseData`，**共享总超时**：

1. 记录 `startedAt = Date.now()`
2. 对每个 `ChooseData[i]`：
   - 计算 `elapsedMs = Date.now() - startedAt`
   - 计算 `remainingMs = max(0, totalMs - elapsedMs)`
   - 若 `remainingMs <= 0`：终止，后续步骤结果标记 `{ cancelled: true, timeout: true }`
   - 设置当前 `session.remaining = Math.ceil(remainingMs / 1000)`（供客户端显示倒计时）
   - 将已完成步骤的结果合并注入 `ctx.results`（数组合并，不覆盖同名 key）
   - `await request(singleStepSession)`
   - 若 `result.cancelled` 则终止后续

#### 2.5 取消语义

- 任一部分取消 → 整个会话结果 `cancelled = true`
- 多步中某步取消 → 后续步骤不执行
- `cancelAll(playerId)` 取消该玩家当前会话

---

### 3. 序列化

#### 3.1 toWire（权威端 → 镜像端）

剥离不可序列化的字段：

- `context.player` → `context.playerId: string`
- `context.room` → 不传（客户端持有 Room 引用）
- `SelectorConfig.selectable` → 走函数序列化（hash + body）
- `SelectorConfig.filter` → 走函数序列化
- `SelectorConfig.life` → 走函数序列化
- `SelectorWindow.filter` → 走函数序列化

保留字段全部为纯数据类型。

#### 3.2 fromWire（镜像端收到后重构）

- `context.player = room.players[context.playerId]`
- 函数字段从缓存恢复：`new Function(...)` → 存入内存 `_chooseFns: Map<hash, Function>`
- 其余字段直接赋值

#### 3.3 多步级联

`ctx.results` 在权威端 multiStep 循环中累积注入（已完成步骤的结果合并到后续步骤的 ctx），toWire 时 `ctx.results` 作为纯数据下发。镜像端无需额外处理。

#### 3.4 响应回传

镜像端构建 `ChooseResult` → `fromWire(ChooseResult)` 回传权威端。`ChooseResult` 本身全部是纯数据（id / cancelled / timeout / results / windowResult / playPhaseResult / useCard / playCard / skillName），无需特殊处理。

---

### 4. 服务端 API

#### 4.1 ChooseManager（`logic/` 层，仅权威端）

```
shared/core/logic/manager/ChooseManager.ts
```

**内部状态**：

```ts
private _pending = new Map<string, PendingChoice>();
private _byPlayer = new Map<string, string>();
private _sentHashes = new Map<string, Set<string>>();  // playerId → 已发送的 hash 集合
```

**核心方法**：

| 方法 | 签名 | 说明 |
|---|---|---|
| `request` | `(session: ChooseSession) => Promise<ChooseResult>` | 单玩家：发一个会话，等完成 |
| `race` | `(sessions: ChooseSession[]) => Promise<ChooseResult>` | 多玩家竞争：分别发同内容会话，第一个完成就 cancel 其余 |
| `all` | `(sessions: ChooseSession[]) => Promise<ChooseResult[]>` | 多玩家全响应：分别发会话，等所有人完成 |
| `respond` | `(sessionId: string, result: ChooseResult) => void` | 客户端响应入口。合并写入 ctx.results / ctx.windowResults |
| `cancel` | `(sessionId: string) => void` | 取消指定会话 |
| `cancelAll` | `(playerId: string) => void` | 取消某玩家当前会话 |
| `isPending` | `(playerId: string) => boolean` | 玩家是否有等待中的选择 |

**发送流程**（request / race / all 共用）：

1. 检查玩家是否已有进行中会话（是则 cancel 旧）
2. `_byPlayer.set(playerId, session.id)`
3. toWire：遍历 session.data 中所有 SelectorConfig 的函数字段，压缩 + hash → 查 `_sentHashes[playerId]` → 首次发送带 body，重发送仅带 hash
4. 启动超时 timer
5. `await room.input.requestChoice(playerId, wireSession)`
6. 返回 Promise（在 respond / cancel / timeout 时 resolve）

**超时处理**：

- `autoSelectFirst = true`：调用 `_autoSelect` 按 count 选前 N 个可选项
- 否则：标记 `{ cancelled: true, timeout: true }`

**`_autoSelect` 逻辑**（按 count 选前 N）：

```ts
for each step:
  for each selectorConfig in step.selectors:
    candidates = config.selectable(ctx)
    selected = []
    for c in candidates:
      if config.filter && !filter(c, selected, ctx) continue
      selected.push(c)
      if !_canSelectMore(config.count, selected) break
    result.results[config.name] = selected
```

**`_canSelectMore` 逻辑**：

- `count: number` → `selected.length < count`
- `count: [min, max]` → `max < 0` 时永远可继续；否则 `selected.length < max`

#### 4.2 IPlayerInput 注入点

```ts
// shared/core/types/ 或 logic/ 层
export interface IPlayerInput {
    requestChoice(playerId: string, session: ChooseSession): Promise<void>;
}
```

网络层实现此接口（本地模式直接调用对应 handler，联机模式经 Colyseus 传输），注入 `ChooseManager`。

#### 4.3 消灭 sgs.selectors

旧 `sgs.selectors: Map<string, SelectorConfig>` 预设注册表不再存在。每个 `chooseXXX` 方法直接产出带完整闭包的 `ChooseData`，不通过 name 字符串查表合并。

---

### 5. 便捷 API（语法糖）

位于 `shared/core/logic/choose/`（或 `shared/core/logic/manager/` 内）。

#### 5.1 三种行为分支

同一 API（如 `chooseDiscard`）根据运行上下文走三种分支：

| 上下文 | 触发场景 | 行为 |
|---|---|---|
| **直接执行** | 消耗/效果结算 | 构造 ChooseData → ChooseManager.request → 选完 → **在选择内部执行对应动作**（如弃牌）→ 返回已执行结果 |
| **权威端构造** | 技能的 choose 回调 | 构造 ChooseData → 返回给技能框架 → 框架封入 ChooseSession → toWire → 等客户端响应 |
| **镜像端替换** | 客户端技能按钮点击 | 构造 ChooseData → 本地渲染 UI → 用户操作 → 结果继承原 session.id 回传权威端 |

调用者无感：同一行 `chooseDiscard(player, 2)` 代码，框架根据运行上下文自动走对的分支。

**关键差异**：直接执行时，弃牌动作在 API 内部完成，技能代码不需要「先选、再调弃牌方法」。

#### 5.2 便捷 API 列表

| API | 说明 |
|---|---|
| `chooseDiscard(player, count, filter?)` | 弃牌选择（选完立即弃牌，或返回 ChooseData 给技能） |
| `chooseTargetToUse(player, cardData, filter?)` | 使用牌目标选择 |
| `chooseTargetToPlay(player, cardData, filter?)` | 打出牌目标选择 |
| `chooseCardsToUse(player, cardData, filter?)` | 使用牌的牌选择 |
| `chooseCardsToPlay(player, cardData, filter?)` | 打出牌的牌选择 |
| `chooseGenerals(player, count, filter?)` | 武将选择 |
| `chooseOptions(player, options)` | 选项选择 |
| `chooseConfirm(player, prompt)` | 确认选择 |

所有 API 返回 `ChooseData`，内部自动处理三种行为分支。

---

### 6. 函数序列化机制

#### 6.1 压缩

`fn.toString()` → 正则去空白换行：

```ts
function compressFn(fn: Function): string {
    return fn.toString().replace(/\s+/g, ' ').trim();
}
```

#### 6.2 Hash

对压缩后的文本做 SHA-256（相同文本 → 相同 hash 确定）：

```ts
function hashFn(body: string): string {
    // SHA-256 → hex
}
```

#### 6.3 服务端按玩家追踪

```
_sentHashes: Map<playerId, Set<hash>>
```

服务端重启后内存重建，不清零。每个玩家连接周期内，同一 hash 仅首次发送 body，后续仅发 hash。

#### 6.4 客户端缓存

客户端内存缓存，不持久化：

```ts
_chooseFns: Map<hash, Function>
```

收到 body 时：`new Function('ctx', 'item', 'selected', body)` → 存入缓存。后续收到同 hash 时直接取值调用。

#### 6.5 可序列化函数约束

所有可序列化的选择函数（`selectable` / `filter` / `life` 回调）**只能访问**：

1. 函数参数（`ctx` / `item` / `selected`）
2. `sgs` 全局（`globalThis.sgs`，含枚举值、类型、工具方法）
3. JavaScript 内置（`Array` / `String` / `Map` 等）

禁止模块级 import 引用。扩展代码中需用到的枚举值与类型通过 `sgs` 注入。

#### 6.6 Wire 格式

```ts
interface WireFunction {
    hash: string;
    body?: string;   // 首次发送时携带
}
```

---

### 7. 客户端消费（R4）

#### 7.1 SelectorConfig → UI 组件映射

```ts
const SelectorUIMap: Record<SelectorType, ComponentType> = {
    [SelectorType.Card]: CardSelector,
    [SelectorType.Player]: PlayerSelector,
    [SelectorType.General]: GeneralSelector,
    [SelectorType.Option]: OptionSelector,
    [SelectorType.Command]: CommandSelector,
    [SelectorType.Confirm]: ConfirmSelector,
};
```

#### 7.2 SelectorLifecycle 回调

客户端驱动 UI 时依次调用：

1. `onInit(ctx, validCandidates)` → 更新 UI 配置
2. 用户点击选项时 `onSelect(item, selected, ctx)` → 更新 UI 配置
3. 用户取消选项时 `onDeselect(item, selected, ctx)` → 更新 UI 配置
4. 确认时 `onComplete(selected, ctx)` → 校验 → 返回 boolean

#### 7.3 多步流程

多步数据 `ChooseData[]` 驱动分步 UI（上一步/下一步导航），每步确认后进入下一步。

---

### 8. SkillAI 配置（技能注册时附带，R3 落地）

```ts
/** 策略类型：对应不同游戏询问 */
enum StrategyType {
    PlayPhase = 'PlayPhase',
    UseCard = 'UseCard',
    PlayCard = 'PlayCard',
    Active = 'Active',
    Respond = 'Respond',
    ChooseCards = 'ChooseCards',
    ChooseTargets = 'ChooseTargets',
    ChoosePlayers = 'ChoosePlayers',
    Invoke = 'Invoke',
}

interface SkillAI {
    type: StrategyType | StrategyType[];

    // === 布尔标签 ===
    /** 濒死时可对自己使用（桃类） */
    save?: boolean;
    /** 可救别人（视为桃类） */
    respondTao?: boolean;
    /** 可响应闪（视为闪类） */
    respondShan?: boolean;
    /** 可响应杀（视为杀类） */
    respondSha?: boolean;
    /** 是卖血技 */
    maixie?: boolean;

    // === 数值 ===
    /** 出牌阶段优先级（同类型比较，数值高先评估） */
    order?: number | ((ctx: AIContext) => number);
    /** 卡牌保留价值（弃牌时用，低价值的先弃） */
    keepValue?: number | ((card: Card) => number);
    /** 卡牌使用价值（出牌阶段评估用） */
    useValue?: number | ((card: Card) => number);

    // === 决策函数 ===
    /** 是否该发动这个技能 */
    shouldUse?: (ctx: AIContext) => boolean;
    /** 选择目标时的排序函数 */
    chooseTarget?: (ctx: AIContext, targets: Player[]) => Player[];
    /** 选择牌时的排序函数 */
    chooseCards?: (ctx: AIContext, cards: Card[]) => Card[];
    /** 视为技能的前置条件 */
    skillTagFilter?: (ctx: AIContext) => boolean;
}

interface AIContext {
    player: Player;
    room: Room;
    skillName: string;
    eventData?: any;
}
```

注册方式（R3 技能框架落地后）：

```ts
const zhiheng: SkillData = {
    name: 'zhiheng',
    type: SkillType.Trigger,
    ai: {
        type: StrategyType.Active,
        keepValue: 1,          // 制衡：牌的价值不重要，等值换
        shouldUse: (ctx) => ctx.player.hand.length > 0,
        chooseCards: (ctx, cards) => {
            // 弃废牌：按卡牌价值升序
            return cards.sort((a, b) =>
                ctx.player.room.defaultCardKeepValue(a) - ctx.player.room.defaultCardKeepValue(b)
            );
        },
    },
    cost: (ctx) => { /* 弃牌逻辑 */ },
    effect: (ctx) => { /* 摸等量牌 */ },
};
```

### 9. AIPlayer（决策引擎，仅权威端，R2 落地）

```
shared/core/logic/ai/AIPlayer.ts
```

```ts
class AIPlayer {
    constructor(readonly player: Player, readonly room: Room) {}

    /** 收到 ChooseSession → 产出 ChooseResult（不走网络，直接同步） */
    evaluate(session: ChooseSession): ChooseResult {
        const ctx: AIContext = {
            player: this.player,
            room: this.room,
            skillName: session.context.skillName ?? '',
            eventData: session.context.eventData,
        };
        const results: Record<string, any[]> = {};

        for (const data of session.data) {
            for (const selector of data.selectors) {
                results[selector.name] = this.evaluateSelector(selector, ctx);
            }
        }
        return { id: session.id, cancelled: false, results };
    }

    // ===== 选择器分发 =====

    private evaluateSelector(config: SelectorConfig, ctx: AIContext): any[] {
        switch (config.type) {
            case SelectorType.Card:
                return this.selectCards(config, ctx);
            case SelectorType.Player:
                return this.selectPlayers(config, ctx);
            case SelectorType.Option:
                return [config.selectable(ctx)[0]];
            case SelectorType.Confirm:
                return [true];
            default:
                return this.pickFirst(config, ctx);
        }
    }

    // ===== 选牌逻辑 =====

    private selectCards(config: SelectorConfig, ctx: AIContext): Card[] {
        const candidates = config.selectable(ctx);
        const count = this.resolveCount(config.count);
        let sorted = candidates;

        const skillAI = sgs.skills[ctx.skillName]?.ai;
        if (skillAI?.chooseCards) {
            sorted = skillAI.chooseCards(ctx, [...candidates]);
        } else {
            sorted = this.sortByCardKeepValue(candidates, config, ctx);
        }

        return this.pickByCount(sorted, count, config.filter, ctx);
    }

    // ===== 选角色逻辑 =====

    private selectPlayers(config: SelectorConfig, ctx: AIContext): Player[] {
        const candidates = config.selectable(ctx).filter(p => p.isAlive());
        const count = this.resolveCount(config.count);
        let sorted = candidates;

        const skillAI = sgs.skills[ctx.skillName]?.ai;
        if (skillAI?.chooseTarget) {
            sorted = skillAI.chooseTarget(ctx, [...candidates]);
        } else {
            sorted = [...candidates].sort((a, b) => {
                const aEnemy = this.isEnemy(a) ? 0 : 1;
                const bEnemy = this.isEnemy(b) ? 0 : 1;
                if (aEnemy !== bEnemy) return aEnemy - bEnemy;
                return a.hp - b.hp;
            });
        }

        return this.pickByCount(sorted, count, config.filter, ctx);
    }

    // ===== 出牌阶段（R3 落地） =====

    evaluatePlayPhase(): ChooseResult {
        const ctx: AIContext = { player: this.player, room: this.room, skillName: '' };

        // 收集可用卡牌和技能
        const strategies = this.collectAvailableStrategies(ctx);

        // 按优先级排序，逐个评估收益，取收益最高的
        let best: { result: ChooseResult; benefit: number } | null = null;
        for (const { skill, strategy } of strategies) {
            const result = this.evaluateSkillUse(skill, strategy, ctx);
            if (!best || result.benefit > best.benefit) {
                best = result;
            }
            // 收益为正就不再继续评估
            if (best.benefit > 0) break;
        }

        return best?.result ?? { id: '', cancelled: false, results: {}, playPhaseResult: PlayPhaseResult.End };
    }

    // ===== 工具方法 =====

    /** 卡牌默认保留价值（兜底）：桃(5) > 装备(3) > 闪(2.5) > 杀(2) > 锦囊(1) */
    private defaultCardKeepValue(card: Card): number { /* ... */ }

    /** 按 count 取前 N 个（过 filter） */
    private pickByCount<T>(sorted: T[], count: number, filter: SelectorConfig['filter'], ctx: AIContext): T[] { /* ... */ }

    /** 解析 count 为具体数字 */
    private resolveCount(count: ChooseCount): number { /* ... */ }

    /** 敌友判断 */
    private isEnemy(target: Player): boolean { /* 身份模式下按阵营判断，未分配身份时默认非自己=敌人 */ }

    /** 收集当前可用的卡牌技能和主动技能 */
    private collectAvailableStrategies(ctx: AIContext): { skill: Skill; strategy: SkillAI }[] { /* ... */ }
}
```

### 10. 目录结构

```
shared/core/
├── logic/                          # 仅权威端（R1 起逐步建设）
│   ├── ai/
│   │   └── AIPlayer.ts             # AI 决策引擎（R2）
│   └── manager/
│       └── ChooseManager.ts        # 会话管理（R2）
├── types/
│   └── ChooseTypes.ts              # 类型定义（替换 SelectTypes.ts，含 StrategyType/SkillAI/AIContext）
└── transport/
    └── messages.ts                 # 新增 MessageType.Choice 等
```

### 11. 与增量对齐

| 增量 | 落点 |
|---|---|
| **R2** | `ChooseTypes.ts` + `ChooseManager` + wire 层（toWire/fromWire）+ 函数序列化 + 便捷 API + `AIPlayer`（兜底策略：卡牌价值排序、敌人优先、选第一项）+ `MessageType.Choice` 消息 |
| **R3** | 技能框架复用 ChooseManager + 便捷 API；技能注册附带 `SkillAI` 配置；`AIPlayer` 优先读 `SkillAI`，未配置走兜底；出牌阶段 `evaluatePlayPhase` |
| **R4** | 客户端消费：SelectorConfig → LayaAir UI 组件 + SelectorLifecycle 回调驱动 + 多步 UI 导航 |

---

## 验收标准

1. `ChooseManager.request` 单玩家选择可正常发起、响应、超时
2. `ChooseManager.race` 竞争模式：多玩家只要第一个完成
3. `ChooseManager.all` 全响应模式：等所有玩家完成
4. 多步选择共享超时，`remaining` 正确递减注入
5. 任一步取消 → 整会话 `cancelled = true`
6. 函数序列化：toWire 剥离函数 → 客户端恢复 → 调用结果与权威端一致
7. 服务端按玩家追踪 hash：同一玩家同 hash 不重复发送 body
8. 便捷 API `chooseDiscard` 直接执行时选完立即执行弃牌动作
9. 旧 `SelectTypes.ts` 删除，所有引用更新为 `ChooseTypes.ts`
10. `AIPlayer.evaluate` 对弃牌/濒死/响应/出杀目标等无技能场景产出合法结果，对局不挂死
11. 含 `SkillAI` 配置的技能（R3）：AI 优先读取 `chooseCards`/`chooseTarget`/`shouldUse`，产出符合预期的选择

## 产出物

- `shared/core/types/ChooseTypes.ts`（替换 `SelectTypes.ts`，含 `StrategyType`/`SkillAI`/`AIContext`）
- `shared/core/logic/manager/ChooseManager.ts`
- `shared/core/logic/ai/AIPlayer.ts`
- `shared/core/transport/messages.ts` 新增 `MessageType.Choice`
- 旧 `SelectTypes.ts` 删除 + 引用更新
- 不产生 `sgs.selectors`（消灭预设机制）
- 不产生游戏模拟器（零模拟评估）
