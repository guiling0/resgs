# 技能框架分析：旧框架问题与新框架方向

> 分析材料：`docs/definitions/skill.md`（六要素权威定义）、`docs/definitions/meta-rules.md`、`.scratch/porting/pending-impl.md` 技能节；旧框架 `old/resgsv1` git HEAD（skill.types.ts + 裸衣/武圣/制衡/急救四个技能实例）；新框架 `shared/core/skill/`（Skill/Effect/SkillTypes）、`shared/core/room/manager/SkillManager.ts`、`EventManager.ts`、`shared/core/event/UseSkillEvent.ts`。
> 日期：2026-07-18。

---

## 一、旧框架的真实问题（逐技能拆解）

### 1.1 裸衣（xuchu.ts）——延时类效果无声明式支持

实现方式：`cost` 中 `data.ratedDrawnum--`（消耗=直接改事件字段，不触发事件，印证"操作不必然触发事件"）；`effect` 中 `room.addEffect('luoyi.delay', from)` + `effect.setData('turn', room.currentTurn)`。

问题：
- **延时效果本体与技能分离**：`luoyi.delay` 的定义不在本文件（注释"来源：国战许褚"），标准包许褚对国战扩展形成**字符串隐式跨包依赖**——脆弱性 + 晦涩性。
- **作用域手工管理**："本回合有效"靠 `setData('turn', ...)` 存值、由 delay 效果自行比对当前回合，无"回合结束自动失效"的声明式生命周期。每个延时技能都要重复这套快照/比对/清理逻辑——冗余。

### 1.2 武圣（guanyu.ts）——转化技（视为技）不是一等公民

实现方式：两个 `TriggerEffect` 分别挂 `NeedUseCard3` / `NeedPlayCard3`，共用 `wusheng_choose` 构造选择器；选择器 `onChange` 中手工 `sha.addSubCard/delSubCard`，并把虚拟牌塞进 `this._use_or_play_vcard`；`sha.custom.method = 1`；`cost` 仅 `return true`。

问题：
- **转化协议全是隐藏约定**：`_use_or_play_vcard` 私有字段是选择器与 needUseCard 流程之间的暗通道；`custom.method = 1` 是魔法数字；框架层面没有"将 X 牌当 Y 使用"的声明式表达——晦涩性 + 脆弱性。
- **样板重复**：使用/打出两个时机必须写两个几乎相同的 Effect（data 类型不同无法合并）；且与急救的转化样板（createVirtualCardByNone + createChooseCard + onChange 维护子卡）高度雷同——冗余。
- **六要素失真**：转化技的"消耗"实为使用牌本身，`cost` 沦为形式化 `return true`，规则语义没有落在对应槽位上。

### 1.3 制衡（sunquan.ts）——约束靠时机模型隐含，配置弱类型

实现方式：挂 `PlayPhaseProceeding`（出牌阶段空闲点无限循环时机）；`skill_cost` 选择器 `count: [1, -1]`（-1 = 不限，魔法值）；`cost` 中执行弃牌并以其返回值作为发动成功判定；`effect` 摸等量牌。

问题：
- **"出牌阶段限一次"没有任何显式表达**：限次语义完全依赖"空闲点循环 + 每时机默认 maxTimes=1"的隐含组合，读代码无法直接得知该技能一个阶段能发几次——晦涩性（pending-impl A8 已裁定废弃无限循环 play_phase 模型，改为独立时机枚举）。
- 同文件救援〖救援〗把效果 `data.baseRecover++` 写进 `cost`：因为框架规定"cost 返回真值才算发动"，无消耗技能只能把唯一效果塞进 cost 槽位——**消耗/效果语义混用**，再次印证六要素映射失真。

### 1.4 急救（huatuo.ts）——上下文弱类型 + 转化样板再现

实现方式：`context()` 返回 `{ canuses: data.cards }` 塞进上下文；选择器中 `use_tao.method ?? 1`、`tao.custom.method`、`this._use_or_play_vcard` 同武圣一套暗协议；`can_trigger` 中 `!player.inturn` 判回合外。

问题：
- **TriggerEffectContext 是 `[key: string]: any`**：`canuses` 这类自由键无类型约束，req_result 巨型嵌套结构——晦涩 + 违背强类型指标。
- 转化样板与武圣重复（第三次出现同一套虚拟牌维护代码）——冗余。

### 1.5 旧框架结构性问题汇总

