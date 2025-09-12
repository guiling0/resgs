import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { GamePlayer } from '../../../../core/player/player';
import { MoveCardReason } from '../../../../core/room/room.types';
import { StateEffect } from '../../../../core/skill/effect';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../core/skill/skill.types';

function offensiveMountCorrect(
    this: StateEffect,
    from: GamePlayer,
    to: GamePlayer
) {
    if (this.isOwner(from)) {
        return -1;
    }
}

export const jingfan = sgs.CardUseEquip({
    name: 'jingfan',
});
sgs.setCardData('jingfan', {
    type: CardType.Equip,
    subtype: CardSubType.OffensiveMount,
    rhyme: 'an',
});
export const chitu_skill = sgs.Skill({
    name: 'jingfan',
    attached_equip: 'jingfan',
});
chitu_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: offensiveMountCorrect,
    })
);

export const liulongcanjia = sgs.CardUseEquip({
    name: 'liulongcanjia',
});
sgs.setCardData('liulongcanjia', {
    type: CardType.Equip,
    subtype: CardSubType.SpecialMount,
    rhyme: 'a',
});
export const liulong_skill = sgs.Skill({
    name: 'liulongcanjia',
    attached_equip: 'liulongcanjia',
});

liulong_skill.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Distance_Correct](from, to) {
            if (this.isOwner(to)) {
                return 1;
            }
            if (this.isOwner(from)) {
                return -1;
            }
        },
        /** 5不能使用坐骑牌 */
        [StateEffectType.Prohibit_UseCard](from, card, target, reason) {
            if (this.isOwner(from)) {
                const type = sgs.utils.getCardSubtype(card.name);
                if (
                    type === CardSubType.DefensiveMount ||
                    type === CardSubType.OffensiveMount ||
                    type === CardSubType.SpecialMount
                ) {
                    return true;
                }
            }
        },
    })
);

/** 3当【六龙骖驾】移至你的装备区后❶，你弃置你的装备区里所有其他坐骑牌。 */
liulong_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return this.isOwner(player) && data.has(this.skill?.sourceEquip);
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.dropCards({
                player: from,
                cards: from
                    .getHorses()
                    .filter((v) => v !== this.skill?.sourceEquip),
                source: data,
                reason: this.name,
            });
        },
    })
);

/** 4 锁定技，当坐骑牌移至你的装备区前❶，你将目标区域改为弃牌堆。*/
liulong_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore1,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (v, c) =>
                        v.toArea === player.equipArea &&
                        (c.subtype === CardSubType.DefensiveMount ||
                            c.subtype === CardSubType.OffensiveMount ||
                            c.subtype === CardSubType.SpecialMount)
                )
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards: GameCard[] = [];
            data.move_datas.forEach((v) => {
                if (v.toArea === from.equipArea) {
                    v.cards.forEach((c) => {
                        if (
                            c.subtype === CardSubType.DefensiveMount ||
                            c.subtype === CardSubType.OffensiveMount ||
                            c.subtype === CardSubType.SpecialMount
                        ) {
                            cards.push(c);
                        }
                    });
                }
            });
            if (cards.length) {
                await data.cancle(cards, false);
                data.add({
                    cards: cards,
                    toArea: room.discardArea,
                    reason: MoveCardReason.PutTo,
                    movetype: CardPut.Up,
                    puttype: CardPut.Up,
                    animation: true,
                });
                return true;
            }
        },
    })
);
