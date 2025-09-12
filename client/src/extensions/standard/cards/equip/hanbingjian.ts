import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const hanbingjian = sgs.CardUseEquip({
    name: 'hanbingjian',
});

sgs.setCardData('hanbingjian', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'an',
});

export const hanbing_skill = sgs.Skill({
    name: 'hanbingjian',
    attached_equip: 'hanbingjian',
});

hanbing_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 2;
            }
        },
    })
);

hanbing_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'hanbingjian_skill',
        audio: ['hanbingjian'],
        auto_log: 1,
        auto_directline: 1,
        forced: 'cost',
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.CauseDamage2,
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getSelfCards(),
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '寒冰剑',
                                    timebar: room.responseTime,
                                    prompt: `寒冰剑：请选择一张牌（还剩${context.count}张）`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '寒冰剑',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
                const { from, reason, to } = data;
                return (
                    reason === 'sha' && player === from && to.hasCardsInArea()
                );
            }
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async cost(room, data: DamageEvent, context) {
            await data.prevent();
            return true;
        },
        async effect(room, data: DamageEvent, context) {
            const {
                from,
                targets: { [0]: target },
            } = context;
            let count = 2;
            while (
                count-- > 0 &&
                target.hasCanDropCards('he', from, 1, this.name)
            ) {
                context.count = count + 1;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);