1. **`TriggerEffectData` 巨型配置接口**：anim/audio/auto_log/auto_sort/auto_directline/exclues_limitAni/not_viewas 等表现层字段与 can_trigger/cost/effect 规则层字段混在同一接口——关注点不分离，僵化。
2. **`getSelectors` 双层嵌套 + `skill_cost` 魔法键名**：`{ skill_cost: () => ({ selectors, options }) }`，选择器定义方式晦涩。
3. **效果=单 effect 回调**：规则要求"按描述顺序依次处理各个能执行的效果"，旧框架没有多效果结构，复杂技能只能在一个回调里手写顺序与跳过逻辑。
4. **无消耗技能无正规路径**：如救援所示，被迫借用 cost 槽位。
5. **上下文与请求结果弱类型**（`[key:string]: any`）。

---

## 二、新框架现状与缺口（对照 skill.md 六要素逐项检查)

新框架已达成的设计改进：触发/状态可共存于同一 Effect（`has_trigger`/`has_state` 双标志 + `stateCallbacks`，SkillManager 双索引注册）；表现字段收拢进 `EffectSettings`；`condition`（非时机条件）与 `can_trigger`（时机条件）拆分；`_currentEffect` 嵌套栈自动为派生事件填 reason/effect；StateEffectType 状态技查询 `getStates` 在位。

逐要素检查：

| 六要素 | 现状 | 缺口 |
|---|---|---|
| **时机** | TimingName 枚举齐全；效果按时机+优先级（General>Equip>Card>Rule）双级索引 | ① `EffectData.trigger` 仅单时机（旧版支持数组），`Effect.inTrigger` 为 `===` 单值比较——武圣类双时机技能仍要拆两个 Effect；② "时机结束"信号（潜袭阻断寒冰剑）无实现；③ `GameStartAfter` 等枚举待补（A1） |
| **条件** | `can_trigger` + `condition` 拆分在位 | "轮到发动者选择时才检查条件"（meta-rules 王异例）依赖 trigger 主循环，而主循环未实现 |
| **发动角色** | `EffectContext.from` 在位 | — |
| **目标** | `EffectContext` 有 index signature；UseSkillEvent 对 `ctx.targets` 排序 | ① `targets`/`cards` 未做为正式强类型字段（弱类型延续，违背 CLAUDE.md TS 指标）；② `EffectData.selectors`（含 `cost` 选择器）**没有任何消费方**——"skill_cost 含 player 选择器自动设为目标"的映射约定（pending-impl 技能节）未落地 |
| **消耗** | 单 `cost` 回调 = 严格单操作（用户裁定），天然满足原子性 | **无消耗技能走不通**：`UseSkillEvent.exec` 中无 cost 回调 → `costResult` 为 undefined → `if (!costResult)` 直接 finalize，`used` 恒为 false，effect 永不执行。skill.md 规定无消耗技能"声明+选目标即发动、然后执行唯一效果"，且需前置检查"唯一效果能执行才可发动"（特殊约定◆）——两者均无实现载体 |
| **效果** | 单 `effect` 回调；状态类效果经 `stateCallbacks` 与触发类共存（达成新设计目标） | ① 无"至少一个触发类效果 + 按描述顺序依次执行 + 逐个判定可执行性、跳过不可执行者不阻断后续"的多效果结构（pending-impl use-skill 节"效果过滤"）；② 延时类效果：`EffectOptions.autoRemove` 与工厂函数 `autoRemove()` **只有类型定义、无任何消费方**——裸衣模式（发动时注册带作用域的后续 Effect）目前是空架子 |

### 发动流程整体缺口（六要素之外）

