import { GameCard } from '../../../../core/card/card';
import { CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';

export const cs_duangui = sgs.General({
    name: 'cs_duangui',
    kingdom: 'qun',
    hp: 1,
    gender: Gender.Male,
    enable: false,
    hidden: true,
});

export const chixia = sgs.Skill({
    name: 'cs_duangui.chixia',
});

//TODO 禁用特定条件的响应

chixia.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.AssignTargeted,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.from === player &&
                data.card &&
                data.card.name === 'sha' &&
                data.targetCount === 1
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(2);
            await room.puto({
                player: from,
                cards,
                toArea: room.processingArea,
                animation: true,
                source: data,
                reason: this.name,
            });
            return cards;
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            const cards = context.cost as GameCard[];
            const suits: CardSuit[] = [];
            cards.forEach((v) => {
                if (!suits.includes(v.suit) && v.suit !== CardSuit.None) {
                    suits.push(v.suit);
                }
                if (room.sameAsSuit(v, data.card)) {
                    data.baseDamage += 1;
                }
            });
            await room.puto({
                player: from,
                cards,
                toArea: room.discardArea,
                animation: true,
                source: data,
                reason: this.name,
            });
        },
    })
);

cs_duangui.addSkill(chixia);
