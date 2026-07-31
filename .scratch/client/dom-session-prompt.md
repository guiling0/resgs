## 你的任务

将当前 `client/` 的 LayaAir 客户端 **完全移植** 到纯 DOM 方案（`client-dom/`）。

## 技术栈

**Vite + TypeScript + 纯 DOM/CSS**。无 Vue，无 React，无 PixiJS，无 LayaAir。

## 当前状态

项目已初始化，`npm install` 已完成，依赖就绪：

| 依赖 | 版本 |
|---|---|
| vite | ^8.1.1 |
| typescript | ~6.0.2 |
| @colyseus/sdk | ^0.17.43 |
| pako | ^3.0.1 |

`npm run dev` 可启动，浏览器打开 `http://localhost:5173`。

## 必须遵守

1. **先读端口计划**：[.scratch/client/port-dom-plan.md](.scratch/client/port-dom-plan.md) — 每个文件的 HTML 结构、CSS、TS 代码模板
2. **先读 LayaAir 源码**：逻辑逐行对照 `client/src/` 翻译，不要自由发挥
3. **先读 .lh 节点**：需要了解精确坐标/颜色时，用 `Laya_ReadLayaAsset` MCP 读取 `client/assets/resources/` 下的 `.lh` 文件
4. **写代码到文件**：直接 `Write` 到 `client-dom/src/`
5. **按需复制资源**：需要用到 PNG/JPG/字体时，从 `../client/assets/resources/` 复制到 `public/resources/`。图集（`.atlas`）暂不处理
6. **按顺序实现**：
   - **第 1 步**：清理脚手架（删 `counter.ts`、`style.css`），改 `index.html` 写入全场景 DOM + 全 CSS + 自适应容器 + 横屏提示
   - **第 2 步**：`src/main.ts` + `src/app.ts` + `src/scene-manager.ts`
   - **第 3 步**：`src/config.ts` + `src/types.ts` + `src/api.ts`
   - **第 4 步**：`src/components/toast.ts` + `src/components/loading.ts`
   - **第 5 步**：`src/pages/entry.ts`（对照 `client/src/scenes/entry/Entry.ts`）
   - **第 6 步**：`src/pages/lobby.ts`（对照 `client/src/scenes/lobby/Lobby.ts`）+ `src/components/room-item.ts`（对照 `client/src/prefabs/lobby/RoomItem.ts`）
   - **第 7 步**：`src/components/chat-panel.ts`（对照 `client/src/prefabs/chat/ChatPanle.ts`）
   - **第 8 步**：`src/pages/table.ts`（对照 `client/src/scenes/table/Table.ts`）+ `src/components/table-seat.ts`（对照 `client/src/prefabs/table/TableSeat.ts`）
7. **DOM 规则**：
   - 设计分辨率 1920×1080，所有坐标/大小用像素值
   - `#game` 容器 CSS `transform: scale(min(100vw/1920, 100vh/1080))` 自适应
   - 所有 animation 只用 `transform` + `opacity`（GPU 合成）
   - 所有事件：`addEventListener`
8. **零 Laya 依赖**：不引用任何 `Laya.*` 或 `laya/*`
9. **shared/ 和 server/ 不修改**

## @colyseus/schema 问题

`client-dom/node_modules` 中没有 `@colyseus/schema`。`@colyseus/sdk` 内部包含 Schema 类但类型导出路径不同。L1 的 shared/ 代码（RoomState, TableState, SeatState）会被 import，处理方式：

- 先尝试 `import { Schema, type, MapSchema } from '@colyseus/sdk'`（看 SDK 是否导出）
- 如果不行，创建 `src/types/schema.d.ts` 手动声明 `Schema`、`MapSchema`、`ArraySchema`、`type` 的简易类型

## 验收方式

每步完成 `npm run dev` 验证。全部完成后流程：启动服务端 → 打开 http://localhost:5173 → 加载 → 登录 → 大厅 → 创建房间 → 加入房间 → 准备。
