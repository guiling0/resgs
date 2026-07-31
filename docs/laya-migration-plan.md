# LayaAir 客户端重建计划

## Context

DOM 客户端（Vite + TypeScript + 纯 DOM/CSS）在开发过程中遇到性能瓶颈：
- 30+ 张卡牌同屏时卡顿
- Web Animations API 在大量 layout 属性动画下性能不佳
- 频繁的 DOM 操作和 getBoundingClientRect 导致强制重排

决定换回 LayaAir 3.4.0（ADR-0001 最终选择），利用其 Canvas/WebGL 渲染管线获得更好的游戏性能。
新建干净项目，直接使用现有 PNG 资源，优先级为：先核心后完善。

## 技术选型

| 层 | 技术 |
|---|---|
| 引擎 | LayaAir 3.4.0 |
| 语言 | TypeScript（严格模式） |
| 构建 | LayaAir IDE + Vite（LayaAir 3.x 默认 Vite 构建） |
| 共享逻辑 | `shared/`（纯 TS，已存在，直接复用） |
| 服务端 | Node.js + Colyseus 0.17（不变） |
| 资源 | 现有 `client/assets/resources/` PNG 直接加载 |
| 设计分辨率 | 1920×1080 |

## 开发流程

1. 用 LayaAir IDE 创建项目、编辑场景、导出 `.lh` 预制体
2. 脚本在 VSCode 中编写（TypeScript + `@regClass()` + `Laya.Script`）
3. 用 Laya MCP 服务器查询 API 文档
4. 旧 LayaAir 项目 `old/resgsv1/clientv0/` 作为参考（GameCardComp、UICard、UIGameRoom）

## 目录结构

```
client-laya/
  src/
    Main.ts              # 引擎初始化 + 场景入口
    config.ts            # 游戏配置（服务器地址、座位位置等）
    core/
      SceneManager.ts    # 场景路由
      CardTracker.ts     # 卡牌追踪系统（_cardMap + 唯一 ID）
      TweenEngine.ts     # Laya.Tween 封装（缓动查找表等）
    ui/
      CardFactory.ts     # 卡牌预制体工厂（buildCard）
      GeneralFactory.ts  # 武将牌工厂（buildGeneral）
      EquipFactory.ts    # 装备槽工厂
      HpRenderer.ts      # 体力值渲染
      EquipLayout.ts     # 装备布局引擎
    components/
      SelfSeat.ts        # 主视角玩家框（Laya.Script）
      OtherSeat.ts       # 其他玩家框（Laya.Script）
      CardInfoPopup.ts   # 卡牌信息弹窗
    scenes/
      LoadScene.ts       # 加载场景
      EntryScene.ts      # 入口/登录场景
      LobbyScene.ts      # 大厅场景
      GameScene.ts       # 游戏场景（核心预览）
  assets/
    resources/           # 从 client/assets/resources/ 复制或软链接
  scenes/
    Load.ls              # LayaAir IDE 场景文件
    Entry.ls
    Lobby.ls
    Game.ls
```

## Phase 1: 项目骨架（C0）

**目标**：LayaAir 项目启动 → 引擎初始化 → 场景切换 → 资源加载

1. **IDE 创建项目**：用 LayaAir IDE 创建新 3.4.0 项目，设计分辨率 1920×1080
2. **Main.ts**：`Laya.init()` 配置，注册所有场景脚本
3. **SceneManager**：`Laya.Scene.open()` 场景切换封装
4. **LoadScene**：资源预加载（`Laya.loader.load()`）+ 进度条显示
5. **EntryScene**：简单登录界面（背景 + 按钮跳转到游戏场景）
6. **复制资源**：将 `client/assets/resources/` 复制到项目 `assets/` 目录

**验证**：项目能在 IDE 中运行，从 Load → Entry → Game 场景切换正常

## Phase 2: 预制体（C1）

**目标**：卡牌、武将牌、装备槽预制体可从代码构建

