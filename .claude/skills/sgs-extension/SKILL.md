---
name: sgs-extension
description: 编写三国杀游戏扩展的完整工作流——武将技能、装备技能、规则技能的定义与实现。涵盖 SkillBuilder/EffectBuilder 构建器、触发技（triggered effect）/状态技（state effect）的编写模式、技能消耗与效果函数、锁定技/限定技/觉醒技标签使用、延时类效果、以及测试与注册流程。当用户需要实现武将能力、定义技能效果、编写触发时机逻辑、注册技能到扩展包、或任何涉及 shared/core/skill/ 框架的代码时，都应使用此 skill。即使用户没有明确提到"技能"或"扩展"，只要涉及游戏角色能力或卡牌效果的定义，也应触发此 skill。
---

# SGS 游戏扩展编写指南

## 核心心智模型

新项目的技能框架与旧项目有本质设计差异，理解这些差异能避免写出旧模式的代码：

**Skill 是容器，Effect 才是逻辑主体。** 一个武将技能（如"裸衣"）= 1 个 `Skill` + N 个 `Effect`。Skill 负责条件检查与可见性，Effect 承载实际的触发逻辑或状态修改。

**触发类与状态类互斥。** 一个 Effect 要么是触发类（`has_trigger`），要么是状态类（`has_state`），不可兼有。如果需要同时有触发和状态行为（如既有距离修正又有触发时机），拆为两个独立 Effect。EffectBuilder 在 `build()` 时会校验，共存会报错。

**Builder 模式是推荐入口。** `SkillBuilder` + `EffectBuilder` 提供链式 API，比手写 `SkillData` 对象更不易出错。Builder 的 `.register()` / `.build()` 产出纯数据对象，运行时由 `SkillManager` 消费。

## 决策树：我要写什么？

开始编码前，先确定你要写的是哪种效果：

```
需要"在某个时机自动触发"？
├── 是 → 触发类效果（has_trigger: true）
│   ├── 需要玩家确认是否发动？
│   │   ├── 是 → forced: 'cost' + choose/cost 回调
│   │   └── 否 → forced: 'mute'（锁定技/规则技）
│   ├── 发动后效果在后续时机才执行？
│   │   └── 是 → 延时类效果（addEffect + temp + autoRemove）
│   └── 效果立即可执行？
│       └── 直接写在 effect 回调中
│
└── 否 → 需要"始终修改某个值"？
    └── 是 → 状态类效果（has_state: true + stateCallbacks）
        └── 如距离修正、手牌上限、禁止使用/打出等
```

## 工作流

### 步骤 1：确定技能元数据

```typescript
// 扩展代码通过 sgs 全局对象访问——不 import 核心模块
const skill = new sgs.SkillBuilder('general_name.skill_name');
// 命名约定：'{武将名}.{技能名}'，如 'xuchu.luoyi'、'guanyu.wusheng'
// 装备技能：'{装备名}.{技能名}'，如 'qinggangjian.passive'
```

### 步骤 2：添加效果并配置

```typescript
const effect = skill.addEffect('effect_name');
// 效果名约定：主效果用描述性名称（'trigger'、'draw'），
// 延时子效果用 'delay' 或具体时机名
```

### 步骤 3：配置触发类效果

按发动流程依次配置：`trigger → can_trigger → context → choose → cost → effect`

每个回调的签名和作用见下方模式详解。

### 步骤 4：配置状态类效果（如有）

```typescript
effect.distanceCorrect((from, to) => -1);  // 马术
effect.maxHandCorrect((player) => 1);       // 手牌上限+1
```

### 步骤 5：注册并导出

```typescript
const skillData = skill.register();
// SkillData 由 builder 返回。注意：SkillBuilder.register() 当前仅返回数据，
// 调用方需手动 sgs.skills.set(name, skillData) 写入全局注册表。
// GeneralBuilder/CardBuilder/ModeBuilder 的 .register() 自动写入对应 sgs.* 表。
```

### 步骤 6：编写测试

在 `shared/test/` 下创建 `{技能名}.test.ts`，使用 `setupIntegrationTest` 辅助函数。测试应覆盖：正常发动、拒绝发动、条件不满足、边界情况。

