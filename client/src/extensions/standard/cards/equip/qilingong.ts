import { CardType, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';

export const qilingong = sgs.CardUseEquip({
    name: 'qilingong',
});

sgs.setCardData('qilingong', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'ong',
});

export const qilingong_skill = sgs.Skill({
    name: 'qilingong',
    attached_equip: 'qilingong',
});

qilingong_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 5;
            }
        },
    })
);

qilingong_skill.addEffect(
    sgs.TriggerEffect({
        anim: 'qilingong_skill',
        audio: ['qilingong'],
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
                                selectable: target.getHorses(),
                                data_rows: [
                                    {
                                        title: 'equipArea',
                                        cards: target.getHorses(),
                                    },
                                ],
                                windowOptions: {
                                    title: '麒麟弓',
                                    timebar: room.responseTime,
                                    prompt: `麒麟弓：请选择一张牌`,
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: '麒麟弓',
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
                const { from, reason, to } = data;
                return (
                    reason === 'sha' &&
                    player === from &&
                    to.getHorses().length > 0
                );
            }
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        async cost(room, data: DamageEvent, context) {
            const {
                from,
                targets: { [0]: target },
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);
