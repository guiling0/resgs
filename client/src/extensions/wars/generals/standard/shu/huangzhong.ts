import { EventTriggers } from '../../../../../core/event/triggers';
import { UseCardEvent } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { GameRoom } from '../../../../../core/room/room';
import {
    PriorityType,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

function checkLiubeiLevel(room: GameRoom) {
    const wuhu = room.getEffect(room.getMark<number>('#wuhujiangdaqi'));
    return wuhu ? wuhu.isOpen() && wuhu.check() : false;
}

export const huangzhong = sgs.General({
    name: 'wars.huangzhong',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const liegong = sgs.Skill({
    name: 'wars.huangzhong.liegong',
});

liegong.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.card.name === 'sha' &&
                data.from === player
            ) {
                const phase = room.getCurrentPhase();
                if (phase.isOwner(player, Phase.Play)) {
                    const target = data.current.target;
                    const count = target.getHandCards().length;
                    return count >= player.hp || count <= player.range;
                }
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { targets } = context;
            return await data.targetCantResponse(targets);
        },
    })
);

liegong.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Correct](from) {
            const room = this.room;
            if (this.isOwner(from) && checkLiubeiLevel(room)) {
                return 1;
            }
        },
    })
);

huangzhong.addSkill(liegong);

export const huangzhong_v2025 = sgs.General({
    name: 'wars.v2025.huangzhong',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const liegong_v2025 = sgs.Skill({
    name: 'wars.v2025.huangzhong.liegong',
});

liegong_v2025.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.General,
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                data.card.name === 'sha' &&
                data.from === player
            ) {
                const phase = room.getCurrentPhase();
                if (phase.isOwner(player, Phase.Play)) {
                    const target = data.current.target;
                    const count = target.getHandCards().length;
                    return count >= player.hp || count <= player.range;
                }
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { targets } = context;
            return await data.targetCantResponse(targets);
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            const count = from.getHandCards().length;
            if (count >= from.hp && count <= from.range) {
                data.baseDamage += 1;
            }
        },
    })
);

liegong_v2025.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Correct](from) {
            const room = this.room;
            if (this.isOwner(from) && checkLiubeiLevel(room)) {
                return 1;
            }
        },
    })
);

huangzhong_v2025.addSkill(liegong_v2025);
