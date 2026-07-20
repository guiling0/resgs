# M2 使用牌骨架 Spec

> 状态: `ready-for-agent`
> 里程碑: M2 使用牌骨架
> 父文档: [map.md](map.md)

---

## Problem Statement

游戏引擎已有完整的事件系统（14 个事件类）、技能框架（触发技闭环 M1 完成）和卡牌基础设施（GameCard/VirtualCard），但**没有"使用牌"的能力**。玩家手上有杀和桃，但无法出牌——`UseCardEvent` 类不存在，`Room.useCard()` 方法缺失。整个游戏卡在出牌这一步，无法推进到伤害和回复。

---

## Solution

实现统一 `UseCardEvent` 类 + `Room.useCard()` 双签名入口 + 杀/桃两张基本牌的 CardUse 定义，打通**无响应路径**（出杀→掉血、出桃→回血）。

```
room.useCard(player, shaCard, [target])   ← 签名1 直接触发（headless 测试/AI）
  ↓
UseCardEvent.exec()
  ├── Part 1: 使用预结算（8 类时机，逐目标展开）
  │    实体牌入处理区
  │    → UseCardDeclare → DeclareAfter → ChooseTarget → Used
  │    → AssignTarget(T1) → BecomeTarget(T1) → AssignTargetAfter(T1) → BecomeTargetAfter(T1)
  │    → Ready（移除已死目标→最终目标列表）
  ├── Part 2: 使用结算（循环 A→B，每目标一次）
  │    → EffectStart → EffectBefore（响应窗口，M3 接线）→ Effect → EffectAfter
  │    （无响应路径：跳过 offset 时机，直接执行 effect）
  └── Part 3: 使用结算结束后
       → End1 → End2 → End3 → 虚拟牌消失
```

验收：headless 测试中 `room.useCard(player, shaCard, [target])` → target.hp 减 1；`room.useCard(player, taoCard, [self])` → self.hp 加 1。

---

## User Stories

1. As a 玩家, I want 在出牌阶段使用杀攻击一名角色, so that 我能对敌人造成伤害
2. As a 玩家, I want 在出牌阶段使用桃回复体力, so that 我能恢复自己的生命值
3. As a 玩家, I want 出牌时实体牌自动移入处理区, so that 牌的使用遵循"先移入处理区再结算"的规则
4. As a 玩家, I want 使用结算按目标逆时针依次进行, so that 多目标牌的结算顺序正确
5. As a 玩家, I want 目标在成为目标时确定"对XX使用过此牌"的关系, so that 〖窃听〗等技能有正确的判定依据
6. As a 玩家, I want 使用结算结束后虚拟牌自动消失, so that 不会残留已使用过的虚拟牌
7. As a 游戏开发者, I want CardUse 定义以数据驱动的方式注册到 sgs, so that 新增卡牌只需声明数据无需写事件代码
8. As a 游戏开发者, I want room.useCard() 提供双签名（直接触发 / 发起询问）, so that headless 测试和客户端交互共用同一入口
9. As a 游戏开发者, I want room.canUseCard() 提供合法性预检（Prohibit → 次数 → 目标数）, so that 客户端可以判断哪些牌可用
10. As a 游戏开发者, I want UseCardEvent 的 targetList 包含 offset/无双/effectTimes 字段, so that M3 响应闭环和 M4 锦囊可以直接复用无需改结构

---

## Implementation Decisions

### D1: 新增/修改文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `shared/core/event/UseCardEvent.ts` | **新增** | 统一 UseCardEvent 类 |
| `shared/core/room/Room.ts` | **修改** | 添加 `useCard()` / `canUseCard()` 方法 |
| `shared/core/room/manager/CardManager.ts` | **修改** | 添加 CardUse 注册和预索引 |
| `shared/core/card/CardTypes.ts` | **修改** | 添加 `CardUseData` 类型定义 |
| `shared/core/sgs.ts` | **修改** | 添加 `carduses: Map<string, CardUseData>` 注册表 |
| `shared/test/m2-usecard.test.ts` | **新增** | M2 验收测试 |
| `shared/core/event/EventTypes.ts` | **修改** | 统一 UseCardEventData 结构（三合一），更新 targetList 类型 |

### D2: UseCardEvent 统一类结构

