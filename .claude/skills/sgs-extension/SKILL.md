---
name: sgs-extension
description: 编写三国杀游戏扩展的完整工作流——武将技能、装备技能、规则技能的定义与实现。涵盖 SkillBuilder/EffectBuilder 构建器、触发技（triggered effect）/状态技（state effect）的编写模式、技能消耗与效果函数、锁定技/限定技/觉醒技标签使用、延时类效果、以及测试与注册流程。当用户需要实现武将能力、定义技能效果、编写触发时机逻辑、注册技能到扩展包、或任何涉及 shared/core/skill/ 框架的代码时，都应使用此 skill。
---

# SGS 游戏扩展编写指南

## 核心心智模型

**Skill 是容器，Effect 才是逻辑主体。** 一个武将技能 = 1 个 `Skill` + N 个 `Effect`。

**触发类与状态类互斥。** 一个 Effect 只能是一种类型。

**所有 API 通过 `sgs.*` 全局访问，不 import 核心模块。**

**Builder `register()` 自动写入注册表，幂等。**

## 决策树：我要写什么？

```
需要"在某个时机自动触发"？
├── 是 → 触发类效果
│   ├── 需确认 → forced: 'cost' + choose/cost
│   ├── 自动 → forced: 'mute'（锁定技/规则技）
│   └── 延时 → addEffect + temp + autoRemove（⚠️ 待 M1-M2）
│
└── 否 → 需要"始终修改某个值"？
    └── 是 → 状态类效果（distanceCorrect/maxHandCorrect 等）
```

## 文件结构

```
extension/<name>/
  index.ts                     ← meta + setExtensionContext + import './pkg'
  pkg/
    cards/                     ← 卡牌扩展包（一个文件 = 一个包）
      standard.ts
    generals/                  ← 武将扩展包
      index.ts                 ← 组织所有大包/子包 → sgs.GeneralPackage()
      wei/                     ← 子包（文件夹，无 index.ts）
        caocao.ts              ← 一个武将 = 一个文件（技能 + 武将数据）
      shu/
      wu/
      qun/
  assets/                      ← 资源文件（图片、音频）
  .agent/                      ← AI 编码指引 + 游戏权威定义
```

## 入口文件

```typescript
/**
 * @name standard
 * @description 身份局标准版扩展包
 * @author ddgl
 * @version 1.0.0
 */
export const meta = { name, description, author, version };

// 扩展上下文——registerCards 自动使用此名作为 ID 前缀
sgs.setExtensionContext(meta.name);

// 导入即加载
import './pkg';
```

## 工作流

### 步骤 1：定义卡牌类型

在 `pkg/cards/{包名}.ts` 中：

```typescript
sgs.CardConfig({ name: 'sha', type: sgs.CardType.Basic, subtype: sgs.CardSubType.Basic, damage: true });
```

### 步骤 2：构建实体牌

```typescript
const cards = [
    sgs.GameCard({ suit: sgs.CardSuit.Spade, number: sgs.CardNumber.A }),
    sgs.GameCard({ suit: sgs.CardSuit.Spade, number: sgs.CardNumber.Number2 }),
];

sgs.CardPackage('standard', cards);  // 自动 registerCards + sgs.cardpacks.set
```

### 步骤 3：编写武将

在 `pkg/generals/{大包}/{子包}/{武将名}.ts` 中，一个文件 = 一个武将 + 技能：

```typescript
// 技能
sgs.SkillBuilder('jianxiong')
    .addEffect('trigger')
    .on(sgs.TimingName.DamageInflictAfter)
    .tag([sgs.SkillTag.Lock])
    .effect(async (room, player) => { await player.drawCards(1); })
    .register();

// 武将数据
export const caocao = sgs.General({
    name: 'caocao', kingdom: 'wei', hp: 4,
    gender: sgs.Gender.Male, skills: ['jianxiong'], lord: true,
});
```

### 步骤 4：组织武将包

在 `pkg/generals/index.ts` 中：

```typescript
import { caocao } from './standard/wei/caocao';

sgs.GeneralPackage('standard', [
    { name: 'standard.wei', generals: [caocao] },
    { name: 'standard.shu', generals: [] },
    { name: 'standard.wu',  generals: [] },
    { name: 'standard.qun', generals: [] },
]);
```

### 步骤 5：调整加载顺序

在 `pkg/index.ts` 中：

```typescript
import './cards/standard';   // 先卡牌
import './generals';         // 再武将
```

## API 速查

### 直接创建

| 方法 | 写入 |
|---|---|
| `sgs.CardConfig({ name, type, ... })` | `sgs.carddatas`（增量覆盖） |
| `sgs.GameCard({ suit, number, ... })` | 构建实体牌数据（不注册） |
| `sgs.General({ name, kingdom, hp, ... })` | `sgs.generals` |
| `sgs.GameMode({ name, maxPlayer, ... })` | `sgs.modes` |
| `sgs.Skill({ name, ... })` | `sgs.skills` |
| `sgs.Effect({ name, skillName, ... })` | `sgs.effects` |

### Builder API

| 方法 | 写入 |
|---|---|
| `sgs.SkillBuilder(name).addEffect(...).register()` | `sgs.skills` + `sgs.effects` |
| `sgs.CardBuilder(name).suit(...).number(...).build()` | 仅构建（由 registerCards 注册） |
| `sgs.GeneralBuilder(name).kingdom(...).hp(...).register()` | `sgs.generals` |
| `sgs.ModeBuilder(name).maxPlayer(...).register()` | `sgs.modes` |

### 扩展包

