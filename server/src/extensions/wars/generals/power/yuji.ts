import { AreaType } from '../../../../core/area/area.type';
import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    MoveCardEvent,
    MoveData,
} from '../../../../core/event/types/event.move';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { PriorityType } from '../../../../core/skill/skill.types';

export const yuji = sgs.General({
    name: 'wars.yuji',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const qianhuan = sgs.Skill({
    name: 'wars.yuji.qianhuan',
});

qianhuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to &&
                data.to.alive &&
                room.sameAsKingdom(player, data.to)
            );
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(1);
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            await room.puto({
                player: from,
                cards,
                toArea: from.upArea,
                source: data,
                movetype: CardPut.Up,
                reason: this.name,
            });
            cards.forEach((v) => v.setMark(this.name, true));
            from.setMark(this.name, true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: from.upArea.areaId,
            });
            return cards.at(0);
        },
        async effect(room, data, context) {
            const { from } = context;
            const card = context.cost as GameCard;
            const same = from.upArea.cards.find(
                (v) =>
                    v !== card && v.hasMark(this.name) && v.suit === card.suit
            );
            if (same) {
                from.refreshMark = this.name;
                await room.puto({
                    player: from,
                    cards: [card],
                    toArea: room.discardArea,
                    source: data,
                    movetype: CardPut.Up,
                    reason: this.name,
                });
            }
        },
    })
);

qianhuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.BecomeTarget,
        can_trigger(room, player, data: UseCardEvent) {
            return (
                this.isOwner(player) &&
                data.card &&
                (data.card.type === CardType.Basic ||
                    data.card.subtype === CardSubType.InstantScroll) &&
                player.hasUpOrSideCards(this.name) &&
                room.sameAsKingdom(player, data.current.target) &&
                data.targets.length === 1
            );
        },
        context(room, player, data: UseCardEvent) {
            return {
                targets: [data.current.target],
            };
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
                                selectable: from.getUpOrSideCards(this.name),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `千幻：你可以将一张“幻”置入弃牌堆，取消当前目标`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: UseCardEvent, context) {
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
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            from.refreshMark = this.name;
            await data.cancleCurrent();
        },
    })
);

qianhuan.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (
                this.player.hasUpOrSideCards(this.name) &&
                room.sameAsKingdom(this.player, player)
            ) {
                return data.has_filter(
                    (v, c) =>
                        v.toArea === player.judgeArea &&
                        c.vcard &&
                        c.vcard.subtype === CardSubType.DelayedScroll
                );
            }
        },
        context(room, player, data: MoveCardEvent) {
            return {
                from: this.player,
                targets: [player],
            };
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
                                selectable: from.getUpOrSideCards(this.name),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `千幻：你可以将一张“幻”置入弃牌堆，取消当前目标`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
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
        async effect(room, data: MoveCardEvent, context) {
            const {
                from,
                targets: [player],
            } = context;
            from.refreshMark = this.name;
            await data.cancle(
                data.getCards(
                    (v, c) =>
                        v.toArea === player.judgeArea &&
                        c.vcard &&
                        c.vcard.subtype === CardSubType.DelayedScroll
                )
            );
        },
    })
);

yuji.addSkill(qianhuan);
