# 扩展系统 Spec

> 状态: `ready-for-agent`
> 里程碑: 扩展系统基础设施
> 父文档: [map.md](map.md)

---

## Problem Statement

当前 `shared/datas/` 下的武将/卡牌/技能 JSON 文件是硬编码的静态数据，`sgs.*` 注册表只能在 `Room.initStart()` 中从硬编码路径加载。游戏内容无法增量扩展——开发者不能添加新武将、新卡牌、新模式而不修改核心代码。

---

## Solution

在 `shared/extension/` 下建立**可插拔扩展系统**。每个扩展是一个独立文件夹，通过 `import` 触发注册副作用——导入即注册。服务端通过构建时生成的注册表统一加载，客户端通过打包后的单文件 JS 加载。

```
shared/extension/
  standard/           ← 标准版扩展包
    index.ts           ← 入口（JSDoc 元数据 + re-export）
    cards.ts           ← 卡牌定义
    generals/
      caocao.ts        ← 曹操
      simayi.ts        ← 司马懿
      ...
    skills/
      jianxiong.ts     ← 奸雄
      fankui.ts        ← 反馈
      ...
    modes/
      standard.ts      ← 身份局模式
    assets/
      generals/        ← 武将皮肤/动画资源
      audio/           ← 非武将音频
      image/           ← 非武将图片
    .agent/
      CLAUDE.md        ← AI 编码指引
      skill.md         ← 扩展编写 skill
      issues/          ← AI 工单目录
```

---

## Implementation Decisions

### D1: 导入即注册

Builders 的 `.register()` 自动写入 `sgs.*` 全局注册表，无需手动 `install()`。

```ts
// extension/standard/generals/caocao.ts
export const caocao = new GeneralBuilder('caocao')
    .hp(4).skills(['jianxiong'])
    .register();
```

入口文件仅做 re-export，加载入口即完成全部注册：

```ts
// extension/standard/index.ts
export * from './cards';
export * from './generals';
export * from './skills';
export * from './modes';
```

约束：
- `.register()` 须幂等——重复加载同一扩展不重复注册
- 入口文件无副作用代码——副作用仅在具体文件中

### D2: 纯代码数据定义

卡牌、武将、技能均使用 TypeScript + Builder API，不使用 JSON。

理据：
- 技能已必须用 TypeScript（回调函数无法 JSON 化）
- 统一语言 = 统一工具链 = 统一类型安全
- 客户端通过编译输出 JS 文件完整运行

### D3: 入口元数据

每个扩展的 `index.ts` 顶部固定 JSDoc：

```ts
/**
 * @name standard
 * @description 身份局标准版扩展包
 * @author ddgl
 * @version 1.0.0
 */
```

导出基础信息对象供 UI 展示：

```ts
export const meta = { name, description, author, version };
```

### D4: 服务端加载——双模式

**开发模式**：运行时 `fs.readdirSync` + `import()` 动态扫描，支持热重载（修改扩展无需重启）。

**生产模式**：构建脚本 `scripts/build-registry.ts` 扫描 `shared/extension/*/index.ts`，生成 `shared/extension/registry.ts`：

```ts
// 自动生成——勿手动编辑
export { default as standard } from './standard';
export { default as promo } from './promo';
```

服务端 `import * as extensions from './extension/registry'` 加载全部扩展。`npm run build` 之前执行一次即可。

### D5: 客户端加载——打包为单文件 JS

每个扩展经 esbuild/rollup 打包为独立 IIFE 文件，浏览器通过 `<script>` 加载：

```html
<script src="extensions/standard.js"></script>
```

构建命令：`scripts/build-extension.ts <extension-name>` → 输出 `client/extensions/<name>.js`

### D6: 资源上传 CDN

扩展的 `assets/` 目录上传到 CDN（阿里云）。`GeneralData.skin` / `General.getAsset()` / `Skill.audio` 通过 CDN URL 引用资源。

- 自有开发：阿里云 CLI 工具（`aliyun oss cp`）
- 第三方开发者：暂定上传到服务器中转。后续评估阿里云 RAM 子账号或 STS 临时授权方案

### D7: 资源系统设计 ⚠️ 新增

#### 7.1 翻译文本集中化

当前每条配音后携带独立 `translation` 字段，分散在多处。改为按 URL 统一配置翻译表：

```ts
// extension/standard/data/translations.ts
export const translations = {
    // 非技能配音
    'generals/caocao/death.mp3': '吾好梦中杀人！',
    // 技能配音
    'generals/caocao/jianxiong1.mp3': '宁教我负天下人！',
    'generals/caocao/jianxiong2.mp3': '休教天下人负我！',
    // 皮肤语音（按相同规则查找）
};
```

翻译表在 `SkillAsset` 和 `GeneralAssetsData` 加载时自动查询——按 URL 匹配显示文本，消除分散的 `translation` 字段。

#### 7.2 资源路径约定

所有资源路径统一遵循：

```
{cdn}/generals/{baseUrl}/{filename}.{ext}
```

| 资源类型 | 路径模板 | 示例 |
|---|---|---|
| 插画 | `{cdn}/generals/{baseUrl}/{image}.png` | `general/caocao/image.png` |
| 双人插画 | `{cdn}/generals/{baseUrl}/{image_dual}.png` | |
| 头像 | `{cdn}/generals/{baseUrl}/{avatar}.png` | |
| 非技能配音 | `{cdn}/generals/{baseUrl}/{url}.mp3` | `general/caocao/death.mp3` |
| 技能配音 | `{cdn}/{url}.mp3` | `general/caocao/jianxiong1.mp3` |
| 皮肤技能配音 | `{cdn}/generals/{皮肤baseUrl}/{技能文件名}.mp3` | |

