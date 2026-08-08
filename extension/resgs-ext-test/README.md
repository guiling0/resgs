# resgs-ext-temp

三国杀游戏扩展模板。克隆即开始，无需理解核心引擎代码。

## 快速开始

```bash
npx degit guiling0/resgs-ext-temp my-extension
cd my-extension
npm install
```

### 通过知识库协作

扩展编写依据项目知识库（`knowledge/`，位于主项目 resgs），AI 按需读取：

- 游戏规则与时机：`knowledge/rules/`（事件时机、词条，带 `id`）
- 项目 API：`knowledge/project-api/`（自动生成，含源码锚点）
- 扩展文档与归档流程：`knowledge/extensions/`（含「扩展完成后归档流程」）
- 编写指南：`knowledge/guide/`

**开始一段对话：**

> 依据知识库 `knowledge/rules/` 与 `knowledge/project-api/`。我要实现……

Agent 按需查阅知识库中的规则定义与 API 文档后进入扩展编写模式。

## 目录结构

```
my-extension/
  index.ts                     ← 扩展入口（JSDoc 元数据 + 加载顺序）
  pkg/
    cards/                     ← 卡牌扩展包
      standard.ts              ← 一个文件 = 一个卡牌包
    generals/                  ← 武将扩展包
      index.ts                 ← 组织所有武将大包/子包
      standard/                ← 大包名（如"标准包"）
        wei/                   ← 子包名（如"标准·魏"）
          caocao.ts            ← 一个武将 = 一个文件
  types/
    global.d.ts                ← sgs 全局类型声明
```

## 编写扩展

### 1. 修改元数据

打开 `index.ts`，修改 JSDoc 和 `meta` 对象：

```ts
/**
 * @name my-extension
 * @description 我的三国杀扩展
 * @author 你的名字
 * @version 1.0.0
 */
```

### 2. 定义卡牌

在 `pkg/cards/` 下创建 `.ts` 文件：

```ts
// pkg/cards/my-pack.ts

// 卡牌类型信息（注：sha、shan、tao 等基础牌已由标准包定义，扩展无需重复注册）
sgs.CardConfig({ name: 'my_card', type: sgs.CardType.Basic, damage: true });

// 实体牌
const cards = [
    sgs.GameCard({ name: 'my_card', suit: sgs.CardSuit.Spade, number: sgs.CardNumber.A }),
];

// 注册卡牌包
sgs.CardPackage('my_pack', cards);
```

### 3. 定义武将

在 `pkg/generals/{大包}/{子包}/` 下创建武将文件：

```ts
// pkg/generals/standard/wei/caocao.ts

// 技能定义
sgs.SkillBuilder('jianxiong')
    .addEffect('trigger')
    .on(sgs.TimingName.DamageInflictAfter)
    .tag([sgs.SkillTag.Lock])
    .effect(async (room, player, data, ctx) => {
        await player.drawCards(1);
    })
    .register();

// 武将注册
export const caocao = sgs.General({
    name: 'caocao',
    kingdom: 'wei',
    hp: 4,
    gender: sgs.Gender.Male,
    skills: ['jianxiong'],
    lord: true,
});
```

### 4. 组织武将包

在 `pkg/generals/index.ts` 中 import 武将并注册：

```ts
import { caocao } from './standard/wei/caocao';
import { liubei } from './standard/shu/liubei';

sgs.GeneralPackage('standard', [
    { name: 'standard.wei', generals: [caocao] },
    { name: 'standard.shu', generals: [liubei] },
]);
```

### 5. 调整加载顺序

在 `pkg/index.ts` 中按依赖顺序 import：

```ts
import './cards/standard';   // 先加载卡牌
import './cards/my-pack';
import './generals';         // 再加载武将
```

## sgs API 速查

### 直接创建

| 方法 | 作用 |
|---|---|
| `sgs.CardConfig({ name, type, ... })` | 注册卡牌类型信息 |
| `sgs.GameCard({ suit, number, ... })` | 构建单张实体牌 |
| `sgs.General({ name, kingdom, hp, ... })` | 注册武将 |
| `sgs.GameMode({ name, maxPlayer, ... })` | 注册游戏模式 |
| `sgs.Skill({ name, ... })` | 注册技能 |

### Builder API

| 方法 | 作用 |
|---|---|
| `sgs.SkillBuilder(name).addEffect(...).register()` | 构建技能 |
| `sgs.CardBuilder(name).suit(...).number(...).build()` | 构建实体牌数据 |
| `sgs.GeneralBuilder(name).kingdom(...).hp(...).register()` | 构建武将 |
| `sgs.ModeBuilder(name).maxPlayer(...).register()` | 构建游戏模式 |

### 扩展包

| 方法 | 作用 |
|---|---|
| `sgs.CardPackage(name, cards)` | 注册卡牌包（内部调 registerCards） |
| `sgs.GeneralPackage(name, subpacks)` | 注册武将包 |

### 枚举（通过 sgs 全局访问，无需 import）

`sgs.TimingName` / `sgs.CardType` / `sgs.CardSuit` / `sgs.CardNumber`
`sgs.CardSubType` / `sgs.SkillTag` / `sgs.PriorityType` / `sgs.Gender`
`sgs.DamageType` / `sgs.AreaType` / `sgs.Phase` / 等

## 测试

两种方案，按需选择：

### 方案 A：隔离测试（默认）

不依赖主项目，纯 mock。适合验证技能代码结构正确、不会运行时崩溃。clone 后直接跑：

```ts
// test/jianxiong.test.ts
import { createRoom, createPlayer, assert, describe, summary } from './setup';

describe('奸雄');
const room = createRoom();
const p = createPlayer(room, 'caocao', { hp: 4, maxhp: 4 });
assert(p.hp === 4, '体力 = 4');
summary();
```

```bash
npx tsx test/jianxiong.test.ts
```

### 方案 B：集成测试

用主项目 `shared/test/setup` 的完整 mock（真实 Room/Player/事件系统），验证触发链和事件交互：

```ts
import { createRoom, createPlayer, assert, describe, summary } from '../../shared/test/setup';
```

Agent 默认生成方案 A。需要事件级验证时切方案 B。

## 类型检查

```bash
npm run typecheck
```

## 构建

自身内置 rollup 配置，直接打包为浏览器可加载的 IIFE：

```bash
npm run build       # 产出 dist/extension.js
```

## 许可

MIT
