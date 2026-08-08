# LLM-Wiki 知识库建设方案

> 状态：待确认（改动确认制）
> 日期：2026-08-06
> 本方案为过渡建设文档，知识库建成后归档至 `knowledge/project/`。

## 1. 背景与目标

在项目 resgs 上搭建一套面向 LLM 的知识库（llm-wiki），替代现有 `docs/` 与 `.trae/skills/` 参考文档体系，成为**唯一知识权威源**。

读者与用途：

| 读者 | 用途 |
|---|---|
| AI（LLM） | 写扩展时查规则词条 → 查 API 文档 → 按约定格式写代码；新会话从知识库恢复上下文（自主学习） |
| 开发者 | 通过 Obsidian 浏览规则、API、决策、状态 |
| 扩展开发者 | 独立项目无全项目文件，知识库是唯一内容源 |

核心原则（沿用 AGENTS.md 既有约定）：单一权威、按需阅读、索引防膨胀；LLM 无记忆，一切跨会话依赖「写入-读取」闭环。

## 2. 总体结构

```
knowledge/                        # 知识库根（独立目录，docs/ 之后作废）
  ├── README.md                 # 入口导航：AI / 开发者 / 扩展开发者 三入口
  ├── rules/                    # 游戏规则（词条化，源：.tmp/rule 三国杀规则集）
  │     ├── index.md            # 规则词条索引（穷举清单）
  │     ├── definitions/        # 基础定义
  │     ├── events/             # 事件时机（每事件一档，时机穷举）
  │     └── terms/              # 用语词条（每词条一档）
  ├── project-api/              # 项目 API 文档（自动生成，源：shared/core）
  ├── extensions/               # 扩展文档（全量记录，逐实体建档）
  │     ├── index.md            # 扩展目录
  │     ├── modes/              # 每模式一档
  │     ├── cards/              # 每卡牌一档（含技能档案）
  │     └── generals/           # 每武将一档（含技能档案）
  ├── guide/                    # 扩展编写指南（skill 模式）
  │     ├── conventions.md      # 约定格式（扩展结构、命名、注册）
  │     ├── patterns.md         # 可复用编码模式（学习沉淀，按需增量）
  │     └── description-mapping.md  # 标注描述 ↔ 详细描述 转换索引
  ├── project/                  # 项目级内容（自主学习区，随 git 提交）
  │     ├── README.md           # 项目总览：是什么/里程碑/当前焦点
  │     ├── status.md           # 当前状态：进展/待办/进行中
  │     ├── decisions.md        # 决策记录：历次用户裁定
  │     ├── lessons.md          # 约定沉淀：代码约定/坑/模式
  │     └── sessions/           # 会话交接：每次会话一份
  └── generated/                # 自动生成区（可整体重建）
        ├── index.md            # 全库索引（frontmatter 聚合）
        ├── links/              # 交叉链接（规则↔API↔扩展↔指南）
        ├── anchors/            # 源码锚点（文件:行号）
        └── refs/               # 规则词条引用列表（穷举聚合产物）
```

## 3. 双链规范（三层链接）

```
规则词条（语义层）
  ↓ ① 语义链接（stable，人工/半自动建立一次）
项目 API 词条（枢纽层）
  ↓ ② 锚点链接（自动维护，文件:行号）
源码位置 shared/core/...ts#Lxxx
```

规则词条还挂两类引用：

```
规则词条 / 事件时机（穷举列表）
  ├── 引用①：API 实现 → project-api/
  ├── 引用②：信息文档 → extensions/（全部涉及该词条的牌/武将/模式）
  └── 引用③：编写指南 → guide/
```

### 链接载体

- 人类浏览：Obsidian 双链 `[[]]` 与常规链接
- 机器可读：每篇文档 frontmatter 声明依赖，供穷举聚合与校验

### frontmatter 约定（机器可读基础）

每篇文档（rules/extensions/project-api/guide）头部声明元数据：

```yaml
---
title: 回复<X>点体力
type: term            # term | event | definition | card | general | mode | api | guide
id: term/recover-hp   # 稳定 ID（链接锚点，不随标题变化）
rules:                # 依赖的规则词条/事件时机 ID（扩展/API/指南声明）
  - event/hp/recover
tags: [体力, 回复]
---
```

- 规则词条/时机必须有 `id`（穷举索引的锚点）
- 扩展/API/指南文档声明 `rules:`（依赖的规则 ID）→ 穷举聚合的依据

## 4. 游戏规则文档（rules/）

源：`.tmp/rule/`（三国杀规则集 + cards/ + generals/）。

- 超长单文件（sanguoshaguizeji.md）按 `#/##/###` 层级拆分为词条档：
  - `definitions/`：基础定义（结算原则、技能要素等）
  - `events/`：每事件一档，时机穷举（如伤害事件 9 时机）
  - `terms/`：每用语词条一档（如「回复<X>点体力」「距离」）
- 每词条/时机档包含：定义、语义、时机列表、**引用区**（①API ②扩展 ③指南，自动聚合）
- `index.md`：词条穷举总索引（id + 标题 + 链接）

## 5. 项目 API 文档（project-api/）

源：`shared/core/`（9 大模块：builder/entity/logic/state/transport/types/utils/sgs.ts）。