| 方法 | 作用 |
|---|---|
| `sgs.CardPackage(name, cards)` | registerCards + sgs.cardpacks.set |
| `sgs.GeneralPackage(name, subpacks)` | sgs.generalpacks.set |
| `sgs.registerCards(cards)` | 批量分配 ID + 注册（扩展名自动注入） |
| `sgs.setExtensionContext(name)` | 设置扩展上下文（入口文件调用） |

---

## 模式一：标准触发技（有消耗，需确认）

```typescript
const skill = sgs.SkillBuilder('xiahoudun.ganglie');

skill.addEffect('damage')
    .settings({ forced: 'cost' })
    .on(sgs.TimingName.DamageInflictAfter)
    .priority(sgs.PriorityType.General)
    .can_trigger(function (room, player, data) { return true; })
    .context(function (room, player, data) { return { from: player }; })
    .choose(async function (room, player, data, ctx) { return true; })
    .cost(async function (room, player, data, ctx) { return {}; })
    .effect(async function (room, player, data, ctx) { await player.drawCards(1); });

skill.register();
```

**`can_trigger` vs `condition`：** 前者检查时机相关条件，后者检查非时机条件（如手牌数 > 体力值）。

## 模式二：锁定技（自动发动）

```typescript
effect
    .tag([sgs.SkillTag.Lock])
    .settings({ forced: 'mute' })
    .on(sgs.TimingName.DamageInflictAfter)
    .effect(async function (room, player) { await player.drawCards(1); });
```

## 模式三：纯状态类效果

```typescript
skill.addEffect('mounted')
    .tag([sgs.SkillTag.Lock])
    .distanceCorrect((from, to) => -1);  // 计算距离时 -1

skill.addEffect('siege')
    .rangeWithin((from, to) => to.hp < from.hp);
```

常用状态回调：`distanceCorrect` / `distanceFixed` / `maxHandCorrect` / `maxHandExclude` / `prohibitUseCard` / `prohibitDropCard` / `rangeWithin` / `rangeWithout` / `skillInvalidity` / `likeHandToUse`。

> 全部 40+ 签名见 `references/state-callbacks.md`

## 模式四：延时类效果

> ⚠️ 待 M1-M2 实现

## 模式五：转化技

> ⚠️ 依赖 M2 NeedUseCard 链路

---

## 测试

扩展内 `test/` 目录存放单元测试。每个武将或技能一个 `.test.ts` 文件。

测试分为两种方案，编写时自行选择：

### 方案 A：隔离测试（test/setup）

不依赖主项目，纯 mock 环境。Proxy 兜底未实现的方法，调用不抛错。
适合验证技能代码结构正确、不会运行时崩溃。

```typescript
// test/jianxiong.test.ts
import { createRoom, createPlayer, assert, describe, summary } from './setup';

describe('奸雄');
const room = createRoom();
const p = createPlayer(room, 'caocao', { hp: 4, maxhp: 4 });
assert(p.hp === 4, '体力 = 4');
summary();
```

运行：
```bash
npx tsx test/jianxiong.test.ts
```

### 方案 B：集成测试（主项目 shared/test/setup）

将扩展放入主项目 `extension/` 目录，直接 import 主项目的完整 mock 基础设施（真实 Room/Player/事件系统）。
适合验证技能触发链、事件交互、状态修改。

```typescript
// test/jianxiong.test.ts
import { createRoom, createPlayer, assert, describe, summary } from '../../shared/test/setup';

describe('奸雄');
const room = createRoom({ logger: new ConsoleLogger(false) });
const pA = createPlayer(room, 'pA', { hp: 3, maxhp: 3, seat: 1 });
// ... 完整的事件触发 + 效果验证
summary();
```

运行：
```bash
npx tsx test/jianxiong.test.ts
```

### AI 生成测试

Agent 默认使用**方案 A**（隔离测试，零依赖、立即可跑）。如果用户在对话中明确要求事件验证或提到 `shared/test/setup`，则切换到**方案 B**。

---

## 常见陷阱

| 陷阱 | 状态 |
|---|---|
| 无消耗技能不发动 | ✅ 已修复 |
| selectors 无消费方 | ⚠️ B7 |
| 明置走直改 | ⚠️ A2 |
| cost 返回 undefined 判为未发动 | 设计如此 |
| 触发主循环未闭环 | 🔴 M1 |

---

## 参考文件

### 框架 API

| 文件 | 何时读 |
|---|---|
| [references/state-callbacks.md](references/state-callbacks.md) | 完整 StateEffectType 签名 |
| [references/effect-builder-api.md](references/effect-builder-api.md) | EffectBuilder/SkillBuilder 方法列表 |
| [references/skill-tags.md](references/skill-tags.md) | SkillTag 枚举和 EffectSettings |

### 游戏权威定义（知识库）

> 编写技能时以这些文件中的时机定义和规则约束为准。

| 文件 | 内容 |
|---|---|
| [references/authority-definitions.md](references/authority-definitions.md) | 技能六要素 + 发动流程 + 元规则 |
| [references/authority-timing.md](references/authority-timing.md) | 回合/阶段/伤害事件完整时机序列 |
| [references/authority-use-skill.md](references/authority-use-skill.md) | UseSkillEvent 流程 |
| [references/authority-terms.md](references/authority-terms.md) | 游戏用语 → API 映射 |
| [references/glossary-semantic-mapping.md](references/glossary-semantic-mapping.md) | 描述文本 → 规则集描述转换 |
| [references/old-project-reference.md](references/old-project-reference.md) | 旧项目技能参考 |
