import { GameCard } from '../card/GameCard';
import { VirtualCard } from '../card/VirtualCard';
import { TimingData, TimingTrigger } from '../event/EventTypes';
import { General } from '../general/General';
import { Player } from '../player/Player';
import { Room } from '../room/Room';
import { SelectCount, SelectorConfig } from '../select/SelectTypes';
import { Effect } from './Effect';
import { Skill } from './Skill';

export type SkillId = number;
export type EffectId = number;

export type TimingCallback<T extends TimingTrigger, This> = {
    trigger: T;
    position: 'before' | 'after';
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<any>;
};

export type AutoRemoveCallback<T extends TimingTrigger, This> = {
    trigger: T;
    position: 'before' | 'after';
    fn: (this: This, room: Room, data: TimingData<T>) => boolean;
};

export function autoRemove<T extends TimingTrigger, This>(
    trigger: T,
    position: 'before' | 'after',
    fn: (this: This, room: Room, data: TimingData<T>) => boolean,
): AutoRemoveCallback<T, This> {
    return { trigger, position, fn };
}

export function refresh<T extends TimingTrigger, This>(
    trigger: T,
    position: 'before' | 'after',
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<any>,
): TimingCallback<T, This> {
    return { trigger, position, fn };
}

export interface SkillOptions {
    source?: string;
    showui?: 'none' | 'default' | 'other' | 'mark' | 'card';
    skipLordCheck?: boolean;
    logOnObtain?: boolean;
    data?: Record<string, any>;
    autoRemove?: Array<AutoRemoveCallback<any, Skill>>;
    refreshs?: Array<TimingCallback<any, Skill>>;
}

export interface EffectOptions {
    source?: string;
    data?: Record<string, any>;
    autoRemove?: Array<AutoRemoveCallback<any, Effect>>;
    refreshs?: Array<TimingCallback<any, Effect>>;
}

export const enum PriorityType {
    /** 武将技能 */
    General = 1,
    /** 装备技能 */
    Equip,
    /** 卡牌技能 */
    Card,
    /** 规则技能 */
    Rule,
}

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
    /** 阵法技-围攻 */
    Array,
    /** 奥秘技 */
    Secret,
    /** 持恒技 */
    Eternal,
    /** 使命技 */
    Mission,
    ZhuShuai,
    QianFeng,
}

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
    Prohibit_Discards,
    Prohibit_ObtainCards,
    Prohibit_RecoverHp,
    Prohibit_LoseHp,
    Prohibit_UseCard,
    Prohibit_DropCard,
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
    /** 视为唯一大势力_最终结果 */
    Regard_OnlyBig_Fixed,
    /** 无次数限制 */
    TargetMod_PassTimeCheck,
    /** 不计入次数的限制 */
    TargetMod_PassCountingTime,
    /** 修改次数限制 */
    TargetMod_CorrectTime,
    /** 无距离限制 */
    TargetMod_PassDistanceCheck,
    /** 修改卡牌选择数量限制 */
    TargetMod_CardLimit_ChooseCount,
    /** 修改卡牌选择距离限制 */
    TargetMod_CardLimit_Distance,
    /** 技能失效 */
    Skill_Invalidity,
    /** 如手牌般使用 */
    LikeHandToUse,
    /** 如手牌般打出 */
    LikeHandToDrop,
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

export interface SkillAsset {
    name: string;
    lang_name: string;
    lang_desc: string;
    lang_desc2: string;
    audios: {
        url: string;
        translation: string;
    }[];
}

export interface SkillData {
    /** 技能名称 等同于技能id */
    name: string;
    /** 自定义数据 */
    data: Record<string, any>;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能，仅用于势力技 */
    attached_kingdom?: string;
    /** 基础技能条件 */
    condition: (this: Skill, room: Room) => boolean;
    /** 是否可见 */
    visible?: (this: Skill, room: Room) => boolean;
    /** 全局技能哪些玩家显示按钮 */
    global?: (this: Skill, room: Room, player: Player) => boolean;
    /** 效果 */
    effects: EffectData[];
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<{
        trigger: TimingTrigger;
        position: 'before' | 'after';
        fn: (this: Skill, room: Room, data: any) => Promise<boolean>;
    }>;
    /** 智能体 */
    ai?: any;
}

export interface EffectData {
    has_trigger: boolean;
    has_state: boolean;
    /** 效果名 */
    name: string;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果设置 */
    settings?: EffectSettings;
    /** 选择器 */
    selectors?: EffectSelectors;
    /** 自定义数据 */
    data: Record<string, any>;

