import { CardPut } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { StateEffectType } from '../../../../core/skill/skill.types';

export const zhonghui = sgs.General({
    name: 'wars.zhonghui',
    kingdom: 'ye',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const quanji = sgs.Skill({
    name: 'wars.zhonghui.quanji',
});

quanji.addEffect(
    sgs.TriggerEffect({
        audio: [`zhonghui/quanji1`, `zhonghui/quanji2`],
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        d.player !== player &&
                        (d.fromArea === player.equipArea ||
                            d.fromArea === player.handArea) &&
                        d.reason === MoveCardReason.Obtain
                )
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `权计：请将一张牌置入武将牌上`,
                            thinkPrompt: '权计',
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const card = room.getResultCards(req).at(0);
            if (card) {
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: from.upArea,
                    source: data,
                    puttype: CardPut.Up,
                    reason: this.name,
                });
                card.setMark('mark.quan', true);
                from.setMark('mark.quan', true, {
                    visible: true,
                    source: this.name,
                    type: 'cards',
                    areaId: from.upArea.areaId,
                });
            }
        },
    })
);

quanji.addEffect(
    sgs.TriggerEffect({
        audio: [`zhonghui/quanji3`, `zhonghui/quanji4`],
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.DamageEvent) &&
                player === data.to
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getHandCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `权计：请将一张牌置入武将牌上`,
                            thinkPrompt: '权计',
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const card = room.getResultCards(req).at(0);
            if (card) {
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: from.upArea,
                    source: data,
                    puttype: CardPut.Up,
                    reason: this.name,
                });
                card.setMark('mark.quan', true);
                from.setMark('mark.quan', true, {
                    visible: true,
                    source: this.name,
                    type: 'cards',
                    areaId: from.upArea.areaId,
                });
            }
        },
    })
);

quanji.addEffect(
    sgs.StateEffect({
        [StateEffectType.MaxHand_Correct](from) {
            if (this.isOwner(from)) {
                const cards = from.getUpOrSideCards('mark.quan');
                return cards.length;
            }
        },
    })
);

export const paiyi = sgs.Skill({
    name: 'wars.zhonghui.paiyi',
});

paiyi.addEffect(
    sgs.TriggerEffect({
        name: 'wars.zhonghui.paiyi0',
        audio: [`zhonghui/paiyi2`],
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
                    const cards = from.getUpOrSideCards('mark.quan');
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `排异，你可以将一张“权”置入弃牌堆，令一名角色摸牌`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.puto({
                player: from,
                cards,
                toArea: room.discardArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            from.refreshMark = 'mark.quan';
            await room.drawCards({
                player: target,
                count: Math.max(1, from.getUpOrSideCards('mark.quan').length),
                source: data,
                reason: this.name,
            });
        },
    })
);

paiyi.addEffect(
    sgs.TriggerEffect({
        name: 'wars.zhonghui.paiyi1',
        audio: [`zhonghui/paiyi1`],
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
                    const cards = from.getUpOrSideCards('mark.quan');
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: Math.max(1, cards.length - 1),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `排异，你可以将一张“权”置入弃牌堆，造成伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            return await room.puto({
                player: from,
                cards,
                toArea: room.discardArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            from.refreshMark = 'mark.quan';
            for (const target of targets) {
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

zhonghui.addSkill(quanji);
zhonghui.addSkill(paiyi);

sgs.loadTranslation({
    ['mark.quan']: '权',
    ['@method:wars.zhonghui.paiyi0']: '摸牌',
    ['@method:wars.zhonghui.paiyi1']: '造成伤害',
});
