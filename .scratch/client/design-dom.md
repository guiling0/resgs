# 客户端设计决策（2026-07-20 纯 DOM 方案）

## 方案说明

基于 LayaAir 方案与纯 DOM 方案的全面对比，决定采用**纯 DOM（Vite + TypeScript + CSS）**。

核心理由：
1. **扩展增量**：协作者改皮肤 = 丢图到 `assets/`，无需 IDE。客户端扩展 JS 可直接操作 DOM/CSS
2. **单一渲染管线**：不混用 Canvas + DOM——卡牌、UI、特效全在 DOM 中，Spine 通过局部 `<canvas>` 嵌入
3. **卡牌对象池**：400 张牌的视觉复杂度由 CSS `background-position`（图集切片）+ 对象池复用 ~30 个 DOM 节点承载，非全量挂载
4. **CSS 即动效**：发牌飞行、翻转、抖动、发光——全用 CSS transition/animation，无需 Tween 库
5. **自适应一行**：`transform: scale()` 等比缩放，不写媒体查询

> 原有 LayaAir 方案保留在 `design.md`，不做删除。本文档为替代方案。

---

## 一、技术栈

| 层 | 技术 |
|---|---|
| 构建 | Vite（HMR + 生产构建） |
| 语言 | TypeScript |
| 渲染 | 纯 DOM + CSS |
| 骨骼动画 | spine-canvas（局部 `<canvas>`，用于武将技能/受击动画） |
| 图集 | TexturePacker / spritesmith → CSS `background-position` |
| 网络 | Colyseus 客户端 SDK（`colyseus.js`） |
| 存储 | IndexedDB（录像） |
| 设计分辨率 | 1920×1080，`transform: scale()` 等比缩放，强制横屏 |

---

## 二、整体架构

```
┌─────────────────────────────────────────────┐
│ DOM UI 层（HTML + CSS + TypeScript）          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ 加载页   │ │ 大厅页    │ │ 对局页    │      │
│ │ #loader  │ │ #lobby   │ │ #game    │      │
│ └──────────┘ └──────────┘ └──────────┘      │
│ ┌──────────────────────────────────────┐     │
│ │ 弹窗层（.window-stack）               │     │
│ └──────────────────────────────────────┘     │
│ ┌──────────────────────────────────────┐     │
│ │ 提示层（#toast, #tooltip）            │     │
│ └──────────────────────────────────────┘     │
├─────────────────────────────────────────────┤
│ 游戏逻辑层（纯 TypeScript）                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │NetworkMgr│ │DirtyUpdater│ │ReplayCtrl│     │
│ │(Colyseus)│ │(State→DOM)│ │(IndexedDB)│    │
│ └──────────┘ └──────────┘ └──────────┘      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │AssetMgr  │ │AudioMgr  │ │SpineCtrl │      │
│ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────┤
│ 共享引擎层（`shared/`）                        │
│ Colyseus Schema │ SelectTypes │ sgs 全局     │
└─────────────────────────────────────────────┘
```

---

## 三、自适应与横屏

### 3.1 强制横屏

```css
@media (orientation: portrait) {
    #rotate-hint { display: flex; }
    #game { display: none; }
}
```

JS 辅助：`screen.orientation.lock('landscape')`（需用户手势触发）

### 3.2 等比缩放

设计分辨率 1920×1080，一行 CSS：

```css
#game {
    width: 1920px;
    height: 1080px;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%)
               scale(min(100vw / 1920, 100vh / 1080));
    transform-origin: center center;
}
```

所有子元素使用绝对像素定位——不需要 rem、vw、媒体查询。

---

## 四、首屏加载与进度条

```html
<!-- index.html —— 首屏 2KB，直接显示加载器 -->
<div id="loader">
    <div id="loader-bar"></div>
    <div id="loader-text">加载中...</div>
</div>
<script type="module" src="/src/loader.ts"></script>
```

```ts
// loader.ts —— 线性推进，不依赖框架
const steps = [
    ['字体', loadFonts, 10],
    ['图集', loadAtlases, 40],
    ['Spine', loadSpine, 15],
    ['扩展', loadExtensions, 30],
    ['初始化', initGame, 5],
];

let pct = 0;
for (const [name, fn, add] of steps) {
    loaderText.textContent = `正在加载${name}...`;
    await fn();
    pct += add;
    loaderBar.style.width = pct + '%';
}
loader.style.display = 'none';
```

