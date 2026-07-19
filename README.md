# 新神杀RE (RESGS)

三国杀卡牌游戏，基于 TypeScript 全栈重构。

## 技术栈

| 层 | 技术 |
|---|---|
| 共享逻辑 | TypeScript（`shared/`，服务端/客户端共用） |
| 服务端 | Node.js + Colyseus 0.17 |
| 客户端 | LayaAir 3.4.0 |
| 数据库 | MongoDB |

## 目录结构

```
shared/   共享代码（核心引擎、事件系统、技能/效果运行时、测试）
server/   服务端（Colyseus 房间、数据库、API、日志）
scripts/  Run & Debug 脚本
wiki/     资料站（纯前端卡牌/武将资料库，CDN 资源）
docs/     正式文档（领域词汇表、ADR、Agent 指引）
.scratch/ 进行中工作的 spec 与 issue
old/      旧项目（移植参照，Phase 8-9 完成后删除）
```

## 快速开始

```bash
# 编译检查
bash scripts/check.sh

# 运行测试
npx tsx shared/test/<test-file>.test.ts

# 全量测试
bash scripts/test-all.sh

# 服务端
cd server && npm install && npm run dev
```

## 设计原则

- `shared/` 下代码不依赖网络模块或 Colyseus 运行时（除 `@colyseus/schema`），仅使用纯 TypeScript
- `@shared/*` 别名引用共享模块
- 事件驱动架构：EventProcess → Timing → EventManager.trigger + refreshs + 效果索引
- Manager 委托模式：Room 持有 9 个 Manager，各司其职
- `CONTEXT.md` 定义领域词汇表，`docs/adr/` 记录关键架构决策

## 开发流程

1. 新会话：读 `CONTEXT.md` → `git log` → 按需读 ADR
2. 写码：写码 → `/simplify` → `/code-review` → 测试
3. 提交：`/conventional-commits`
