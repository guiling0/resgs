# StateEffectType 完整回调签名

> 来源：[SkillTypes.ts](../../shared/core/skill/SkillTypes.ts) `StateCallbackMap` 接口。
> 所有回调的 `this` 指向 Effect 实例，可通过 `this.player`、`this.room` 访问上下文。

## 距离与座次

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `Distance_Correct` | `distanceCorrect` | `(from: Player, to: Player) => number` | 距离修正值，所有修正累计到最终距离；距离最小为 1 |
| `Distance_Fixed` | `distanceFixed` | `(from: Player, to: Player) => number` | 距离终值，直接返回 |
| `NotCalcSeat` | `notCalcSeat` | `(from: Player) => boolean` | 不计入座次计算 |
| `NotCalcDistance` | `notCalcDistance` | `(from: Player) => boolean` | 不计入距离限制 |

## 手牌上限

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `MaxHand_Initial` | `maxHandInitial` | `(from: Player) => number` | 手牌上限初始值，多个取最大 |
| `MaxHand_Correct` | `maxHandCorrect` | `(from: Player) => number` | 手牌上限修正值，累计到上限 |
| `MaxHand_Fixed` | `maxHandFixed` | `(from: Player) => number` | 手牌上限终值，多个取最大 |
| `MaxHand_Exclude` | `maxHandExclude` | `(from: Player, card: GameCard) => boolean` | 指定卡牌不计入手牌上限 |

## 攻击范围

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `Range_Initial` | `rangeInitial` | `(from: Player) => number` | 攻击范围初始值（一般由武器提供） |
| `Range_Correct` | `rangeCorrect` | `(from: Player) => number` | 攻击范围修正值 |
| `Range_Fixed` | `rangeFixed` | `(from: Player) => number` | 攻击范围终值 |
| `Range_Within` | `rangeWithin` | `(from: Player, to: Player) => boolean` | to 视为在 from 攻击范围内 |
| `Range_Without` | `rangeWithout` | `(from: Player, to: Player) => boolean` | to 视为不在 from 攻击范围内（优先级高于 Within） |

## 禁止类（Prohibit）

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `Prohibit_Open` | `prohibitOpen` | `(player: Player, generals: General[], reason: string) => boolean` | 不能明置武将牌 |
| `Prohibit_Close` | `prohibitClose` | `(player: Player, generals: General[], reason: string) => boolean` | 不能暗置武将牌 |
| `Prohibit_Discards` | `prohibitDiscards` | `(player: Player, card: GameCard, reason: string) => boolean` | 不能弃置卡牌 |
| `Prohibit_ObtainCards` | `prohibitObtainCards` | `(player: Player, card: GameCard, reason: string) => boolean` | 不能获得卡牌 |
| `Prohibit_RecoverHp` | `prohibitRecoverHp` | `(player: Player, number: number, reason: string) => boolean` | 不能回复体力 |
| `Prohibit_LoseHp` | `prohibitLoseHp` | `(player: Player, number: number, reason: string) => boolean` | 不能失去体力 |
| `Prohibit_UseCard` | `prohibitUseCard` | `(from: Player, card: VirtualCard, target: Player\|VirtualCard, response: VirtualCard\|undefined, reason: string) => boolean` | 不能使用卡牌 |
| `Prohibit_DropCard` | `prohibitDropCard` | `(from: Player, card: VirtualCard, response: VirtualCard\|undefined, reason: string) => boolean` | 不能打出卡牌 |
| `Prohibit_Pindian` | `prohibitPindian` | `(player: Player, targets: Player[], reason: string) => boolean` | 不能拼点 |

## 目标修改（TargetMod）

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `TargetMod_PassTimeCheck` | `targetModPassTimeCheck` | `(from: Player, card: VirtualCard, target: Player) => boolean` | 无次数限制 |
| `TargetMod_PassCountingTime` | `targetModPassCountingTime` | `(from: Player, card: VirtualCard, target: Player) => boolean` | 不计入次数限制 |
| `TargetMod_CorrectTime` | `targetModCorrectTime` | `(from: Player, card: VirtualCard, target: Player) => number` | 修改次数限制 |
| `TargetMod_PassDistanceCheck` | `targetModPassDistanceCheck` | `(from: Player, card: VirtualCard, target: Player) => boolean` | 无距离限制 |
| `TargetMod_CardLimit_ChooseCount` | `targetModCardLimitChooseCount` | `(from: Player, card: VirtualCard) => SelectCount` | 修改卡牌选择数量限制 |
| `TargetMod_CardLimit_Distance` | `targetModCardLimitDistance` | `(from: Player, card: VirtualCard) => number` | 修改卡牌选择距离限制 |

## 视为/转化类

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `Regard_CardData` | `regardCardData` | `(card: GameCard, property: string, source: any) => any` | 卡牌基本信息视为其他 |
| `Regard_Kingdom` | `regardKindom` | `(player: Player) => string` | 视为某势力 |
| `Regard_OnlyBig` | `regardOnlyBig` | `(player: Player) => boolean` | 视为唯一大势力 |
| `Regard_OnlyBig_Fixed` | `regardOnlyBigFixed` | `(player: Player, result: string[]) => boolean` | 视为唯一大势力_最终结果 |
| `Regard_ArrayCondition` | `regardArrayCondition` | `(from: Player, to: Player, type: 'quene'\|'siege_from'\|'siege_to') => boolean` | 视为满足阵法条件 |
| `Regard_PindianResult` | `regardPindianResult` | `(cards: Map<Player, GameCard>, reason: string) => Player\|Player[]` | 拼点结果视为 |

## 技能/卡牌可用性

| StateEffectType | 方法 | 签名 | 说明 |
|---|---|---|---|
| `Skill_Invalidity` | `skillInvalidity` | `(effect: Effect) => boolean` | 技能失效（全局） |
| `LikeHandToUse` | `likeHandToUse` | `(from: Player, card: GameCard) => boolean` | 如手牌般使用 |
| `LikeHandToDrop` | `likeHandToDrop` | `(from: Player, card: GameCard) => boolean` | 如手牌般打出 |
| `IgnoreHeadAndDeputy` | `ignoreHeadAndDeputy` | `(effect: Effect) => boolean` | 忽略主副将技标签条件 |
| `FieldCardEyes` | `fieldCardEyes` | `(from: Player, card: GameCard) => boolean` | 卡牌对某玩家永远可见 |