---

## 模式一：标准触发技（有消耗，需确认）

最常见的技能类型——时机到达时询问玩家是否发动，执行消耗后产生效果。

```typescript
const skill = new sgs.SkillBuilder('xiahoudun.ganglie');

skill.addEffect('damage')
    .tag([])
    .settings({ forced: 'cost' })
    .on(sgs.TimingName.DamageInflictAfter)     // 受到伤害后
    .priority(sgs.PriorityType.General)         // 武将技优先级
    .can_trigger(function (room, player, data) {
        // 时机条件：data 是事件数据，player 是技能拥有者
        // 返回任意真值 = 此效果"可以发动"，进入询问流程
        return true;
    })
    .context(function (room, player, data) {
        // 构建上下文对象，传给后续 choose/cost/effect
        // 最少需包含 from（发动者）
        return { from: player };
    })
    .choose(async function (room, player, data, ctx) {
        // 发动前选择（选目标等），返回 falsy = 不发动
        return true;
    })
    .cost(async function (room, player, data, ctx) {
        // 消耗：返回 falsy = 不发动
        // 消耗严格为单操作（如弃一张牌、失去1点体力）
        return { /* cost result */ };
    })
    .effect(async function (room, player, data, ctx) {
        // 效果执行
        // ctx.cost 包含 cost 返回值
        // ctx.choose 包含 choose 返回值
        await player.drawCards(1);
    });
```

**为什么 `can_trigger` 和 `condition` 是分开的？** `can_trigger` 检查时机相关的条件（如"你是伤害来源吗"），`condition` 检查非时机条件（如"你的手牌数大于体力值吗"）。分离后，`condition` 可用于 `Skill.check()` 判断技能是否"可见/可用"，而不依赖具体时机。

**为什么 `choose` 在 `cost` 之前？** 规则要求"声明技能名 + 选目标 + 执行消耗"在同一次询问中完成。`choose` 负责前两步，`cost` 负责第三步。如果 `choose` 返回 falsy，技能视为"未选择发动"，消耗不会执行。

---

## 模式二：锁定技（自动发动，不询问）

```typescript
effect
    .tag([sgs.SkillTag.Lock])        // 锁定技标签
    .settings({ forced: 'mute' })    // 静默发动，不询问玩家
    .on(sgs.TimingName.DamageInflictAfter)
    // 锁定技无需 choose/cost，直接在 effect 中执行逻辑
    .effect(async function (room, player, data, ctx) {
        await player.drawCards(1);
    });
```

**`forced: 'mute'` 是必要非充分条件。** 能否自动发动由 `Effect.canAutoExecute()` 判断，三个条件缺一不可：
1. `forced='mute'`
2. `selectors` 中无 `cost` 字段（有消耗选择器的技能必须询问）
3. 若有所属武将牌，必须处于明置状态

`SkillTag.Lock` 是语义标签（用于战报显示"锁定技"、卡牌效果区分"锁定技无效"等），与自动发动独立。

---

## 模式三：纯状态类效果

状态类效果没有时机、不询问，始终生效。用于距离修正、手牌上限、禁止使用/打出等被动修改。

```typescript
const skill = new sgs.SkillBuilder('general.mashu');

skill.addEffect('mounted')
    .tag([sgs.SkillTag.Lock])
    // 无需 .on()、.can_trigger() 等触发类配置
    .distanceCorrect(function (from, to) {
        return -1;  // 计算 from→to 距离时 -1
    });

// 一个技能可以有多个独立的状态类效果
skill.addEffect('siege')
    .tag([SkillTag.Lock])
    .rangeWithin(function (from, to) {
        // to 视为在 from 的攻击范围内
        return to.hp < from.hp;
    });
```

**状态回调的 `this` 指向 Effect 实例**，可以通过 `this.player`、`this.room`、`this.getMark()` 访问技能拥有者和游戏状态。

**常用状态回调速查：**

