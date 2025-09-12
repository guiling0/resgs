import { EventTriggers } from '../../../../core/event/triggers';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { SkillTag } from '../../../../core/skill/skill.types';

export const simaliang = sgs.General({
    name: 'wars.simaliang',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const gongzhi = sgs.Skill({
    name: 'wars.simaliang.gongzhi',
});

gongzhi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.DrawPhaseStart,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) && data.isOwner(player) && !data.isComplete
            );
        },
        async cost(room, data: PhaseEvent, context) {
            await data.skip();
            return true;
        },
        async effect(room, data, context) {
            const { from } = context;
            let source = from;
            let number = 4;
            while (number-- > 0) {
                await room.drawCards({
                    player: source,
                    source: data,
                    reason: this.name,
                });
                const players = room.sortPlayers(room.playerAlives, source);
                const player = players.find(
                    (v) => room.sameAsKingdom(from, v) && v !== source
                );
                if (player) source = player;
            }
        },
    })
);

export const sheju = sgs.Skill({
    name: 'wars.simaliang.sheju',
});

sheju.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.Opened,
        can_trigger(room, player, data: OpenEvent) {
            return (
                this.isOwner(player) &&
                player !== data.player &&
                room.sameAsKingdom(player, data.player) &&
                player.losshp > 0
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.recoverhp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.dropCards({
                player: from,
                cards: from.getHandCards(),
                source: data,
                reason: this.name,
            });
        },
    })
);

simaliang.addSkill(gongzhi);
simaliang.addSkill(sheju);