1. **CardFactory.ts** — `buildCard(data: CardRenderData): Laya.Sprite`
   - 140×195 容器
   - 牌面图片（Laya.Image，CDN 或本地，onerror 兜底 `none.png`）
   - 点数图标（左上角，`card/number/{color}/{num}.png`）
   - 花色图标（点数下方，`card/suit/{suit}.png`）
   - 牌背可选显示/隐藏
   - 参考：DOM 的 `CardUI.ts` + 旧 LayaAir 的 `UICard.ts`

2. **GeneralFactory.ts** — `buildGeneral(data: GeneralRenderData): Laya.Sprite`
   - 140×195 容器
   - 武将肖像（缩放 0.66，偏移 -15,-2）
   - 边框（`general/general_border.png`）
   - 势力图标（左上角 47×49）
   - 竖排武将名（SIMLI 字体）
   - 体力值（势力对应 HP 图标）
   - 参考：DOM 的 `GeneralUI.ts`

3. **EquipFactory.ts** — `buildEquipSlot(data: EquipRenderData): Laya.Sprite`
   - 全槽 224×30 / 半槽 112×30
   - 类型背景 + 花色点数 + 名称
   - 参考：DOM 的 `EquipUI.ts`

**验证**：在 EntryScene 中渲染几张卡牌和武将牌预览

## Phase 3: 玩家框（C2）

**目标**：SelfSeat 和 OtherSeat 组件完成，状态预创建 + 可见性切换

1. **SelfSeat.ts**（Laya.Script 组件）
   - 挂在 GameScene 的 self-seat 节点上
   - 武将头像区（单将/双将模式）
   - 8 种状态图预创建（fanmian/diezhi/jiu/playing/responding/sos/selected/diaohu）
   - 阵营背景 + 阵营/身份图标
   - 武将名显示（势力背景 + 名称文字 + 势力图标）
   - 手牌数显示（`game/hand/{kingdom}.png`）
   - 座位号（`game/seat_num/self/{num}.png`）
   - 体力值渲染（委托给 HpRenderer）
   - 比例 scale 1.3，transformOrigin 右下角
   - 参考：DOM 的 `self-seat.ts`

2. **OtherSeat.ts**（Laya.Script 组件）
   - 挂在动态创建的 seat 节点上
   - 与 SelfSeat 相同功能 + 以下差异：
   - 浮动动画（Laya.Tween）
   - 装备区显示
   - 武将名竖排 90° 旋转
   - 比例 1.5
   - 参考：DOM 的 `other-seat.ts`

3. **HpRenderer.ts**
   - `renderHp(container, cfg, resources)`
   - maxHp < 5：竖排体力珠（绿/黄/红/灰）
   - maxHp >= 5：数字文本 + 单体力珠
   - 护甲显示
   - 参考：DOM 的 `hp-utils.ts`

4. **EquipLayout.ts**
   - `layoutEquip(items, self): EquipSlot[]`
   - 武器/防具/马/宝物布局规则
   - 参考：DOM 的 `equip-layout.ts`

**验证**：GameScene 中 SelfSeat 和 1 个 OtherSeat 正确渲染，状态切换正常

## Phase 4: 游戏场景（C3）

**目标**：完整游戏预览场景，包含座位布局、卡牌管理、移动动画

1. **GameScene.ts** 结构搭建
   - 背景图片
   - 2-12 人座位布局（复用 DOM 的 `LAYOUTS` 数据）
   - SelfSeat 实例化
   - OtherSeat 动态创建和定位
   - 操作区（底部 240px 半透明背景）
   - 手牌区（黄色虚线边框）
   - 处理区（红色虚线边框，屏幕中央 1320×195）

2. **CardTracker.ts** — 卡牌追踪系统
   - `_cardMap: Map<number, Laya.Sprite>` — ID → 卡牌节点
   - `_nextCardId` — 唯一 ID 生成器
   - `handCards: number[]` / `processCards: number[]` — 管理数组
   - 参考：DOM 的卡牌追踪系统

3. **手牌/处理区渲染**
   - 间隔计算 + 溢出重叠
   - 展开/收起 hover（`Laya.Event.MOUSE_OVER` / `MOUSE_OUT`）
   - 点击固定展开
   - 处理区居中排列

4. **TweenEngine.ts** — 补间引擎
   - `Laya.Tween.to()` 方法用于属性补间
   - 缓动查找表（cubic-bezier 101 采样点）
   - 参考：DOM 的 rAF 补间系统

