import { GameCard } from '../../../../core/card/card';
import { CardColor } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import {
    UseCardEvent,
    UseCardToCardEvent,
} from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { Phase } from '../../../../core/player/player.types';
import { MoveCardReason } from '../../../../core/room/room.types';
import { SkillTag, StateEffectType } from '../../../../core/skill/skill.types';

export const bianfuren = sgs.General({
    name: 'wars.bianfuren',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const wanwei = sgs.Skill({
    name: 'wars.bianfuren.wanwei',
});

wanwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.MoveCardFixed,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        d.player !== player &&
                        (d.fromArea === player.equipArea ||
                            d.fromArea === player.handArea) &&
                        d.reason === MoveCardReason.DisCard
                )
            );
        },
        context(room, player, data: MoveCardEvent) {
            let h_player: GamePlayer;
            let count = data.getCards((d, c) => {
                if (
                    d.player !== player &&
                    (d.fromArea === player.equipArea ||
                        d.fromArea === player.handArea) &&
                    d.reason === MoveCardReason.DisCard
                ) {
                    h_player = d.player;
                    return true;
                }
            }).length;
            return {
                h_player: h_player.playerId,
                count,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const player = room.getPlayer(context.h_player);
                    const count = context.count;
                    return {
                        selectors: {
                            card: room.createDropCards(player, {
                                step: 1,
                                count: count,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `婉危：你可以选择${count}张牌作为本次被弃置的牌`,
                            thinkPrompt: '婉危',
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from, cards } = context;
            data.update(
                data.getCards(
                    (d, c) =>
                        d.player !== from &&
                        (d.fromArea === from.equipArea ||
                            d.fromArea === from.handArea) &&
                        d.reason === MoveCardReason.DisCard
                ),
                { cards }
            );
            return true;
        },
    })
);

wanwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.MoveCardFixed,
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
        context(room, player, data: MoveCardEvent) {
            let count = data.getCards((d, c) => {
                if (
                    d.player !== player &&
                    (d.fromArea === player.equipArea ||
                        d.fromArea === player.handArea) &&
                    d.reason === MoveCardReason.Obtain
                ) {
                    return true;
                }
            }).length;
            return {
                count,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const count = context.count;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: count,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `婉危：你可以选择${count}张牌作为本次被获得的牌`,
                            thinkPrompt: '婉危',
                        },
                    };
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from, cards } = context;
            data.update(
                data.getCards(
                    (d, c) =>
                        d.player !== from &&
                        (d.fromArea === from.equipArea ||
                            d.fromArea === from.handArea) &&
                        d.reason === MoveCardReason.Obtain
                ),
                { cards }
            );
            return true;
        },
    })
);

wanwei.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        d.player !== player &&
                        (d.fromArea === player.equipArea ||
                            d.fromArea === player.handArea) &&
                        (d.reason === MoveCardReason.DisCard ||
                            d.reason === MoveCardReason.Obtain)
                )
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards = data.getCards(
                (d, c) =>
                    d.player !== from &&
                    (d.fromArea === from.equipArea ||
                        d.fromArea === from.handArea) &&
                    (d.reason === MoveCardReason.DisCard ||
                        d.reason === MoveCardReason.Obtain)
            );
            if (cards.length > 1) {
                return await room.drawCards({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            } else if (cards.length > 0) {
                const _cards = room.drawArea.get(
                    1,
                    sgs.DataType.GameCard,
                    'top',
                    (c) => c.name === cards.at(0).name
                );
                if (_cards.length) {
                    return await room.obtainCards({
                        player: from,
                        cards: _cards,
                        source: data,
                        reason: this.name,
                    });
                } else {
                    return await room.drawCards({
                        player: from,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const yuejian = sgs.Skill({
    name: 'wars.bianfuren.yuejian',
});

yuejian.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.DropPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            if (
                room.sameAsKingdom(player, this.player) &&
                data.isOwner(player)
            ) {
                return !room.hasHistorys(
                    sgs.DataType.UseCardEvent,
                    (d) =>
                        d.from === player &&
                        !!d.targets.some((t) => room.isOtherKingdom(t, player)),
                    room.currentTurn
                );
            }
        },
        async cost(room, data, context) {
            context.from.setMark(this.name, true);
            return true;
        },
        lifecycle: [
            {
                trigger: EventTriggers.DropPhaseEnd,
                priority: 'after',
                async on_exec(room, data) {
                    this.player.removeMark(this.name);
                },
            },
        ],
    })
);

yuejian.addEffect(
    sgs.StateEffect({
        tag: [SkillTag.Lock],
        [StateEffectType.MaxHand_Initial](from) {
            if (from.hasMark(this.name)) {
                return from.maxhp;
            }
        },
    })
);

bianfuren.addSkill(wanwei);
bianfuren.addSkill(yuejian);
