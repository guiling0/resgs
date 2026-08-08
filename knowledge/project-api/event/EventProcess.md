---
title: EventProcess
type: api
id: api/event/EventProcess
rules:
  - terms/description-terms/cmd
  - terms/game-flow-terms/complete
  - terms/resolution-terms/process
  - terms/resolution-terms/settle
tags: [API, 事件域（logic/event/）]
---

# EventProcess（类）

- 签名：`export abstract class EventProcess<T extends EventType = EventType>`
- 位置：../../shared/core/logic/event/EventProcess.ts#L28
- 规则：[process](../../rules/terms/resolution-terms/process.md)

> 事件执行基类——权威端结算流程载体（logic 层，仅 host 注入后运行）。
> 子类在构造函数填充 eventTriggers/endTriggers（Timing[]），
> exec() 按顺序执行各时机：before → 触发调度（room.event.trigger）→ after。
> 事件栈、历史、fuhuos/deferredOpens 均经 room.host 运行态访问（镜像端为空）。
> @rules terms/resolution-terms/process
> @description 事件在合理的时机插入发生后所进行的处理过程

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  | 所属房间 |
| type | `readonly type: T` |  | 事件类型 |
| id | `readonly id: number` |  | 事件自增 id |
| eventData | `readonly eventData: EventData<T>` |  | 预设事件数据（按事件类型推导） |
| eventTriggers | `eventTriggers: Timing<TimingTrigger>[]` |  | 进行中的时机序列 |
| endTriggers | `endTriggers: Timing<TimingTrigger>[]` |  | 结束时的时机序列 |
| trigger | `trigger?: TimingName` |  | 当前触发时机名 |
| isEnd | `isEnd: boolean` |  | 是否已结束（开始执行 endTriggers） |
| isComplete | `isComplete: boolean` |  | 是否完全完成（已 cleanup） |
| triggerable | `triggerable: boolean` |  | 是否允许继续触发（设为 false 跳过后续 trigger） |
| triggerNot | `triggerNot: boolean` |  | 是否跳过触发（业务逻辑跳过，区别于 triggerable） |
| data | `data: Record<string, unknown>` |  | 运行时自定义数据（如 buqu 等结算标记） |
| source | ` get source(): EventProcess \| undefined` |  | 源事件（事件栈上层，取自事件数据） |
| source | ` set source(v: EventProcess \| undefined): Effect \| undefined` |  |  |
| effect | ` get effect(): Effect \| undefined` |  | 触发事件的技能效果（取自事件数据） |
| effect | ` set effect(v: Effect \| undefined): string \| undefined` |  |  |
| reason | ` get reason(): string \| undefined` |  | 触发原因（取自事件数据） |
| reason | ` set reason(v: string \| undefined): Player \| undefined` |  |  |
| [cmd](../../rules/terms/description-terms/cmd.md) | ` get cmd(): Player \| undefined` | [cmd](../../rules/terms/description-terms/cmd.md) | 指令角色（A令B中的A，取自事件数据） |
| cmd | ` set cmd(v: Player \| undefined): void` |  |  |
| _processingCards | `private _processingCards: { card: GameCard` |  | 移动到处理区的牌及其原因（processCompleted 中清理） |
| _trackProcessingCard | ` _trackProcessingCard(card: GameCard, reason: string): void` |  | 将牌移动到处理区时的回调，基类自动收集 |
| constructor | ` constructor(room: Room, type: T, eventData: EventData<T>): boolean` |  |  |
| check | ` check(): boolean` |  | 事件合法性检查（返回 false 则不执行） |
| checkEvent | ` checkEvent(): boolean` |  | 每轮触发前检查是否继续 |
| init | ` protected async init(): Promise<void>` |  | 初始化：设置 source → 推入事件栈（Turn→turnStack，Phase→phaseStack，其余→eventStack） |
| [exec](../../rules/terms/resolution-terms/settle.md) | ` async exec(): Promise<this>` | [settle](../../rules/terms/resolution-terms/settle.md) | 主执行循环：eventTriggers → endTriggers → processCompleted |
| triggerFunc | ` async triggerFunc(timing: Timing<TimingTrigger>, step?: number): Promise<void>` |  | 触发单个时机：注入 refreshs → before → 触发调度 → after |
| injectRefreshs | ` private injectRefreshs(timing: Timing<TimingTrigger>): void` |  | 将时机匹配的 refreshs 注入到 Timing 的 before/after |
| processCompleted | ` async processCompleted(): Promise<void>` |  | 事件完成后的清理：出栈 + 处理区牌清理 + fuhuos/deferredOpens 排空 + AllEventEnd |
| findArea | ` findArea(card: GameCard): { type: AreaType; areaId: AreaId } \| undefined` |  | 查询牌所在区域（经 card.area 直接读取） |
| insert | ` insert(timings: (TimingName \| Timing<TimingTrigger>): void` |  | 在时机序列中插入新时机。 |
| registerBefore | ` registerBefore(timingName: string, fn: (room: Room, data: unknown): void` |  | 在指定时机的 before 列表注册回调（时机不存在则自动创建），this 绑定当前事件 |
| registerAfter | ` registerAfter(timingName: string, fn: (room: Room, data: unknown): void` |  | 在指定时机的 after 列表注册回调（时机不存在则自动创建），this 绑定当前事件 |
| removeCallback | ` removeCallback(timingName: string, fn: (...args: unknown[]): void` |  | 从 before/after 中移除指定回调（传入原始未 bind 的函数引用） |
| bindWithMark | ` protected bindWithMark(fn: Function): (room: Room, data: unknown) => Promise<unknown>` |  | 包装 bind 并标记原始函数引用，便于 removeCallback 匹配 |
| findOrCreate | ` private findOrCreate(timingName: string): Timing<TimingTrigger>` |  | 查找或创建一个 Timing（优先查 eventTriggers，再查 endTriggers） |
| end | ` async end(): Promise<this>` |  | 结束事件（isEnd=true，triggerable=false） |
| [complete](../../rules/terms/game-flow-terms/complete.md) | ` async complete(): Promise<this>` | [complete](../../rules/terms/game-flow-terms/complete.md) | 强制完成事件（终止流程/回合） |

### createTiming（函数）

- 签名：`export function createTiming(`
- 位置：../../shared/core/logic/event/EventProcess.ts#L12

> 创建 Timing 对象的便捷工厂（各事件子类统一使用）
