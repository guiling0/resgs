import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';
import type { Effect as EffectEntity } from '../entity/Effect';
import type { ChooseSession } from '../types/ChooseTypes';
import type { TimingData, TimingTrigger } from '../types/EventTypes';
import { PriorityType, SkillTag } from '../types/SkillTypes';
import type {
    EffectContext,
    EffectData,
    EffectSettings,
    StateCallbackMap,
    StateEffectData,
    StateEffectType,
    TimingCallback,
    TriggerEffectData,
} from '../types/SkillTypes';

/** EffectBuilder 实例接口——链式构建效果数据，不负责注册；name 为必传构造参数 */
export interface EffectBuilder<T extends TimingTrigger = TimingTrigger> {
    readonly name: string;
    /** 自定义数据 */
    data: Record<string, unknown>;
    /** 拥有效果时显示的标记 */
    mark?: string | string[];
    /** 技能标签 */
    tag: SkillTag[];
    /** 效果优先级 */
    priority: PriorityType;

    /** 设置状态回调（按状态类型写入 state） */
    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this;
    /** 设置发动条件（非时机条件检测） */
    condition(fn: (this: EffectEntity, room: Room, ctx?: EffectContext) => boolean): this;
    /** 设置最大发动次数（number=固定值，function=实时计算，-1=无限制） */
    times(n: number | ((this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => number)): this;
    /** 设置触发时机（收窄 data 推断类型） */
    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U>;
    /** 设置时机条件检测 */
    can_trigger(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => boolean): this;
    /** 构建本次发动上下文 */
    context(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => EffectContext): this;
    /** 设置发动前选择（返回选择会话数据，id 由选择系统赋予） */
    choose(fn: (this: EffectEntity, room: Room, player: Player, ctx: EffectContext) => Omit<ChooseSession, 'id'>): this;
    /** 设置技能消耗 */
    cost(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this;
    /** 设置技能效果 */
    effect(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this;
    /** 设置效果设置 */
    settings(config: Partial<EffectSettings>): this;
    /** 添加刷新回调 */
    refresh<U extends TimingTrigger>(data: TimingCallback<U, EffectEntity>): this;
    /** 构建效果数据（skillName 提供时效果名带技能前缀） */
    build(skillName?: string): EffectData;
    /** 注册到 sgs.effects（幂等） */
    register(skillName?: string): EffectData;
}

/** EffectBuilder 工厂（sgs.EffectBuilder）——无需 new */
export function EffectBuilder<T extends TimingTrigger = TimingTrigger>(name: string): EffectBuilder<T> {
    return new _EffectBuilder<T>(name);
}

class _EffectBuilder<T extends TimingTrigger = TimingTrigger> implements EffectBuilder<T> {
    readonly name: string;
    data: Record<string, unknown> = {};
    mark?: string | string[];
    tag: SkillTag[] = [];
    priority: PriorityType = PriorityType.General;
    private _state: StateEffectData = {};

    private _settings: EffectSettings = {
        forced: 'mute',
        audios: 'extends',
        temp: false,
        ani: 'text',
        log: true,
        toast: true,
        sort: true,
        directline: 1,
        limitAni: true,
        awakeAni: true,
        viewas: true,
        global: false,
    };
    private _condition?: (this: EffectEntity, room: Room, ctx?: EffectContext) => boolean;
    private _refreshs: Array<TimingCallback<any, EffectEntity>> = [];
    private _times?: number | ((this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => number);
    private _trigger?: T;
    private _can_trigger?: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => boolean;
    private _context?: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => EffectContext;
    private _choose?: (this: EffectEntity, room: Room, player: Player, ctx: EffectContext) => Omit<ChooseSession, 'id'>;
    private _cost?: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>;
    private _effect?: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>;

    constructor(name: string) {
        this.name = name;
    }

    state<U extends StateEffectType>(type: U, fn: StateCallbackMap[U]): this {
        this.checkStateConflict();
        (this._state as unknown as Record<string, unknown>)[type] = fn;
        return this;
    }

    condition(fn: (this: EffectEntity, room: Room, ctx?: EffectContext) => boolean): this {
        this._condition = fn;
        return this;
    }

    times(n: number | ((this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => number)): this {
        this.checkTriggerConflict();
        this._times = n;
        return this;
    }

    on<U extends TimingTrigger>(trigger: U): EffectBuilder<U> {
        this.checkTriggerConflict();
        this._trigger = trigger as unknown as T;
        return this as unknown as EffectBuilder<U>;
    }

    can_trigger(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => boolean): this {
        this.checkTriggerConflict();
        this._can_trigger = fn;
        return this;
    }

    context(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>) => EffectContext): this {
        this.checkTriggerConflict();
        this._context = fn;
        return this;
    }

    choose(fn: (this: EffectEntity, room: Room, player: Player, ctx: EffectContext) => Omit<ChooseSession, 'id'>): this {
        this.checkTriggerConflict();
        this._choose = fn;
        return this;
    }

    cost(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this {
        this.checkTriggerConflict();
        this._cost = fn;
        return this;
    }

    effect(fn: (this: EffectEntity, room: Room, player: Player, data: TimingData<T>, ctx: EffectContext) => Promise<unknown>): this {
        this.checkTriggerConflict();
        this._effect = fn;
        return this;
    }

    /** 触发类 setter 互斥检查（已有状态回调时报错） */
    private checkTriggerConflict(): void {
        if (Object.keys(this._state).length > 0) {
            throw new Error(`效果 "${this.name}" 不能同时配置触发与状态回调`);
        }
    }

    /** 状态注册互斥检查（已有任意触发值时报错） */
    private checkStateConflict(): void {
        if (this._trigger !== undefined || this._can_trigger !== undefined || this._context !== undefined ||
            this._choose !== undefined || this._cost !== undefined || this._effect !== undefined || this._times !== undefined) {
            throw new Error(`效果 "${this.name}" 不能同时配置触发与状态回调`);
        }
    }

    settings(config: Partial<EffectSettings>): this {
        Object.assign(this._settings, config);
        return this;
    }

    refresh<U extends TimingTrigger>(data: TimingCallback<U, EffectEntity>): this {
        this._refreshs.push(data);
        return this;
    }

    build(skillName?: string): EffectData {
        const name = skillName && !this.name.startsWith(`${skillName}.`) ? `${skillName}.${this.name}` : this.name;
        const isTrigger = !!(this._trigger ?? this._can_trigger ?? this._context ?? this._choose ?? this._cost ?? this._effect);
        const isState = Object.keys(this.state).length > 0;
        if (!isTrigger && !isState) {
            throw new Error(`效果 "${name}" 需配置触发内容或状态回调（至少其一）`);
        }
        return {
            name,
            mark: this.mark,
            tag: [...this.tag],
            settings: { ...this._settings },
            data: this.data,
            condition: this._condition ?? (() => true),
            refreshs: this._refreshs.length > 0 ? [...this._refreshs] : undefined,
            trigger: isTrigger
                ? {
                    priority: this.priority,
                    trigger: this._trigger,
                    can_trigger: this._can_trigger,
                    times: this._times,
                    context: this._context,
                    choose: this._choose,
                    cost: this._cost,
                    effect: this._effect,
                } as TriggerEffectData
                : undefined,
            state: isState ? this._state : undefined,
        };
    }

    register(skillName?: string): EffectData {
        const data = this.build(skillName);
        if (!sgs.effects.has(data.name)) {
            sgs.effects.set(data.name, data);
        }
        return sgs.effects.get(data.name)!;
    }
}

/** 构建并注册效果数据（sgs.createEffect）——name 必传，内部经 EffectBuilder 复用默认值；已注册则直接返回已有数据 */
export function Effect(input: Pick<EffectData, 'name'> & Partial<EffectData>): EffectData {
    if (sgs.effects.has(input.name)) {
        return sgs.effects.get(input.name)!;
    }
    const b = EffectBuilder(input.name);
    if (input.data !== undefined) b.data = input.data;
    if (input.mark !== undefined) b.mark = input.mark;
    if (input.tag !== undefined) b.tag = [...input.tag];
    if (input.condition !== undefined) b.condition(input.condition);
    if (input.refreshs !== undefined) {
        for (const r of input.refreshs) b.refresh(r);
    }
    if (input.settings !== undefined) b.settings(input.settings);
    if (input.trigger) {
        const t = input.trigger;
        b.priority = t.priority;
        if (t.trigger !== undefined) b.on(t.trigger);
        if (t.times !== undefined) b.times(t.times);
        if (t.can_trigger !== undefined) b.can_trigger(t.can_trigger);
        if (t.context !== undefined) b.context(t.context);
        if (t.choose !== undefined) b.choose(t.choose);
        if (t.cost !== undefined) b.cost(t.cost);
        if (t.effect !== undefined) b.effect(t.effect);
    }
    if (input.state !== undefined) {
        for (const [type, fn] of Object.entries(input.state)) {
            b.state(type as unknown as StateEffectType, fn as unknown);
        }
    }
    return b.register();
}
