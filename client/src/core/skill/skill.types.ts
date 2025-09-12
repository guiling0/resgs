import { GameCard } from '../card/card';
import { VirtualCardData } from '../card/card.types';
import { VirtualCard } from '../card/vcard';
import {
    ChooseData,
    ChooseResultCount,
    GameRequest,
    PlayPhaseResule,
    RequestOptionData,
} from '../choose/choose.types';
import { EventData } from '../event/data';
import { Triggers } from '../event/triggers';
import { General } from '../general/general';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { Effect, StateEffect, TriggerEffect } from './effect';
import { Skill } from './skill';

export type SkillId = string;
export type EffectId = string;

export interface SkillOptions {
    source: string;
    showui?: 'none' | 'default' | 'other' | 'mark';
    /** 获得技能时的轮数 */
    circle?: number;
    log?: boolean;
}

export enum EffectType {
    None = 0,
    /** 触发技 */
    Trigger,
    /** 状态技 */
    State,
}

export const enum PriorityType {
    None = 0,
    /** 武将技能 */
    General,
    /** 装备技能 */
    Equip,
    /** 卡牌技能 */
    Card,
    /** 规则技能 */
    Rule,
    /** 全局规则技能 */
    GlobalRule,
    /** 用于刷新处理的技能 */
    Refresh,
}

/** 技能标签 */
export const enum SkillTag {
    None = 0,
    /** 锁定技 */
    Lock,
    /** 主将技 */
    Head,
    /** 副将技 */
    Deputy,
    /** 觉醒技 */
    Awake,
    /** 限定技 */
    Limit,
    /** 主公技/君主技 */
    Lord,
    /** 阵法技-队列 */
    Array_Quene,
    /** 阵法技-围攻 */
    Array_Siege,
    /** 奥秘技 */
    Secret,
    /** 持恒技 */
    Eternal,
}

export interface SkillData {
    /** 技能名 */
    name: string;
    audio: string[];
    /** 基础技能条件 */
    condition: (this: Skill, room: GameRoom) => boolean;
    /**
     * 是否将该技能按钮添加给其他玩家。
     * 为true时，对于该技能下的主动技和视为技的效果，将通过该按钮发动。
     * 其他类型的效果仅显示技能按钮
     *
     * @param self 技能对象
     * @param room 房间
     * @param to 目标
     * @returns 是否将技能按钮添加给目标玩家
     */
    global: (this: Skill, room: GameRoom, to: GamePlayer) => boolean;
    /** 是否显示技能按钮 */
    visible: (this: Skill, room: GameRoom) => boolean;
    /** 哪个装备的技能 */
    attached_equip: string;
    /** 哪些势力可以获得该技能，仅用于势力技 */
    attached_kingdom: string[];
    /** 包含的所有效果 */
    effects: string[];
    /** 视为拥有的技能 */
    regard_skills: string[];
}

export type CreateSkill = Partial<SkillData> & {
    name: string;
    // effects?: (string | TriggerEffectData | StateEffectData)[];
};

export type TriggerEffectContext = {
    effect?: TriggerEffect;
    /** 发动者 默认为拥有者 */
    from?: GamePlayer;
    /** 最大发动次数 默认为1 */
    maxTimes?: number;
    /** 消耗中选择的卡牌 */
    cards?: GameCard[];
    /** 技能目标 */
    targets?: GamePlayer[];
    /** 服务端提供的设置 */
    options?: RequestOptionData;
    /** 消耗询问返回的数据 */
    req_result?: {
        req?: GameRequest;
        /** 是否主动点击了取消 */
        cancle?: boolean;
        /** 使用或打出的卡牌。 */
        use_or_play_card?: VirtualCardData;
        /** 选中的技能 */
        selected_skill?: number;
        /** 出牌阶段返回结果 */
        playphase?: PlayPhaseResule;
        /** 选择器结果 */
        results: ReturnType<typeof GameRoom.prototype.toData_SelectorResult>;
    };
} & {
    [key: string]: any;
};