参考 `DamageEvent` 的模式——在构造函数中 `_buildTriggers()`，标准 `exec()` 循环消费 `eventTriggers` + `endTriggers`。不同于 `UseSkillEvent` 的自定义 `exec()`，UseCardEvent 走标准事件管线。

```
class UseCardEvent extends EventProcess<EventType.UseCard>:
    constructor(room, data: UseCardEventData):
        super(room, EventType.UseCard, data)
        data.isFirstTarget = true
        this._buildTriggers()
    
    // 便利访问器
    get player(): Player
    get card(): VirtualCard
    get targets(): Player[]
    get targetList(): TargetEntry[]
    
    // 核心方法
    private _buildTriggers(): void      ← 按 card.type 分支构建时机序列
    private _buildTargetTriggers(): void ← 逐目标展开 assign/become/assign_after/become_after
    private _sortTargets(): void         ← 目标逆时针重排序
    private _reindexTargets(): void      ← 重排序后更新 index
    
    // 生命周期
    protected async init(): Promise<void>
    async exec(): Promise<this>
    check(): boolean                     ← 目标列表非空
    checkEvent(): boolean
    
    // 目标操作（预结算中用）
    changeTarget(oldTarget, newTarget): void   ← 转移目标
    cancelTarget(target, reason): void         ← 取消目标（移出+终止时机）
    markInvalid(target): void                  ← 标记无效
    
    // 结算中用（循环 A→B）
    offset(target, event): void         ← 被抵消（M3 接线）
    addWushuang(target, player): void   ← 无双标记
```

### D3: buildTriggers() 按卡牌类型分支

根据设计决策（use-card-and-need.md §5.5），一个 UseCardEvent 类替代旧三子类：

| 卡牌条件 | 时机构建逻辑 |
|---|---|
| **基本牌/普通锦囊**（默认分支） | 全套 15 时机 + 循环 A→B。assign/become/assign_after/become_after 按目标数逐个展开 |
| **目标是牌**（闪/无懈/金蝉） | 剔除 UseCardDeclareAfter ~ UseCardBecomeTargetAfter 段（无 assign/become 序列）。M3 实现 |
| **装备/延时锦囊** | 预结算收尾直接结束——实体牌移入装备区/判定区，不进入循环 A→B。M4 实现 |

M2 只实现**基本牌/普通锦囊分支**（杀/桃验证），但 buildTriggers 的 `if/else` 骨架一次到位。

### D4: 时机序列（生成式执行）⚠️ 已修订

> 原 spec 为构造函数中预构建全部时机。用户指示规则为**生成式**——每个时机完成后根据当前状态即时生成下一个时机。

实现采用自定义 `exec()` 四段式：

1. **预结算固定段**：Declare → DeclareAfter → ChooseTarget → Used（标准 eventTriggers 消费）
2. **目标扩展段（生成式）**：逐阶段（AssignTarget/BecomeTarget/AssignTargetAfter/BecomeTargetAfter）× 逐个当前目标。中途加入从当前阶段开始，中途移除跳过剩余。
3. **Ready**：移除死者 → 最终目标列表
4. **结算段（生成式轮询）**：按 effectTimes 逐轮结算。已有 invalid→跳过全部；EffectStart 期间 invalid→跳过后续；EffectBefore 期间 offset→Offset+跳过 Effect/EffectAfter
5. **结束后固定段**：End1 → End2 → End3（endTriggers 消费）

关键实现细节：
- `UseCardOffset` 条件生成：仅 `entry.offset` 存在时插入（M2 始终 undefined）
- `_doneTargetPhases` Map 追踪每个目标的已完成阶段
- `isFirstTarget`：目标阶段每阶段首目标=true；结算阶段每轮首目标=true

### D5: targetList 完整结构 ⚠️ 已修订

在现有 `UseCardEventData.targetList` 基础上统一并补全：

```typescript
interface TargetEntry {
    index: number;              // 自增 ID——仅用于同玩家时稳定排序，不回写
    target: Player;             // 目标角色
    subTargets?: Player[];      // 借刀子目标（不进 targetList、不触发 assign/become 时机）
    invalid?: boolean;          // 此牌对此目标无效（跳过生效时机）
    offset?: any;               // 抵消此牌的事件（M3 接线）
    effectTimes?: number;       // 生效次数（默认取事件的 effectTimes，可单独修改）
    settleCount?: number;       // 已结算次数
}
```