5. **卡牌移动动画**（playMoveAnimation）
   - 区域类型定义（PublicArea / PrivateArea / AreaRef）
   - 源位置计算（牌堆=右上角，后备区=左上角，公共区=屏幕中央，私人区=座位中心）
   - 管理区目标（手牌/处理区）直接加入管理
   - 非管理区目标 Laya.Tween 补间 + 可选淡出
   - 贝塞尔曲线（二次贝塞尔，bezierCount=2 时激活）
   - 参考：DOM 的 `playMoveAnimation`

6. **预览按钮**
   - 12 个移动场景按钮（牌堆→手牌、手牌→处理等）
   - 手牌/处理区 +/- 按钮
   - 清空处理区按钮
   - 模式切换按钮（单/双将、势力/身份、人数）

7. **处理区清空**
   - 快照当前卡牌
   - 半透明遮罩覆盖
   - 5 秒后 Laya.Tween 渐出删除
   - 参考：DOM 的 `_clearProcessArea`

**验证**：完整游戏预览场景可交互，卡牌移动动画流畅

## Phase 5: 精细打磨（C4）

1. **CardInfoPopup** — 卡牌信息弹窗（hover 显示牌名/花色/描述）
2. **判定区预览** — 乐不思蜀/兵粮寸断/闪电 hover 弹窗
3. **大厅场景完善** — 房间列表、创建房间、加入房间
4. **桌位场景完善** — 座位管理、准备/开始

## 关键设计决策

1. **不用 Widget 建造器**：LayaAir 有 `Laya.Image`、`Laya.Text`、`Laya.Box` 等类，用简单工厂函数代替链式调用。

2. **动画用 Laya.Tween**：`Laya.Tween.to(node, { x: targetX, y: targetY }, duration, Laya.Ease.customEase(...))`。Laya.Tween 是 Canvas/WebGL 渲染，比 DOM + Web Animations 高效得多。

3. **场景用 Laya.Scene**：IDE 创建 `.ls` 场景文件，代码中 `Laya.Scene.open('Game.ls')` 切换。场景节点树直接挂载脚本。

4. **坐标系统**：LayaAir 节点用 `x`/`y` 属性定位（相对于父节点），与 DOM 的 `left`/`top` 不同。1920×1080 设计分辨率保持一致。

5. **节点层级替代 z-index**：LayaAir 用 `parent.addChild()` 顺序控制层级，`setChildIndex()` 调整。

6. **事件系统**：`Laya.Event.MOUSE_OVER`、`MOUSE_OUT`、`CLICK` 替代 DOM 事件。

7. **资源加载**：`Laya.loader.load(url, Laya.Handler.create(this, callback))` 异步加载图片。

8. **共享代码不变**：`shared/` 直接 import，vite.config.ts 配置 `@shared` 别名。

## 旧项目关键模式参考

以下是从 `old/resgsv1/clientv0/` 中提取的关键 LayaAir 开发模式，新项目应遵循：

1. **`@regClass()`** 装饰所有 `Laya.Script` 子类，注册到引擎运行时
2. **`declare owner: UIWidgetType;`** 声明脚本挂载的节点类型
3. **`this.owner.getComponent(CompClass)`** 跨组件通信
4. **对象池**：`Laya.Pool.getItemByCreateFun()` 高频创建/销毁的对象
5. **Dirty Flag 渲染**：`onUpdate()` 中检查脏标记，按需更新
6. **Property Setter 触发渲染**：setter 中直接调用 render 方法
7. **消息驱动架构**：Colyseus 消息 → `execMessage()` → 分发到对应 handler
8. **场景缓存**：非活跃场景移入 pool，不销毁

## 验证方式

每个 Phase 完成后：
1. 在 LayaAir IDE 中运行项目
2. 编译无错误（`tsc --noEmit`）
3. Phase 1: 场景切换正常
4. Phase 2: 预制体渲染正确
5. Phase 3: SelfSeat + OtherSeat 完整显示
6. Phase 4: 游戏场景完整可交互，动画流畅（30+ 卡牌不卡顿）
7. Phase 5: 弹窗和细节功能正常