export interface TriggerEffectData {
    /** 效果名 */
    name: string;
    /** 技能标签 */
    tag: SkillTag[];
    /** 拥有效果时显示的标记（只能显示boolean类型的标记） */
    mark: string[];
    /** 视为拥有技能
     * 该函数会在每一个时机触发前(先于触发优先级None被调用)
     * 返回值表示对应的角色会视为拥有哪些技能，如果对应角色没有该技能则会增加该技能，如果对应角色已有该技能则不会进行任何处理
     * 效果内部会记录每名角色因此效果而视为拥有的技能，在失去该效果的同时会一同失去这些技能，在失去该效果之前这些技能只要获得过就永远不会失去
     * 注意：只能视为拥有技能，不能视为拥有某种效果  如果想要控制某个技能是否显示在UI上，需要在对视为拥有的技能下的visible参数中设置
     */
    regard_skill: (
        this: TriggerEffect,
        room: GameRoom,
        player: GamePlayer,
        data: EventData
    ) => string | string[];
    /** 效果类型 */
    type: EffectType.Trigger;
    /** 优先级类型 */
    priorityType: PriorityType;
    /** 触发时机 */
    trigger: Triggers | Triggers[];
    /** 发动技能时播放的动画 默认值为text，播放文字动画*/
    anim: string;
    /** 发动技能时播放的配音地址，如果有多个则按顺序依次播放 */
    audio: string[];
    /** 发动技能时是否自动log 默认值为0
     * 0-不进行log 1-log技能发动了 2-log技能发动并携带所有目标
     */
    auto_log: number;
    /** 是否对技能目标排序 默认为true */
    auto_sort: boolean;
    /** 发动技能时是否对所有目标播放指向线 默认值为0 该值等同于播放指向线的类型*/
    auto_directline: number;
    /** 屏蔽限定技特效 默认为false */
    exclues_limitAni: boolean;
    /** 默认为mute，在未定义skill_cost选择方法时自动发动（国战模式下未明置的武将牌也会询问等同于设置为cost的效果）。
     * 设置为cost可以让该技能套一层询问是否发动。出牌阶段技能被设置为cost之后表示该技能必须要在出牌阶段发动一次 */
    forced: 'mute' | 'cost';
    /** 定义技能选择器 */
    getSelectors: (
        this: TriggerEffect,
        room: GameRoom,
        context: TriggerEffectContext
    ) => {
        [key: string]: () => {
            selectors?: { [key: string]: ChooseData };
            options?: RequestOptionData;
        };
    };
    /** 触发条件。返回任意真值即为可以发动 */
    can_trigger: (
        this: TriggerEffect,
        room: GameRoom,
        player: GamePlayer,
        data: EventData
    ) => any;
    /** 在执行消耗和选择之前执行。可以在这里定义Context的内容 */
    context: (
        this: TriggerEffect,
        room: GameRoom,
        player: GamePlayer,
        data: EventData
    ) => TriggerEffectContext;
    /** 技能消耗 */
    cost: (
        this: TriggerEffect,
        room: GameRoom,
        data: EventData,
        context: TriggerEffectContext
    ) => Promise<any>;
    /** 技能效果 */
    effect: (
        this: TriggerEffect,
        room: GameRoom,
        data: EventData,
        context: TriggerEffectContext
    ) => Promise<void>;

    lifecycle: EffectLifecycle[];
}

export type CreateTriggerEffect = Partial<
    Omit<TriggerEffectData, 'name' | 'type'>
> & {
    name?: string;
};

export enum StateEffectType {
    Distance_Correct = 1,
    Distance_Fixed,
    NotCalcSeat,
    NotCalcDistance,
    MaxHand_Initial,
    MaxHand_Correct,
    MaxHand_Fixed,
    MaxHand_Exclude,
    Prohibit_Open,
    Prohibit_Close,
    Prohibit_DropCards,
    Prohibit_RecoverHp,
    Prohibit_UseCard,
    Prohibit_PlayCard,
    Prohibit_Pindian,
    Range_Initial,
    Range_Correct,
    Range_Fixed,
    /** 视为在攻击范围内 */
    Range_Within,
    /** 视为不在攻击范围内 */
    Range_Without,
    /** 卡牌基本信息视为其他信息 */
    Regard_CardData,
    /** 视为唯一大势力 */
    Regard_OnlyBig,
    /** 无次数限制 */
    TargetMod_PassTimeCheck,
    /** 不计入次数的限制 */
    TargetMod_PassCountingTime,
    /** 修改次数限制 */
    TargetMod_CorrectTime,
    /** 无距离限制 */
    TargetMod_PassDistanceCheck,
    /** 修改卡牌选择限制 */
    TargetMod_CardLimit,
    /** 技能失效 */
    Skill_Invalidity,
    /** 如手牌般使用 */
    LikeHandToUse,
    /** 如手牌般打出 */
    LikeHandToPlay,
    /** 忽略主副将标签的条件 */
    IgnoreHeadAndDeputy,
    /** 卡牌永远可见 */
    FieldCardEyes,
    /** 视为满足阵法条件 */
    Regard_ArrayCondition,
    /** 拼点结果视为 */
    Regard_PindianResult,
    /** 视为某势力 */
    Regard_Kingdom,
}

export type StateEffectKey = { [key in StateEffectType]: Function };