**修订项**：
- `index` 是自增 ID，排序不更新——排序键是玩家座位，index 仅作同玩家次级排序
- 移除 `generator`：改为快照（`_doneTargetPhases` Map）追踪阶段完成情况
- 移除 `wushuang`：无双类技能稍后裁定如何实现
- 排序规则：从当前回合角色开始，逆时针（clockwise=false 默认）或顺时针；同玩家按 index

**已移除**：旧 `UseCardToCardEventData` 和 `UseCardSpecialEventData` 的独立 targetList 类型——统一为一个 `TargetEntry[]`。

### D6: room.useCard() 双签名 ⚠️ 已修订

```typescript
// 签名 1：直接触发事件（headless 测试 / AI / 系统触发）
async useCard(
    player: Player,
    card: VirtualCard,
    targets: Player[],
): Promise<UseCardEvent | null>;

// 签名 2：发起使用牌询问（客户端交互）
async useCard(
    player: Player,
    opts: { cardNames?: string[] },
): Promise<UseCardEvent | null>;
```

签名 2 内部：查 CardUse → 选牌（chooseCard）→ 创建 VirtualCard → 选目标（choosePlayer）→ 回调签名 1。M2 实现签名 1 + 签名 2 骨架（选牌→选目标两步），need2 技能列表组装在 M3 补全。

### D7: CardUse 数据定义与注册 ⚠️ 已修订

```typescript
interface CardUseData {
    name: string;                          // 牌名（如 'sha', 'tao'）
    timing: TimingName;                    // 默认使用时机（每种使用方法只在一个时机）
    target: (room, player, card) => Player[];  // 合法目标选择器
    distanceCondition?: (room, player, target, card) => boolean;  // 距离条件
    effect: (room, target, event: UseCardEventData) => Promise<void>; // 牌面效果
    canUse?: (room, player, card) => boolean;         // 额外使用条件（如桃需体力不满）
    timesCondition?: (room, player) => number;        // 使用次数条件
}
```

**修订项**：
- `cardName` 合并入 `name`：牌名即标识名，无需区分
- `defaultTiming: TimingName[]` → `timing: TimingName`：每种使用方法只在**一个**默认时机
- `targetSelector` → `target`：简化命名
- `timesLimit` → `timesCondition`：与 `distanceCondition` 统一 `xxxCondition` 命名

注册方式：
- `sgs.carduses: Map<string, CardUseData>` — 全局注册表
- `CardManager.initCardUses()` 深拷贝到 `room.carduses`，允许运行时修改

杀和桃的 CardUse 定义在 M2 中直接写入 `CardManager.initCardUses()`，不需要单独的扩展包文件。

### D8: room.canUseCard() 合法性检测

```typescript
canUseCard(
    player: Player,
    cardNameOrVC: string | VirtualCard,
    target?: Player,
    opts?: { useModifiers?: UseModifiers }
): boolean
```

三关检测：
1. **Prohibit**：`Prohibit_UseCard` StateEffect 禁止使用此牌名 → false
2. **次数**：杀在出牌阶段空闲时间点使用 → history 查询当前 PhaseEvent.phaseId 之后的杀使用计数是否达上限
3. **目标数**：合法目标数量 ≥ 额定目标数下限 且 ≠ 0 → true

属性盲返回布尔值。传入 VirtualCard 时做 Post-check（可用于客户端渲染）。

### D9: exec() 流程中的关键操作 ⚠️ 已修订

由于执行模型改为生成式，固定操作挂钩点有所调整：

| 时机 | 固定操作 |
|---|---|
| `UseCardDeclare` before | 实体牌移入处理区（`MoveCardEvent`），reason='use' |
| `UseCardUsed` before | 目标列表重排序 |
| `UseCardBecomeTarget` 全部完成后 | `_finalizeBecomeTarget()` 定型"对XX使用过此牌"关系（M2 空实现，M3 补全） |
| `UseCardReady` before | 移除已死亡目标 → 重排序 → 形成最终目标列表 |
| `UseCardEffectAfter` after | 执行 `cardUse.effect(room, target, this.eventData)`，更新 settleCount |
| `UseCardEnd3` after | 虚拟牌消失 + 切断对应关系 |

