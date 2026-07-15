import { TimingData, TimingTrigger } from '../../event/EventTypes';
import { Player } from '../../player/Player';
import { Room } from '../../room/Room';
import { Skill } from '../Skill';
import { SkillData, TimingCallback } from '../SkillTypes';
import { EffectBuilder } from './EffectBuilder';

export class SkillBuilder {
    /** 技能名称 等同于技能id */
    name: string;
    /** 自定义数据 */
    data: Record<string, any> = {};
    /** 是否为规则技能 */
    is_rule: boolean = false;
    /** 是否为主公技能 */
    is_lord: boolean = false;
    /** 哪个装备的技能 */
    attached_equip: string;
    /** 哪些势力可以获得该技能，仅用于势力技 */
    attached_kingdom: string;

    /** 基础技能条件 */
    private _condition: (this: Skill, room: Room) => boolean;
    /** 是否可见 */
    private _visible?: (this: Skill, room: Room) => boolean;
    /** 全局技能哪些玩家显示按钮 */
    private _global?: (this: Skill, room: Room, player: Player) => boolean;
    private _effects: EffectBuilder[] = [];
    private _refreshs?: Array<TimingCallback<any, Skill>> = [];
    private _ai?: any;

    constructor(name: string) {
        this.name = name;
    }

    addEffect(effect: string | EffectBuilder): EffectBuilder {
        if (typeof effect === 'string') {
            const builder = new EffectBuilder(effect);
            this._effects.push(builder);
            return builder;
        } else {
            this._effects.push(effect);
            return effect;
        }
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
        return {
            name: this.name,
            data: this.data,
            is_rule: this.is_rule,
            is_lord: this.is_lord,
            attached_equip: this.attached_equip,
            attached_kingdom: this.attached_kingdom,
            condition: this._condition ?? (() => true),
            visible: this._visible ?? (() => true),
            global: this._global ?? (() => true),
            effects: this._effects.map((builder) => builder.build(this.name)),
            ai: this._ai,
        };
    }
}
