# R0-04 实体层（Entity Layer）范围确认

> 所属 spec：[specs/r0-engine-foundation.md](../specs/r0-engine-foundation.md) · 工单：[issues/r0.md](../issues/r0.md) · 架构依据：[ADR 0004](../../decisions/adr/0004-entity-layering.md)

## 一、目标与范围

实现**六类实体 + MarkHost 通用化**，实体只写一份（**状态字段 + 纯派生 getter**），两端共享，不含任何逻辑执行（事件/技能/结算属后续增量）。

| 实体 | 职责 |
|---|---|
| Player | 玩家（体力/身份/势力/装备/手牌引用/标记） |
| GameCard | 实体牌（花色/点数/颜色/属性） |
| VirtualCard | 虚拟牌（由牌/技能合成的临时牌，不占实体位） |
| General | 武将（势力/体力/性别/技能名表） |
| Skill | 技能（来源武将/装备引用、效果列表、失效状态、标记） |
| Effect | 效果（触发配置/来源技能，行为回调留 R3） |

## 二、实体字段范围（对照来源）

### 2.1 状态字段（@sync 同步，以备份 *State 为对照基准）

| 实体 | 主要状态字段 |
|---|---|
| Player | playerId/username/seat/role/kingdom/gender/hp/maxhp/death/phase/inturn + marks/hand 容器（**最小集**，区域相关留 R1） |
| GameCard | id/name/suit/color/number/attr + marks |
| General | id/name/trueName/kingdom/kingdoms/hp/hpmax/shield/gender/skills/lord/isWars + marks |
| Skill | id/name/playerId/sourceGeneral/sourceEquip/sourceEffect/invalids/preshow/showui + marks |
| Effect | id/name/skillId/playerId/type（触发/状态）+ marks |

> 状态字段**全量对照**备份 `*State`（schema/）逐项核对，剔除已废弃项；实体 id 统一 string。

### 2.2 派生 getter（纯查询，无副作用，两端可独立运行）

- Player：`losshp`、`handMax`、`attackRange`、`distanceTo`、`getCards`（基础版）
- GameCard：`type`/`subType`/`color`（suit→color 派生）
- General：`hp`/`hpmax` 数组展开（`[体力, 上限, 护甲]`）
- Skill：`isOpen`、`isInvalid`、`check`（仅数据判定，不触发）

### 2.3 MarkHost 通用化（任意实体可存键值标记）

- 接口：`room` + `data`（运行时快照，不序列化）+ `marks`（`@syncMap` 容器）+ `_markKeyMap`（原始键→全键索引）
- `MarkMethods` 单例委托：`setMark/getMark/hasMark/removeMark/countMark/pushMark/unpushMark/clearMark/parseKey`
- 六实体均 `implements MarkHost`，方法零重复
- 同步：marks 经 `@syncMap` 自动产 patch（如 `player/p1/marks/guanxing`）
- 详细设计/生命周期/可见性见 [mark-system-design.md](../mark-system-design.md)

## 三、验收标准

1. **六实体均实现 MarkHost**，标记方法单例委托、零重复；tsc 通过（shared 独立 tsconfig）
2. **实体状态对照表**：与备份 `*State` 逐字段核对完成，标注承接/废弃
3. **标记冒烟**（mark-system-design 第五章验收 2）：`set→flush→apply` 回放一致；`countMark/pushMark` 语义正确；`@tag` 分组清理与 `@never` 豁免正确
4. **实体同步**：实体 `@sync` 字段挂载后变化产生正确 path patch（如 `player/p1/kingdom`、`player/p1/marks/{key}`），镜像 apply 回放一致
5. **派生 getter 纯查询**：只读已同步状态、无副作用，host 与镜像结果一致（ADR 0004 约束）
6. **已有回归**：smoke-state / smoke-transport 全部通过

## 四、依赖关系

```
R0-01/02/03（state 层：装饰器/容器/StateStore）✅ 已就绪
        │
        ▼
R0-04 实体层（本增量）
        │
        ├──► R0-05 事件框架（EventProcess 操作 Skill/Effect 来源）
        ├──► R1 对局骨架（Room 状态树/区域管理/GameClient 用实体）
        ├──► R3 技能框架（Skill/Effect 行为执行）
        └──► R5 标准内容（武将/牌数据实例化）
```

- **依赖**：state 层（@sync/@syncMap/@syncArray、StateStore、applyPatches）
- **被依赖**：R0-05 起全部核心增量
- **参考素材**：`.tmp/shared-backup/core/`（card/general/player/skill/mark 实体 + schema 状态类）、`old/resgsv1/server/src/core/`（card/player/general/skill/custom 追平目标）

## 五、边界（本增量不做）

- 事件框架 / 触发调度（R0-05）
- 技能/效果行为执行（R3，Effect 仅承载数据与类型）
- 区域管理与牌移动（R1）
- sgs 注册表与 Builder（R0-06）
- 数据加载与武将壳子生成（R6）
- GameClient / 观察台（R1）

## 六、范围决策（2026-08-03 已确认）

1. **实体目录**：迁移到 `shared/core/entity/`（六实体 + MarkHost 集中）
2. **派生 getter**：直接实现 R1 所需——Player `losshp/handMax/attackRange/distanceTo/getCards`（基础版），GameCard `type/subType/color`，General hp 数组展开，Skill `isOpen/isInvalid/check`（仅数据判定）
3. **实体 id**：统一 string
4. **Player 状态字段**：最小集（R1 够用）——playerId/username/seat/role/kingdom/gender/hp/maxhp/death/phase/inturn + marks/hand
5. **区域引用**：本期不实现（GameCard 所在区域、Player 手牌/装备/判定区结构留 R1 区域管理）
6. **能力注入结构（2026-08-05 修订）**：实体类 = 数据 + 派生 getter + 查询 + 能力方法（薄转发 host/view）；非查询能力分 `PlayerHost`（权威端）/`PlayerView`（镜像端）双接口，实现类 `PlayerLogic`（logic/）/`PlayerViewModel`（view/）经实例注入，仅注入其一，运行时注入差异决定行为；查询（getCards 等）直接放实体本体。详见 [ADR 0004](../../decisions/adr/0004-entity-layering.md)
