import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const pianxiangche_lose = sgs.TriggerEffect({
    name: 'pianxiangche_lose',
    auto_log: 1,
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) => c.name === 'pianxiangche' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const pianxiangche = data.getCard(
            (d, c) => c.name === 'pianxiangche' && d.toArea === room.discardArea
        );
        const _data = data.get(pianxiangche);
        return {
            from: _data.player,
            cards: [pianxiangche],
        };
    },
    async cost(room, data: MoveCardEvent, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data: MoveCardEvent, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: CardPut.Down,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});

export const pianxiangche = sgs.CardUseEquip({
    name: 'pianxiangche',
    effects: [pianxiangche_lose.name],
});

sgs.setCardData('pianxiangche', {
    type: CardType.Equip,
    subtype: CardSubType.OffensiveMount,
    rhyme: 'e',
});

export const pianxiangche_skill = sgs.Skill({
    name: 'pianxiangche',
    attached_equip: 'pianxiangche',
});

pianxiangche_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(from)) {
                return -1;
            }
            if (
                this.isOwner(to) &&
                this.room.getSiege(to).find((v) => v.target === to)
            ) {
                return 1;
            }
        },
    })
);

pianxiangche_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
                const _data = data.get(this.skill.sourceEquip);
                if (!_data) return false;
                return (
                    _data.reason === MoveCardReason.Obtain &&
                    _data.toArea.player !== player
                );
            }
        },
        async cost(room, data: MoveCardEvent, context) {
            return await data.cancle([this.skill.sourceEquip]);
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);