---

## 五、卡牌对象池

全场同时可见 ≤ 30 张牌，池子预创建 30 个离屏 `<div class="card">`：

```
sgs.cardDatas    ← 纯数据（id, name, suit, number），零 DOM
pool[0..29]      ← 30 个离屏 <div>（无 parent，不在 DOM 树）
```

流程：

```
摸牌：sgs.cardDatas.get(id) → 纯数据已有
     node = pool.pop()
     设置 data-* + CSS 背景 → parent.appendChild(node)
     CSS transition → 飞到玩家手牌位置

打出：CSS transition → 飞到处理区
     结算完毕
     parent.removeChild(node) → node.className = 'card' → pool.push
```

生命周期中 DOM 树节点数**恒定**——只改位置和可见性，不增删。

---

## 六、图集与资源

### 6.1 构建时生成

```
scripts/build-atlas.ts
  输入：extension/*/assets/**/*.png
  输出：
    dist/atlas-cards.png   ← 一张大图
    dist/atlas-cards.json  ← { "sha": {x:0, y:0, w:128, h:180} }
```

### 6.2 开发 / 生产切换

```ts
// AssetManager.ts
class AssetManager {
    private atlas: Map<string, AtlasEntry> | null = null;

    getCardStyle(name: string): Partial<CSSStyleDeclaration> {
        if (this.atlas) {
            const f = this.atlas.get(name)!;
            return {
                backgroundImage: 'url(dist/atlas-cards.png)',
                backgroundPosition: `-${f.x}px -${f.y}px`,
                width: f.w + 'px', height: f.h + 'px',
            };
        }
        // 开发：散图
        return { backgroundImage: `url(assets/cards/${name}.png)` };
    }
}
```

---

## 七、Dirty Flag 渲染

```ts
// DirtyUpdater.ts
class DirtyUpdater {
    private flags = new Map<HTMLElement, Set<string>>();

    mark(el: HTMLElement, flag: string) {
        if (!this.flags.has(el)) this.flags.set(el, new Set());
        this.flags.get(el)!.add(flag);
    }

    // 每帧执行
    flush() {
        for (const [el, flags] of this.flags) {
            for (const f of flags) {
                switch (f) {
                    case 'hp': this._updateHp(el); break;
                    case 'handCount': this._updateHandCount(el); break;
                    // ...
                }
            }
            flags.clear();
        }
    }
}
```

`requestAnimationFrame(updater.flush)` — 每帧只更新脏节点。

---

## 八、Spine 动画

使用 `spine-canvas` 库（支持 3.8.x 格式）。

卡牌上可能有 Spine 动画（判定成功/失败），武将框有 Spine 动画（技能/受伤/回血）。

```
DOM 布局
├── 武将框   → mini <canvas>（Spine 骨架）
├── 卡牌     → mini <canvas>（判定动画）
├── 手牌     → 纯 DOM（静态）
└── 战报框   → 纯 DOM（自定义滚动条）
```

每个 `<canvas>` 独立管理自己的 Spine 实例，CSS 控制位置和 z-index。

约束：同一时刻播放的 Spine ≤ 2 个。

---

## 九、自定义滚动条

```css
.message-log::-webkit-scrollbar { width: 16px; }
.message-log::-webkit-scrollbar-thumb {
    background: url(assets/ui/scroll-thumb.png);
}
.message-log::-webkit-scrollbar-track {
    background: url(assets/ui/scroll-track.png);
}
```

---

## 十、目录结构

