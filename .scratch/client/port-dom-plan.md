# 客户端移植计划：LayaAir → 纯 DOM 方案

> 生成日期：2026-07-27
> 源：当前 LayaAir 客户端源码 + `.lh` 预制体节点树 + `design-dom.md` 旧方案
> 目标：100% 还原当前客户端功能和 UI 布局，零 LayaAir 依赖
> 技术栈：Vite + TypeScript + 纯 DOM/CSS，无 Vue / 无 React / 无 PixiJS

---

## 项目初始化（执行一次）

```bash
mkdir client-dom && cd client-dom
npm init -y
npm install vite typescript @colyseus/sdk
npx tsc --init
```

## 资源复制（执行一次）

从 `../client/` 复制所需资源到 `public/`：

```bash
mkdir -p public/resources

# 背景图（全部）
cp -r ../client/assets/resources/background public/resources/

# 大厅资源（仅 PNG，图集稍后）
mkdir -p public/resources/lobby
cp ../client/assets/resources/lobby/*.png public/resources/lobby/

# 桌子资源
mkdir -p public/resources/table
cp ../client/assets/resources/table/*.png public/resources/table/

# 窗口资源
mkdir -p public/resources/window
cp ../client/assets/resources/window/*.png public/resources/window/

# BaseUI 资源
mkdir -p public/resources/baseui
cp ../client/assets/resources/baseui/*.png public/resources/baseui/

# CDN 武将头像 / 卡牌图（线上）
mkdir -p public/resources/general
mkdir -p public/resources/card
mkdir -p public/resources/buttons
mkdir -p public/resources/game

# 字体
mkdir -p public/resources/font
cp ../client/assets/resources/font/*.ttf public/resources/font/

# 公告
mkdir -p public/update
cp ../client/assets/update/notice.json public/update/ 2>/dev/null || echo '{}' > public/update/notice.json
```

### 暂不复制/稍后处理

| 资源 | 原因 |
|---|---|
| `*.atlas` 图集文件 | 需要 atlas unpack 脚本（或 CSS background-position），L2 再做 |
| `*.lh` 预制体 | LayaAir 专用，DOM 方案不需要 |
| `card/`、`general/` 图集 | 线上 CDN 加载（`res.resgs.com`），暂用占位 |
| `daoju/` 互动道具 | L6 再做 |
| `*.mp3` 音频 | L3 再做 |

### Vite `public/` 目录说明

`public/` 下的文件在构建时原样复制到 `dist/`，运行时通过根路径访问：
```
public/resources/background/frameBg.jpg
→ 代码中引用: /resources/background/frameBg.jpg
```

---

## 零、项目骨架

### 0.1 目录结构

```
client-dom/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts                  ← 应用入口
    ├── app.ts                   ← App 单例
    ├── loader.ts                ← 资源加载 + 进度条
    ├── config.ts                ← 服务器地址 / 座位布局
    ├── types.ts                 ← RoomListItem / ChatMessage
    ├── scene-manager.ts         ← 场景路由(无 Laya 依赖)
    ├── api.ts                   ← Colyseus SDK 封装
    ├── audio.ts                 ← Web Audio API
    ├── res-manager.ts           ← 图片预加载(Image 对象池)
    ├── style.css                ← 全局样式 + 自适应 + 横屏
    ├── pages/
    │   ├── load.ts              ← 加载场景
    │   ├── entry.ts             ← 登录场景
    │   ├── lobby.ts             ← 大厅场景
    │   └── table.ts             ← 等待房间场景
    ├── components/
    │   ├── toast.ts             ← 提示文本
    │   ├── loading.ts           ← 加载遮罩
    │   ├── chat-panel.ts        ← 聊天面板
    │   ├── room-item.ts         ← 房间列表项
    │   └── table-seat.ts        ← 座位组件
    └── style/
        ├── entry.css
        ├── lobby.css
        ├── table.css
        └── components.css
```

### 0.2 `vite.config.ts` — Vite 配置

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@shared': path.resolve(__dirname, '../shared'),
        },
    },
    server: {
        port: 3000,
    },
    base: './',
});
```

### 0.3 `tsconfig.json`

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "skipLibCheck": true,
        "paths": {
            "@shared/*": ["../shared/*"]
        }
    },
    "include": ["src"]
}
```