**修订项**：
- 使用计数 +1 由 `Room.canUseCard` 的 history 查询管理，不在 UseCardEvent 中硬编码
- BecomeTarget 定型时机从"每个目标完成后"改为"所有目标 BecomeTarget 完成后"
- EffectAfter 传入 `this.eventData`（UseCardEventData）而非 `this`（UseCardEvent 实例）

### D10: 实体牌路径 ⚠️ 已修订

```
手牌区 → (UseCardDeclare before) → 处理区(reason='use')
       → (processCompleted 清理) → 弃牌堆(reason='use.clear')
```

- 使用开始时实体牌从手牌区移入处理区（失去手牌 → 可触发〖连营〗类技能）
- 事件 processCompleted 时从处理区移入弃牌堆——通过 **MoveCardEvent**（B6 修复），reason=`{原reason}.clear`
- 虚拟牌在 UseCardEnd3 后消失（`room.vcard.destroy(card)`）

### D11: 随 M2 修复的 Bug

| Bug | 修复内容 |
|---|---|
| **B2** — skipPhase 误杀 | TurnEvent 中 skipPhase 的跳过逻辑改为：只跳过未开始的阶段，不跳过当前正在执行的阶段 |
| **B3** — drawCount setter | 恢复 `ratedDrawnum` 的"归零后锁死"语义——`draw_start1` 类效果（改为0）优先级高于 `draw_start2` 类（加减） |
| **B5** — getLoseDatas('h') | `MoveCardEvent.getLoseDatas()` 按目标区域判断（而非仅按原区域类型），交给他人手牌也判定为失去 |
| **B6** — 处理区清理无移动时机 | 处理区清理时插入 `MoveCardEvent`（reason='clear'），可被技能响应 |
| **B8** — 扣血时机错位 | `ReduceHpAfter` 时机移到实际扣血操作**之后**——让〖伤逝〗类技能读到扣血后的 hp |

---

## Testing Decisions

### 测试文件

`shared/test/m2-usecard.test.ts`

### 测试缝合点（Seam）

**唯一缝**：`room.useCard(player, card, targets)` — 签名 1 直接触发。

headless Room 中：
1. 通过 `CardManager.create()` 创建实体牌到玩家手牌区
2. 通过 `VirtualCardManager.createByName()` 或 `createFromCard()` 创建虚拟牌
3. 调用 `room.useCard(player, virtualCard, [target])` 触发完整使用流程
4. 验证 target.hp / player.hp 的变化

### 测试用例

1. **出杀→目标掉血（核心验收）**：创建杀虚拟牌 → `room.useCard(A, shaVC, [B])` → B.hp 减 1
2. **出桃→自己回血（核心验收）**：创建桃虚拟牌 → A 体力不满 → `room.useCard(A, taoVC, [A])` → A.hp 加 1
3. **实体牌移入处理区**：出杀后验证实体牌从手牌区消失、进入处理区
4. **使用结算结束后实体牌入弃牌堆**：UseCardEnd3 后验证实体牌在处理区不在、在弃牌堆
5. **虚拟牌消失**：使用结算结束后 `vcard.destroyed === true`
6. **目标列表逆时针编号**：3 人局，当前回合=P2 → P1 对 P3 出杀 → targetList[0].index=1（T1=P3，从当前回合逆时针数第一个目标）
7. **canUseCard 杀次数限制**：出牌阶段使用一张杀后 `canUseCard(player, 'sha')` → false（默认上限 1）
8. **canUseCard 目标数为 0**：攻击范围外目标 `canUseCard(player, 'sha', distantTarget)` → false
9. **targetList 结构完整性**：验证 `offset`/`wushuang`/`effectTimes`/`settleCount` 字段存在且有默认值
10. **虚拟牌与实体牌对应**：使用 1 张实体牌的虚拟牌 → suit/color/number 继承实体牌

### 参考现有测试

- [shared/test/m1-trigger-bridge.test.ts](shared/test/m1-trigger-bridge.test.ts) — 同模式的 headless 测试，使用 `createRoom`/`createPlayer`/`assert`
- [shared/test/damage.test.ts](shared/test/damage.test.ts) — DamageEvent 触发链，验证 hp 变化
- [shared/test/setup.ts](shared/test/setup.ts) — Room/Player 工厂 + MockPlayerInput + ConsoleLogger

