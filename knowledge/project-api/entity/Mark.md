---
title: Mark
type: api
id: api/entity/Mark
rules:
  - terms/card-op-terms/removeMark
tags: [API, 实体域（entity/）]
---

# Mark（类）

- 签名：`export abstract class Mark extends StateNode`
- 位置：../../shared/core/entity/Mark.ts#L65

> 标记抽象类——需要标记能力的实体继承本类（Room/Player/GameCard/General/Skill/Effect）。
> 标记键格式：key[@tag[:data]...][-when | --when]，见 docs/develop/mark-key.md。
> data 为运行时值快照（不序列化），marks 经 @syncMap 自动同步（全量传给镜像端，可见性仅影响 UI 显示）。

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| data | `data: Record<string, unknown>` |  | 运行时值快照（原始键 → 值，仅权威端读） |
| marks | `@syncMap() marks: StateMap<string, unknown>` |  | 标记容器（key 为含标签全键，value 为可序列化值） |
| parseKey | ` parseKey(rawKey: string): ParsedMarkKey` |  | 拆解标记键 |
| hasTag | ` hasTag(rawKey: string, tagName: string): boolean` |  | 是否存在标签 |
| getTagData | ` getTagData(rawKey: string, tagName: string): string \| undefined` |  | 读取标签数据 |
| setMark | ` setMark<T>(rawKey: string, value: T, visible?: string[]): void` |  | 写入标记：@card/@general 值对象转 id 存储，原对象（数组浅拷贝）备份至 data；@ref 存 true 占位 |
| getMark | ` getMark<T>(rawKey: string, assert?: T \| (new (...args: never[]): T \| undefined` |  | 读取标记（忽略标签与生命周期，按原始键读取；@ref 依赖区域与卡牌实体，待实现） |
| hasMark | ` hasMark(rawKey: string): boolean` |  | 是否存在标记（忽略标签） |
| [removeMark](../../rules/terms/card-op-terms/removeMark.md) | ` removeMark(rawKey: string): void` | [removeMark](../../rules/terms/card-op-terms/removeMark.md) | 弃标记：删除指定标记 |
| countMark | ` countMark(rawKey: string, delta: number): void` |  | 数值加减标记 |
| pushMark | ` pushMark<T>(rawKey: string, item: T): void` |  | 数组去重追加 |
| unpushMark | ` unpushMark<T>(rawKey: string, item: T): void` |  | 数组移除 |
| clearMark | ` clearMark(tag?: string): void` |  | 按标签清理标记；无标签时清理全部非 @never 标记 |
| clearMarkByLife | ` clearMarkByLife(when: string, before: boolean): void` |  | 按生命周期时机清理（该时机后 / 该时机前），优先级高于 @never |
| setVisible | ` setVisible(rawKey: string, playerIds: string[]): void` |  | 设置部分可见玩家（覆盖 key 默认显示语义，仅权威端） |
| getVisible | ` getVisible(rawKey: string): string[] \| undefined` |  | 读取部分可见玩家列表 |
| clearVisible | ` clearVisible(rawKey: string): void` |  | 清除部分可见设置（恢复 key 标签默认显示语义） |

### MarkTag（接口）

- 签名：`export interface MarkTag`
- 位置：../../shared/core/entity/Mark.ts#L6

> 解析后的标签

### MarkLife（接口）

- 签名：`export interface MarkLife`
- 位置：../../shared/core/entity/Mark.ts#L12

> 生命周期

### ParsedMarkKey（接口）

- 签名：`export interface ParsedMarkKey`
- 位置：../../shared/core/entity/Mark.ts#L19

> 标记键解析结果

### parseMarkKey（函数）

- 签名：`export function parseMarkKey(rawKey: string): ParsedMarkKey {`
- 位置：../../shared/core/entity/Mark.ts#L35

> 拆解标记键：key[@tag[:data]...][-when | --when]
