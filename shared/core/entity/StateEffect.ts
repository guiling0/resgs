import { Effect } from './Effect';
import type { Room } from './Room';
import type { Skill } from './Skill';
import type { Player } from './Player';
import { EffectType } from '../types/SkillTypes';
import type { EffectOptions, EffectData, StateEffectType } from '../types/SkillTypes';

/**
 * 状态类效果——持续生效的修正效果，状态回调由 state 配置承载。
 */
export class StateEffect extends Effect {
    constructor(room: Room, data: EffectData, skill?: Skill, player?: Player, options?: EffectOptions) {
        super(room, data, skill, player, EffectType.State, options);
        // 登记状态效果索引
        room.stateEffectsById.set(this.id, this);
        // 登记状态类型索引（每个状态回调键登记一条）
        const state = data.state;
        if (state) {
            for (const key of Object.keys(state)) {
                const type = key as unknown as StateEffectType;
                let list = room.stateEffectsByType.get(type);
                if (!list) {
                    list = [];
                    room.stateEffectsByType.set(type, list);
                }
                list.push(this);
            }
        }
    }
}
