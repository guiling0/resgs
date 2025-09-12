import { CardColor, CardSuit } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { NeedUseCardData } from '../../../../../core/event/types/event.use';
import { Gender } from '../../../../../core/general/general.type';
import { GamePlayer } from '../../../../../core/player/player';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const huatuo = sgs.General({
    name: 'wars.huatuo',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const jijiu = sgs.Skill({
    name: 'wars.huatuo.jijiu',
});

jijiu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const use_tao = context.canuses.find(
                        (v) => v.name === 'tao'
                    );
                    const tao = room.createVirtualCardByNone(
                        'tao',
                        undefined,
                        false
                    );
                    tao.custom.method = use_tao.method ?? 1;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item.color === CardColor.Red;
                                },
                                onChange(type, item) {
                                    if (type === 'add') tao.addSubCard(item);
                                    if (type === 'remove') tao.delSubCard(item);
                                    tao.set();
                                    this._use_or_play_vcard = tao;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: '急救：你可以将一张红色牌当【桃】使用',
                        },
                    };
                },
            };
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                !player.inturn &&
                data.is(sgs.DataType.NeedUseCardData) &&
                data.from === player &&
                data.has('tao', 0)
            );
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

export const chuli = sgs.Skill({
    name: 'wars.huatuo.chuli',
});

chuli.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player) &&
                player.hasCanDropCards('he', player, 1, this.name)
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const skill = this;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [1, 3],
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        item.hasCanDropCards(
                                            'he',
                                            from,
                                            1,
                                            skill.name
                                        ) &&
                                        (item.isNoneKingdom() ||
                                            !selected.find((v) =>
                                                room.sameAsKingdom(item, v)
                                            ))
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `除疠：选择至多三名没有势力或势力均不相同的角色`,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    const target = room.getPlayer(context.target);
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                                selecte_type: 'rows',
                                data_rows: target.getCardsToArea('he'),
                                windowOptions: {
                                    title: '除疠',
                                    timebar: room.responseTime,
                                    prompt: '除疠：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            return true;
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            targets.push(from);
            room.sortResponse(targets);
            const draws: GamePlayer[] = [];
            while (targets.length > 0) {
                const to = targets.shift();
                context.target = to.playerId;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                const drop = await room.dropCards({
                    player: from,
                    cards,
                    source: data,
                    reason: this.name,
                });
                if (drop && cards.find((v) => v.suit === CardSuit.Spade)) {
                    draws.push(to);
                }
            }
            while (draws.length > 0) {
                await room.drawCards({
                    player: draws.shift(),
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

huatuo.addSkill(jijiu);
huatuo.addSkill(chuli);
