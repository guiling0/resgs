import {
    CardType,
    CardSubType,
    CardColor,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { JudgeEvent } from '../../../../core/event/types/event.judge';
import { NeedPlayCardData } from '../../../../core/event/types/event.play';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { PriorityType } from '../../../../core/skill/skill.types';

export const baguazhen = sgs.CardUseEquip({ name: 'baguazhen' });

sgs.setCardData('baguazhen', {
    type: CardType.Equip,
    subtype: CardSubType.Armor,
    rhyme: 'en',
});

export const baguazhen_skill = sgs.Skill({
    name: 'baguazhen',
    attached_equip: 'baguazhen',
});

baguazhen_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'baguazhen_skill',
        audio: ['baguazhen'],
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedUseCard1,
        auto_log: 1,
        forced: 'cost',
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.NeedUseCardData)) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return result.color === CardColor.Red;
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: NeedUseCardData, context) {
            const { from } = context;
            const judge = context.cost as JudgeEvent;
            if (judge.success) {
                const shan = room.createVirtualCardByNone('shan');
                shan.custom.method = 1;
                data.used = await room.preUseCard(
                    Object.assign(
                        {
                            from,
                            card: shan,
                        },
                        data.copy()
                    )
                );
            }
        },
    })
);

baguazhen_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'baguazhen_skill',
        audio: ['baguazhen'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedPlayCard1,
        forced: 'cost',
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData)
            ) {
                return data.from === player && data.has('shan');
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return result.color === CardColor.Red;
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: NeedPlayCardData, context) {
            const { from } = context;
            const judge = context.cost as JudgeEvent;
            if (judge.success) {
                const shan = room.createVirtualCardByNone('shan');
                data.played = await room.prePlayCard(
                    Object.assign(
                        {
                            from,
                            card: shan,
                        },
                        data.copy()
                    )
                );
            }
        },
    })
);
