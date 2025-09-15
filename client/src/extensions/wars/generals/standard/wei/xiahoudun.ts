import { CardSuit } from '../../../../../core/card/card.types';
import { DamageType } from '../../../../../core/event/event.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { JudgeEvent } from '../../../../../core/event/types/event.judge';
import { Gender } from '../../../../../core/general/general.type';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const xiahoudun = sgs.General({
    name: 'wars.xiahoudun',
    kingdom: 'wei',
    hp: 2.5,
    gender: Gender.Male,
    isWars: true,
});

export const ganglie = sgs.Skill({
    name: 'wars.xiahoudun.ganglie',
});

ganglie.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        auto_directline: 1,
        forced: 'cost',
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createDropCards(target, {
                                step: 1,
                                count: 2,
                                selectable: target.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '刚烈，你需要弃置两张手牌，否则受到1点伤害',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                player === data.to
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.from],
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            return await room.judge({
                player: from,
                isSucc(result) {
                    return result.suit !== CardSuit.Heart;
                },
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const from = context.from;
            const target = context.targets.at(0);
            const judge = context.cost as JudgeEvent;
            if (target && judge.success) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                if (cards.length === 2) {
                    await room.dropCards({
                        player: target,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                } else {
                    await room.damage({
                        from,
                        to: target,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

xiahoudun.addSkill(ganglie);
