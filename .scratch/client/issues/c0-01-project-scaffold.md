# C0-01 — 项目骨架：Vite + TypeScript + 自适应容器

**What to build:** `npm create vite` 初始化 `client/` 项目，配置 `@shared/*` 别名，`index.html` 实现 1920×1080 自适应缩放 + 竖屏旋转提示。

**Blocked by:** None — 可立即开始

**Status:** ready-for-agent

- [ ] `client/` 下 Vite + TypeScript 项目，`npm run dev` 可启动
- [ ] `vite.config.ts` 配置 `@shared/*` 别名指向 `../shared/*`
- [ ] `index.html`：`#game` 容器 1920×1080，`transform: scale()` 等比缩放居中
- [ ] 竖屏时 `#rotate-hint` 全屏提示，`#game` 隐藏
- [ ] 所有 UI 子元素使用像素绝对定位，强制横屏