| 方法 | 作用 |
|---|---|
| `distanceCorrect(fn)` | 距离修正值（累计） |
| `distanceFixed(fn)` | 距离终值（直接返回） |
| `rangeCorrect(fn)` | 攻击范围修正值 |
| `maxHandCorrect(fn)` | 手牌上限修正值 |
| `maxHandExclude(fn)` | 不计入手牌上限的牌 |
| `prohibitUseCard(fn)` | 禁止使用某牌 |
| `prohibitDropCard(fn)` | 禁止打出某牌 |
| `likeHandToUse(fn)` | 如手牌般使用 |
| `skillInvalidity(fn)` | 使某技能失效 |

> 全部 40+ 状态回调签名见 `references/state-callbacks.md`。

---

## 模式四：延时类效果

发动技能时注册一个临时 Effect，在后续时机触发。

> ⚠️ **当前状态**：`autoRemove` 机制仅有类型定义无消费方（B7），延时类效果的自动注册→触发→清理链路待 M1-M2 实现。以下为**目标模式**。

```typescript
// 主效果：发动时注册延迟子效果
skill.addEffect('trigger')
    .settings({ forced: 'cost' })
    .on(TimingName.DrawPhaseProceeding)
    .cost(async function (room, player, data, ctx) {
        data.ratedDrawnum--;   // 少摸牌（消耗）
        return true;
    })
    .effect(async function (room, player, data, ctx) {
        // 注册一个临时效果，本回合有效
        await player.addEffect(
            this.getTempEffect('delay'),
            { custom_data: { turn: room.currentTurn } }
        );
    });

// 延迟子效果：在造成伤害时触发
skill.addEffect('delay')
    .settings({ temp: true, log: false, toast: false })
    .tag([SkillTag.Lock])
    .on(TimingName.CauseDamage1)
    .can_trigger(function (room, player, data) {
        return data.from === player
            && (data.reason === 'sha' || data.reason === 'juedou');
    })
    .cost(async function (room, player, data, ctx) {
        data.number++;  // 伤害+1
        return true;
    });
```

**为什么延时效果用独立 Effect 而非内联逻辑？** 延时效果需要在**不同时机**触发（如裸衣在"出牌阶段开始时"发动，在"造成伤害时"生效），两个时机之间可能插入任意事件。独立 Effect 模型让延时效果可以复用 trigger→can_trigger→cost→effect 的完整管线，且天然支持"离开区域即失效"（通过卡牌标记实现）。

---

## 模式五：转化技（视为技）

转化技允许玩家将一张牌当作另一张牌使用/打出，如武圣（红牌当杀）、急救（红牌当桃）。

> ⚠️ **依赖 M2**：转化技依赖"需要使用牌"（NeedUseCard）链路，该链路在 M2 中实现。编写转化技的 issue 需标注 M2 依赖。以下是**目标模式**：

```typescript
skill.addEffect('transform')
    .settings({ forced: 'cost', viewas: true })
    .on(TimingName.UseCardNeed1)   // 需要使用牌时
    .can_trigger(function (room, player, data) {
        // 检查是否有可转化的牌
        return player.getCards('h').some(c => c.suit === 'heart');
    })
    // ... viewas 选择器配置牌转化
    .cost(async function (room, player, data, ctx) {
        return true;  // 消耗为使用牌本身
    });
```

---

## 测试

### 文件位置与命名

```
shared/test/xuchu-luoyi.test.ts   # 武将技能测试
shared/test/equip-qinggang.test.ts # 装备技能测试
```

### 测试模板

```typescript
import { setupIntegrationTest } from './setup';

describe('许褚-裸衣', () => {
    it('发动后额定摸牌数-1', async () => {
        const { room, player1 } = await setupIntegrationTest({
            players: 2,
            skills: ['xuchu.luoyi'],
        });
        // 触发 DrawPhaseProceeding → 确认发动 → 验证 ratedDrawnum
    });

    it('拒绝发动时摸牌数不变', async () => { /* ... */ });

    it('非杀/决斗伤害不触发延时效果', async () => { /* ... */ });
});
```

参考现有测试文件：
- 触发类：[damage.test.ts](shared/test/damage.test.ts)、[dying-death.test.ts](shared/test/dying-death.test.ts)
- 状态类：[move-card.test.ts](shared/test/move-card.test.ts)、[judge.test.ts](shared/test/judge.test.ts)

