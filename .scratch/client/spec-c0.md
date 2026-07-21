# C0 — 客户端项目骨架

> 状态: `ready-for-agent`
> 里程碑: C0 客户端项目骨架
> 父文档: [map.md](../map.md)

---

## Problem Statement

当前 `client/` 目录为空。需要一个最小可运行的 Web 前端项目骨架，包含构建工具链、自适应容器、首屏加载器——作为后续 C1-C3 所有客户端功能的入口和基础设施。

---

## Solution

Vite + TypeScript 项目，`index.html` 作为自适应容器（设计分辨率 1920×1080，`transform: scale()` 等比缩放，强制横屏），`loader.ts` 线性推进加载资源并显示进度条，`main.ts` 作为应用入口。

```
加载流程：
  浏览器打开 → index.html（竖屏提示/横屏自适应）
  → loader.ts（字体→图集→Spine→扩展→初始化，进度条更新）
  → main.ts（App 单例挂载，场景路由就绪）
```

首屏仅 2KB HTML + 内联 CSS，JS 模块异步加载。

---

## User Stories

1. As a 玩家, I want 打开页面后看到加载进度条, so that 我知道资源正在加载而非白屏
2. As a 玩家, I want 加载完成后进入游戏主界面, so that 我可以开始操作
3. As a 玩家, I want 在竖屏设备上看到旋转提示, so that 我知道需要横屏使用
4. As a 玩家, I want 窗口缩放时游戏画面等比缩放不变形, so that 不同屏幕下体验一致
5. As a 开发者, I want `@shared/*` 路径别名在客户端可用, so that 我可以直接引用共享代码
6. As a 开发者, I want `npx vite` 启动开发服务器支持 HMR, so that 修改代码即时生效
7. As a 开发者, I want `npx vite build` 产出生产构建, so that 可以部署到静态服务
8. As a 协作者, I want `npm install && npm run dev` 即可启动开发, so that 新人无需额外配置即可上手

---

## Implementation Decisions

### D1: 技术选型

- Vite 作为构建工具（HMR 开发 + 生产构建）
- TypeScript 作为开发语言
- CSS 作为样式方案（不引入 CSS-in-JS 或预处理器框架）
- 设计分辨率 1920×1080，等比缩放适配

### D2: 项目结构

```
client/
├── index.html              ← 自适应容器 + 竖屏提示 + 加载器 DOM
├── package.json            ← vite, typescript, colyseus.js, spine-canvas
├── vite.config.ts          ← @shared/* 别名 + base 配置
├── tsconfig.json
└── src/
    ├── loader.ts           ← 线性进度条加载
    └── main.ts             ← App 单例入口
```

### D3: 自适应缩放的 CSS 策略

- `#game` 容器固定 1920×1080，`position: absolute; top: 50%; left: 50%`
- `transform: translate(-50%, -50%) scale(min(100vw / 1920, 100vh / 1080))`
- 竖屏时 `#rotate-hint` 全屏覆盖提示，`#game` 隐藏
- 所有子元素使用像素绝对定位，不引入 rem/vw/媒体查询

### D4: 加载器设计

- `index.html` 内联加载器 DOM（`#loader` → `#loader-bar` + `#loader-text`），首屏即渲染
- `loader.ts` 定义加载步骤数组，每步有权重百分比
- C0 阶段所有加载步骤均为空函数（stub），后续里程碑渐进填充
- 加载完成后 `#loader` 隐藏，触发 `main.ts` 初始化

### D5: Vite 配置

- `@shared/*` 别名指向 `../shared/*`（与根 tsconfig paths 对齐）
- `base: './'` 确保相对路径资源可访问
- C0 不做任何 Colyseus 或网络相关配置

### D6: App 单例

- `main.ts` 导出 `App` 单例，持有 `sgs` 全局引用
- 提供 `App.start()` 入口方法，C0 阶段仅打印就绪日志
- 后续场景（加载→登录→大厅→房间→游戏）通过 `App` 单例路由

### D7: 不做 `@shared/*` 运行时引用

- C0 阶段不引入任何 `shared/` 模块的实际引用
- `vite.config.ts` 中仅配置别名路径，后续里程碑中逐步引入
- 避免 C0 阶段因服务端依赖（`@colyseus/schema` 等）导致客户端构建失败

---

## Testing Decisions

- **验收方式**：手动验证——`npm run dev` 启动后在浏览器中看到自适应画面 + 加载进度条走完 + 控制台输出就绪日志
- **不做单元测试**：C0 是纯基础设施搭建，无业务逻辑可测
- 后续里程碑中 UI 组件的测试以 C0 的项目结构为基础

---

## Out of Scope

- Colyseus 连接（C2）
- 登录/注册 UI（C1）
- 大厅/房间 UI（C2）
- 游戏对局 UI（C3）
- 实际的资源文件（字体/图集/Spine——C1-C3 逐步引入）
- `shared/` 模块的实际引用和类型检查（C1+）

---

## Further Notes

- 详细技术方案见 `.scratch/client/design-dom.md`
- 客户端里程碑 C0→C1→C2→C3 优先于核心 M4+，等客户端基础完成后再回归核心开发
- 图集构建脚本 `scripts/build-atlas.ts` 不在 C0 范围，C1 或后续里程碑中实现
