---
name: adr-0001-client-layaair
description: 客户端选型 LayaAir 3.4（替代 PixiJS + Vite）
metadata:
  type: adr
---

# ADR-0001：客户端采用 LayaAir 3.4

> 决策历程：PixiJS + Vite（2026-07-18，已弃）→ LayaAir 3.4（2026-07-19，首次）→ Web 前端渲染（2026-07-20，尝试一天后放弃）→ **LayaAir 3.4（2026-07-21，最终）**。Web 前端方案见 `design-dom.md`（历史记录）。

**日期**：2026-07-21（最终修订）
**状态**：已决定 — LayaAir 3.4

## 决策历程

| 日期 | 方案 | 结果 |
|---|---|---|
| 2026-07-18 | PixiJS + Vue 3 + Vite | 弃用：自建工作量大，渲染双栈复杂 |
| 2026-07-19 | LayaAir 3.4 | 首次选定 |
| 2026-07-20 | Web 前端渲染（Vite + CSS + spine-canvas） | 尝试一天后放弃：npm 权限问题 + 全部系统需自建 |
| **2026-07-21** | **LayaAir 3.4（最终）** | **当前方案** |

## 选定理由

1. **旧项目就是 LayaAir 客户端**：`old/resgsv1/clientv0/` 是一个完整的、经过验证的 LayaAir 三国杀客户端。其架构模式（场景管理、消息驱动渲染、Dirty Flag、对象池、录像回放）可直接继承，大幅降低设计风险。
2. **IDE MCP 消除 IDE 绑定问题**：LayaAir IDE MCP 服务器已配置，可通过 AI 工具操作场景/预制体的创建和编辑，不再需要手工在 IDE 中完成所有操作。
3. **内置系统减少自建工作量**：UI 系统（GBox/GButton/GLabel/GList/GPanel）、补间动画（Tween）、骨骼动画（Spine）、音效管理（SoundManager）、资源加载（Loader）均为引擎内置。Web 前端方案需要从零自建所有这些系统，工作量 3-5 倍。
4. **单一技术栈**：LayaAir UI2 系统同时承载游戏渲染和 UI 面板，无需双栈分离。

## 决策

**采用 LayaAir 3.4 + Colyseus SDK 作为客户端技术栈。**

- 渲染 + UI：LayaAir 3.4（新版 UI `ui2`：GBox/GButton/GLabel/GImage/GList/GPanel）
- 网络：Colyseus 客户端 SDK（`colyseus.js`）
- 动效：LayaAir 内置（Tween + FrameAnimation + Spine）
- 音效：LayaAir SoundManager
- 存储：LayaAir LocalStorage + IndexedDB（录像）
- 设计分辨率：1920×1080，`showall`，横屏

## 核心架构决策

1. **Prefab 优先**：UI 通过 LayaAir IDE 搭建 .ls/.lh 资源文件，代码只负责逻辑
2. **Schema 驱动渲染**：Colyseus Schema onChange → Dirty Flag → UI 更新
3. **消息驱动回放**：录像 = 游戏消息日志 + 定期快照（完全继承旧项目模式）
4. **对象池**：CardItem、Toast 等频繁对象使用 Laya.Pool 管理
5. **场景层级**：场景内容 → 弹窗栈 → 提示层 → 确认层 → 加载层

## 与旧决定的差异

| 维度 | PixiJS 方案（弃） | LayaAir 方案（当前） |
|---|---|---|
| 渲染引擎 | PixiJS 8.x | LayaAir 内置 Sprite/Scene |
| UI 系统 | Vue 3 DOM overlay | LayaAir UI2（GBox/GButton/...） |
| 场景管理 | 单 Canvas + Container 树 | LayaAir Scene.open/close |
| 动画 | 自建补间系统 | LayaAir Tween + FrameAnimation + Spine |
| 资源加载 | 自建加载器 | LayaAir Loader |
| 音效 | 自建 AudioContext | LayaAir SoundManager |
| 构建 | Vite | LayaAir IDE 编译 |
| UI 编辑 | 手写 Vue 模板 | IDE 可视化 + .ls/.lh 资源文件 |

## 影响

- `client/` 从 LayaAir IDE 项目开始搭建（非 Vite 项目）
- 旧项目 `old/resgsv1/clientv0/` 中 ~70% 的架构模式和组件设计可直接迁移
- 卡牌渲染、动画、UI 使用引擎内置系统，开发效率更高
- 需要 LayaAir IDE 进行场景/预制体编辑（通过 MCP 自动化）
- shared/ 作为纯 TypeScript 引入，`@shared/*` 别名，不影响构建
- 新版 UI（`ui2`）组件名前缀为 `G`，旧项目代码中使用经典 UI 的部分需要适配

## 旧项目可迁移清单

| 旧项目模块 | 迁移程度 | 说明 |
|---|---|---|
| 场景管理（Main.ts） | 重构后复用 | API 对齐新版 |
| Dirty Flag 渲染（PlayerComp.ts） | 基本复用 | 核心模式不变 |
| 录像回放（Replay.ts） | 基本复用 | IndexedDB + Pako |
| 对象池（EntityTypeEnum） | 直接迁移 | Laya.Pool API |
| 选择 UI（ChooseCards 等） | 重构后复用 | 适配新 SelectorConfig |
| 游戏桌面（RoomGameComp.ts） | 重构后复用 | 适配 Schema onChange |
| 全局动效（GameAniComp.ts） | 基本复用 | Spine/Tween 调用 |
| 场景布局（config.ts） | 直接迁移 | 座位坐标等 |
| 资源映射（urlmap.ts） | 直接迁移 | 卡牌素材路由 |
| 武将动效（effects/*） | 基本复用 | 动画脚本 |

## 风险

1. IDE 构建流程与 CI/CD 的集成需要确认
2. 旧项目 LayaAir 版本（约 3.3）与新版本（3.4）有 API 差异，迁移时需逐项检查
3. 需确认新版 UI（`ui2`）与旧项目使用的经典 UI 组件的兼容性

## 关联

- [[adr-0002-ai-utility-rules]] — AI 方案 ADR
