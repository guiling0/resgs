---
title: AITypes
type: api
id: api/types/AITypes
tags: [API, 类型域（types/）]
---

# AITypes（类型域（types/））

### StrategyType（枚举）

- 签名：`export enum StrategyType`
- 位置：../../shared/core/types/AITypes.ts#L6

> 策略类型：对应不同游戏询问

**枚举值：**

| 值 | 成员 | 说明 |
|---|---|---|
| `PlayPhase` | PlayPhase | 出牌阶段 |
| `UseCard` | UseCard | 使用牌 |
| `PlayCard` | PlayCard | 打出牌 |
| `Active` | Active | 主动技 |
| `Respond` | Respond | 响应 |
| `ChooseCards` | ChooseCards | 选牌 |
| `ChooseTargets` | ChooseTargets | 选目标 |
| `ChoosePlayers` | ChoosePlayers | 选角色 |
| `Invoke` | Invoke | 询问发动 |

### AIContext（接口）

- 签名：`export interface AIContext`
- 位置：../../shared/core/types/AITypes.ts#L28

> AI 上下文

### SkillAI（接口）

- 签名：`export interface SkillAI`
- 位置：../../shared/core/types/AITypes.ts#L40

> 技能 AI 配置（技能注册时附带）
