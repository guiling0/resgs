# CLAUDE.md

## 务必遵守的规则

### Communication

- 永远使用简体中文进行思考和对话
- 编写 .md 文档时也要用中文

### Documentation

**文档体系（三件套）**：

| 文件 | 内容 | 何时写 |
|---|---|---|
| `CONTEXT.md` | 领域词汇表 | 新术语/新概念确定时惰性创建/更新 |
| `docs/adr/` | 架构决策记录（ADR） | 不可逆、反直觉、有真实权衡的决策 |
| `.scratch/<feature>/` | 进行中工作的 spec + issue | 新功能/重构启动时创建 |

**约定**：
- 正式文档写到 `docs/` 下
- 领域权威定义三类：`docs/definitions/`（游戏基础定义）、`docs/events/`（每事件一档：事件→时机定义）、`docs/terms/`（每用语类型一档），索引入口在 `CONTEXT.md`
- 术语归属：游戏规则术语的权威定义在上述文档中，`CONTEXT.md` 只保留开发概念与索引；同名不同义时 CONTEXT 保留开发概念并标注消歧
- 进行中的设计文档（spec、issue 工单）写到 `.scratch/` 下，格式遵循 `docs/agents/issue-tracker.md`
- **不存在 `discuss/` 目录**——不保留讨论类文档，不记录会话日志
- 新会话开始时，先读取 `CONTEXT.md` 了解领域术语，按需读取 `docs/adr/` 中的相关决策，通过 `git log` 了解最新进展
- **不要**在新会话中加载全部文档，根据当前需求按需读取

### Development Workflow

- **写码前**：`git add` 将已有变更加入暂存区，通过 `git diff --cached` 了解当前状态
- **写码后**：静默执行 `/simplify` 优化 + `/code-review` 审查。自行发起的优化和审查**无需告知**内容与前后对比，静默执行
- **测试**：每次写码后在 `shared/test/` 下编写对应的测试用例。测试只运行相关套件（如 `npx tsx shared/test/damage.test.ts`），**不要**每次跑全量测试（`test-all.sh`）
- **提交**：使用 `/conventional-commits` 生成符合规范的提交信息

### Code Comments

- **只写两类注释**：
  - **JSDoc**（`/** ... */`）：类、方法、属性的公开 API 说明
  - **流程说明**（`// ===== 1. xxx =====`）：函数内关键步骤的行内注释，描述"这一段做了什么"
- **禁止**写：
  - 与旧项目的对比
  - 实现方案的讨论和想法
  - 设计决策的辩护
- 上述禁止内容应写到 `shared/test/` 的测试注释或 `.scratch/` 的设计文档中

### Code Architecture

- 编写和审查代码时，关注以下可能侵蚀代码质量的「坏味道」：
  1. **僵化 (Rigidity)**：微小改动引发连锁修改
  2. **冗余 (Redundancy)**：同样逻辑在多处重复
  3. **循环依赖 (Circular Dependency)**：模块互相纠缠无法解耦
  4. **脆弱性 (Fragility)**：修改一处导致看似无关部分损坏
  5. **晦涩性 (Obscurity)**：代码意图不明，结构混乱
  6. **数据泥团 (Data Clump)**：多个数据项总是一起出现，应组合成对象
  7. **不必要的复杂性 (Needless Complexity)**：过度设计
- 识别出坏味道时，提出优化建议并询问用户是否处理

### Run & Debug

- 在 `scripts/` 目录下维护 Run & Debug 所需的 `.sh` 脚本
- 所有启停操作使用 `scripts/` 下的脚本，**不要**直接使用 npm/pnpm 命令
- **编译检查**（`tsc --noEmit`）和**运行测试**（`tsx shared/test/*.test.ts`）属于开发流程，可直接在 Bash 执行
- 脚本失败时先紧急修复，然后仍坚持用脚本

### TypeScript

- 尽可能使用 TypeScript
- 数据结构尽可能定义为强类型
- 个别场景必须使用 `any` 或非结构化 JSON 时，先征求用户同意

## 技术栈

| 层 | 技术 |
|---|---|
| 共享逻辑 | TypeScript（`shared/`，服务端/客户端共用，纯 TypeScript 无网络依赖） |
| 服务端 | Node.js + Colyseus 0.17 |
| 客户端 | LayaAir 3.4.0 + TypeScript |
| 数据库 | MongoDB |
| 资料站 | 纯 HTML/CSS/JS（`wiki/`） |

## 目录结构

```
shared/      共享代码（纯 TypeScript，核心引擎/事件/技能/实体/区域）
  core/        游戏引擎（事件、技能、实体、区域、选择系统）
  datas/       JSON 数据（卡牌、武将、技能、翻译）
  test/        测试用例
server/      服务端（Colyseus 房间、数据库、API、日志）
scripts/     Run & Debug 脚本（.sh）
wiki/        资料站（纯前端卡牌/武将资料库，CDN 资源）
docs/        正式文档 + 架构决策记录
  agents/      Agent 指引
  adr/         架构决策记录
.scratch/    进行中工作的 spec 与 issue
old/         旧项目（Phase 8-9 移植完成后删除）
```

## 共享代码

- 所有对 `shared/` 内模块的引用使用别名 `@shared/*`：
  ```ts
  import { GameCard } from '@shared/core/card/GameCard';
  import { SkillData } from '@shared/core/skill/SkillTypes';
  ```
- `shared/` 下代码不依赖网络模块或 Colyseus 运行时（除 `@colyseus/schema`），仅使用纯 TypeScript
- 根目录 `tsconfig.json` 仅用于 IDE 类型检查，不参与实际构建

## 设计约定

- `sgs` 全局：`globalThis.sgs` 持有全部静态数据，任何位置可直接 `sgs.xxx` 访问，无需 import
- `sync` 参数：控制客户端通知，不影响 Schema 自动同步
- `create` vs `build`：create = 创建实例并放入区域；build = 仅注册索引
- 委托优先：Player 方法统一委托到 Room 对应方法，保持单一入口

## Agent skills

参见 `docs/agents/`：
- [issue-tracker.md](docs/agents/issue-tracker.md) — Issue 追踪（.scratch 本地 Markdown）
- [domain.md](docs/agents/domain.md) — 领域文档（单上下文：CONTEXT.md + docs/adr/）