运行单个测试：
```bash
npx tsx shared/test/xuchu-luoyi.test.ts
```

---

## 代码组织

### 扩展文件结构

```
extension/<name>/
  index.ts              ← JSDoc 元数据 + side-effect import（导入即注册）
  generals/             ← 武将定义（GeneralBuilder）
  skills/               ← 技能定义（SkillBuilder + EffectBuilder）
  cards/                ← 卡牌定义（CardBuilder）
  modes/                ← 模式定义（ModeBuilder）
  assets/               ← 资源文件（图片、音频）
  .agent/               ← AI 编码指引
```

### 扩展入口文件

```typescript
/**
 * @name standard
 * @description 身份局标准版扩展包
 * @author ddgl
 * @version 1.0.0
 */
export const meta = {
    name: 'standard',
    description: '身份局标准版扩展包',
    author: 'ddgl',
    version: '1.0.0',
};

// 导入即注册——副作用文件
import './generals/caocao';
import './skills/jianxiong';
import './cards/sha';
import './modes/standard';
```

### 武将定义文件

```typescript
// 扩展代码通过 sgs.* 全局对象访问——不 import 核心模块
new sgs.GeneralBuilder('caocao')
    .kingdom('wei')
    .hp(4)
    .gender(sgs.Gender.Male)
    .skills(['jianxiong'])
    .lord(true)
    .register();  // 自动写入 sgs.generals，幂等
```

### 技能定义文件

```typescript
const builder = new sgs.SkillBuilder('jianxiong');
builder.addEffect('trigger')
    .on(sgs.TimingName.DamageStart)
    .effect(async (room, player) => { /* ... */ });
builder.register();
```

### 卡牌定义文件

```typescript
new sgs.CardBuilder('sha')
    .type(sgs.CardType.Basic)
    .subtype(sgs.CardSubType.Basic)
    .suit(sgs.CardSuit.Spade)
    .number(sgs.CardNumber.A)
    .damage(true)
    .register();  // → sgs.carddatas（类型）+ sgs.cards（实例）
```

### 模式定义文件

```typescript
new sgs.ModeBuilder('standard')
    .maxPlayer(8)
    .isTeamMode(false)
    .settings({ enableLuckyCard: [] })
    .beforeStart(async (room) => { /* 分配身份、选将、发起始手牌 */ })
    .register();  // → sgs.modes
```

## 注册约束

- `.register()` **幂等**——重复调用不重复注册，返回已有数据
- `GeneralBuilder`/`CardBuilder`/`ModeBuilder` 的 `.register()` **自动写入** `sgs.*` 注册表
- `SkillBuilder.register()` 当前仅返回数据，调用方需手动 `sgs.skills.set()`
- 扩展通过 `sgs.TimingName.DamageStart` 访问枚举值，无需 import 核心模块

## 代码/数据分离

官方扩展可拆分为两个独立扩展包：

```
extension/
  standard/              ← 代码扩展（开发者维护——git 管理）
    index.ts / generals/ / skills/ / cards/ / modes/
  standard-data/         ← 数据扩展（协作者维护——文件传输）
    index.ts
    data/
      generals.ts        ← GeneralAssetsData（皮肤、称号等）
      translations.ts    ← 翻译表
    assets/
      generals/          ← 插画、配音文件
```

运行时两个扩展独立加载，通过武将名/技能名自动匹配资源和翻译。

## 资源路径约定

所有资源路径统一遵循：

```
{cdn}/generals/{baseUrl}/{filename}.{ext}
```

| 资源 | 路径模板 | 示例 |
|---|---|---|
| 插画 | `{cdn}/generals/{baseUrl}/{image}.png` | `general/caocao/image.png` |
| 技能配音 | `{cdn}/{url}.mp3` | `general/caocao/jianxiong1.mp3` |

特殊规则：路径含 `/` 时忽略 baseUrl，直接拼接 `{cdn}/generals/{xxx}.{ext}`。

## 构建与发布

