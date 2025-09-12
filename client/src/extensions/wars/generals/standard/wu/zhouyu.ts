import { CardPut, CardSuit } from '../../../../../core/card/card.types';
import { CustomString } from '../../../../../core/custom/custom.type';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import {
    SkillTag,
    StateEffectType,
} from '../../../../../core/skill/skill.types';

export const zhouyu = sgs.General({
    name: 'wars.zhouyu',
    kingdom: 'wu',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const yingzi = sgs.Skill({
    name: 'wars.zhouyu.yingzi',
});

yingzi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.DrawPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        async cost(room, data: PhaseEvent, context) {
            data.ratedDrawnum++;
            return true;
        },
    })
);

yingzi.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.MaxHand_Initial](from) {
            if (this.isOwner(from)) {
                return from.maxhp;
            }
        },
    })
);

export const fanjian = sgs.Skill({
    name: 'wars.zhouyu.fanjian',
});

fanjian.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
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
                            prompt: '反间：你可以展示一张牌并交给一名角色',
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    const suit = context.suit as CardSuit;
                    const options: CustomString[] = [
                        {
                            text: `${
                                !target.hasHandCards() ? '!' : ''
                            }yingzi.show`,
                            values: [{ type: 'string', value: `suit${suit}` }],
                        },
                        'yingzi.losehp',
                    ];
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
                            prompt: '反间：请选择一项',
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
                cards,
            } = context;
            context.suit = cards.at(0)?.suit;
            return await room.giveCards({
                from,
                to: target,
                cards,
                movetype: CardPut.Up,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const suit = context.suit;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('yingzi.show')) {
                await room.showCards({
                    player: target,
                    cards: target.getHandCards(),
                    source: data,
                    reason: this.name,
                });
                await room.delay(3);
                const drops = target
                    .getSelfCards()
                    .filter((card) => card.suit === suit);
                await room.dropCards({
                    player: target,
                    cards: drops,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('yingzi.losehp')) {
                await room.losehp({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zhouyu.addSkill(yingzi);
zhouyu.addSkill(fanjian);

sgs.loadTranslation({
    ['yingzi.show']: '展示并弃置{0}牌',
    ['yingzi.losehp']: '失去1点体力',
});
