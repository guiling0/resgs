# 标记系统需求设计文档

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 落点：R0 引擎地基（实体层）· 日期：2026-08-02

## 一、背景与目标

标记（Mark）是挂在任意实体（Room/Player/GameCard/General/Skill/Effect）上的键值数据，是技能效果的通用存储载体（计数、状态、牌堆引用、临时数据）。重构后的标记系统需满足：

1. **纯 TS 化**：弃 Colyseus MapSchema，状态经 `@syncMap` 自动同步（协议分散原则）
2. **继承链清晰**：`MarkHost` 作为统一接口注入各实体，标记方法零重复实现
3. **覆盖旧项目全量语义**：追齐 old/resgsv1 所有标记用法（含 markChanges 广播、可见性、富文本）
4. **吸取已验证的增强**：备份项目的 key 标签机制、FreeKill 的生命周期后缀与命名约定

## 二、现状调研（三处实现对比）

| 维度 | old/resgsv1 | 备份项目（.tmp/shared-backup） | FreeKill |
|---|---|---|---|
| 存储 | `Custom._mark: {key: {value, options}}` | `marksMap: MapSchema<MarkState>` + `data` 快照 | `Player.mark: table<string, any>` 纯表 |
| 继承 | mixin 混入各实体（Custom） | `MarkHost` 接口 + 类委托 `MarkMethods` | 基类 `Base.Player` 内置 `self.mark` |
| API | set/get/has/remove/increase/reduce/removeAll/getAll | set/get/has/remove/count/push/unpush/clear + parseKey | set/get/add/remove/has/getTable/getNames |
| 值类型 | MarkValue（number/string/boolean/数组） | 任意值，JSON.stringify 入 MarkState.value | 任意（number/string/table），cbor 序列化 |
| 键约定 | 无 | `key@tag`（clearMark 按标签清理，@never 保留） | `xxx` 隐藏 / `@xxx` 带数据 / `@@xxx` 隐藏数据 / `@$xxx` 卡牌数组 / `@&xxx` 武将数组 |
| 生命周期 | 无（手动 remove） | clearMark(tag) 手动清理 | `-phase/-turn/-round/-noclear` 后缀 + Room 层自动清理；卡牌加 `-inhand/-inarea/-public` |
| 可见性 | options.visible（boolean/string[]） | MarkOptions.visible（boolean/string[]） | 前缀约定 |
| 富文本 | options.values（CustomStringValue[]） | MarkState.values + parseType（img/card/general/command/prompt/suit/color/card_number/area） | UI 端按前缀渲染 |
| 区域引用 | 无 | ref（refType/refArea/refMark，客户端维护 value） | 私人牌堆（derived_piles）另路 |
| 同步 | `room.markChanges[]` 广播，客户端应用 | Colyseus MapSchema 自动同步（旧方案） | cbor serialize 全量 |
| 系统标记 | 散落使用 | 无集中枚举 | `MarkEnum` 集中枚举（手牌上限/次数距离绕过/技能失效/防具无效/转换技状态/野心家等） |
| 双层 API | 无 | 无 | `Player:setMark`（纯数据）+ `Room:addPlayerMark`（带通知） |

## 三、需求

### 3.1 功能需求

- **F1 通用存储**：任意实现 `MarkHost` 的实体可 set/get/has/remove 标记，值类型不限（number/string/boolean/数组/对象）
- **F2 数值运算**：countMark（±n）、pushMark/unpushMark（数组去重增删）
- **F3 键标签**：`key@tag` 支持按标签分组清理（`clearMark(tag)`），`@never` 标记不被全量清理
- **F4 生命周期**：`-phase/-turn/-round` 后缀标记在阶段/回合/轮次结束时自动清除（对照 FreeKill）；`-noclear` 标记豁免
- **F5 可见性**：标记可配置 `visible`（boolean 或玩家列表），同步给客户端的可见性按观察者过滤（预留 visibilityFor hook）
- **F6 富文本与解析**：string 标记可携带 `values`（动态显示内容）与 `parseType`（img/card/general/command/prompt/suit/color/card_number/area），客户端按类型渲染
- **F7 区域引用**：`ref` 支持标记值动态引用某区域某标记（如观星牌堆引用），value 由客户端按引用维护
- **F8 来源记录**：标记可记录 `source`（来源技能/效果）
- **F9 系统标记枚举**：集中定义系统级标记常量（MarkEnum），替代旧项目散落字符串
- **F10 序列化**：全实体标记随 snapshot 序列化（toJSON/fromJSON），子对象可独立快照

### 3.2 非功能需求

- N1 纯 TS 零依赖，不依赖 Colyseus
- N2 同步走 `@syncMap` 自动 patch（改动经 StateStore flush 发送）
- N3 接口零重复：方法仅一处实现（MarkMethods），各实体委托
- N4 与旧项目 API 面兼容（sgs 全局可访问 getMark/setMark 等，扩展包消费者无感）

## 四、设计

### 4.1 继承链

```
MarkHost（接口：room / data / marksMap / _markKeyMap）
   ▲
   ├── Player        （手牌/装备/判定/武将牌区域持有者）
   ├── GameCard / VirtualCard
   ├── General
   ├── Skill / Effect
   └── Room          （房间级标记：当前轮次/野心家等）

实现方式：MarkMethods 单例（纯函数 + this 绑定），各实体 implements MarkHost 并委托——
  class Player implements MarkHost {
    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    ...
  }
```

