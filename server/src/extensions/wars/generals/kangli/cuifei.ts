import { GameCard } from '../../../../core/card/card';
import { CardType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';

export const cuifei = sgs.General({
    name: 'xl.cuifei',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const yixiu = sgs.Skill({
    name: 'xl.cuifei.yixiu',
});

yixiu.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data
                    .getObtainDatas(player)
                    .some((v) =>
                        v.cards.find(
                            (card) =>
                                card.type === CardType.Equip &&
                                player.canUseCard(
                                    room.createVirtualCardByOne(card, false),
                                    undefined,
                                    this.name
                                )
                        )
                    )
            );
        },
        context(room, player, data: MoveCardEvent) {
            const cards: GameCard[] = [];
            data.getObtainDatas(this.player).forEach((v) => {
                v.cards.forEach((card) => {
                    if (
                        card.type === CardType.Equip &&
                        this.player.canUseCard(
                            room.createVirtualCardByOne(card, false),
                            undefined,
                            this.name
                        )
                    ) {
                        cards.push(card);
                    }
                });
            });
            return { cards };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const cards = context.cards;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, -1],
                                selectable: cards,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `衣绣：你可以展示任意张装备牌并使用（使用顺序为你选择的顺序）`,
                            thinkPrompt: '衣绣',
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from, cards } = context;
            for (const card of cards) {
                await room.preUseCard({
                    from,
                    card: room.createVirtualCardByOne(card),
                    source: data,
                    reason: this.name,
                });
            }
            await room.drawCards({
                player: from,
                count: cards.length,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const yashang = sgs.Skill({
    name: 'xl.cuifei.yashang',
});

yashang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                player === data.to &&
                data.from &&
                (room.sameAsKingdom(player, data.from) ||
                    room.differentAsKingdom(player, data.from))
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const player = room.getPlayer(context.player);
                    const count = Math.max(
                        0,
                        5 - player.getEquipCards().length
                    );
                    const hands = player.getHandCards();
                    return {
                        selectors: {
                            card: room.createDropCards(player, {
                                step: 1,
                                count: hands.length - count,
                                selectable: hands,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `雅殇：请将手牌弃至${count}张`,
                            thinkPrompt: '雅殇',
                        },
                    };
                },
            };
        },
        async effect(room, data: DamageEvent, context) {
            const { from } = context;
            const count = Math.max(0, 5 - from.getEquipCards().length);
            if (room.sameAsKingdom(from, data.from)) {
                context.player = from.playerId;
                if (from.getHandCards().length - count > 0) {
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
                } else {
                    const draw_count = count - data.from.getHandCards().length;
                    await room.drawCards({
                        player: data.from,
                        count: draw_count,
                        source: data,
                        reason: this.name,
                    });
                }
            }

            if (room.differentAsKingdom(from, data.from)) {
                context.player = data.from.playerId;
                if (data.from.getHandCards().length - count > 0) {
                    const req = await room.doRequest({
                        player: data.from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    const cards = room.getResultCards(req);
                    await room.dropCards({
                        player: data.from,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                } else {
                    const draw_count = count - from.getHandCards().length;
                    await room.drawCards({
                        player: from,
                        count: draw_count,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

cuifei.addSkill(yixiu);
cuifei.addSkill(yashang);