- 常规 API 文档形态：类、方法、参数、返回值、使用说明、示例
- 每个类/方法一档（或按模块聚合），frontmatter 声明 `id` 与相关规则 `rules:`
- 由生成脚本从源码 `.d.ts` 提取（TypeDoc 或自定义轻量提取），**随 git 提交重建**

## 6. 扩展文档（extensions/）

- **全量记录，逐实体建档**：每模式/卡牌/武将各一档，不论文档膨胀
- 每档内容：**普通描述（标注描述）+ 详细描述（给 AI 逻辑梳理）+ 基础信息**（体力/势力/性别/技能等）
- 技能档案：标注描述 + 详细描述，位于所属牌/武将档内
- frontmatter 声明 `rules:`（技能逻辑依据的规则词条/时机）
- 新扩展（模式/牌/武将）写入后，穷举聚合自动更新规则词条引用区②

### 描述转换（标注 ↔ 详细）

- 标注描述：人类自然语言、面向玩家（一般由用户提供）
- 详细描述：按规则词条拆解逻辑、面向 AI（需自行推断，从全量信息文档学习）
- 转换索引 `guide/description-mapping.md`：转换指引 + 全量扩展文档中的两描述对照示例聚合（AI 写新技能先查索引学转换模式）

## 7. 项目级自主学习区（project/）

会话总结存知识库内，**随 git 提交写入**（每次提交即开新会话的工作流）：

- 会话结束 → AI 写 `sessions/YYYY-MM-DD-xxx.md`（做了什么/学到什么/下一步）
- 新裁定/约定 → 同步 `decisions.md` / `lessons.md`
- 持续更新 `status.md`（进展/待办）
- 新会话 AI 恢复流程（写入 AGENTS.md）：读 project/README → status + 最新 session → decisions + lessons → 直接接续

## 8. 自动化（git 提交时重建）

### 触发

- `git config core.hooksPath .githooks`（hook 目录进版本库）
- `.githooks/post-commit` → 执行 `npm run kb:build`
- `kb:init`：一键配置 hooksPath

### 生成脚本

| 脚本 | 生成内容 | 输入 |
|---|---|---|
| `kb:index` | 全库索引、目录树、frontmatter 聚合 | knowledge/*.md frontmatter |
| `kb:api` | project-api/ 文档 | shared/core 源码 .d.ts |
| `kb:links` | 交叉链接（三层链接、源码锚点） | 全部 frontmatter + 源码 |
| `kb:refs` | 规则词条引用区（穷举聚合 ①②③） | 扩展/API/指南 的 rules 声明 |
| `kb:mapping` | 描述转换索引（示例聚合） | extensions/ 全量 |
| `kb:check` | 校验：悬空词条/链接、索引对齐 | 上述产物 |

`kb:build` = index + api + links + refs + mapping + check，一键全量。

### 穷举聚合流程

新增扩展文档（mode/card/general）→ frontmatter `rules:` 声明 → 重建扫描 → 规则词条引用区② 追加对应实体档（带链接）→ 校验声明指向的词条/时机必须存在。

### 提交衔接

- 手写区与生成区同批提交（`generated/` 变更由 AI 收尾时一并 add，hook 不自动改文件）

## 9. 迁移清单（范围待定）

> 用户裁定：是否迁移后续确定。以下为候选清单。

| 现有资产 | 去向 | 状态 |
|---|---|---|
| `.tmp/rule/`（三国杀规则集） | `knowledge/rules/` 词条化 | 待确认 |
| `shared/core/` | `knowledge/project-api/`（生成） | 自动 |
| `.trae/skills/sgs-extension/references/`（9 篇） | `knowledge/guide/` + 词条合并 | 待确认 |
| `.trae/skills/layaAir/references/` | `knowledge/guide/` | 待确认 |
| `docs/domain/` | `knowledge/rules/` | 待确认 |
| `docs/decisions/`（ADR） | `knowledge/project/decisions.md` | 待确认 |
| `docs/develop/` | `knowledge/guide/` 或 rules | 待确认 |
| `docs/sessions.md` | `knowledge/project/sessions/` | 待确认 |
| `docs/planning/` | 作废（本方案为过渡文档，建成后归档） | 已确认废除 |
| `AGENTS.md` | 更新：入口导航、会话恢复流程、技能学习义务指向 | 修改 |
| `wiki/`、`shared/datas/` | 不动（玩家资料站，与知识库无关） | 已确认 |
| TRAE memory（~/.trae-cn/memory/） | 不动，与知识库分工（memory 自动注入指针，知识库存全量） | 已确认 |

## 10. 实施步骤

| 阶段 | 内容 | 产出 |
|---|---|---|
| 0 | Obsidian 桌面版 + CLI 就绪，`knowledge/` 作为 vault 打开 | 环境可用 |
| 1 | 知识库骨架 + 自动化脚本（hooks、生成、校验） | 空库可重建 |
| 2 | 规则词条化迁移（.tmp/rule → rules/，建 id 体系） | 规则域 |
| 3 | API 文档生成（shared/core → project-api/） | API 域 |
| 4 | 扩展文档规范 + 描述转换索引 + 穷举聚合跑通 | 扩展域 |
| 5 | 项目级会话沉淀 + AGENTS.md 更新 + 旧资产清理（确认后） | 全库闭环 |

## 11. 待确认项

1. 知识库目录名：暂定 `knowledge/`，是否可用
2. 迁移范围（第 9 节清单逐项）
3. API 文档生成方式：TypeDoc vs 自定义轻量提取
4. 会话交接模板细节
