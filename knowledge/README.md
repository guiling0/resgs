# 知识库（LLM-Wiki）

面向 LLM 的项目知识库，同时供开发者、扩展开发者阅读。是游戏规则、API、扩展文档的唯一知识权威源。

项目进度、裁定等内容**不写入知识库**，保持 `docs/` 现有规则。

## 读者入口

| 读者 | 从这里开始 |
|---|---|
| AI（LLM） | 写扩展 → [扩展文档规范](extensions/index.md)（含归档流程）→ [guide/](guide/) 约定；查规则 → [rules/](rules/)；查 API → [project-api/](project-api/) |
| 开发者 | [rules/](rules/) 规则 → [project-api/](project-api/) API；项目进度/裁定 → `docs/` |
| 扩展开发者 | [扩展文档规范](extensions/index.md) → [rules/](rules/) → [project-api/](project-api/) |

## 目录结构

| 目录 | 内容 | 维护 |
|---|---|---|
| `rules/` | 游戏规则词条化：`definitions/`、`topics/`、`events/`（每事件一档）、`terms/`（每词条一档，id 三级） | 人工/AI |
| `project-api/` | 项目 API 文档（源 `shared/core`，**每类一档**，`kb:api` 生成） | 自动生成 |
| `extensions/` | 扩展文档：`modes/`、`cards/`、`generals/`、`projects/` 每实体一档（全量记录） | 人工/AI |
| `guide/` | 编写指南 + 描述转换索引 | 人工/AI |
| `generated/` | 自动生成区：索引 / 锚点 / 引用聚合 / 映射（可整体重建，勿手改） | 脚本 |

## frontmatter 约定（机器可读基础）

每篇文档声明元数据，供穷举聚合与校验：

```yaml
---
title: 拼点事件
type: term            # term | event | definition | card | general | mode | project | api | guide
id: terms/<分类>/<词条>  # 稳定 ID（词条三级；事件 events/<事件>；API api/<模块>/<类名>）
rules:                # 依赖的规则词条/事件时机 ID
  - events/pindian
tags: [拼点, 事件]
---
```

- 规则词条/事件必须有 `id`（链接锚点，不随标题变化）
- API 档的 `rules:` 由源码 JSDoc `@rules` 自动提取（见下），扩展/指南手动声明
- 词条 id 当前为拼音占位（`terms/<分类>/<拼音>`），逐步改为英文与代码属性/方法名对应

## 语义链接（@rules → 引用区）

代码 JSDoc 标注规则对应关系（格式见 AGENTS.md「注释原则」），自动打通三层：

```
源码 JSDoc @rules events/pindian
  → kb:api 提取 → API 档 frontmatter rules
  → kb:refs 聚合 → 规则文档「引用区」：
      ① API 实现    ② 扩展信息    ③ 编写指南
```

- 事件类 JSDoc：`@rules events/<事件>`
- 方法/属性 JSDoc：`@rules terms/<分类>/<词条>`
- 时机级不用 `@rules`：规则文档时机行标注 `TimingName` 枚举名，与代码枚举同名对接

## 自动化

```bash
npm run kb:init     # 配置 git hooksPath（一次）
npm run kb:build    # 一键全量重建：api → links → refs → mapping → index → check
```

每次 git 提交后经 post-commit hook 自动重建。

## 文档规范

遵循 AGENTS.md：单一权威、按需阅读、索引防膨胀。
