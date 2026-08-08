---
title: General
type: api
id: api/entity/General
rules:
  - terms/card-terms/GeneralCard
tags: [API, 实体域（entity/）]
---

# General（类）

- 签名：`export class General extends Mark`
- 位置：../../shared/core/entity/General.ts#L20
- 规则：[GeneralCard](../../rules/terms/card-terms/GeneralCard.md)

> 武将——继承 Mark 具备标记能力。
> 源数据（sourceData）在构造时解析（hp 数组展开/多势力分割/trueName），属性经 getter 动态暴露。
> @rules terms/card-terms/GeneralCard
> @description 武将牌实体——角色武将牌的运行时对象

**类内成员：**

| 成员 | 签名 | 规则 | 说明 |
|---|---|---|---|
| room | `readonly room: Room` |  |  |
| area | `area?: Area` |  | 当前所在区域（加入区域时设置，移出时清空） |
| _skin | `private _skin: string` |  | 当前使用的皮肤名（默认取源数据 defaultSkin，可经 setSkin 切换） |
| put | `@sync() put: boolean` |  | 放置方式（true=明置，false=暗置）——TODO(R8): 国战明置机制同步语义细化 |
| sourceData | `readonly sourceData: {` |  | 解析后的源数据（外部可读，状态效果修正直接改此数据） |
| constructor | ` constructor(room: Room, data: GeneralData)` |  |  |
| id | ` get id(): string` |  | 武将 id（即武将名） |
| name | ` get name(): string` |  | 武将名 |
| trueName | ` get trueName(): string` |  | 真名（name 去前缀段，如 sp.zhaoyun → zhaoyun） |
| kingdom | ` get kingdom(): string` |  | 主势力 |
| kingdom2 | ` get kingdom2(): string` |  | 次势力（双势力武将，单势力时同主势力） |
| kingdoms | ` get kingdoms(): string[]` |  | 势力列表（多势力分割） |
| hp | ` get hp(): number` |  | 当前体力值 |
| hpmax | ` get hpmax(): number` |  | 体力上限 |
| shield | ` get shield(): number` |  | 护盾值 |
| gender | ` get gender(): Gender` |  | 性别 |
| skills | ` get skills(): string[]` |  | 技能名列表（副本） |
| lord | ` get lord(): boolean` |  | 是否为主公/君主 |
| isWars | ` get isWars(): boolean` |  | 是否为国战武将 |
| enable | ` get enable(): boolean` |  | 是否启用 |
| isDual | ` isDual(): boolean` |  | 是否为双势力武将 |
| sameAs | ` sameAs(to: General): boolean` |  | 是否与目标武将势力有交集 |
| isLord | ` isLord(): boolean` |  | 是否为主公 |
| turnTo | ` turnTo(put: boolean): void` |  | 设置放置方式（明置/暗置） |
| resources | ` get resources(): GeneralSkin[] \| undefined` |  | 皮肤列表（按武将真名共享，未注册返回 undefined） |
| setSkin | ` setSkin(skinName: string): void` |  | 切换当前使用的皮肤 |
| getSkin | ` getSkin(skinName: string = this._skin): GeneralSkin \| undefined` |  | 指定皮肤（缺省当前使用的皮肤） |
| getImage | ` getImage(skinName: string = this._skin): string` |  | 插画（完整 url） |
| getDualImage | ` getDualImage(skinName: string = this._skin): string` |  | 特殊插画-他人视角（未配置回退插画） |
| getDualImageSelf | ` getDualImageSelf(skinName: string = this._skin): string` |  | 特殊插画-自己视角（未配置回退他人视角） |
| getDeathAudio | ` getDeathAudio(skinName: string = this._skin): string` |  | 阵亡语音（完整 url；audios.death 第一条为阵亡语音） |
| getDeathText | ` getDeathText(skinName: string = this._skin): string` |  | 阵亡语音文字（翻译表） |
