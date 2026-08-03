# 0004-实体分层：可镜像逻辑 vs 权威逻辑

> 状态：已定案 · 日期：2026-08-02

## 背景

重构后状态同步 = 纯消息收发（snapshot/patches），客户端 apply 镜像。需明确 Room/Player 等实体对象在**权威端**（服务端/单机 host）与**镜像端**（客户端）的形态与边界。

## 结论

### 1. 实体不区分 Server/Client，只写一份

实体类 = **状态字段 + 纯派生 getter**，天然两端共享，不建 `ServerRoom`/`ClientRoom` 双类。分层发生在**能力层**：

| 层 | 内容 | 运行端 |
|---|---|---|
| `entity/` | Room/Player/GameCard/General/Skill/Effect：SyncNode 状态 + 派生 getter（losshp/handMax/attackRange/distanceTo 等） | 两端 |
| `query/` | 纯查询运行时：distance/maxHand/atkRange/targetMod/prohibit/filter 等，调用 registry 中状态类 Effect 做修正 | 两端 |
| `registry/` | sgs 静态注册表（技能/效果/牌/武将定义） | 两端（客户端用于显示与查询） |
| `logic/` | RoomEngine（9 Manager + 事件栈 + 流程控制）+ EventProcess/EventManager + 触发类 Effect 执行 | **仅权威端** |

### 2. 可镜像边界 = 纯查询（无副作用）

- **可镜像**（两端执行）：状态字段、派生 getter、状态类 Effect 的查询修正
- **不可镜像**（仅权威端）：事件调度（exec/trigger）、触发类 Effect（can_trigger/choose/cost/effect）、牌移动/伤害等副作用结算
- 权威端结算与客户端显示**走同一查询函数**（Player.getter → query 模块），天然一致

### 3. 状态类 Effect 纯查询约束（写入 R3 约束）

- 状态类 Effect 的 condition 与修正函数**只读已同步状态**（hp/marks/区域/装备），不得依赖权威端临时数据（当前事件栈、内部缓存）
- 违反此约束的"假状态技"（实际有副作用）必须拆为触发技（与"触发/状态互斥"设计一致）
- 原因：客户端需本地计算派生值（零额外同步），必须保证修正函数可独立运行

### 4. 打包隔离

- 客户端产物仅含 `entity + query + registry + transport/client`，不含 `logic/`
- TS 类型层面隔离：客户端拿不到 RoomEngine，误调副作用方法编译不通过

### 5. 单机与联机形态统一

- 单机：`new RoomEngine(room)` 运行 + LocalTransport 投副本 → 客户端 Room 状态树（两个对象，不共享引用）
- 联机：RoomEngine 在远端服务端，客户端同样只收消息
- AI 沙盒（R4+）：沙盒内 `new RoomEngine(cloneRoom)` 隔离实例，与日常镜像解耦

## 关联

- porting-map 技术决策 18；R0 spec（目录结构）；R1 spec（GameClient = RoomView 边界）；R3 spec（状态类 Effect 纯查询约束）
