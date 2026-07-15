import { Room } from '../Room';
import { Player } from '@shared/core/player/Player';
import {
    EffectData,
    EffectOptions,
    SkillData,
    SkillOptions,
    StateEffectType,
} from '@shared/core/skill/SkillTypes';
import { Skill } from '@shared/core/skill/Skill';
import { Effect } from '@shared/core/skill/Effect';
import { SkillState } from '@shared/core/schema/SkillState';
import { EffectState } from '@shared/core/schema/EffectState';
import { TimingName } from '@shared/core/event/EventTypes';
import { PriorityType, SkillAsset } from '@shared/core/skill/SkillTypes';

/**
 * 技能管理器 — 技能/效果生命周期、效果索引、状态技查询。
 */
export class SkillManager {
    constructor(readonly room: Room) {}

    // ===== 技能生命周期 =====

    /** 为玩家添加技能并创建所有关联 Effect */
    addSkill(
        skillName: string,
        player: Player | undefined,
        options: SkillOptions = {},
    ): Skill | undefined {
        const data = sgs.skills.get(skillName);
        if (!data) return undefined;

        const id = ++this.room.skillIds;
        const state = new SkillState();
        const skill = new Skill(id, player, data, this.room, state, options);

        this.room.skills.push(skill);
        this.room.state.skillStates.set(id.toString(), state);

        if (data.refreshs) {
            this.room.event.registerRefreshs(skill, data.refreshs);
        }
        if (options.refreshs) {
            this.room.event.registerRefreshs(skill, options.refreshs);
        }

        for (const edata of data.effects) {
            const effect = this.addEffect(edata.name, player, {}, skill);
            if (effect) skill.effects.push(effect);
        }

        return skill;
    }

    /** 移除技能及所有关联效果 */
    async removeSkill(skill: Skill) {
        if (skill._jsonData.refreshs) {
            this.room.event.unregisterRefreshs(skill, skill._jsonData.refreshs);
        }
        if (skill.options.refreshs) {
            this.room.event.unregisterRefreshs(skill, skill.options.refreshs);
        }
        for (const effect of skill.effects.slice()) {
            await this.removeEffect(effect);
        }
        const idx = this.room.skills.indexOf(skill);
        if (idx >= 0) this.room.skills.splice(idx, 1);
        this.room.state.skillStates.delete(skill.id.toString());
    }

    // ===== 效果生命周期 =====

    /** 创建效果并注册索引 */
    addEffect(
        effectName: string,
        player: Player | undefined,
        options: EffectOptions = {},
        fromSkill?: Skill,
    ): Effect | undefined {
        const data = sgs.effects.get(effectName);
        if (!data) return undefined;

        const id = ++this.room.effectIds;
        const state = new EffectState();
        const effect = new Effect(
            id,
            player,
            data,
            this.room,
            state,
            options,
            fromSkill,
        );

        this.room.effects.push(effect);
        this.room.state.effectStates.set(id.toString(), state);

        // 注册到索引
        this.registerEffect(effect);

        if (data.refreshs) {
            this.room.event.registerRefreshs(effect, data.refreshs);
        }
        if (options.refreshs) {
            this.room.event.registerRefreshs(effect, options.refreshs);
        }

        return effect;
    }

    /** 移除效果：注销索引 → 从列表移除 */
    async removeEffect(effect: Effect, removeSkill: boolean = false) {
        this.unregisterEffect(effect);

        if (effect._jsonData.refreshs) {
            this.room.event.unregisterRefreshs(
                effect,
                effect._jsonData.refreshs,
            );
        }
        if (effect.options.refreshs) {
            this.room.event.unregisterRefreshs(effect, effect.options.refreshs);
        }

        const idx = this.room.effects.indexOf(effect);
        if (idx >= 0) this.room.effects.splice(idx, 1);
        this.room.state.effectStates.delete(effect.id.toString());

        if (removeSkill && effect.skill) {
            await this.removeSkill(effect.skill);
        }
    }

    // ===== 效果索引注册（触发 + 状态） =====

    /** 注册效果到房间索引：触发效果 → triggerEffects，状态效果 → stateEffects */
    private registerEffect(effect: Effect) {
        // 触发效果
        if (effect.hasTrigger) {
            const timing = effect._jsonData.trigger as TimingName;
            if (timing) {
                let timingMap = this.room.triggerEffects.get(timing);
                if (!timingMap) {
                    timingMap = new Map();
                    this.room.triggerEffects.set(timing, timingMap);
                }

                const priority =
                    effect._jsonData.priority || PriorityType.General;
                let entry = timingMap.get(priority);
                if (!entry) {
                    entry = { global: [], byPlayer: new Map() };
                    timingMap.set(priority, entry);
                }

                if (effect._jsonData.settings?.global) {
                    entry.global.push(effect);
                } else {
                    const pid = effect.state.playerId;
                    if (pid) {
                        let list = entry.byPlayer.get(pid);
                        if (!list) {
                            list = [];
                            entry.byPlayer.set(pid, list);
                        }
                        list.push(effect);
                    }
                }
            }
        }

        // 状态效果
        if (effect.hasState) {
            const callbacks = effect._jsonData.stateCallbacks;
            if (callbacks) {
                for (const key of Object.keys(callbacks)) {
                    const type = Number(key) as StateEffectType;
                    let list = this.room.stateEffects.get(type);
                    if (!list) {
                        list = [];
                        this.room.stateEffects.set(type, list);
                    }
                    list.push(effect);
                }
            }
        }
    }

    /** 注销效果索引 */
    private unregisterEffect(effect: Effect) {
        // 触发效果
        if (effect.hasTrigger) {
            const timing = effect._jsonData.trigger as TimingName;
            if (timing) {
                const timingMap = this.room.triggerEffects.get(timing);
                if (timingMap) {
                    const priority =
                        effect._jsonData.priority || PriorityType.General;
                    const entry = timingMap.get(priority);
                    if (entry) {
                        const remove = (arr: Effect[]) => {
                            const i = arr.indexOf(effect);
                            if (i >= 0) arr.splice(i, 1);
                        };
                        remove(entry.global);
                        const playerList = entry.byPlayer.get(
                            effect.state.playerId,
                        );
                        if (playerList) remove(playerList);
                    }
                }
            }
        }

        // 状态效果
        if (effect.hasState) {
            const callbacks = effect._jsonData.stateCallbacks;
            if (callbacks) {
                for (const key of Object.keys(callbacks)) {
                    const type = Number(key) as StateEffectType;
                    const list = this.room.stateEffects.get(type);
                    if (list) {
                        const i = list.indexOf(effect);
                        if (i >= 0) list.splice(i, 1);
                    }
                }
            }
        }
    }

    // ===== 状态技查询 =====

    /**
     * 查询所有匹配的状态效果回调。
     */
    getStates<T extends StateEffectType>(type: T, ...args: any[]): any[] {
        const results: any[] = [];
        const list = this.room.stateEffects.get(type);
        if (!list) return results;
        for (const effect of list) {
            if (effect.isInvalid || !effect.check()) continue;
            const cb = (effect._jsonData.stateCallbacks as any)?.[type];
            if (typeof cb !== 'function') continue;
            const r = cb.call(effect, ...args);
            if (r !== undefined) results.push(r);
        }
        return results;
    }
}
