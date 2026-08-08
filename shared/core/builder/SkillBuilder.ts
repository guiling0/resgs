import type { Player } from '../entity/Player';
import type { Room } from '../entity/Room';
import type { Skill as SkillEntity } from '../entity/Skill';
import type { SkillAI } from '../types/AITypes';
import type { SkillData, TimingCallback } from '../types/SkillTypes';
import type { TimingTrigger } from '../types/EventTypes';
import { EffectBuilder, Effect } from './EffectBuilder';

/** SkillBuilder 实例接口——链式构建技能数据，不负责注册；name 为必传构造参数 */
export interface SkillBuilder {
    readonly name: string;
    /** 是否为规则技能 */
    is_rule: boolean;
    /** 是否为主公技能 */
    is_lord: boolean;
    /** 哪个装备的技能 */
    attached_equip?: string;
    /** 哪些势力可以获得该技能（仅势力技） */
    attached_kingdom?: string;
    /** 自定义数据 */
    data: Record<string, unknown>;

    /** 添加效果（按效果名或已有 builder） */
    addEffect(effect: string | EffectBuilder): EffectBuilder;
    /** 设置智能体配置 */
    ai(config: SkillAI): this;
    /** 设置基础技能条件（非时机条件检测） */
    condition(fn: (this: SkillEntity, room: Room) => boolean): this;
    /** 设置是否可见 */
    visible(fn: (this: SkillEntity, room: Room) => boolean): this;
    /** 设置全局技能显示按钮的玩家 */
    global(fn: (this: SkillEntity, room: Room, player: Player) => boolean): this;
    /** 添加刷新回调 */
    refresh<T extends TimingTrigger>(data: TimingCallback<T, SkillEntity>): this;
    /** 构建技能数据 */
    build(): SkillData;
    /** 注册到 sgs.skills（幂等） */
    register(): SkillData;
}

/** SkillBuilder 工厂（sgs.SkillBuilder）——无需 new */
export function SkillBuilder(name: string): SkillBuilder {
    return new _SkillBuilder(name);
}

class _SkillBuilder implements SkillBuilder {
    readonly name: string;
    is_rule: boolean = false;
    is_lord: boolean = false;
    attached_equip?: string;
    attached_kingdom?: string;
    data: Record<string, unknown> = {};

    private _condition?: (this: SkillEntity, room: Room) => boolean;
    private _visible?: (this: SkillEntity, room: Room) => boolean;
    private _global?: (this: SkillEntity, room: Room, player: Player) => boolean;
    private _effects: EffectBuilder[] = [];
    private _refreshs: Array<TimingCallback<any, SkillEntity>> = [];
    private _ai?: SkillAI;

    constructor(name: string) {
        this.name = name;
    }

    addEffect(effect: string | EffectBuilder): EffectBuilder {
        if (typeof effect === 'string') {
            const existing = this._effects.find((e) => e.name === effect);
            if (existing) return existing;
            const builder = EffectBuilder(effect);
            this._effects.push(builder);
            return builder;
        }
        const existing = this._effects.find((e) => e.name === effect.name);
        if (existing) return existing;
        this._effects.push(effect);
        return effect;
    }

    ai(config: SkillAI): this {
        this._ai = config;
        return this;
    }

    condition(fn: (this: SkillEntity, room: Room) => boolean): this {
        this._condition = fn;
        return this;
    }

    visible(fn: (this: SkillEntity, room: Room) => boolean): this {
        this._visible = fn;
        return this;
    }

    global(fn: (this: SkillEntity, room: Room, player: Player) => boolean): this {
        this._global = fn;
        return this;
    }

    refresh<T extends TimingTrigger>(data: TimingCallback<T, SkillEntity>): this {
        this._refreshs.push(data);
        return this;
    }

    build(): SkillData {
        return {
            name: this.name,
            data: this.data,
            is_rule: this.is_rule,
            is_lord: this.is_lord,
            attached_equip: this.attached_equip,
            attached_kingdom: this.attached_kingdom,
            condition: this._condition ?? (() => true),
            visible: this._visible,
            global: this._global,
            effects: this._effects.map((builder) => builder.build(this.name)),
            refreshs: this._refreshs.length > 0 ? [...this._refreshs] : undefined,
            ai: this._ai,
        };
    }

    register(): SkillData {
        if (sgs.skills.has(this.name)) {
            return sgs.skills.get(this.name)!;
        }
        const data = this.build();
        for (const e of data.effects) {
            if (!sgs.effects.has(e.name)) {
                sgs.effects.set(e.name, e);
            }
        }
        sgs.skills.set(data.name, data);
        return data;
    }
}

/** 构建并注册技能数据（sgs.createSkill）——name 必传，内部经 SkillBuilder 复用默认值并连带注册效果；已注册则直接返回已有数据 */
export function Skill(input: Pick<SkillData, 'name'> & Partial<SkillData>): SkillData {
    if (sgs.skills.has(input.name)) {
        return sgs.skills.get(input.name)!;
    }
    const b = SkillBuilder(input.name);
    if (input.data !== undefined) b.data = input.data;
    if (input.is_rule !== undefined) b.is_rule = input.is_rule;
    if (input.is_lord !== undefined) b.is_lord = input.is_lord;
    if (input.attached_equip !== undefined) b.attached_equip = input.attached_equip;
    if (input.attached_kingdom !== undefined) b.attached_kingdom = input.attached_kingdom;
    if (input.condition !== undefined) b.condition(input.condition);
    if (input.visible !== undefined) b.visible(input.visible);
    if (input.global !== undefined) b.global(input.global);
    if (input.refreshs !== undefined) {
        for (const r of input.refreshs) b.refresh(r);
    }
    if (input.ai !== undefined) b.ai(input.ai);
    const data = b.build();
    if (input.effects !== undefined && input.effects.length > 0) {
        data.effects = input.effects.map((e) => {
            if (!e.name.startsWith(`${data.name}.`)) {
                e = { ...e, name: `${data.name}.${e.name}` };
            }
            return Effect(e);
        });
    }
    sgs.skills.set(data.name, data);
    return data;
}
