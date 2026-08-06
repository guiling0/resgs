import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';
import type { Skill } from '../entity/Skill';
import type { Effect } from '../entity/Effect';
import type { General } from '../entity/General';
import type { GameCard } from '../entity/GameCard';
import type { TimingData, TimingTrigger } from './EventTypes';
import type { ChooseSession } from './ChooseTypes';
import type { SkillAI } from './AITypes';

/** 技能 id（房间内自增） */
export type SkillId = number;
/** 效果 id（房间内自增） */
export type EffectId = number;

/** 效果类别（触发类与状态类互斥） */
export enum EffectType {
    /** 触发类效果 */
    Trigger = 'trigger',
    /** 状态类效果 */
    State = 'state',
}

/** 效果优先级 */
export enum PriorityType {
    /** 武将技能 */
    General = 1,
    /** 装备技能 */
    Equip,
    /** 卡牌技能 */
    Card,
    /** 规则技能 */
    Rule,
}

/** 技能标签 */
export enum SkillTag {
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
    /** 阵法技 */
    Array,
    /** 奥秘技 */
    Secret,
    /** 持恒技 */
    Eternal,
    /** 使命技 */
    Mission,
    /** 主帅技 */
    ZhuShuai,
    /** 前锋技 */
    QianFeng,
}

/** 状态效果类型 */
export enum StateEffectType {}

/** 刷新回调（注册到时机 before/after，data 按 trigger 推断事件数据） */
export interface TimingCallback<T extends TimingTrigger, This> {
    /** 触发时机 */
    trigger: T;
    /** 时机位置（前/后） */
    position: 'before' | 'after';
    /** 回调（执行刷新逻辑） */
    fn: (this: This, room: Room, data: TimingData<T>) => Promise<void>;
}

/** 自动移除回调（返回 true 时移除临时效果，data 按 trigger 推断事件数据） */
export interface AutoRemoveCallback<T extends TimingTrigger, This> {
    /** 触发时机 */
    trigger: T;
    /** 时机位置（前/后） */
    position: 'before' | 'after';
    /** 回调 */
    fn: (this: This, room: Room, data: TimingData<T>) => boolean;
}

/** 技能运行时选项 */
export interface SkillOptions {
    /** 来源（武将/装备/效果，构造时推断 sourceGeneral/sourceEquip/sourceEffect） */
    source?: General | GameCard | Effect;
    /** 按钮显示方式 */
    showui?: 'none' | 'default' | 'other' | 'mark' | 'card';
    /** 跳过主公检查 */
    skipLordCheck?: boolean;
    /** 获得时是否写战报 */
    logOnObtain?: boolean;
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 自动移除回调 */
    autoRemove?: Array<AutoRemoveCallback<TimingTrigger, Skill>>;
    /** 刷新回调 */
    refreshs?: Array<TimingCallback<TimingTrigger, Skill>>;
}

/** 效果运行时选项 */
export interface EffectOptions {
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 自动移除回调 */
    autoRemove?: Array<AutoRemoveCallback<TimingTrigger, Effect>>;
    /** 刷新回调 */
    refreshs?: Array<TimingCallback<TimingTrigger, Effect>>;
}

/** 技能定义数据（注册到 sgs.skills，技能全名即 id） */
export interface SkillData {
    /** 技能名（等同技能 id） */
    name: string;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能（仅势力技） */
    attached_kingdom?: string;
    /** 基础技能条件（非时机条件检测） */
    condition: (this: Skill, room: Room) => boolean;
    /** 是否可见 */
    visible?: (this: Skill, room: Room) => boolean;
    /** 全局技能显示按钮的玩家 */
    global?: (this: Skill, room: Room, player: Player) => boolean;
    /** 效果定义列表 */
    effects: EffectData[];
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<TimingCallback<TimingTrigger, Skill>>;
    /** 自定义数据（添加技能后注入到技能的 data） */
    data?: Record<string, unknown>;
    /** 智能体配置 */
    ai?: SkillAI;
}