```
client/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── loader.ts              ← 首屏加载 + 进度条
│   ├── main.ts                ← 游戏入口
│   ├── app.ts                 ← 全局单例 App
│   ├── network.ts             ← Colyseus 连接
│   ├── dirty.ts               ← Dirty Flag 渲染
│   ├── asset.ts               ← 资源管理（图集/散图切换）
│   ├── audio.ts               ← 音效管理
│   ├── spine.ts               ← Spine 动画控制
│   ├── replay.ts              ← 录像回放
│   ├── pool.ts                ← DOM 节点对象池
│   ├── ui/
│   │   ├── game.ts            ← 对局场景
│   │   ├── lobby.ts           ← 大厅
│   │   ├── card.ts            ← 卡牌组件
│   │   ├── general.ts         ← 武将组件
│   │   ├── player.ts          ← 玩家座位
│   │   ├── choose.ts          ← 选择 UI
│   │   ├── skill-btn.ts       ← 技能按钮
│   │   ├── toast.ts           ← 提示
│   │   └── window.ts          ← 弹窗栈
│   └── style/
│       ├── game.css
│       ├── card.css
│       ├── general.css
│       └── ui.css
└── dist/                      ← 构建输出
```

---

## 十一、与 LayaAir 方案的关键差异

| 维度 | LayaAir | 纯 DOM |
|---|---|---|
| 渲染 | Canvas（引擎） | DOM + CSS |
| UI 编辑 | IDE 可视化 | 手写 HTML/CSS |
| 动画 | Tween/FrameAnim/Spine | CSS transition/animation + spine-canvas |
| 构建 | LayaAir IDE | Vite |
| 图集 | LayaAtlas | CSS background-position |
| 扩展门槛 | 需 LayaAir IDE | 会 CSS 即可 |
| 客户端 UI 扩展 | 需 LayaAir 组件开发 | 直接操作 DOM/CSS |
| 调试 | Canvas 内不可见 | DevTools 直接看 |

---

## 十二、里程碑（更新）

客户端里程碑与核心里程碑交织——每步都有可验证的视觉效果。

| 里程碑 | 核心 | 客户端 |
|---|---|---|
| M1 触发技闭环 | ✅ 已完成 | — |
| **M2 使用牌骨架** | ✅ 已完成 | **C0 项目骨架**：Vite + HTML + 自适应缩放 + 进度条加载器 |
| **扩展系统** | 待实现 | — |
| **M3 响应闭环** | 待实现 | **C1 对局渲染**：座位布局 + 手牌区 + 装备区 + 武将框（静态占位） |
| **M4 身份局最小可玩** | 待实现 | **C2 交互系统**：选牌/选目标 UI + 技能按钮 + 出牌操作 |
| M5 AI + 自动对战 | 待实现 | — |
| M6 标准包内容完备 | 待实现 | **C3 动画+音效**：发牌/飞牌/伤害数字/武将语音 |
| M7 联机 | 待实现 | **C4 完整体验**：大厅/房间/聊天/断线重连/观战 |
| M8 客户端 | — | **C5 武将动效**：Spine 动画 + 出场/技能特效 |
| — | — | **C6 录像回放**：IndexedDB + 回放控制条 |

### 客户端里程碑详情

| 客户端 | 内容 | M2 后可并行于核心 |
|---|---|---|
| C0 | Vite 项目 + `index.html` + `loader.ts` + 自适应缩放 + 图集构建脚本 | 立即启动 |
| C1 | 对局页面静态布局：座位、手牌区、装备区、武将框、体力条 | M3 后 |
| C2 | 选择 UI（选牌/选将/选目标）+ 技能按钮 + Colyseus 对接 | M4 后 |
| C3 | CSS 动效（发牌/飞牌/伤害数字）+ 音效播放 | M6 后 |
| C4 | 大厅/房间/聊天/断线重连/观战 | M7 后 |
| C5 | Spine 武将动画 | M8 后 |
| C6 | IndexedDB 录像存储/回放 | M8 后 |

---

## 十三、C0 落地计划

Vite 项目最简启动：

```
client/
├── index.html           ← 自适应容器 + 加载器
├── package.json         ← vite, typescript, colyseus.js, spine-canvas
├── vite.config.ts       ← @shared/* 别名
├── tsconfig.json
└── src/
    ├── loader.ts        ← 线性进度条
    └── main.ts          ← sgs.init('client') → 挂载 DOM
```

首屏只有 `<div id="loader">` + `loader.ts`——加载字体/图集/Spine/扩展 → 进度条 → 进入游戏。
