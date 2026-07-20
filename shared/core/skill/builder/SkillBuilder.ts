import { TimingData, TimingTrigger } from '../../event/EventTypes';
import { Player } from '../../player/Player';
import { Room } from '../../room/Room';
import { Skill } from '../Skill';
import { SkillData, TimingCallback } from '../SkillTypes';
import { EffectBuilder } from './EffectBuilder';

/** SkillBuilder 实例接口 */
export interface SkillBuilder {
    name: string;
    data: Record<string, any>;
    is_rule: boolean;
    is_lord: boolean;
    attached_equip?: string;
    attached_kingdom?: string;

    addEffect(effect: string | EffectBuilder): EffectBuilder;
    ai(config: any): this;
    condition(fn: (this: Skill, room: Room) => boolean): this;
    visible(fn: (this: Skill, room: Room) => boolean): this;
    global(fn: (this: Skill, room: Room, player: Player) => boolean): this;
    refresh<U extends TimingTrigger>(data: TimingCallback<U, Skill>): this;
    register(): SkillData;
}

/** SkillBuilder 工厂——无需 new */
export function SkillBuilder(name: string): SkillBuilder {
    return new _SkillBuilder(name);
}

class _SkillBuilder implements SkillBuilder {
    name: string;
    data: Record<string, any> = {};
    is_rule: boolean = false;
    is_lord: boolean = false;
    attached_equip?: string;
    attached_kingdom?: string;

    private _condition?: (this: Skill, room: Room) => boolean;
    private _visible?: (this: Skill, room: Room) => boolean;
    private _global?: (this: Skill, room: Room, player: Player) => boolean;
    private _effects: EffectBuilder[] = [];
    private _refreshs: Array<TimingCallback<any, Skill>> = [];
    private _ai?: any;

    constructor(name: string) {
        this.name = name;
    }

    addEffect(effect: string | EffectBuilder): EffectBuilder {
        if (typeof effect === 'string') {
            // 已注册则直接返回，避免重复创建
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

    ai(config: any) {
        this._ai = config;
        return this;
    }

    condition(fn: (this: Skill, room: Room) => boolean): this {
        this._condition = fn;
        return this;
    }

    visible(fn: (this: Skill, room: Room) => boolean): this {
        this._visible = fn;
        return this;
    }

    global(fn: (this: Skill, room: Room, player: Player) => boolean): this {
        this._global = fn;
        return this;
    }

    refresh<U extends TimingTrigger>(data: TimingCallback<U, Skill>): this {
        this._refreshs.push(data);
        return this;
    }

    register(): SkillData {
        const data: SkillData = {
            name: this.name,
            data: this.data,
            is_rule: this.is_rule,
            is_lord: this.is_lord,
            attached_equip: this.attached_equip,
            attached_kingdom: this.attached_kingdom,
            condition: this._condition ?? (() => true),
            visible: this._visible ?? (() => true),
            global: this._global ?? (() => true),
            effects: this._effects.map((builder) => builder.register(this.name)),
            ai: this._ai,
        };
        if (sgs.skills.has(this.name)) {
            console.warn(`[SkillBuilder] 技能 "${this.name}" 已存在——跳过重复注册`);
            return sgs.skills.get(this.name)!;
        }
        sgs.skills.set(this.name, data);
        return data;
    }
}
