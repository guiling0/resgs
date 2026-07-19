---
name: adr-0001-client-pixi-vite
description: 客户端选型 PixiJS + Vite（弃 LayaAir）
metadata:
  type: adr
---

# ADR-0001：客户端采用 PixiJS + Vite

**日期**：2026-07-18
**状态**：已决定

## 上下文

项目需要选择客户端渲染技术。旧项目使用 LayaAir 3.3.0，存在以下问题：

1. **与 shared/ 的集成成本高**：旧项目通过 Windows 绝对路径 symlink 共享 `server/src/core/` ，项目移入 `old/` 后已断链。LayaAir IDE 的编译流程与标准 TypeScript 工具链割裂。
2. **对卡牌游戏过度**：80% 引擎功能（物理、3D、粒子）用不到，引擎包体积 ~5MB。
3. **IDE 绑定**：LayaAir IDE 与 VSCode 工作流割裂，热更新体验差，调试困难。
4. **个人项目规模不匹配**：学习曲线陡峭，社区小，人才难招。

三国杀是卡牌 + UI 密集型游戏，核心需求：卡牌渲染、动画、UI 面板交互。不需要物理引擎、碰撞检测、3D 场景。

## 决策

**采用 PixiJS + Vite 作为客户端技术栈。**

- 渲染：PixiJS 8.x（WebGL/WebGPU 2D 渲染，轻量 ~500KB）
- UI 层：DOM + CSS（设置面板、对话框等重排版 UI）
- 构建：Vite（快速 HMR，原生 TS 支持）
- 网络：Colyseus 客户端 SDK
- 动画：GSAP 或自建补间系统

## 替代方案

### LayaAir 3.4.0（已弃）

- 优点：内置时间轴编辑器、UI 编辑器、微信小游戏官方支持
- 缺点：IDE 绑定、编译慢、引擎体量大、学习成本高、与 shared/ 集成的路径映射脆弱
- 何时重新考虑：若确定发布微信小游戏且现有方案不满足性能需求

### HTML Canvas + DOM（已弃）

- 优点：零依赖、首屏 <2MB、Chrome DevTools 一流
- 缺点：动画需手写（但卡牌游戏模式固定，可复用）；粒子/骨骼无内置支持
- 此方案亦可行，但 PixiJS 在 2D 渲染上提供更好的抽象

## 影响

- `client/` 目录需从零搭建（旧 LayaAir 客户端代码已全部删除）
- 卡牌渲染、动画、交互系统需自行实现
- 无需 LayaAir IDE 许可证，全部在 VSCode 中开发
- shared/ 可直接 import，实现全栈类型安全
- 后续如需移植微信小游戏，渲染层可独立替换

## 关联

- [[adr-0002-ai-utility-rules]] — AI 方案 ADR
- 客户端具体实现方案将在 `.scratch/client/` 中单独设计
