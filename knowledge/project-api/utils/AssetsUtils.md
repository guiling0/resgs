---
title: AssetsUtils
type: api
id: api/utils/AssetsUtils
tags: [API, 工具域（utils/）]
---

# AssetsUtils（工具域（utils/））

### CardGender（类型别名）

- 签名：`export type CardGender = 'male' | 'female';`
- 位置：../../shared/core/utils/AssetsUtils.ts#L2

> 卡牌配音性别

### defaultCardImage（函数）

- 签名：`export function defaultCardImage(name: string): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L5

> 牌图默认路径

### defaultCardAudio（函数）

- 签名：`export function defaultCardAudio(name: string, gender: CardGender): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L10

> 卡牌默认配音路径（无动画分支专属配音时使用）

### defaultGeneralImage（函数）

- 签名：`export function defaultGeneralImage(name: string, skin: string): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L15

> 武将插画默认路径

### defaultGeneralImageDual（函数）

- 签名：`export function defaultGeneralImageDual(name: string, skin: string): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L20

> 武将特殊插画-他人视角默认路径

### defaultGeneralImageDualSelf（函数）

- 签名：`export function defaultGeneralImageDualSelf(name: string, skin: string): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L25

> 武将特殊插画-自己视角默认路径

### defaultGeneralDeath（函数）

- 签名：`export function defaultGeneralDeath(name: string, skin: string): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L30

> 武将阵亡语音默认路径

### defaultSkillAudio（函数）

- 签名：`export function defaultSkillAudio(general: string, skin: string, skill: string, order: number): string {`
- 位置：../../shared/core/utils/AssetsUtils.ts#L35

> 技能语音默认路径（{武将真名}/{皮肤}/{技能名}{序号}）
