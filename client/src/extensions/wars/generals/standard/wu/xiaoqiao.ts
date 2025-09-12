import { CardSuit } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { JudgeEvent } from '../../../../../core/event/types/event.judge';
import { Gender } from '../../../../../core/general/general.type';
import {
    PriorityType,
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const xiaoqiao = sgs.General({
    name: 'wars.xiaoqiao',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const tianxiang = sgs.Skill({
    name: 'wars.xiaoqiao.tianxiang',
});

tianxiang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && player === data.to;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.suit === CardSuit.Heart;
                                },
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    return item !== from;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `天香，你可以弃置一张红桃牌让一名角色受到伤害或失去体力`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const options = ['tianxiang.damage', 'tianxiang.losehp'];
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: options,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: `天香，请选择一项`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: DamageEvent, context) {
            const {
                from,
                targets: [target],
                cards,
            } = context;
            await data.prevent();
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('tianxiang.damage')) {
                const damage = await room.damage({
                    from: data.from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
                if (damage) {
                    await room.drawCards({
                        player: target,
                        count: Math.min(5, target.losshp),
                        source: data,
                        reason: this.name,
                    });
                }
            }
            if (result.includes('tianxiang.losehp')) {
                const lose = await room.losehp({
                    player: target,
                    source: data,
                    reason: this.name,
                });
                const card = cards.at(0);
                if (
                    lose &&
                    (card.area === room.drawArea ||
                        card.area === room.discardArea)
                ) {
                    await room.obtainCards({
                        player: target,
                        cards: [card],
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const hongyan = sgs.Skill({
    name: 'wars.xiaoqiao.hongyan',
});

hongyan.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.Regard_CardData](card, property, source) {
            if (
                card.area === this.player.handArea &&
                property === 'suit' &&
                source === CardSuit.Spade
            ) {
                return CardSuit.Heart;
            }
        },
    })
);

hongyan.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        priorityType: PriorityType.General,
        trigger: EventTriggers.JudgeResult2,
        can_trigger(room, player, data: JudgeEvent) {
            return (
                this.isOwner(player) &&
                this.isOpen() &&
                data.player === player &&
                data.result.suit === CardSuit.Spade
            );
        },
        async cost(room, data: JudgeEvent, context) {
            data.result.suit = CardSuit.Heart;
            data.resetSuccess();
            return true;
        },
    })
);

xiaoqiao.addSkill(tianxiang);
xiaoqiao.addSkill(hongyan);

sgs.loadTranslation({
    ['tianxiang.damage']: '受到伤害',
    ['tianxiang.losehp']: '失去体力',
});
