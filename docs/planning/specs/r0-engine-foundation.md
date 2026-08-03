# R0 引擎地基（Engine Foundation）

> 所属计划：[plans/porting-map.md](../plans/porting-map.md) · 步骤拆分：[issues/r0.md](../issues/r0.md)

## 需求

第一阶段「核心引擎」的地基：让纯 TS 引擎具备**状态同步、实体、事件调度、全局注册、消息传输**五大基础能力，后续 R1-R4 全部建立其上。

1. **状态层**（`core/state/`）：
   - `StateStore`：pending 收集 + 帧级 flush（16ms tick）+ 事务批次（`beginBatch/endBatch`）+ apply 枢纽（snapshot/patch 应用）
   - `StateMap / StateArray / StateNode`：统一容器，嵌套挂载时注入 `_store`/`_path`，深层变化自动产 patch
   - 装饰器：`@sync / @syncMap / @syncArray`（legacy 属性装饰器，`experimentalDecorators` + `useDefineForClassFields:false`）
   - `StatePatch` 强类型联合：`set / map.add / map.remove / arr.insert / arr.remove / replace`
2. **实体**：GameCard / VirtualCard / General / Player / Skill / Effect，全部实现 `MarkHost`（任意实体可存键值标记）；**实体分层按 [ADR 0004](../../decisions/adr/0004-entity-layering.md)**——实体只写一份（状态 + 纯派生 getter），能力层分 `entity/`（两端）、`query/`（纯查询，两端）、`registry/`（两端）、`logic/`（仅权威端）
3. **事件框架**：EventProcess（eventTriggers/endTriggers + `exec()`）+ EventTypes（TimingName 80+，`const enum`）+ EventManager（trigger 调度、refreshs、效果索引、PriorityType 优先级：General→Equip→Card→Rule）
4. **全局注册**：`sgs` 单例 + `register.ts`（枚举/Builder 挂载，幂等），API 面与 `extension/resgs-ext-temp/types/global.d.ts` 契约逐项核对
5. **传输层补齐**：ITransport / LocalTransport / codec（serialize/deserialize）/ Envelope 消息类型——R0 前已有雏形，补齐缺口
6. **扩展契约**：global.d.ts 核对，扩展加载不崩

## 目标

- shared 纯 TS 零依赖可编译（独立 tsconfig 只检查 shared）
- 冒烟脚本证明：装饰器 setter→flush→apply 回放一致；事务批次原子性；扩展加载正常
- sgs 注册表 API 与既有扩展包（resgs-ext-temp）兼容

## 前置依赖

- 无（重构起点）；参考 `.tmp/shared-backup/core/`（11 状态类/事件类/register/factories 实现细节）与 `old/resgsv1/server/src/core/`（旧项目行为）

## 验收标准

1. `tsc` 通过（shared 独立 tsconfig）
2. 冒烟脚本：
   - 装饰器字段 setter 后 flush 产生正确 set patch，apply 到镜像对象后两对象回放一致
   - 事务批次内多字段变化 = 一条 patches 消息，帧 tick 遇 batch 跳过
   - `@syncMap/@syncArray` 增删产生对应 map/arr patch
3. 扩展包加载：resgs-ext-temp 导入后 sgs.cards/generals/skills/effects 有数据，无崩溃
4. EventManager 冒烟：构造最小 EventProcess + 触发，效果按优先级顺序执行（本项可在 R1 联调，R0 仅框架可跑通单元冒烟）

## 产出物

- `shared/core/state/`（StateStore/StateMap/StateArray/StateNode/decorators/StatePatch）
- `shared/core/entity/`（GameCard/VirtualCard/General/Player/Skill/Effect + MarkHost，状态 + 派生 getter）
- `shared/core/query/`（纯查询运行时雏形：distance/maxHand 等，两端共享）
- `shared/core/registry/`（sgs 静态注册表：skills/effects/cards/generals）
- `shared/core/logic/`（RoomEngine 雏形 + EventProcess/EventTypes/EventManager，仅权威端）
- `shared/core/sgs.ts` + `register.ts` 重写
- `shared/core/transport/` 补齐
- 冒烟脚本（`shared/test/smoke-r0.ts`）