### 0.4 `package.json` — 核心依赖

```json
{
    "name": "resgs-client-dom",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "@colyseus/sdk": "^0.17.43"
    },
    "devDependencies": {
        "typescript": "^7.0.2",
        "vite": "^6.0.0"
    }
}
```

### 0.5 `index.html` — 自适应容器

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>RGS 三国杀</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:100%; height:100%; overflow:hidden; background:#000; }
  #rotate-hint { display:none; position:fixed; inset:0; z-index:99999;
    background:#000; color:#fff; justify-content:center; align-items:center;
    font-size:24px; flex-direction:column; }
  #rotate-hint::before { content:'📱'; font-size:64px; margin-bottom:16px; }
  @media (orientation:portrait) {
    #rotate-hint { display:flex; }
    #game { display:none; }
  }
  #game { width:1920px; height:1080px; position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%) scale(min(100vw/1920,100vh/1080));
    transform-origin:center center; overflow:hidden; font-family:'Microsoft YaHei',sans-serif; }
  #game > .page { display:none; position:absolute; top:0; left:0; width:100%; height:100%; }
  #game > .page.active { display:block; }
  #loader { position:absolute; inset:0; z-index:999; background:#1a1a2e;
    display:flex; flex-direction:column; justify-content:center; align-items:center; }
  #loader-bar-wrap { width:600px; height:12px; background:#333; border-radius:6px; overflow:hidden; }
  #loader-bar { width:0%; height:100%; background:linear-gradient(90deg,#4FC3F7,#81C784); transition:width .3s; }
  #loader-text { color:#aaa; margin-top:16px; font-size:20px; }
  #toast-layer { position:absolute; bottom:100px; left:50%; transform:translateX(-50%); z-index:9999;
    display:flex; flex-direction:column-reverse; align-items:center; gap:8px; pointer-events:none; }
  #toast-layer .toast { background:rgba(0,0,0,.75); color:#fff; padding:10px 24px;
    border-radius:8px; font-size:22px; white-space:nowrap;
    animation:toastIn .3s ease-out, toastOut .4s 2s ease-in forwards; }
  @keyframes toastIn { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
  @keyframes toastOut { from{opacity:1;} to{opacity:0;} }
  #loading-overlay { display:none; position:absolute; inset:0; z-index:9998;
    background:rgba(0,0,0,.4); justify-content:center; align-items:center; }
  #loading-overlay.show { display:flex; }
  .spinner { width:48px; height:48px; border:4px solid rgba(255,255,255,.2);
    border-top-color:#fff; border-radius:50%; animation:spin .8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg);} }
</style>
</head>
<body>
<div id="rotate-hint"><span>请旋转设备</span></div>
<div id="game">
  <div id="loader"><div id="loader-bar-wrap"><div id="loader-bar"></div></div><div id="loader-text">加载中...</div></div>
  <div id="toast-layer"></div>
  <div id="loading-overlay"><div class="spinner"></div></div>
  <div id="page-load" class="page"></div>
  <div id="page-entry" class="page"></div>
  <div id="page-lobby" class="page"></div>
  <div id="page-table" class="page"></div>
</div>
<script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 0.3 `src/main.ts` — 应用入口

```ts
import { App } from './app';
import { startLoader } from './loader';
import './style.css';

startLoader(async (progress) => {
    // 加载步骤完成后进入
    App.init();
    App.scene.show('entry');
});
```

### 0.4 `src/app.ts` — 全局单例

```ts
import { SceneManager } from './scene-manager';
import { ApiClient } from './api';

class App {
    static scene: SceneManager;
    static api: ApiClient;

    static init() {
        this.scene = new SceneManager(document.getElementById('game')!);
        this.api = new ApiClient();
    }
}
```

### 0.5 `src/scene-manager.ts` — 场景管理器

```ts
type PageId = 'load' | 'entry' | 'lobby' | 'table';

interface PageDef {
    id: PageId;
    enter?: (el: HTMLElement, data?: any) => void;
    exit?: (el: HTMLElement) => void;
}

class SceneManager {
    private _root: HTMLElement;
    private _current: PageId | null = null;
    private _pages = new Map<PageId, HTMLElement>();
    private _defs = new Map<PageId, PageDef>();
    private _data: any = null;

    constructor(root: HTMLElement) { this._root = root; }

    get enterData() { return this._data; }

    register(def: PageDef) {
        this._defs.set(def.id, def);
    }

    registerAll(defs: PageDef[]) { defs.forEach(d => this.register(d)); }

    show(id: PageId, data?: any) {
        this._data = data ?? null;
        // 隐藏当前
        if (this._current) {
            const prev = this._defs.get(this._current);
            const el = this._pages.get(this._current);
            if (prev?.exit && el) prev.exit(el);
            if (el) el.classList.remove('active');
        }
        // 显示目标
        let el = this._pages.get(id);
        if (!el) {
            el = document.getElementById(`page-${id}`)!;
            this._pages.set(id, el);
        }
        el.classList.add('active');
        this._current = id;
        const def = this._defs.get(id);
        if (def?.enter) def.enter(el, data);
    }
}
```

### 0.6 `src/config.ts` — 全局配置

从 `client/src/config.ts` 直接复制 `SERVER_CONFIG`、`SEAT_POSITIONS`（保持不变）。

### 0.7 `src/types.ts` — 类型定义

从 `client/src/types.ts` 复制 `ChatMessage`、`ChatSource`、`RoomListItem`、`CHAT_SOURCE_CONFIG`（保持不变）。

---

## 一、加载场景 (Load)

### 对应源文件
- `Load.lh`: GWidget "Load" → img(GImage) + pb(GProgressBar) + txt(GTextField)
- `Load.ts`: startPreload 顺序加载 RES_URLS → PREFAB_URLS → SCENE_URLS

### HTML 结构
```html
<div id="page-load" class="page" style="background:url('resources/background/frameBg.jpg') center/cover;">
  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
    <div id="load-img" style="width:200px; height:200px; margin:0 auto; background:center/contain no-repeat;"></div>
    <div id="load-bar-wrap" style="width:400px; height:10px; background:rgba(255,255,255,.2); border-radius:5px; margin-top:20px;">
      <div id="load-bar" style="width:0%; height:100%; background:#4FC3F7; border-radius:5px; transition:width .2s;"></div>
    </div>
    <div id="load-text" style="color:#aaa; margin-top:12px; font-size:20px;">加载中...</div>
  </div>
</div>
```

### 逻辑 (`src/pages/load.ts`)
- 加载步骤数组（每步有权重）
- 修改 `load-bar` 宽度百分比
- C0 阶段所有资源加载为 stub
- 加载完成 → `App.scene.show('entry')`

---

## 二、登录场景 (Entry)

### 对应源文件
- `Entry.lh`: 20 节点 — img(GImage) + input_username/password(GTextInput) + save_info(CheckBox) + btn_entry_game/btn_alone_server/btn_pck_mgr/btn_exit_game/btn_dev_tools(GButton) + title_list(GList) + notice_panel(GPanel) + notice(GTextField) + ver(GTextField) + more_settings(GTextField)
- `.lh` 中坐标（设计分辨率 1920×1080）：
  - 背景 img: full screen
  - input_username: ~x=800, y=450
  - input_password: ~x=800, y=520
  - btn_entry_game: ~x=800, y=600
  - notice_panel: 右侧区域

### HTML 结构
完整还原 Entry.lh 的节点层级和坐标：

```html
<div id="page-entry" class="page" style="background:#1a1a2e;">
  <!-- 背景图 -->
  <img src="resources/background/frameBg.jpg" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.6;">

  <!-- 公告面板 / 标题列表 -->
  <div style="position:absolute; left:60px; top:200px; width:400px;">
    <div id="entry-notice-title" style="color:#fff; font-size:24px; margin-bottom:12px;">公告</div>
    <div id="entry-title-list" style="max-height:200px; overflow-y:auto;"></div>
    <div id="entry-notice-panel" style="width:400px; height:300px; background:rgba(0,0,0,.5); border-radius:8px; padding:16px; margin-top:12px; overflow-y:auto;">
      <div id="entry-notice" style="color:#ccc; font-size:18px; line-height:1.6;"></div>
    </div>
  </div>

  <!-- 登录表单 -->
  <div style="position:absolute; right:200px; top:50%; transform:translateY(-50%); width:360px;">
    <input id="entry-username" type="text" placeholder="用户名" style="width:100%; padding:12px; font-size:20px; border:1px solid #555; border-radius:6px; background:rgba(255,255,255,.1); color:#fff; margin-bottom:16px;">
    <input id="entry-password" type="password" placeholder="密码" style="width:100%; padding:12px; font-size:20px; border:1px solid #555; border-radius:6px; background:rgba(255,255,255,.1); color:#fff; margin-bottom:16px;">
    <label style="color:#aaa; font-size:16px; display:flex; align-items:center; gap:8px; margin-bottom:20px;">
      <input id="entry-save-info" type="checkbox"> 记住密码
    </label>
    <button id="entry-btn-login" style="width:100%; padding:14px; font-size:22px; background:linear-gradient(135deg,#4FC3F7,#29B6F6); color:#fff; border:none; border-radius:8px; cursor:pointer;">进入游戏</button>
  </div>

  <!-- 底部按钮栏 -->
  <div style="position:absolute; bottom:30px; left:50%; transform:translateX(-50%); display:flex; gap:20px;">
    <button id="entry-btn-alone" style="padding:8px 20px; background:rgba(255,255,255,.1); color:#aaa; border:1px solid #555; border-radius:6px; font-size:16px; cursor:pointer;">单机模式</button>
    <button id="entry-btn-ext" style="padding:8px 20px; background:rgba(255,255,255,.1); color:#aaa; border:1px solid #555; border-radius:6px; font-size:16px; cursor:pointer;">扩展管理</button>
    <button id="entry-btn-exit" style="padding:8px 20px; background:rgba(255,255,255,.1); color:#aaa; border:1px solid #555; border-radius:6px; font-size:16px; cursor:pointer;">退出游戏</button>
  </div>

  <!-- 版本号 -->
  <div id="entry-ver" style="position:absolute; right:20px; bottom:20px; color:#555; font-size:14px;">v1.0.0</div>
</div>
```

### 逻辑 (`src/pages/entry.ts`)
从 `Entry.ts` 逐行翻译：
- `onAwake` → 页面 `enter` 回调
- `_onLogin`: 取 input 值 → `api.login(username, password)` → 成功后 `scene.show('lobby')`
- 公告加载：`fetch('./update/notice.json')` → 渲染标题列表
- 回车登录：`entry-password` 上监听 `keydown`(Enter)
- 所有 Laya `this.btn_xxx.on(CLICK, ...)`→ `document.getElementById('entry-btn-xxx').addEventListener('click', ...)`
- Laya `ToastUI.show('...')` → `App.toast.show('...')` (见下方 Toast)
- Laya `LoadingUI.show/hide` → toggle `#loading-overlay` CSS class

---

## 三、大厅场景 (Lobby)

### 对应源文件
- `Lobby.lh`: 17 子节点 + 引用的 prefab
- `Lobby.ts`: joinLobby → 监听 rooms/+/-/chat → 按钮

### HTML 结构

```html
<div id="page-lobby" class="page" style="background:#1a1a2e;">
  <!-- 背景 -->
  <img src="resources/background/frameBg.jpg" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.6;">

  <!-- 顶部信息栏 -->
  <div style="position:absolute; top:0; left:0; right:0; height:80px; background:rgba(0,0,0,.6); display:flex; align-items:center; padding:0 24px;">
    <div id="lobby-avatar" style="width:48px; height:48px; border-radius:50%; background:#555; border:2px solid #4FC3F7;"></div>
    <span id="lobby-playername" style="color:#fff; font-size:22px; margin-left:12px;">用户名</span>
    <div style="flex:1;"></div>
    <span id="lobby-status" style="color:#aaa; font-size:16px;">在线:0 | 房间:0</span>
    <span id="lobby-version" style="color:#555; font-size:14px; margin-left:16px;">v1.0.0</span>
  </div>

  <!-- 左侧功能区 -->
  <div style="position:absolute; left:30px; top:110px; width:300px; display:flex; flex-direction:column; gap:12px;">
    <input id="lobby-search" type="text" placeholder="搜索房间..." style="padding:8px 12px; font-size:16px; background:rgba(255,255,255,.1); border:1px solid #555; border-radius:6px; color:#fff;">
    <label style="color:#aaa; font-size:16px; display:flex; align-items:center; gap:8px;">
      <input id="lobby-only-wait" type="checkbox"> 只看等待中的房间
    </label>
    <button id="lobby-btn-create" style="width:100%; padding:14px; font-size:22px; background:linear-gradient(135deg,#81C784,#4CAF50); color:#fff; border:none; border-radius:8px; cursor:pointer;">创建房间</button>
    <button id="lobby-btn-logout" style="width:100%; padding:12px; font-size:18px; background:rgba(255,255,255,.1); color:#E57373; border:1px solid #555; border-radius:6px; cursor:pointer;">退出登录</button>
  </div>

  <!-- 房间列表 (中央) -->
  <div style="position:absolute; left:360px; top:110px; right:30px; bottom:300px; overflow-y:auto;">
    <div id="lobby-room-list" style="display:flex; flex-direction:column; gap:8px;"></div>
  </div>

  <!-- 聊天面板 (底部) -->
  <div id="lobby-chat-panel" style="position:absolute; left:360px; right:30px; bottom:20px; height:260px;"></div>
</div>
```

### 房间列表项 (`src/components/room-item.ts`)
从 `RoomItem.ts` 逐行翻译：

```html
<!-- 单条 room-item 结构 -->
<div class="room-item" style="display:flex; align-items:center; padding:12px 16px; background:rgba(255,255,255,.05); border-radius:8px; gap:16px;">
  <span class="room-id" style="color:#4FC3F7; font-size:18px; width:60px;">[1000]</span>
  <span class="room-mode" style="color:#888; font-size:16px; width:80px;">身份</span>
  <span class="room-name" style="color:#fff; font-size:18px; flex:1;">房间名</span>
  <span class="room-count" style="color:#81C784; font-size:16px; width:100px;">3/8(0)</span>
  <span class="room-state" style="font-size:16px; width:80px;">等待中</span>
  <button class="btn-join" style="padding:6px 16px; background:#4FC3F7; color:#fff; border:none; border-radius:4px; cursor:pointer;">加入</button>
  <button class="btn-watch" style="padding:6px 16px; background:rgba(255,255,255,.1); color:#aaa; border:1px solid #555; border-radius:4px; cursor:pointer;">旁观</button>
  <button class="btn-info" style="padding:6px 16px; background:rgba(255,255,255,.1); color:#aaa; border:1px solid #555; border-radius:4px; cursor:pointer;">信息</button>
</div>
```

逻辑：
- `.room-state` 颜色：waiting→`#81C784` green, playing→`#E57373` red
- 密码房间：roomName 前加 🔒 图标
- `_onJoin`: `api.join(roomId, RoomState)` → `scene.show('table', { room })`

### 逻辑 (`src/pages/lobby.ts`)
- `enter` 回调 = `onAwake`:
  1. `this._lobbyRoom = await api.joinOrCreate('lobby')`
  2. `onMessage('rooms', (rooms) => renderList(rooms))`
  3. `onMessage('+', ([id, room]) => addOrUpdateRoom(id, room))`
  4. `onMessage('-', (id) => removeRoom(id))`
  5. `onMessage('chat', (msg) => chatPanel.append(msg))`
- `exit` 回调 = `onDestroy`: `this._lobbyRoom?.leave()`
- `btn-create` click → `api.create('game', {...})` → `scene.show('table', { room })`
- `btn-logout` click → `room.leave()` → `api.logout()` → `scene.show('entry')`

---

## 四、等待房间场景 (Table)

### 对应源文件
- `Table.lh`: 12 子节点 — img(GImage) + players(GWidget) + roomname/roominfo(GTextField) + 多个 GButton + ChatPanle
- `Table.ts`: onEntry 创建座位 → onStateChange 刷新 → 消息处理

### 座位坐标 (TABLE_SEAT_POSITIONS from config.ts)
从 `client/src/config.ts` 的 `TABLE_SEAT_POSITIONS` 复制：
```
role(4人): [{x:261,y:300,s:1},{x:1261,y:300,s:1},{x:1761,y:300,s:1},{x:761,y:300,s:1}]
default(8人): [{x:261,y:250,s:1},{x:561,y:250,s:1},{x:861,y:250,s:1},{x:1161,y:250,s:1},{x:1461,y:250,s:1},{x:1761,y:250,s:1},{x:1061,y:550,s:1},{x:861,y:550,s:1}]
```

### HTML 结构

```html
<div id="page-table" class="page" style="background:#1a2a1a;">
  <img src="resources/background/frameBg.jpg" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.6;">

  <!-- 房间信息栏 -->
  <div style="position:absolute; top:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.6); padding:8px 24px; border-radius:8px;">
    <span id="table-room-name" style="color:#fff; font-size:22px;">房间名 | 模式：role | 0/8人</span>
  </div>

  <!-- 座位容器 -->
  <div id="table-seats" style="position:absolute; top:120px; left:0; right:0; bottom:200px;"></div>

  <!-- 聊天面板 -->
  <div id="table-chat-panel" style="position:absolute; left:30px; right:30px; bottom:80px; height:200px;"></div>

  <!-- 操作按钮栏 -->
  <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:16px;">
    <button id="table-btn-ready" style="padding:10px 32px; font-size:20px; background:linear-gradient(135deg,#81C784,#4CAF50); color:#fff; border:none; border-radius:8px; cursor:pointer;">准备</button>
    <button id="table-btn-unready" style="padding:10px 32px; font-size:20px; background:linear-gradient(135deg,#FFB74D,#FF9800); color:#fff; border:none; border-radius:8px; cursor:pointer; display:none;">取消准备</button>
    <button id="table-btn-start" style="padding:10px 32px; font-size:20px; background:linear-gradient(135deg,#E57373,#F44336); color:#fff; border:none; border-radius:8px; cursor:pointer; display:none;">开始游戏</button>
    <button id="table-btn-leave" style="padding:10px 32px; font-size:20px; background:rgba(255,255,255,.1); color:#E57373; border:1px solid #555; border-radius:8px; cursor:pointer;">返回大厅</button>
  </div>
</div>
```

### 座位组件 (`src/components/table-seat.ts`)

```html
<!-- 单个座位 -->
<div class="table-seat" style="position:absolute; width:160px; text-align:center;">
  <img class="seat-avatar" style="width:64px; height:64px; border-radius:50%; border:2px solid #555; display:block; margin:0 auto;">
  <div class="seat-name" style="color:#fff; font-size:18px; margin-top:4px;">玩家名</div>
  <img class="seat-state" style="width:24px; height:24px; margin-top:4px; display:none;">
</div>
```

逻辑：
- `set(seatState, isSelf, isOwner)`: 空则清空
  - `seat-name` 颜色：isSelf→`#FF5252` red, others→`#FFFFFF` white
  - `seat-state` 显示：owner→👑, ready→✅
  - `seat-avatar` 加载：`apiClient` 暂不处理

### 逻辑 (`src/pages/table.ts`)
- `enter` 回调(`onEntry`):
  1. 接收 `room` 从 `scene.enterData`
  2. 根据 `room.state.options.playerCountMax` 和 `room.state.options.mode` 获取座位坐标
  3. 循环创建 `.table-seat` div → 设置 position + scale
  4. `room.onStateChange` → `_refreshRoomInfo` + `_refreshSeatInfo` + `_refreshButtons`
  5. `room.onMessage('kicked')` → toast + leave
  6. `room.onMessage('game_start')` → toast
  7. `room.onMessage('chat')` → `chatPanel.append()`
  8. `_refreshRoomInfo`: 设置 room-id, room-name
  9. `_refreshSeatInfo`: 遍历 seats → 每个座位调 `table-seat.set(seatState, isSelf, isOwner)`
  10. `_refreshButtons`: btn-start 仅房主可见, btn-ready 非房主未准备时可见, btn-unready 已准备时可见

---

## 五、聊天面板 (ChatPanel)

### 对应源文件
- `ChatPanle.ts` + `chat_panle.lh`
- 功能：多来源消息列表 + 输入框 + 发送 + 筛选 + 表情 + 快捷语音 + 跳底按钮
- 消息格式: `[来源标签] 发送者：内容`
- 筛选按钮: 全部 / 大厅 / 房间 / 队伍

### HTML 结构

```html
<div class="chat-panel" style="display:flex; flex-direction:column; height:100%;">
  <!-- 筛选标签 -->
  <div style="display:flex; gap:8px; margin-bottom:8px;">
    <button class="chat-filter active" data-filter="all" style="padding:4px 12px; font-size:14px; border-radius:4px; cursor:pointer;">全部</button>
    <button class="chat-filter" data-filter="lobby" style="padding:4px 12px; font-size:14px; border-radius:4px; cursor:pointer;">大厅</button>
    <button class="chat-filter" data-filter="room" style="padding:4px 12px; font-size:14px; border-radius:4px; cursor:pointer;">房间</button>
    <button class="chat-filter" data-filter="team" style="padding:4px 12px; font-size:14px; border-radius:4px; cursor:pointer;">队伍</button>
  </div>
  <!-- 消息列表 -->
  <div class="chat-messages" style="flex:1; overflow-y:auto; background:rgba(0,0,0,.3); border-radius:6px; padding:8px;">
    <!-- 每条消息 -->
    <div class="chat-msg" style="display:flex; gap:8px; align-items:baseline; padding:2px 0;">
      <span class="chat-tag" style="padding:2px 6px; border-radius:3px; font-size:13px; font-weight:bold; color:#fff; white-space:nowrap;">大厅</span>
      <span class="chat-text" style="color:#ddd; font-size:16px;">玩家名：消息内容</span>
    </div>
  </div>
  <!-- 输入栏 -->
  <div style="display:flex; gap:8px; margin-top:8px;">
    <input class="chat-input" type="text" placeholder="输入消息..." style="flex:1; padding:8px 12px; font-size:16px; background:rgba(255,255,255,.1); border:1px solid #555; border-radius:6px; color:#fff;">
    <button class="chat-send" style="padding:8px 16px; background:#4FC3F7; color:#fff; border:none; border-radius:6px; cursor:pointer;">发送</button>
  </div>
</div>
```

### 逻辑 (`src/components/chat-panel.ts`)
- 消息存储 `_store: ChatMessage[]` + 静态全局存储
- `setFilter(source)`: 切换 active 样式 + 过滤显示
- `append(msg)`: 追加 → 去重 → 自动滚底 / 显示跳底按钮
- `_isAtBottom()`: `scrollTop + clientHeight >= scrollHeight - 5`
- 标签颜色: `CHAT_SOURCE_CONFIG[source].color`
- Laya `this.btn_send.on(CLICK)` → `addEventListener('click')`
- Laya `this.input_chat.on(KEY_DOWN, ...)` → `addEventListener('keydown', ...)` Enter=13

---

## 六、Toast 提示

### HTML 结构
```html
<div id="toast-layer" style="position:absolute; bottom:100px; left:50%; transform:translateX(-50%); z-index:9999; display:flex; flex-direction:column-reverse; align-items:center; gap:8px; pointer-events:none;"></div>
```

### 逻辑 (`src/components/toast.ts`)
- `show(message)`: 创建 `.toast` div → append 到 `#toast-layer`
- 同内容去重（比对 innerText）
- CSS 动画: 0.3s 上推 → 2s 停留 → 0.4s 淡出 → remove()
- 同屏最多 5 条

---

## 七、加载遮罩 (Loading)

### HTML 结构
```html
<div id="loading-overlay" style="display:none; position:absolute; inset:0; z-index:9998; background:rgba(0,0,0,.4); justify-content:center; align-items:center;">
  <div class="spinner"></div>
</div>
```

### 逻辑 (`src/components/loading.ts`)
- `show()`: `loading-overlay.classList.add('show')` (CSS `display:flex`)
- `hide()`: `loading-overlay.classList.remove('show')`

---

## 八、ApiClient 映射

从 `client/src/api/ApiClient.ts` 逐行翻译：

| LayaAir | DOM |
|---|---|
| `Laya.LocalStorage.getJSON('resgs_token')` | `localStorage.getItem('resgs_token')` (JSON.parse) |
| `Laya.LocalStorage.setJSON(key, val)` | `localStorage.setItem(key, JSON.stringify(val))` |
| `new ColyseusSDK(wsUrl)` | `new ColyseusSDK(wsUrl)` (保持不变，colyseus SDK 无 DOM 依赖) |
| `sdk.http.post(...)` | 保持不变 |
| `sdk.joinOrCreate(...)` | 保持不变 |
| `sdk.create(...)` | 保持不变 |
| `sdk.joinById(...)` | 保持不变 |

---

## 九、事件系统映射

| LayaAir 事件 | DOM 等价 |
|---|---|
| `btn.on(Laya.Event.CLICK, this, fn)` | `btn.addEventListener('click', fn.bind(this))` |
| `input.on(Laya.Event.KEY_DOWN, this, fn)` | `input.addEventListener('keydown', fn.bind(this))`  |
| `Laya.stage.on(Laya.Event.RESIZE, ...)` | `window.addEventListener('resize', ...)` |
| `Laya.timer.frameOnce(1, this, fn)` | `requestAnimationFrame(() => { requestAnimationFrame(fn); })` |
| `Laya.timer.once(delay, this, fn)` | `setTimeout(fn, delay)` |

---

## 十、完整文件清单

| 文件 | 来源 | 说明 |
|---|---|---|
| `index.html` | 新建（含全 CSS） | 自适应容器 + 横屏提示 + 所有场景 DOM 骨架 |
| `package.json` | 新建 | vite + typescript + colyseus-sdk |
| `tsconfig.json` | 从 client/tsconfig.json 改 | 去掉 Laya 相关，保留 @shared/* |
| `vite.config.ts` | 从 spec-c0.md | `@shared/*` 别名 |
| `src/main.ts` | 新建 | App.init + 加载流程 |
| `src/app.ts` | 新建 | 全局单例 |
| `src/loader.ts` | 新写 | 资源加载 + 进度条 |
| `src/config.ts` | 直接复制 client/src/config.ts | SERVER_CONFIG + SEAT_POSITIONS |
| `src/types.ts` | 直接复制 client/src/types.ts | ChatMessage 等 |
| `src/scene-manager.ts` | 新写 | DOM 场景路由 |
| `src/api.ts` | 翻译 client/src/api/ApiClient.ts | localStorage 替代 Laya.LocalStorage |
| `src/res-manager.ts` | 新写 | Image 预加载 |
| `src/pages/load.ts` | 翻译 client/src/scenes/load/Load.ts | 加载场景 |
| `src/pages/entry.ts` | 翻译 client/src/scenes/entry/Entry.ts | 登录场景 |
| `src/pages/lobby.ts` | 翻译 client/src/scenes/lobby/Lobby.ts | 大厅场景 |
| `src/pages/table.ts` | 翻译 client/src/scenes/table/Table.ts | 等待房间场景 |
| `src/components/toast.ts` | 翻译 client/src/components/ToastUI.ts | 提示 |
| `src/components/loading.ts` | 翻译 client/src/components/LoadingUI.ts | 加载遮罩 |
| `src/components/chat-panel.ts` | 翻译 client/src/prefabs/chat/ChatPanle.ts | 聊天面板 |
| `src/components/room-item.ts` | 翻译 client/src/prefabs/lobby/RoomItem.ts | 房间列表项 |
| `src/components/table-seat.ts` | 翻译 client/src/prefabs/table/TableSeat.ts | 座位组件 |
| `src/style.css` | 从 index.html 提取 | 全局样式 |

共 21 个文件。shared/ 和 server/ 零改动。

---

## 十一、按场景逐步实现顺序

1. **C0 骨架**：`index.html` → `package.json` → `tsconfig.json` → `vite.config.ts` → `main.ts` → `app.ts` → `loader.ts` → `scene-manager.ts` → `config.ts` → `types.ts` → `api.ts`。验收：`npm run dev` 打开页面看到自适应容器 + 进度条走完 + 控制台 App 就绪
2. **Toast + Loading**：`toast.ts` + `loading.ts`。验收：页面显示 Toast
3. **Entry 场景**：`entry.ts` + API 对接。验收：能登录成功跳转大厅
4. **Lobby 场景**：`lobby.ts` + `room-item.ts`。验收：看到房间列表
5. **Chat 面板**：`chat-panel.ts`。验收：大厅聊天
6. **Table 场景**：`table.ts` + `table-seat.ts`。验收：创建房间 → 看到座位 → 准备 → 开始

---

## 十二、与当前 LayaAir 版本的差异

| 项目 | LayaAir | DOM 方案 |
|---|---|---|
| 文件数 | ~80+（含 .lh, .generated.ts, prefabs）| 21 个纯 TS/HTML/CSS |
| @colyseus/schema 问题 | TS 7 + UMD 冲突 | 仍需解决，同一方案 |
| 编辑器依赖 | LayaAir IDE 必须 | 零（VSCode 即可）|
| 扩展门槛 | 需 LayaAir 组件开发 | HTML/CSS 即可 |
| sgs.init | 暂未启用 | 暂未启用（C1+ 改）|