- `marksMap`：`StateMap<string, MarkState>`（@syncMap 容器，替代旧 MapSchema）
- `data`：`Record<string, any>` 运行时值快照（key 标签原始键，不序列化，仅服务端读）
- `_markKeyMap`：`Map<string, Set<string>>` 原始键 → 全键（含标签）索引，支撑 clearMark/生命周期清理

### 4.2 MarkState（同步载荷）

```ts
class MarkState extends SyncNode {
  key: string;        // 全键，含标签与生命周期后缀，如 "guanxing@never" / "add_max_cards-turn"
  value: string;      // JSON.stringify 序列化值
  source: string;     // 来源技能/效果名
  visible: string[];  // 可见玩家列表（空 = 全不可见；填满 = 全部可见）；服务端始终全量，客户端按可见性过滤
  values: string;     // 富文本动态值（JSON）
  parseType: string;  // 解析类型（F6）
  refType: string;    // 'static' | 'area'
  refArea: string;    // 区域标识
  refMark: string;    // 引用的标记名
}
```

### 4.3 API 契约（MarkMethods）

```ts
setMark<T>(key, value, options?)   // options: source/visible/values/parseType/ref
getMark<T>(key): T                 // 忽略标签，取原始键值
hasMark(key): boolean
removeMark(key)                    // 删除原始键及其全部带标签变体
countMark(key, delta, options?)    // 数值加减（至多减到 0 由调用方控制）
pushMark<T>(key, item, options?)   // 数组去重追加
unpushMark<T>(key, item)           // 数组移除
clearMark(tag?)                    // 按标签清理；无标签时清理全部非 @never 标记
parseKey(rawKey): { originalKey, tags, lifeSuffix }   // 拆解 key@tag 与 -phase/-turn/-round
```

### 4.4 生命周期自动清理（新增，吸取 FreeKill）

- 键形如 `xxx-turn` / `xxx-phase` / `xxx-round`（后缀来自 `MarkMethods.LifeSuffix` 常量）
- 挂接点：TurnEvent 结束、PhaseEvent 结束、round 切换时调用 `clearMarkByLifecycle('phase'|'turn'|'round')`，仅清理带对应后缀且非 `-noclear` 的标记
- `-noclear` 后缀标记豁免一切自动清理（仅手动 remove）

### 4.5 系统标记枚举（新增，吸取 FreeKill）

```ts
export const MarkEnum = {
  AddMaxCards: 'AddMaxCards',           // 手牌上限 +N
  AddMaxCardsInTurn: 'AddMaxCards-turn',
  MinusMaxCards: 'MinusMaxCards',
  BypassTimesLimit: 'BypassTimesLimit', // 使用牌无次数限制
  BypassDistancesLimit: 'BypassDistancesLimit',
  InvalidSkills: 'InvalidSkills',       // 失效技能表
  PlayerRemoved: 'PlayerRemoved',       // 不计入距离座次
  SwitchSkillPre: '__switcher_',        // 转换技状态前缀
  QuestSkillPre: '__questPre_',         // 使命技状态前缀
  // ... 随内容增量扩充
} as const;
```

### 4.6 同步接入（@syncMap 自动 patch）

- `PlayerState.marks: StateMap<string, MarkState>` 声明 `@syncMap`
- 标记 set/remove 时写入 marksMap（产生 map.add/map.remove patch）与 data 快照
- **可见性过滤**：serialize 时按观察者过滤 `visible`（visibilityFor hook，porting-map 风险 8 提前落地）；服务端内存中始终全量
- 生命周期清理同样走 marksMap，客户端收到 map.remove 自动消失

### 4.7 与旧项目 API 兼容

- `sgs.getMark/setMark/...` 无需——旧扩展经 `player.getMark(key)` 等实例方法访问，保持同名签名即可
- `MarkValue` 类型别名保留（number/string/boolean/数组/对象），JSON 序列化兼容旧值形态

## 五、验收标准

1. **继承链**：Player/GameCard/General/Skill/Effect/Room 六类均实现 MarkHost，方法零重复（单例委托）
2. **冒烟**（R0 冒烟脚本）：set→flush→apply 回放一致；countMark/pushMark 语义正确；`@tag` 分组清理与 `@never` 豁免正确
3. **生命周期**：`-turn` 标记在回合结束时自动消失（观察台消息流见 map.remove）
4. **可见性**：visible 过滤在 serialize 层生效（预留 hook 可注入观察者）
5. **同步**：标记变化经 @syncMap 产生正确 patch，客户端镜像一致
6. **兼容**：旧项目标记用法（如杀次数 `__sha_times`、武将牌上/旁 hasMark 查询）在新 API 下可表达

## 六、关联

- **R0 引擎地基**：实体层实现（4.1）+ 冒烟（验收 2）
- **R3 技能框架**：标记系统首个真实消费者（技能计数/状态标记）；@syncMap 标记显示在座位 UI
- **R5 复杂机制**：生命周期全档（-phase 与延时锦囊、-turn 与转换技状态）；MarkEnum 扩充
- **依赖**：R0 状态层（StateMap/@syncMap/StateStore flush）先行就绪
- **参考**：`.tmp/shared-backup/core/mark/MarkTypes.ts`（标签机制）、`.tmp/shared-backup/core/schema/MarkState.ts`（载荷结构）、`.tmp/freekill-core/lua/core/player.lua` + `ltk/server/mark_enum.lua`（生命周期/枚举/命名约定）
