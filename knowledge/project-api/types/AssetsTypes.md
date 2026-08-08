---
title: AssetsTypes
type: api
id: api/types/AssetsTypes
tags: [API, 类型域（types/）]
---

# AssetsTypes（类型域（types/））

### CardAnimation（接口）

- 签名：`export interface CardAnimation`
- 位置：../../shared/core/types/AssetsTypes.ts#L2

> 卡牌动画分支（含该分支专属配音）

### CardAssets（接口）

- 签名：`export interface CardAssets`
- 位置：../../shared/core/types/AssetsTypes.ts#L14

> 游戏牌资源（未配置字段走默认路径模板）

### AudioData（接口）

- 签名：`export interface AudioData`
- 位置：../../shared/core/types/AssetsTypes.ts#L22

> 配音条目（武将皮肤下配置，数组顺序即语音序号）

### SkillTranslation（接口）

- 签名：`export interface SkillTranslation`
- 位置：../../shared/core/types/AssetsTypes.ts#L30

> 技能翻译（GeneralConfig.skills 下按技能全名配置，只写入翻译表）

### GeneralSkin（接口）

- 签名：`export interface GeneralSkin`
- 位置：../../shared/core/types/AssetsTypes.ts#L40

> 武将皮肤（default 为原画）

### GeneralInfo（接口）

- 签名：`export interface GeneralInfo`
- 位置：../../shared/core/types/AssetsTypes.ts#L54

> 武将信息（按武将全名入 generalInfoMap，全字段注入翻译表）

### GeneralConfig（接口）

- 签名：`export interface GeneralConfig`
- 位置：../../shared/core/types/AssetsTypes.ts#L70

> 武将资源配置（注册武将时一并提供：信息/技能翻译/皮肤）