export interface StateEffectData extends StateEffectKey {
    /** 效果名 */
    name: string;
    /** 拥有效果时显示的标记（只能显示boolean类型的标记） */
    mark: string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 视为拥有技能
     * 该函数会在每一个时机触发前(先于触发优先级None被调用)，在获得技能时也会调用一次
     * 返回值表示对应的角色会视为拥有哪些技能，如果对应角色没有该技能则会增加该技能，如果对应角色已有该技能则不会进行任何处理
     * 效果内部会记录每名角色因此效果而视为拥有的技能，在失去该效果的同时会一同失去这些技能，在失去该效果之前这些技能只要获得过就永远不会失去
     * 注意：只能视为拥有技能，不能视为拥有某种效果  如果想要控制某个技能是否显示在UI上，需要在对视为拥有的技能下的visible参数中设置
     */
    regard_skill: (
        this: StateEffect,
        room: GameRoom,
        player: GamePlayer,
        data: EventData
    ) => string | string[];
    /** 效果类型 */
    type: EffectType.State;
    /**
     * 距离修正值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 修正值
     * @description 所有修正值会累计到最终距离，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Correct]: (
        this: StateEffect,
        from: GamePlayer,
        to: GamePlayer
    ) => number;
    /**
     * 距离终值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 终值 返回undefined无用
     * @description 计算距离时会直接返回终值，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Fixed]: (
        this: StateEffect,
        from: GamePlayer,
        to: GamePlayer
    ) => number;
    /** 不计入座次计算 */
    [StateEffectType.NotCalcSeat]: (
        this: StateEffect,
        from: GamePlayer
    ) => boolean;
    /** 不计入距离限制 */
    [StateEffectType.NotCalcDistance]: (
        this: StateEffect,
        from: GamePlayer
    ) => boolean;
    /**
     * 手牌上限初始值
     * @param from 计算手牌上限的玩家
     * @returns 手牌上限初始值
     * @description 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Initial]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 手牌上限修正值
     * @param from 计算手牌上限的玩家
     * @returns 修正值
     * @description 所有修正值会累计到手牌上限中，但无论经过怎样的计算，手牌上限最小为0
     */
    [StateEffectType.MaxHand_Correct]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 手牌上限终值
     * @param from 计算手牌上限的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表手牌上限无限大
     * @description 计算手牌上限时会直接返回终值，但无论经过怎样的计算，手牌上限最小为0。如果有多个修改终值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Fixed]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 不计入手牌上限
     * @param from 计算手牌上限的玩家
     * @param card 检测的卡牌
     * @returns 布尔值 指定卡牌是否不计入手牌上限
     * @description 不计入手牌上限的牌在弃牌阶段计算需要弃置多少张牌时视为该牌不存在，同时弃牌时也不能选中该牌
     */
    [StateEffectType.MaxHand_Exclude]: (
        this: StateEffect,
        from: GamePlayer,
        card: GameCard
    ) => boolean;
    /**
     * 不能明置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 明置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Open]: (
        this: StateEffect,
        player: GamePlayer,
        generals: General[],
        reason: string
    ) => boolean;
    /**
     * 不能暗置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 暗置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Close]: (
        player: GamePlayer,
        generals: General[],
        reason: string
    ) => boolean;
    /**
     * 不能弃置
     * @param player 弃牌的角色
     * @param card 弃置的牌
     * @param reason 弃置的原因
     * @returns
     */
    [StateEffectType.Prohibit_DropCards]: (
        this: StateEffect,
        player: GamePlayer,
        card: GameCard,
        reason: string
    ) => boolean;
    /** 不能回复体力 */
    [StateEffectType.Prohibit_RecoverHp]: (
        this: StateEffect,
        player: GamePlayer,
        number: number,
        reason: string
    ) => boolean;
    /**
     * 不能使用卡牌
     * @param from 使用者
     * @param card 使用的卡牌
     * @param target 检测的目标
     * @param reason 使用原因
     * @returns
     */
    [StateEffectType.Prohibit_UseCard]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        target: GamePlayer | VirtualCard,
        reason: string
    ) => boolean;
    /**
     * 不能打出卡牌
     * @param from 打出者
     * @param card 打出的卡牌
     * @param reason 打出的原因
     * @returns
     */
    [StateEffectType.Prohibit_PlayCard]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        reason: string
    ) => boolean;
    /**
     * 不能拼点
     * @param player 拼点发起者
     * @param targets 拼点的目标
     * @param reason 拼点的原因
     * @returns
     */
    [StateEffectType.Prohibit_Pindian]: (
        this: StateEffect,
        player: GamePlayer,
        targets: GamePlayer[],
        reason: string
    ) => boolean;
    /**
     * 攻击范围初始值
     * @param from 计算攻击范围的玩家
     * @returns 攻击范围初始值
     * @description 一般只有武器技能会用到这个属性 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.Range_Initial]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 攻击范围修正值
     * @param from 计算攻击范围的玩家
     * @returns 修正值
     * @description 所有修正值会累计到攻击范围中，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Correct]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 攻击范围终值
     * @param self 技能本身
     * @param from 计算攻击范围的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表攻击范围无限大
     * @description 计算攻击范围时会直接返回终值，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Fixed]: (
        this: StateEffect,
        from: GamePlayer
    ) => number;
    /**
     * 视为在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定在from的攻击范围内
     */
    [StateEffectType.Range_Within]: (
        this: StateEffect,
        from: GamePlayer,
        to: GamePlayer
    ) => boolean;
    /**
     * 视为不在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定不在from的攻击范围内，当此效果与一个攻击范围状态的within冲突时，以without(本函数)为准。
     */
    [StateEffectType.Range_Without]: (
        this: StateEffect,
        from: GamePlayer,
        to: GamePlayer
    ) => boolean;
    [StateEffectType.Regard_CardData]: (
        this: StateEffect,
        card: GameCard,
        property: string,
        source: any
    ) => any;
    [StateEffectType.Regard_OnlyBig]: (
        this: StateEffect,
        player: GamePlayer
    ) => boolean;
    /** 视为某势力 */
    [StateEffectType.Regard_Kingdom]: (
        this: StateEffect,
        player: GamePlayer
    ) => string;
    /** 无次数限制 */
    [StateEffectType.TargetMod_PassTimeCheck]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        target: GamePlayer
    ) => boolean;
    /** 不计入次数的限制 */
    [StateEffectType.TargetMod_PassCountingTime]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        target: GamePlayer
    ) => boolean;
    /** 修改次数限制 */
    [StateEffectType.TargetMod_CorrectTime]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        target: GamePlayer
    ) => number;
    /** 无距离限制 */
    [StateEffectType.TargetMod_PassDistanceCheck]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard,
        target: GamePlayer
    ) => boolean;
    [StateEffectType.TargetMod_CardLimit]: (
        this: StateEffect,
        from: GamePlayer,
        card: VirtualCard
    ) => ChooseResultCount;
    /** 技能失效 */
    [StateEffectType.Skill_Invalidity]: (
        this: StateEffect,
        effect: Effect
    ) => boolean;
    /** 如手牌般使用 */
    [StateEffectType.LikeHandToUse]: (
        this: StateEffect,
        from: GamePlayer,
        card: GameCard
    ) => boolean;
    /** 如手牌般打出 */
    [StateEffectType.LikeHandToPlay]: (
        this: StateEffect,
        from: GamePlayer,
        card: GameCard
    ) => boolean;
    /** 忽略主副将技标签的条件 */
    [StateEffectType.IgnoreHeadAndDeputy]: (
        this: StateEffect,
        effect: Effect
    ) => boolean;
    /** 指定卡牌对某玩家可见 */
    [StateEffectType.FieldCardEyes]: (
        this: StateEffect,
        from: GamePlayer,
        card: GameCard
    ) => boolean;
    /** 视为满足阵法条件 */
    [StateEffectType.Regard_ArrayCondition]: (
        this: StateEffect,
        from: GamePlayer,
        to: GamePlayer,
        type: 'quene' | 'siege_from' | 'siege_to'
    ) => boolean;
    /** 拼点结果视为
     * @returns 若为数组，则表示没赢的角色，不在数组内的为赢的角色；若不为数组则表示赢的角色，不为该角色均没赢
     */
    [StateEffectType.Regard_PindianResult]: (
        this: StateEffect,
        cards: Map<GamePlayer, GameCard>,
        reason: string
    ) => GamePlayer | GamePlayer[];

    lifecycle: EffectLifecycle[];
}

export type CreateStateEffect = Partial<
    Omit<StateEffectData, 'name' | 'type'>
> & {
    name?: string;
};

export interface EffectLifecycle {
    trigger: Triggers | Triggers[];
    priority?: 'before' | 'after';
    /**
     * 执行函数
     * @param room 房间对象
     * @param data 触发执行函数的事件
     * @description 在获得技能后和失去技能后,没有相关的事件数据
     */
    on_exec?: (this: Effect, room: GameRoom, data?: EventData) => Promise<void>;
    /**
     * 时机为onCheck的专属执行函数
     * @param room 房间对象
     * @param data 触发执行函数的事件
     * @description 在状态效果检测时,没有相关的事件数据
     */
    on_check?: (this: Effect, room: GameRoom, data?: EventData) => boolean;
}