**特殊规则**：路径含 `/` 时忽略 baseUrl，直接拼接 `{cdn}/generals/{xxx}.{ext}`。

#### 7.3 代码与资源分离

延续旧项目 `extension/datas` 模式。一个扩展可拆分为两个独立扩展：

```
shared/extension/
  standard/              ← 代码扩展（开发者维护）
    index.ts
    cards.ts
    generals/             ← 技能逻辑 + GeneralBuilder
    skills/
    modes/
  standard-data/         ← 数据扩展（协作者维护——无需 git）
    index.ts
    data/
      generals.ts         ← GeneralAssetsData（皮肤、info）
      translations.ts     ← 翻译表
    assets/
      generals/           ← 插画、配音文件
      audio/
      image/
```

**职责分离**：
- **代码扩展**：你负责——技能逻辑、模式定义
- **数据扩展**：协作者负责——武将信息、皮肤、配音、翻译。通过文件传输协作，不需要 git

**运行时**：两个扩展独立加载，数据扩展提供的 `assets` 和 `translations` 在运行时与代码扩展的武将/技能通过名称匹配——技能配音按 `{武将名}/{技能语音文件名}` 匹配，非技能配音按 `{武将名}/{音频文件名}` 匹配。

### D8: GitHub vs CDN

| | GitHub raw | CDN |
|---|---|---|
| 开发/测试 | ✅ 免费、即时 | ❌ 需上传 |
| 生产环境 | ❌ 限速、不保证可用 | ✅ 稳定快速 |
| 第三方协作 | ✅ 推送即可见 | ❌ 需上传权限 |

**方案**：环境切换。

```ts
const CDN_BASE = process.env.NODE_ENV === 'production'
    ? 'https://res.resgs.com'
    : `https://raw.githubusercontent.com/${owner}/${repo}/main`;
```

扩展开发者推送后，运行 `scripts/publish-extension.ts` 上传 `assets/` 到 CDN 并更新线上环境。

### D9: 构建脚本

| 脚本 | 功能 |
|---|---|
| `scripts/build-registry.ts` | 扫描 `shared/extension/*/index.ts` → 生成 `registry.ts` |
| `scripts/build-extension.ts <name>` | 打包扩展为单文件 JS（rollup） |
| `scripts/publish-extension.ts <name>` | 上传 assets 到 CDN（阿里云 CLI） |
| `scripts/build-types.ts` | `tsc --declaration` 生成 `.d.ts` 到 `shared/extension/types/` |

### D10: .agent 文件夹

每个扩展下的 `.agent/` 目录包含：

```
.agent/
  CLAUDE.md          ← AI 编码指引（扩展编写规范、Builder API 参考）
  skill.md           ← 扩展编写 skill 定义
  knowledge/         ← 领域知识库（技能范例、模板）
  issues/            ← AI 工单存放目录（由 Agent 自动创建）
```

### D11: 扩展隔离——通过 sgs 全局访问核心

扩展独立编译，**不能** `import` 核心模块。所有类型和 API 通过 `sgs` 全局对象访问：

```ts
// 扩展代码——不 import 核心，只通过 sgs
const builder = new sgs.SkillBuilder('jianxiong');
builder.addEffect('trigger')
    .on(sgs.TimingName.DamageStart)
    .effect(async (room, player) => { ... });
```

核心一次性批注册，不逐一手动暴露：

```ts
// shared/core/register.ts
import { TimingName, EventType, ... } from './event/EventTypes';
import { SkillBuilder } from './skill/builder/SkillBuilder';
// ...
export function registerCore(sgs: RESGS) {
    Object.assign(sgs, { TimingName, EventType, SkillBuilder, ... });
}
```

`sgs.init()` 中调用 `registerCore(this)`，新增枚举/Builder 时加一行即可。`const enum` 保留——值已在 sgs 运行时可用。

### D12: Builder API 体系

本里程碑实现完整 Builder 体系：

| Builder | register() 目标 | 说明 |
|---|---|---|
| `SkillBuilder` | `sgs.skills` | 已实现（M1） |
| `EffectBuilder` | `sgs.effects` | 已实现（M1） |
| `GeneralBuilder` | `sgs.generals` | **新增** |
| `CardBuilder` | `sgs.cards` / `sgs.carddatas` | **新增** |
| `ModeBuilder` | `sgs.modes` | **新增** |

`.register()` 幂等——重复调用不重复注册。

### D13: 错误处理

- **生产环境**：扩展加载失败 → 阻止游戏启动
- **开发环境**：跳过该扩展 + 日志警告

### D14: 扩展模板仓库

已创建：`https://github.com/guiling0/resgs-ext-temp.git`

包含：
- `shared/core/*.d.ts` — 核心类型声明（`scripts/build-types.ts` 生成后放入）
- `.agent/` — AI 编码指引 + skill 定义
- 示例文件：武将/卡牌/技能/模式 Builder 用法
- `scripts/` — 构建/发布脚本

开发者克隆模板 → 编写扩展 → `npm run build` → 产出单 JS 文件。

### D15: 旧数据迁移

`shared/datas/` 下的 JSON 文件暂时保留，随各扩展包的 TypeScript 迁移逐步删除。迁移顺序：M4 标准包 → M6 全武将。

---

## Out of Scope

- 客户端 UI 增量扩展（Q6 提出的武将特效扩展）——后续 ADR
- 阿里云 STS 第三方授权方案
- 扩展依赖管理（暂时无依赖约束）
- 扩展热更新（客户端重新下载扩展 JS）

---

## Further Notes

- 扩展系统在 M2 和 M3 之间实现——为后续武将/卡牌/模式开发提供基础设施
- 扩展构建脚本在 `scripts/` 目录下维护
- `.d.ts` 产出路径：`shared/extension/types/`
