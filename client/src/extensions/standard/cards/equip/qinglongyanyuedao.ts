import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventData } from '../../../../core/event/data';
import { EventTriggers } from '../../../../core/event/triggers';
import {
    TargetListItem,
    UseCardEvent,
} from '../../../../core/event/types/event.use';
import { GameRoom } from '../../../../core/room/room';
import { TriggerEffect } from '../../../../core/skill/effect';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const qinglongyanyuedao = sgs.CardUseEquip({
    name: 'qinglongyanyuedao_bs',
});

sgs.setCardData('qinglongyanyuedao_bs', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'ao',
});

export const qinglong_skill = sgs.Skill({
    name: 'qinglongyanyuedao_bs',
    attached_equip: 'qinglongyanyuedao_bs',
});

qinglong_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 3;
            }
        },
    })
);
qinglong_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'qinglongyanyuedao_skill',
        audio: ['qinglongyanyuedao'],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.BeOffset,
        getSelectors(room, context) {
            return {
                target_limit: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                excluesCardDistanceLimit: true,
                                excluesCardTimesLimit: true,
                                filter(item, selected) {
                                    return item === target;
                                },
                            }),
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
                const { from, current, card } = data;
                return (
                    card.name === 'sha' &&
                    player === from &&
                    current.target.alive
                );
            }
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
        },
        async cost(room, data: UseCardEvent, context) {
            const { from } = context;
            return await room.needUseCard({
                from,
                cards: [{ name: 'sha' }],
                reqOptions: {
                    canCancle: true,
                    prompt: `@qinglongyanyuedao`,
                    thinkPrompt: this.name,
                },
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context,
                },
                source: data,
                reason: this.name,
            });
        },
    })
);

sgs.loadTranslation({
    ['@qinglongyanyuedao']: '青龙偃月刀：你可以继续使用杀',
});
