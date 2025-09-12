import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { DamageType } from '../../../../core/event/event.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const xijia_lose = sgs.TriggerEffect({
    name: 'xijia_lose',
    auto_log: 1,
    priorityType: PriorityType.Equip,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) => c.name === 'xijia' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const xijia = data.getCard(
            (d, c) => c.name === 'xijia' && d.toArea === room.discardArea
        );
        const _data = data.get(xijia);
        return {
            from: _data.player,
            cards: [xijia],
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

export const xijia = sgs.CardUseEquip({
    name: 'xijia',
    effects: [xijia_lose.name],
});

sgs.setCardData('xijia', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'a',
});

export const xijia_skill = sgs.Skill({
    name: 'xijia',
    attached_equip: 'xijia',
});

xijia_skill.addEffect(
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

xijia_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.damageType === DamageType.Fire &&
                this.skill &&
                this.skill.sourceEquip
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.removeCard({
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

xijia_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage2,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.damageType === DamageType.None &&
                !this.getData('times')
            );
        },
        async cost(room, data: DamageEvent, context) {
            data.number -= 1;
            this.setData('times', 1);
            return true;
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                async on_exec(room, data) {
                    this.removeData('times');
                },
            },
        ],
    })
);