    /** 发动条件 该函数一般用于可被忽略觉醒条件（神郭嘉）  注：can_trigger一般用于时机条件的检测；condition的设计是用于非时机条件的检测 */
    condition: (this: Effect, room: Room, ctx?: EffectContext) => any;
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<{
        trigger: TimingTrigger;
        position: 'before' | 'after';
        fn: (this: Effect, room: Room, data: any) => Promise<boolean>;
    }>;

    //==================触发技相关==================

    /**
     * 最大发动次数。number=固定值，函数=根据实时数据计算（签名同context，用于计数型技能如〖明哲②〗）。
     * 默认 1，-1 表示无限制。扫描阶段直接读取此字段，不会为获取 maxTimes 而调用 context()。
     */
    times?: number | ((this: Effect, room: Room, player: Player, data: any) => number);
    /** 效果优先级 */
    priority: PriorityType;
    trigger?: TimingTrigger;
    /** 触发条件。返回任意真值即为可以发动 */
    can_trigger?: (this: Effect, room: Room, player: Player, data: any) => any;
    /** 在执行消耗和选择之前执行。可以在这里定义本次发动上下文的内容 */
    context?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
    ) => EffectContext;
    /** 技能选择 注：晚于selector中的cost定义 。该函数返回任意真值，才会发动技能。紧接着会处理明置，动画，log。然后才会执行技能消耗。
     * 对于需要明置的模式，消耗前的选择应该尽量在cost和这里完成，以保证合法的发动技能并且亮将
     * 但需要注意，最好不要对相关的selector的thinkprompt进行赋值，该方法里的选择询问不会自动处理暗将信息。
     * 如果该函数返回任意假值，技能视为未发动过
     */
    choose?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        ctx: EffectContext,
    ) => Promise<any>;
    /** 技能消耗 */
    cost?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        context: EffectContext,
    ) => Promise<any>;
    /** 技能效果 */
    effect?: (
        this: Effect,
        room: Room,
        player: Player,
        data: any,
        context: EffectContext,
    ) => Promise<any>;

    //==================状态技相关==================
    stateCallbacks?: Partial<StateCallbackMap>;
}

export interface EffectSelectors {
    cost?: SelectorConfig[];
    [name: string]: SelectorConfig[] | undefined;
}

export interface EffectSettings {
    /** 默认为mute，在未定义skill_cost选择方法时自动发动（国战模式下未明置的武将牌也会询问等同于设置为cost的效果）。
     * 设置为cost可以让该技能套一层询问是否发动。
     * 出牌阶段技能被设置为cost之后表示该技能必须要在出牌阶段发动。拥有此类技能将不能结束出牌阶段，除非删除该技能
     */
    forced?: 'mute' | 'cost';
    /** 发动技能时播放的配音地址，如果有多个则按随机顺序依次播放
     * 默认值为extends(继承技能，循环随机播放技能所设置的语音)
     * 注：使用皮肤后将会在generals下按照皮肤根目录寻找同名文件进行播放(地址中最后一个/后面的内容为文件名)
     */
    audios?: string[] | 'extends';
    /** 阵法技类型 */
    arraytype?: 'quene' | 'single';
    /** 临时效果 在获得技能时不获得 默认值为false */
    temp?: boolean;
    /** 发动技能时播放的动画 默认值为text，播放文字动画*/
    ani?: string;
    /** 发动技能时是否自动log 默认值为true */
    log?: boolean;
    /** 发动技能时是否弹出提示 默认值为true */
    toast?: boolean;
    /** 是否对技能目标排序 默认为true */
    sort?: boolean;
    /** 发动技能时对所有目标播放指向线 默认值为1(0为不播放) 该值等同于播放指向线的类型*/
    directline?: number;
    /** 播放限定技特效 默认值为true 只在拥有限定技标签时有效 */
    limitAni?: boolean;
    /** 播放觉醒技特效 默认值为true 只在拥有觉醒技标签时有效 */
    awakeAni?: boolean;
    /** 是否将使用的卡牌设置为转化牌 默认值为true 只在需要使用/打出时的技能有效 */
    viewas?: boolean;
    /** 是否检测所有人 默认值为false 只检测拥有者 */
    global?: boolean;
}

export interface EffectContext {
    from: Player;
    /** 触发此技能的源事件（技能中可通过它调用 prevent/transfer 等方法） */
    event?: import('../event/EventProcess').EventProcess;
    cost?: Record<string, any[]>;
    selections?: Record<string, Record<string, any[]>>;
    [key: string]: any;
}

