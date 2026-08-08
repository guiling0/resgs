# 新神杀 RE (RESGS)

三国杀卡牌游戏，基于 TypeScript 全栈重构，事件驱动引擎 + 知识库驱动的扩展开发体系。

## 技术栈

| 层 | 技术 |
|---|---|
| 共享逻辑 | TypeScript（`shared/`，服务端/客户端共用，纯 TypeScript 无网络依赖） |
| 服务端 | Node.js + Colyseus 0.17 + MongoDB |
| 客户端 | LayaAir 3.4（`client/`，UI2 系统 + 引擎内置渲染/动效/音效）+ Colyseus SDK |
| 资料站 | 纯 HTML/CSS/JS（`wiki/`，CDN 素材资料库） |
| 扩展体系 | `extension/`（独立扩展包：`resgs-ext-temp` / `resgs-ext-test`）+ create-ext 脚手架 |

## 目录结构

```
shared/     共享核心（实体/事件/状态同步/技能效果运行时，纯 TypeScript）
server/     服务端（Colyseus 房间、数据库、日志）
client/     客户端（LayaAir 3.4 工程：场景/预制体/UI/资源）
wiki/       资料站（纯前端卡牌/武将资料库）
knowledge/  知识库（唯一知识权威源，见下「文档体系」）
docs/       项目管理（决策/计划/会话交接）
extension/  扩展开发（扩展包 + 注册表 + 脚手架脚本）
scripts/    工具脚本（kb:* 知识库构建、build:* 扩展构建、create-ext 等）
old/        旧项目（移植参照，Phase 8-9 完成后删除）
.tmp/       临时素材源（当前 CDN 素材，仅供参考/迁移，不参与构建）
```

## 文档体系

项目文档分两部分，遵循「按需写作、索引防膨胀、单一权威」：

| 体系 | 位置 | 说明 |
|---|---|---|
| 知识库 | `knowledge/` | **唯一知识权威源**：游戏规则（`rules/` 词条带 id）、项目 API（`project-api/`，`kb:api` 生成）、扩展文档（`extensions/`）、编写指南（`guide/`）；`generated/` 为自动生成区 |
| 项目管理 | `docs/` | 决策记录（`decisions/adr/`）、计划执行（`planning/`）、会话交接（`sessions.md`） |

- **语义链接（@rules）**：代码 JSDoc 标注 `@rules <词条/事件 id>`，经 `kb:build` 自动打通三层——API 档内类/方法/属性/枚举值可点击直达词条，规则词条文档末尾「引用区」聚合对应 API 实现
- 规则词条/事件时机是唯一权威：技能归档、时机穷举均写入 `knowledge/rules/`
- 项目进度、裁定等内容不写入知识库，保持 `docs/` 规则
- 入口：`knowledge/README.md`、`docs/sessions.md`

## 快速开始

```bash
# 类型检查
npm run typecheck

# 运行单个测试
npm run test:file shared/test/<test-file>.test.ts

# 全量测试
npm test

# 知识库构建（api → links → refs → index → check）
npm run kb:build

# 服务端
cd server && npm install && npm run dev
```

## 工具脚本（`package.json`）

| 命令 | 用途 |
|---|---|
| `kb:init` / `kb:build` | 知识库构建链：配置 git hooks（post-commit 自动重建）→ api/links/refs/mapping/index/check |
| `kb:api` / `kb:links` / `kb:refs` / `kb:index` / `kb:check` | 知识库构建分步执行 |
| `create:ext` | 扩展脚手架：生成独立扩展包（含测试框架与类型生成） |
| `build:types` | 生成 shared 类型声明（供扩展包使用） |
| `build:registry` / `build:extension` | 扩展注册表构建 / 单扩展构建 |
| `publish:extension` | 发布扩展 |

## 关键架构决策（ADR）

| ADR | 决策 |
|---|---|
| 0001 | 客户端采用 **LayaAir 3.4**（PixiJS+Vite / Web 前端方案已弃） |
| 0004 | 实体分层：Room/Player 继承 Mark，纯类型入 `types/` |
| 0005 | 对局可复现与时光回溯（`randomSeed` + 命令日志回放） |
| 0006 | 状态效果求值框架：`getStates` + 同类型求值栈防环（叶子只读事实、组合器单向依赖） |
| 0007 | 卡牌可见性：`put` + 记录层（`visibleCardIds` 同步字段）+ `FieldCardEyes` 状态效果 |
| 0008 | 技能「修改描述」：状态效果 + `SkillModify` 查询点（大旗模式），增强分支保持每技能独立 |

完整决策见 `docs/decisions/adr/`。

## 设计原则

- `shared/` 为纯 TypeScript：核心文件不依赖网络模块/Colyseus 运行时，仅依赖 `@shared/*` 别名（对外经 index 导出，内部文件级直连）
- `sgs` 全局静态数据：`globalThis.sgs` 持有全部注册数据，除初始化 import 外直接访问
- 事件驱动：EventProcess → Timing → EventManager 触发调度；`sync` 同步参数暂未实现
- 状态同步：`@sync()` / `@syncArray()` 装饰器 + StateStore 补丁（markDirty → patches），服务器改数据即同步，客户端只读
- 动态资源按名称注册（牌名/武将真名/技能真名），未配置走默认路径模板（见 `shared/core/utils/AssetsUtils.ts`）
- 房间级 logger 统一调试输出（`room.logger`），格式 `[Room:r1][Player:p2][event] 消息 {"json"}`

## 扩展开发

1. `npm run create:ext` 生成扩展包脚手架
2. 在 `pkg/` 下编写卡牌/武将/技能，按默认路径模板配置资源（CardAssets / GeneralAssets）
3. `npm run build:extension` 构建，`npm run build:registry` 更新注册表
4. 归档：遵循 `knowledge/extensions/index.md` 的「扩展完成后归档流程」，规则词条/时机写入 `knowledge/rules/`

## 开发流程

1. 新会话：读 `knowledge/README.md` + `docs/sessions.md` + `git log` → 按需读 ADR
2. 写码：遵循 AGENTS.md（注释原则、日志规范、改动确认制）
3. 提交：Conventional Commits（`feat:` `fix:` `docs:` `refactor:` `chore:` `test:` + 中文描述），提交文案由 AI 生成并经确认
