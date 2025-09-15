/** 游戏时机 */
export const enum EventTriggers {
    None = 'None',
    /** 游戏结束时 */ GameEnd = 'GameEnd',

    //游戏准备
    /** 游戏开始前 */ GameStartBefore = 'GameStartBefore',
    /** 确定身份 */ AssignRoles = 'AssignRoles',
    /** 分配座次 */ AdjustSeats = 'AdjustSeats',
    /** 选择武将 */ ChooseGeneral = 'ChooseGeneral',
    /** 选择武将牌后 */ ChooseGeneralAfter = 'ChooseGeneralAfter',
    /** 初始化属性 等同于选择体力牌 */ InitProperty = 'InitProperty',
    /** 分配起始手牌 */ InitHandCard = 'InitHandCard',

    //回合相关时机
    /** 登场后 */ OnStaged = 'OnStaged',
    /** 游戏开始时 */ GameStarted = 'GameStarted',
    /** 每轮开始时 */ CircleStarted = 'CircleStarted',
    /** 每轮结束时 */ CircleEnd = 'CircleEnd',

    /** 休整结束后 */ RestOver = 'RestOver',
    /** 回合开始前 */ TurnStartBefore = 'TurnStartBefore',
    /** 回合开始时 */ TurnStart = 'TurnStart',
    /** 回合开始后 */ TurnStarted = 'TurnStarted',
    /** 回合结束时 */ TurnEnd = 'TurnEnd',
    /** 回合结束后 */ TurnEnded = 'TurnEnded',
    //准备阶段
    /** 准备阶段开始前 */ ReadyPhaseStart = 'ReadyPhaseStart',
    /** 准备阶段开始时 */ ReadyPhaseStarted = 'ReadyPhaseStarted',
    /** 准备阶段 */ ReadyPhaseProceeding = 'ReadyPhaseProceeding',
    /** 准备阶段结束时 */ ReadyPhaseEnd = 'ReadyPhaseEnd',
    //判定阶段
    /** 判定阶段开始前 */ JudgePhaseStart = 'JudgePhaseStart',
    /** 判定阶段开始时 */ JudgePhaseStarted = 'JudgePhaseStarted',
    /** 判定阶段 */ JudgePhaseProceeding = 'JudgePhaseProceeding',
    /** 判定阶段结束时 */ JudgePhaseEnd = 'JudgePhaseEnd',
    //摸牌阶段
    /** 摸牌阶段开始前 */ DrawPhaseStart = 'DrawPhaseStart',
    /** 摸牌阶段开始时1 */ DrawPhaseStarted = 'DrawPhaseStarted',
    /** 摸牌阶段开始时2 */ DrawPhaseStartedAfter = 'DrawPhaseStartedAfter',
    /** 摸牌阶段 */ DrawPhaseProceeding = 'DrawPhaseProceeding',
    /** 摸牌阶段结束时 */ DrawPhaseEnd = 'DrawPhaseEnd',
    //出牌阶段
    /** 出牌阶段开始前 */ PlayPhaseStart = 'PlayPhaseStart',
    /** 出牌阶段开始时 */ PlayPhaseStarted = 'PlayPhaseStarted',
    /** 出牌阶段 */ PlayPhaseProceeding = 'PlayPhaseProceeding',
    /** 出牌阶段结束时 */ PlayPhaseEnd = 'PlayPhaseEnd',
    //弃牌阶段
    /** 弃牌阶段开始前 */ DropPhaseStart = 'DropPhaseStart',
    /** 弃牌阶段开始时 */ DropPhaseStarted = 'DropPhaseStarted',
    /** 弃牌阶段 */ DropPhaseProceeding = 'DropPhaseProceeding',
    /** 弃牌阶段结束时 */ DropPhaseEnd = 'DropPhaseEnd',
    //结束阶段
    /** 结束阶段开始前 */ EndPhaseStart = 'EndPhaseStart',
    /** 结束阶段开始时 */ EndPhaseStarted = 'EndPhaseStarted',
    /** 结束阶段 */ EndPhaseProceeding = 'EndPhaseProceeding',
    /** 结束阶段结束时 */ EndPhaseEnd = 'EndPhaseEnd',

    //移动事件时机
    /** 确定移动的牌时 */ MoveCardFixed = 'MoveCardFixed',
    /** 移动至目标区域前1 */ MoveCardBefore1 = 'MoveCardBefore1',
    /** 移动至目标区域前2 */ MoveCardBefore2 = 'MoveCardBefore2',
    /** 移动至目标区域后1 */ MoveCardAfter1 = 'MoveCardAfter1',
    /** 移动至目标区域后2 */ MoveCardAfter2 = 'MoveCardAfter2',
    /** 移动结算结束后 */ MoveCardEnd = 'MoveCardEnd',

    //使用事件时机
    /** 需要使用牌时1*/ NeedUseCard1 = 'NeedUseCard1',
    /** 需要使用牌时2 */ NeedUseCard2 = 'NeedUseCard2',
    /** 需要使用牌时2 */ NeedUseCard3 = 'NeedUseCard3',
    /** 声明使用牌后 */ DeclareUseCard = 'DeclareUseCard',
    /** 选择目标后 */ ChooseTarget = 'ChooseTarget',
    /** 牌被使用时 */ CardBeUse = 'CardBeUse',
    /** 指定目标时 */ AssignTarget = 'AssignTarget',
    /** 成为目标时 */ BecomeTarget = 'BecomeTarget',
    /** 指定目标后 */ AssignTargeted = 'AssignTargeted',
    /** 成为目标后 */ BecomeTargeted = 'BecomeTargeted',
    /** 使用结算准备工作结束时 */ UseCardReady = 'UseCardReady',
    /** 对当前目标结算开始时 */ CardEffectStart = 'CardEffectStart',
    /** 对当前目标生效前 */ CardEffectBefore = 'CardEffectBefore',
    /** 被抵消后 */ BeOffset = 'BeOffset',
    /** 对当前目标生效时 */ CardEffect = 'CardEffect',
    /** 对当前目标生效后 */ CardEffected = 'CardEffected',
    /** 使用结算结束后1 */ UseCardEnd1 = 'UseCardEnd1',
    /** 使用结算结束后2 */ UseCardEnd2 = 'UseCardEnd2',
    /** 使用结算结束后3 */ UseCardEnd3 = 'UseCardEnd3',

    //打出事件时机
    /** 需要打出牌时1*/ NeedPlayCard1 = 'NeedPlayCard1',
    /** 需要打出牌时2 */ NeedPlayCard2 = 'NeedPlayCard2',
    /** 需要打出牌时2 */ NeedPlayCard3 = 'NeedPlayCard3',
    /** 牌被打出时 */ CardBePlay = 'CardBePlay',
    /** 打出结算结束后 */ PlayCardEnd = 'PlayCardEnd',

    //拼点事件时机
    /** 进行拼点时 */ Pindian = 'Pindian',
    /** 拼点牌被亮出时 */ PindianShow = 'PindianShow',
    /** 拼点结果确定后 */ PindianResulted = 'PindianResulted',
    /** 拼点结算结束后 */ PindianEnd = 'PindianEnd',

    //牌状态改变事件相关。牌状态改变包含：横置，重置，翻面/叠置/平置，移除，变更，明置，暗置。
    //这些将不作为一个流程实现（与规则集不同），改为操作方法实现。这些时机被触发时提供的是对应操作的数据
    /** 牌状态改变前 */ StateChange = 'StateChange',
    /** 牌状态改变后 */ StateChanged = 'StateChanged',
    /** 牌状态改变结算结束后 */ StateChangeEnd = 'StateChangeEnd',
    //特殊：明置后，明置后统一在返回回合流程或阶段流程时按照明置顺序依次执行。
    /** 明置后 */ Opened = 'Opened',

    //判定事件时机
    /** 判定时 */ Judge = 'Judge',
    /** 成为判定牌后 */ BeJudgeCard = 'BeJudgeCard',
    /** 判定结果确定前1 */ JudgeResult1 = 'JudgeResult1',
    /** 判定结果确定前2 */ JudgeResult2 = 'JudgeResult2',
    /** 判定结果确定后1 */ JudgeResulted1 = 'JudgeResulted1',
    /** 判定结果确定后2 */ JudgeResulted2 = 'JudgeResulted2',
    /** 判定结算结束后 */ JudgeEnd = 'JudgeEnd',

    //伤害事件时机
    /** 伤害结算开始时 */ DamageStart = 'DamageStart',
    /** 造成伤害时1 */ CauseDamage1 = 'CauseDamage1',
    /** 造成伤害时2 */ CauseDamage2 = 'CauseDamage2',
    /** 受到伤害时1 */ InflictDamage1 = 'InflictDamage1',
    /** 受到伤害时2 */ InflictDamage2 = 'InflictDamage2',
    /** 受到伤害时3 */ InflictDamage3 = 'InflictDamage3',
    /** 造成伤害后 */ CauseDamaged = 'CauseDamaged',
    /** 受到伤害后 */ InflictDamaged = 'InflictDamaged',
    /** 伤害结算结束后 */ DamageEnd = 'DamageEnd',

    //失去体力事件时机
    /** 失去体力结算开始时 */ LoseHpStart = 'LoseHpStart',
    /** 失去体力后 */ LoseHp = 'LoseHp',
    /** 失去体力结算结束后 */ LoseHpEnd = 'LoseHpEnd',

    //扣减体力事件流程
    /** 扣减体力前 */ ReduceHpStart = 'ReduceHpStart',
    /** 扣减体力时 */ ReduceHp = 'ReduceHp',
    /** 扣减体力后 */ ReduceHpAfter = 'ReduceHpAfter',
    /** 扣减体力结算结束后 */ ReduceHpEnd = 'ReduceHpEnd',

    //回复体力事件流程
    /** 回复体力前 */ RecoverHpStart = 'RecoverHpStart',
    /** 回复体力后 */ RecoverHpAfter = 'RecoverHpAfter',
    /** 回复体力结算结束后 */ RecoverHpEnd = 'RecoverHpEnd',

    //体力上限改变事件流程
    /** 体力上限改变前 */ MaxHpChangeStart = 'MaxHpChangeStart',
    /** 体力上限改变后 */ MaxHpChangeAfter = 'MaxHpChangeAfter',
    /** 体力上限改变结算结束后 */ MaxHpChangeEnd = 'MaxHpChangeEnd',

    //濒死事件流程
    /** 进入濒死状态时 */ EntryDying = 'EntryDying',
    /** 进入濒死状态后 */ EntryDyinged = 'EntryDyinged',
    /** (连续若干个)处于濒死状态时 */ Dying = 'Dying',
    /** 濒死结算结束后 */ DyingEnd = 'DyingEnd',

    //死亡事件流程
    /** 死亡前 */ BeforeDeath = 'BeforeDeath',
    /** 确认身份前 */ ConfirmRole = 'ConfirmRole',
    /** 死亡时 */ Death = 'Death',
    /** 死亡后 */ Deathed = 'Deathed',
    /** 死亡结算结束后 */ DieEnd = 'DieEnd',

    //技能相关
    /** 获得技能后 */ onObtain = 'onObtain',
    /** 获得技能后时机 */ onObtainTrigger = 'onObtainTrigger',
    /** 失去技能后 */ onLose = 'onLose',
    /** 技能检测时 */ onCheck = 'onCheck',
    /** 执行消耗后 */ BeCost = 'BeCost',
}

export type Triggers = EventTriggers | string;
