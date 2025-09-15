import { EventTriggers } from '../../../../core/event/triggers';
import { PlayCardEvent } from '../../../../core/event/types/event.play';
import {
    UseCardEvent,
    UseCardToCardEvent,
    UseEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const shamoke = sgs.General({
    name: 'wars.shamoke',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const jili = sgs.Skill({
    name: 'wars.shamoke.jili',
});

jili.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: [EventTriggers.CardBeUse, EventTriggers.CardBePlay],
        can_trigger(room, player, data: UseEvent | PlayCardEvent) {
            if (this.isOwner(player) && data.from === player) {
                return (
                    room.getPeriodHistory(room.currentTurn).filter((v) => {
                        return (
                            (v.data.is(sgs.DataType.UseCardEvent) ||
                                v.data.is(sgs.DataType.UseCardToCardEvent) ||
                                v.data.is(sgs.DataType.PlayCardEvent)) &&
                            v.data.from === player
                        );
                    }).length === player.range
                );
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                count: from.range,
                source: data,
                reason: this.name,
            });
        },
    })
);

shamoke.addSkill('wars.shamoke.jili');