```bash
# 生成类型声明供扩展开发者使用
npx tsx scripts/build-types.ts

# 扫描扩展目录，生成 extension/registry.ts
npx tsx scripts/build-registry.ts

# 打包单个扩展为 IIFE（浏览器可加载）
npx tsx scripts/build-extension.ts <extension-name>

# 发布扩展——打包 + 上传 assets 到 CDN
npx tsx scripts/publish-extension.ts <extension-name>
```

发布流程：
1. `build-extension` → 产出 `extension/<name>/dist/<name>.js`
2. `publish-extension` → 打包 + 上传 `assets/` 到 CDN（阿里云 OSS）
3. 第三方开发者暂需通过服务器中转上传资源（STS 临时授权方案评估中）

---

## 常见陷阱

| 陷阱 | 说明 | 状态 |
|---|---|---|
| **无消耗技能不发动** | ~~B4~~ 已修复：`choose`/`cost` 回调未提供时默认 `true`，无消耗技能正常走完发动流程。 | ✅ 已修复 |
| **selectors 无消费方** | `EffectData.selectors` 字段定义了但没有任何代码使用它。 | ⚠️ B7，M1 修复 |
| **明置走直改** | `UseSkillEvent` 第 3 步直接 `turnTo(true)` 而非通过 `ChangeStateEvent`。 | ⚠️ A2，M1-M2 |
| **GameStartAfter 缺失** | 游戏开始后时机枚举不存在。 | ⚠️ A1 |
| **cost 返回真值才算发动** | 如果 `cost` 回调返回 `undefined`（忘记 `return true`），技能会被判定为"未发动"。 | 设计如此 |
| **触发主循环未闭环** | `EventManager.trigger()` 扫描到效果后停在 TODO 注释。 | 🔴 M1 核心任务 |

---

## 参考文件

需要查阅详细信息时，按需读取以下文件。

### 框架 API 参考

| 文件 | 何时读 |
|---|---|
| [references/state-callbacks.md](references/state-callbacks.md) | 编写状态类效果，需要查完整 StateEffectType 签名 |
| [references/effect-builder-api.md](references/effect-builder-api.md) | 需要查 EffectBuilder/SkillBuilder 完整方法列表 |
| [references/skill-tags.md](references/skill-tags.md) | 需要查 SkillTag 枚举含义和 EffectSettings 字段 |

### 游戏权威定义

> 以下文件从 `docs/definitions/`、`docs/events/` 和 `docs/terms/` 复制而来，**已剔除各时机下可发动的技能穷举**（该穷举将在技能实现后反向登记）。编写技能时以这些文件中的时机定义和规则约束为准。

| 文件 | 内容 | 何时读 |
|---|---|---|
| [references/authority-definitions.md](references/authority-definitions.md) | 技能六要素 + 发动流程 + 元规则（优先级/多角色结算/插入结算） | 不确定技能的发动判定点、消耗语义、或优先级规则时 |
| [references/authority-timing.md](references/authority-timing.md) | 回合/阶段/伤害事件的完整时机序列、各时机含义与规则约束 | 需要确定技能应该挂哪个时机，或理解某时机的语义时 |
| [references/authority-use-skill.md](references/authority-use-skill.md) | UseSkillEvent 的 exec() 流程、各步骤含义、与旧项目差异 | 需要理解技能发动内部的 choose→cost→effect 执行顺序时 |
| [references/authority-terms.md](references/authority-terms.md) | 卡牌操作/事件结算/游戏流程/武将牌操作/数值公式/区域 的**规则定义 + API 映射** | 需要从游戏用语快速查找对应 API（如"交给"→`MoveCardEvent` reason='give'）时 |

### 语义对照表

| 文件 | 内容 | 何时读 |
|---|---|---|
| [references/glossary-semantic-mapping.md](references/glossary-semantic-mapping.md) | **标准描述 ↔ 详细描述（规则集描述）** 的转换规则与实例对照 | 用户提供标准描述（通俗描述）时，参照此表转化为精确的规则集描述，再映射到代码实现 |

### 移植参考

| 文件 | 何时读 |
|---|---|
| [references/old-project-reference.md](references/old-project-reference.md) | 查看旧项目技能实现作为移植参考（后续将替换为新项目实现） |
