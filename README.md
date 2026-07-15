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
shared/   — 共享代码（核心逻辑、事件系统、技能/效果运行时）
server/   — 服务端（Colyseus 房间、数据库、API）
client/   — 客户端（LayaAir UI、场景、资源管理）
wiki/     — Wiki 资料站（卡牌、武将资料库）
```

## 快速开始

```bash
# 服务端
cd server && npm install && npm run dev

# 客户端
# 使用 LayaAir IDE 打开 client/ 目录
```

## 设计原则

- `shared/` 下代码不依赖网络模块或 Colyseus 运行时（除 `@colyseus/schema`），仅使用纯 TypeScript
- `@shared/*` 别名引用共享模块
- 事件驱动架构：EventProcess → Timing → Manager 分层