1. **触发主循环未闭环**：`EventManager.trigger` 扫描出可用效果后仅记录日志，`// TODO Phase 7: askForSkillInvoke → create UseSkillEvent → exec`。即：**询问（=声明技能名）、创建 UseSkillEvent、逆时针逐人轮询、"每人从未选项中选一个→重复直至无人可选"（meta-rules 多角色结算 b）全部缺失**。`times` 计数容器已声明但无人累加——"同一技能每人一次 vs 计数型可多次"（明哲②）无从生效。
2. **maxTimes 取值设计不当**：扫描期对每个候选效果调用完整 `context()` 回调仅为读取 `maxTimes`——context 可能含副作用且每次 check 重复执行，晦涩 + 性能隐患。
3. **明置未走明置事件**：UseSkillEvent 第 3 步直接 `turnTo(true)`，已裁定改为 ChangeStateEvent(open) + deferredOpens（A2）。
4. **`settings.forced`（mute/cost）无消费方**：必发技能"无需询问直接发动"与"套一层询问"的分叉逻辑无处落地。
5. **"发动了此技能"判定点未区分**：有消耗（消耗全部执行完毕后）与无消耗（声明并选目标后）两种判定点，现只有前者（`cost 成功 → used=true`）。
6. **需要使用/打出牌链路（转化技宿主）待整体重设计**：用户已明确指示不在现架构修补（pending-impl "架构重设计"节），武圣/急救类技能依赖该链路，M2 前需先出 `use-card-design.md`。

---

## 三、修改方向（不含代码）

按依赖顺序排列：

1. **完成触发主循环（Phase 7，最高优先）**：在 `EventManager.trigger` 中实现——逆时针逐人轮询；轮到某人时才评估 `can_trigger`/`condition`（落实"发动时检查条件"）；按优先级取该人可选效果集→询问（forced=mute 直发/cost 询问）→创建 UseSkillEvent 执行→`times` 累加→本人从未选项继续，直至无人可选；支持"时机结束"信号提前终止本时机；回合角色离场时轮询起点改为其下家。
2. **UseSkillEvent 按两种发动流程分叉**：有消耗流程保持"cost 成功=发动"；新增无消耗流程——前置检查唯一效果可执行→声明+选目标即 `used=true`→执行唯一效果。消除"无 cost 回调=未发动"的现行错误语义，救援类技能不再借用 cost 槽位。
3. **接线 selectors**：发动询问阶段消费 `EffectData.selectors.cost`，选择结果强类型写入 context；player 类型选择器结果自动设为 `targets`（落实定义映射）。同步将 `EffectContext` 的 `targets`/`cards`/`choose` 等常用字段正式化为强类型。
4. **延时类效果落地**：实现 `autoRemove`/`refreshs` 的消费逻辑，形成"发动时 addEffect + 声明式作用域（本回合/本阶段）自动清理"的标准模式；以许褚裸衣为首个验证用例，完成后按用户指示回填 skill.md 参考节。
5. **转化技一等公民化**：结合"需要使用/打出牌"链路重设计（`use-card-design.md`），提供声明式视为配置（目标牌名、可用牌过滤、`settings.viewas`），由框架统一生成选择器与虚拟牌维护，消灭武圣/急救式样板与 `_use_or_play_vcard` 暗协议。
6. **多效果结构决策（需与用户讨论）**：是否将 `EffectData.effect` 演进为有序效果列表（逐个判定可执行性、跳过不阻断），以贴合"按描述顺序依次处理各个能执行的效果"；或维持单回调、由技能自写顺序——前者更贴定义但增加框架复杂度，需权衡"不必要的复杂性"。
7. **maxTimes 与 context 解耦**：将最大发动次数改为独立字段/轻量函数（并区分"普通=1"与"按计数/按伤害点数可多次"两型），扫描期不再执行完整 `context()`。
8. **小项**：trigger 支持多时机数组（或明确"一时机一 Effect"取舍并文档化）；明置改走 ChangeStateEvent（A2）；补 `GameStartAfter` 枚举（A1）；`_orderToPriority` 的 1-6 序号与 4 值枚举错位映射宜简化为直接按 PriorityType 迭代。

---

## 附：关键文件索引

| 内容 | 路径 |
|---|---|
| 六要素权威定义 | `docs/definitions/skill.md` |
| 元规则（结算顺序/优先级） | `docs/definitions/meta-rules.md` |
| 差异待办（技能/使用链路节） | `.scratch/porting/pending-impl.md` |
| 旧框架类型 | `old/resgsv1` @ `server/src/core/skill/skill.types.ts`（git HEAD） |
| 旧技能实例 | 同上 `server/src/extensions/standard/generals/{wei/xuchu,shu/guanyu,wu/sunquan,qun/huatuo}.ts` |
| 新框架 | `shared/core/skill/{Skill,Effect,SkillTypes}.ts`、`shared/core/room/manager/SkillManager.ts` |
| 触发主循环（TODO Phase 7 所在） | `shared/core/room/manager/EventManager.ts` |
| 技能使用事件 | `shared/core/event/UseSkillEvent.ts` |