---

## Out of Scope

- **响应闭环**：闪/无懈/金蝉的打出和 UseCardEvent 中的抵消（M3）
- **DropCardEvent**：打出牌事件（M3）
- **need1/need2 完整交互**：need1 询问式技能（护驾/激将）和 need2 按钮式技能列表（武圣/丈八）的 ChooseManager session 组装（M3 补全）
- **濒死求桃**：DyingEvent 中的桃使用询问（M3）
- **出牌阶段空闲时间点循环**：play_phase 时机的无限循环和玩家主动结束（M3，随响应闭环）
- **装备牌/延时锦囊的使用**：装备区和判定区的目标规则（M4）
- **锦囊牌**（决斗/过河拆桥/顺手牵羊等）：CardUse 定义在 M4 随标准包牌堆完成
- **UseModifiers 的 Skill_Invalidity_PerAgent**：按来源作用域的"无视"机制（M4）
- **借刀子目标**：targetSelector 的 subTarget 字段（M4 借刀杀人）
- **连环伤害传导**：DamageEvent 的 chain 逻辑（M4）

---

## Further Notes

- 旧项目参考：`old/resgsv1/server/src/core/event/event.use.ts`（UseCardEvent 三子类）、`old/resgsv1/server/src/core/room/room.choose.ts`（useCard 编排）、`old/resgsv1/server/src/core/card/card.use.ts`（CardUseSkillData 定义模式）
- 设计决策权威来源：`docs/events/use-card.md`（15 时机完整定义）、`docs/events/use-card-and-need.md` §5.1-5.5（26 条重设计决策）
- `UseCardEventData` 需要从现有的三套独立类型（UseCard/UseCardToCard/UseCardSpecial）收敛为一套，旧类型保留为兼容别名但标记 deprecated
- M2 不引入新的网络消息类型——headless 阶段全部走签名 1（直接触发）
- 旧 EventType 枚举中的 `UseCardToCard` 和 `UseCardSpecial` 保留但 M2 不使用——统一走 `EventType.UseCard`

---

## 实现修订记录

以下为实现过程中用户确认的偏离 spec 的修订，已同步到上述各决策段落：

| # | 修订 | 原 spec | 实际实现 | 原因 |
|---|---|---|---|---|
| R1 | 执行模型 | 构造函数预构建 eventTriggers | 生成式 `exec()` 四段式 | 用户：规则为生成式——下个时机由当前状态决定 |
| R2 | TargetEntry.index | 逆时针编号 [T1…Tn] | 自增 ID，排序时不回写 | 用户：排序键是座位，index 仅同玩家次级排序 |
| R3 | TargetEntry.generator | 记录生成条目的时机 | 移除——改用 `_doneTargetPhases` Map 快照 | 用户：快照方式不再需要 |
| R4 | TargetEntry.wushuang | 无双标记 | 移除 | 用户：无双类技能稍后裁定 |
| R5 | clockwise 默认值 | `true`（顺时针） | `false`（逆时针） | 用户纠正 |
| R6 | CardUseData.cardName | `name`+`cardName` 双字段 | 合并为 `name` | 用户：牌名即标识名 |
| R7 | CardUseData.defaultTiming | `TimingName[]`（数组） | `timing: TimingName`（单值） | 用户：每种使用方法只在一个时机 |
| R8 | CardUseData.targetSelector | 长名 | `target` | 用户：简化命名 |
| R9 | CardUseData.timesLimit | 命名不一致 | `timesCondition` | 用户：与 `distanceCondition` 统一 |
| R10 | `_reindexTargets` | 存在的重编号方法 | 不实现 | 用户：index 是自增 ID，无需回写 |
| R11 | `addTarget` | 未定义 | 新增公开方法 | 用户：转移目标场景需要动态加入 |
| R12 | BecomeTarget 定型时机 | 每个目标完成后 | 所有目标完成后统一 | 用户：全部 BecomeTarget 完成后再定型 |
| R13 | 处理区清理 | 直接 `area.move()` | MoveCardEvent（B6） | 用户：reason=`{原reason}.clear` |
| R14 | 按原因查询方法 | `getLoseDatas`/`getObtainDatas` 等 6 个 | 删除——`ByReason` 版本替代 | 用户：职责重复 |