/** 效果设置 */
export interface EffectSettings {
    /** 发动方式：mute=自动发动，cost=询问是否发动 */
    forced?: 'mute' | 'cost';
    /** 发动时配音地址（多个则随机顺序播放；默认 extends 继承技能语音） */
    audios?: string[] | 'extends';
    /** 阵法技类型 */
    arraytype?: 'quene' | 'single';
    /** 临时效果（获得技能时不获得） */
    temp?: boolean;
    /** 发动时动画（默认 text） */
    ani?: string;
    /** 发动时是否自动写战报（默认 true） */
    log?: boolean;
    /** 发动时是否弹出提示（默认 true） */
    toast?: boolean;
    /** 是否对技能目标排序（默认 true） */
    sort?: boolean;
    /** 发动时对所有目标播放指向线（0 不播放，默认 1） */
    directline?: number;
    /** 限定技特效（默认 true，仅在限定技标签时有效） */
    limitAni?: boolean;
    /** 觉醒技特效（默认 true，仅在觉醒技标签时有效） */
    awakeAni?: boolean;
    /** 使用的卡牌是否设置为转化牌（默认 true，仅在使用/打出类技能有效） */
    viewas?: boolean;
    /** 是否检测所有人（默认 false，只检测拥有者） */
    global?: boolean;
}

/** 技能发动上下文 */
export interface EffectContext {
    /** 发动者 */
    from: Player;
    /** 触发此技能的源事件（可通过它调用 prevent/transfer 等方法） */
    event?: unknown;
    /** 消耗结果 */
    cost?: unknown;
    /** 选择结果（选择器名 → 目标 → 结果列表） */
    selections?: Record<string, Record<string, unknown[]>>;
    [key: string]: unknown;
}

/** 触发类效果数据（data 按 T 推断事件数据） */
export interface TriggerEffectData<T extends TimingTrigger = TimingTrigger> {
    /** 效果优先级 */
    priority: PriorityType;
    /** 触发时机 */
    trigger?: T;
    /** 时机条件检测（返回真值即可以发动） */
    can_trigger?: (this: Effect, room: Room, player: Player, data: TimingData<T>) => boolean;
    /** 最大发动次数：number=固定值，function=实时计算，-1=无限制（默认 1） */
    times?: number | ((this: Effect, room: Room, player: Player, data: TimingData<T>) => number);
    /** 构建本次发动上下文（在消耗与选择前执行） */
    context?: (this: Effect, room: Room, player: Player, data: TimingData<T>) => EffectContext;
    /** 发动前选择（返回选择会话数据，id 由选择系统赋予；无事件数据参数） */
    choose?: (
        this: Effect,
        room: Room,
        player: Player,
        ctx: EffectContext,
    ) => Omit<ChooseSession, 'id'>;
    /** 技能消耗（返回 falsy 视为未发动） */
    cost?: (
        this: Effect,
        room: Room,
        player: Player,
        data: TimingData<T>,
        ctx: EffectContext,
    ) => Promise<unknown>;
    /** 技能效果 */
    effect?: (
        this: Effect,
        room: Room,
        player: Player,
        data: TimingData<T>,
        ctx: EffectContext,
    ) => Promise<unknown>;
}

/** 状态类效果数据（状态回调直接继承） */
export interface StateEffectData extends Partial<StateCallbackMap> {}

/** 效果定义数据（注册到 sgs.effects） */
export interface EffectData {
    /** 效果全名 */
    name: string;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果设置 */
    settings?: EffectSettings;
    /** 自定义数据 */
    data?: Record<string, unknown>;
    /** 发动条件（非时机条件检测；时机条件检测用 can_trigger） */
    condition: (this: Effect, room: Room, ctx?: EffectContext) => boolean;
    /** 刷新回调（注册到时机 before/after） */
    refreshs?: Array<TimingCallback<TimingTrigger, Effect>>;

    /** 触发类效果数据 */
    trigger?: TriggerEffectData;
    /** 状态类效果数据 */
    state?: StateEffectData;
}

/** 状态回调签名映射 */
export interface StateCallbackMap {
    [key: string]: unknown;
}
