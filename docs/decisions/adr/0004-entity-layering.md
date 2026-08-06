# 0004-实体分层：数据/查询与能力注入

> 状态：已修订 · 日期：2026-08-02（2026-08-05 修订：query 并入 entity、能力经 host/view 注入、取消编译期隔离表述）

## 背景

重构后状态同步 = 纯消息收发（snapshot/patches），客户端 apply 镜像。需明确 Room/Player 等实体对象在**权威端**（服务端/单机 host）与**镜像端**（客户端）的形态与边界。

## 结论

### 1. 实体不区分 Server/Client，只写一份

实体类 = **同步状态字段 + 派生 getter + 查询**（query/ 并入实体：查询即通用方法，依赖两端同步数据与静态注册表），天然两端共享，不建 `ServerRoom`/`ClientRoom` 双类。分层发生在**能力层**：

| 层 | 内容 | 运行端 |
|---|---|---|
| `entity/` | Room/Player/GameCard/General/Skill/Effect/Area：SyncNode 状态 + 派生 getter（losshp/handMax/attackRange/distanceTo 等）+ 查询（getCards 等）+ 能力方法（薄转发 host/view） | 两端 |
| `registry/` | sgs 静态注册表（技能/效果/牌/武将定义） | 两端（客户端用于显示与查询） |
| `logic/` | PlayerHost/RoomHost 等能力实现 + RoomEngine（事件栈 + 流程控制）+ EventProcess/EventManager + 触发类 Effect 执行 | 仅权威端运行时存在 |
| `view/` | PlayerView 等镜像端能力实现（应用同步消息、本地展示） | 仅镜像端运行时存在 |

### 2. 能力注入：host/view 双接口

实体的「非查询能力」按端拆分接口，实体类统一声明、运行时注入实现：

```ts
interface PlayerHost { turnOver(): void; moveCard(...): void; }   // 权威端能力
interface PlayerView  { applyMoveSync(...): void; }               // 镜像端能力

class Player implements PlayerHost, PlayerView {
    host?: PlayerHost;  // 权威端注入（PlayerLogic），内部持有 player 引用
    view?: PlayerView;  // 镜像端注入（PlayerViewModel），内部持有 player 引用
    turnOver() { return this.host?.turnOver() ?? 抛错; }          // 薄转发
}

class PlayerLogic     implements PlayerHost { ... }   // logic/
class PlayerViewModel implements PlayerView { ... }   // view/
```

- 分发规则：`host ?? view ?? 抛错`（两端只会注入其一）
- 查询（getCard/getCards/派生 getter）直接放实体本体，不经 host/view——两端一致，无需分发
- 同名方法应避免签名不一致；语义不同的操作（如权威端发起移动 vs 镜像端应用移动结果）建议改名（`moveCard` / `applyMoveSync`），不写类型重载
- 实现类（PlayerLogic 等）持有实体引用访问数据，属内部细节；外部调用方只经实体方法分发，无双点访问
- 注入时机：权威端由 RoomEngine 创建实体后注入（工厂封装）；镜像端由 snapshot 构建后注入

### 3. 可镜像边界 = 纯查询（无副作用）

- **可镜像**（两端执行）：状态字段、派生 getter、查询、状态类 Effect 的查询修正
- **不可镜像**（仅权威端）：事件调度（exec/trigger）、触发类 Effect（can_trigger/choose/cost/effect）、牌移动/伤害等副作用结算
- 权威端结算与客户端显示**走同一查询函数**（Player.getter → 查询），天然一致

### 4. 隔离 = 运行时注入差异，非编译期

- shared 两端同源（同一份代码），单机模式客户端本地即 host（需运行逻辑类）——**不存在「客户端产物不含 logic」**，编译期类型隔离不成立
- 端差异由**实例注入**决定：权威端实体注入 host，镜像端注入 view，未注入侧调用能力方法抛错兜底
- 能力接口（PlayerHost/PlayerView）分离的价值在**类型标注端归属**：逻辑实现被编译器强制覆盖全部 host 能力，镜像实现同理

### 5. 状态类 Effect 纯查询约束（写入 R3 约束）

- 状态类 Effect 的 condition 与修正函数**只读已同步状态**（hp/marks/区域/装备），不得依赖权威端临时数据（当前事件栈、内部缓存）
- 违反此约束的"假状态技"（实际有副作用）必须拆为触发技（与"触发/状态互斥"设计一致）
- 原因：客户端需本地计算派生值（零额外同步），必须保证修正函数可独立运行

### 6. 区域镜像一致

- Area（牌堆/手牌/装备/判定区）两端存在相同结构：权威端负责变更结算，镜像端接收牌移动消息，用通用 add/remove（含消息携带的位置索引）维护镜像，达成同步
- random 位置由权威端 `room.randomInt` 定下标并随消息下发，镜像端按索引插入，不使用自身随机

### 7. 单机与联机形态统一

- 单机：`new RoomEngine(room)` 运行 + LocalTransport 投副本 → 客户端 Room 状态树（两个对象，不共享引用）
- 联机：RoomEngine 在远端服务端，客户端同样只收消息
- AI 沙盒（R4+）：沙盒内 `new RoomEngine(cloneRoom)` 隔离实例，与日常镜像解耦

## 关联

- porting-map 技术决策 18；R0 spec（目录结构）；R1 spec（GameClient = RoomView 边界）；R3 spec（状态类 Effect 纯查询约束）