export interface StateCallbackMap {
    /**
     * 距离修正值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 修正值
     * @description 所有修正值会累计到最终距离，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Correct]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => number;
    /**
     * 距离终值
     * @param from 计算距离的起始玩家
     * @param to 计算距离的目标玩家
     * @returns 终值 返回undefined无用
     * @description 计算距离时会直接返回终值，但无论经过怎样的计算，与自己的距离始终为0，与其他角色的距离最小为1
     */
    [StateEffectType.Distance_Fixed]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => number;
    /** 不计入座次计算 */
    [StateEffectType.NotCalcSeat]: (this: Effect, from: Player) => boolean;
    /** 不计入距离限制 */
    [StateEffectType.NotCalcDistance]: (this: Effect, from: Player) => boolean;
    /**
     * 手牌上限初始值
     * @param from 计算手牌上限的玩家
     * @returns 手牌上限初始值
     * @description 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Initial]: (this: Effect, from: Player) => number;
    /**
     * 手牌上限修正值
     * @param from 计算手牌上限的玩家
     * @returns 修正值
     * @description 所有修正值会累计到手牌上限中，但无论经过怎样的计算，手牌上限最小为0
     */
    [StateEffectType.MaxHand_Correct]: (this: Effect, from: Player) => number;
    /**
     * 手牌上限终值
     * @param from 计算手牌上限的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表手牌上限无限大
     * @description 计算手牌上限时会直接返回终值，但无论经过怎样的计算，手牌上限最小为0。如果有多个修改终值的技能，则按照最大值为准
     */
    [StateEffectType.MaxHand_Fixed]: (this: Effect, from: Player) => number;
    /**
     * 不计入手牌上限
     * @param from 计算手牌上限的玩家
     * @param card 检测的卡牌
     * @returns 布尔值 指定卡牌是否不计入手牌上限
     * @description 不计入手牌上限的牌在弃牌阶段计算需要弃置多少张牌时视为该牌不存在，同时弃牌时也不能选中该牌
     */
    [StateEffectType.MaxHand_Exclude]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /**
     * 不能明置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 明置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Open]: (
        this: Effect,
        player: Player,
        generals: General[],
        reason: string,
    ) => boolean;
    /**
     * 不能暗置
     * @param player 进行明置的角色
     * @param generals 将要明置的武将牌
     * @param reason 暗置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Close]: (
        this: Effect,
        player: Player,
        generals: General[],
        reason: string,
    ) => boolean;
    /**
     * 不能弃置
     * @param player 弃牌的角色
     * @param card 弃置的牌
     * @param reason 弃置的原因
     * @returns
     */
    [StateEffectType.Prohibit_Discards]: (
        this: Effect,
        player: Player,
        card: GameCard,
        reason: string,
    ) => boolean;
    /**
     * 不能获得
     * @param player 弃牌的角色
     * @param card 弃置的牌
     * @param reason 弃置的原因
     * @returns
     */
    [StateEffectType.Prohibit_ObtainCards]: (
        this: Effect,
        player: Player,
        card: GameCard,
        reason: string,
    ) => boolean;
    /** 不能回复体力 */
    [StateEffectType.Prohibit_RecoverHp]: (
        this: Effect,
        player: Player,
        number: number,
        reason: string,
    ) => boolean;
    /** 不能失去体力 */
    [StateEffectType.Prohibit_LoseHp]: (
        this: Effect,
        player: Player,
        number: number,
        reason: string,
    ) => boolean;
    /**
     * 不能使用卡牌
     * @param from 使用者
     * @param card 使用的卡牌
     * @param target 检测的目标
     * @param response 响应的目标牌 这个数据仅用于判断角色是否能响应借刀杀人等。客户端是没有这个数据的，所以对于不能响应指定卡牌的效果需要在服务端判断并跳过需要使用牌询问
     * @param reason 使用原因
     * @returns
     */
    [StateEffectType.Prohibit_UseCard]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player | VirtualCard,
        response: VirtualCard | undefined,
        reason: string,
    ) => boolean;
    /**
     * 不能打出卡牌
     * @param from 打出者
     * @param card 打出的卡牌
     * @param response 响应的目标牌 这个数据仅用于判断角色是否能响应南蛮万剑等。客户端是没有这个数据的，所以对于不能响应指定卡牌的效果需要在服务端判断并跳过需要打出牌询问
     * @param reason 打出的原因
     * @returns
     */
    [StateEffectType.Prohibit_DropCard]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        response: VirtualCard | undefined,
        reason: string,
    ) => boolean;
    /**
     * 不能拼点
     * @param player 拼点发起者
     * @param targets 拼点的目标
     * @param reason 拼点的原因
     * @returns
     */
    [StateEffectType.Prohibit_Pindian]: (
        this: Effect,
        player: Player,
        targets: Player[],
        reason: string,
    ) => boolean;
    /**
     * 攻击范围初始值
     * @param from 计算攻击范围的玩家
     * @returns 攻击范围初始值
     * @description 一般只有武器技能会用到这个属性 其余修改会在初值基础上修改。如果有多个修改初值的技能，则按照最大值为准
     */
    [StateEffectType.Range_Initial]: (this: Effect, from: Player) => number;
    /**
     * 攻击范围修正值
     * @param from 计算攻击范围的玩家
     * @returns 修正值
     * @description 所有修正值会累计到攻击范围中，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Correct]: (this: Effect, from: Player) => number;
    /**
     * 攻击范围终值
     * @param self 技能本身
     * @param from 计算攻击范围的玩家
     * @returns 终值 返回undefined无用 可以返回正无穷代表攻击范围无限大
     * @description 计算攻击范围时会直接返回终值，但无论经过怎样的计算，攻击范围最小为0
     */
    [StateEffectType.Range_Fixed]: (this: Effect, from: Player) => number;
    /**
     * 视为在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定在from的攻击范围内
     */
    [StateEffectType.Range_Within]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => boolean;
    /**
     * 视为不在攻击范围内
     * @param from 计算攻击范围的玩家
     * @param to 计算攻击范围的目标玩家
     * @returns 布尔值 to是否视为在from的攻击范围内
     * @description 如果返回true则不进行距离检测，to必定不在from的攻击范围内，当此效果与一个攻击范围状态的within冲突时，以without(本函数)为准。
     */
    [StateEffectType.Range_Without]: (
        this: Effect,
        from: Player,
        to: Player,
    ) => boolean;
    [StateEffectType.Regard_CardData]: (
        this: Effect,
        card: GameCard,
        property: string,
        source: any,
    ) => any;
    [StateEffectType.Regard_OnlyBig]: (this: Effect, player: Player) => boolean;
    [StateEffectType.Regard_OnlyBig_Fixed]: (
        this: Effect,
        player: Player,
        result: string[],
    ) => boolean;
    /** 视为某势力 */
    [StateEffectType.Regard_Kingdom]: (this: Effect, player: Player) => string;
    /** 无次数限制 */
    [StateEffectType.TargetMod_PassTimeCheck]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 不计入次数的限制 */
    [StateEffectType.TargetMod_PassCountingTime]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 修改次数限制 */
    [StateEffectType.TargetMod_CorrectTime]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => number;
    /** 无距离限制 */
    [StateEffectType.TargetMod_PassDistanceCheck]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
        target: Player,
    ) => boolean;
    /** 修改卡牌的选择数量限制 */
    [StateEffectType.TargetMod_CardLimit_ChooseCount]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
    ) => SelectCount;
    [StateEffectType.TargetMod_CardLimit_Distance]: (
        this: Effect,
        from: Player,
        card: VirtualCard,
    ) => number;
    /** 技能失效 */
    [StateEffectType.Skill_Invalidity]: (
        this: Effect,
        effect: Effect,
    ) => boolean;
    /** 如手牌般使用 */
    [StateEffectType.LikeHandToUse]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 如手牌般打出 */
    [StateEffectType.LikeHandToDrop]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 忽略主副将技标签的条件 */
    [StateEffectType.IgnoreHeadAndDeputy]: (
        this: Effect,
        effect: Effect,
    ) => boolean;
    /** 指定卡牌对某玩家可见 */
    [StateEffectType.FieldCardEyes]: (
        this: Effect,
        from: Player,
        card: GameCard,
    ) => boolean;
    /** 视为满足阵法条件 */
    [StateEffectType.Regard_ArrayCondition]: (
        this: Effect,
        from: Player,
        to: Player,
        type: 'quene' | 'siege_from' | 'siege_to',
    ) => boolean;
    /** 拼点结果视为
     * @returns 若为数组，则表示没赢的角色，不在数组内的为赢的角色；若不为数组则表示赢的角色，不为该角色均没赢
     */
    [StateEffectType.Regard_PindianResult]: (
        this: Effect,
        cards: Map<Player, GameCard>,
        reason: string,
    ) => Player | Player[];
}
