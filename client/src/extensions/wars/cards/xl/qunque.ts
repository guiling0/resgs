import { AreaType } from '../../../../core/area/area.type';
import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardType,
    CardSubType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType } from '../../../../core/skill/skill.types';

export const qunque_lose = sgs.TriggerEffect({
    name: 'qunque_lose',
    auto_log: 1,
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) => c.name === 'qunque' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const qunque = data.getCard(
            (d, c) => c.name === 'qunque' && d.toArea === room.discardArea
        );
        const _data = data.get(qunque);
        return {
            from: _data.player,
            cards: [qunque],
        };
    },
    async cost(room, data: MoveCardEvent, context) {
        const { cards } = context;
        return await data.cancle(cards);
    },
    async effect(room, data: MoveCardEvent, context) {
        const { from, cards } = context;
        await room.removeCard({
            player: from,
            cards,
            puttype: CardPut.Down,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
});

export const qunque_sameequip = sgs.TriggerEffect({
    name: 'qunque_sameequip',
    auto_log: 1,
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore1,
    can_trigger(room, player, data: MoveCardEvent) {
        const qunque = data.filter(
            (d, c) => c.name === 'qunque' && d.toArea.type === AreaType.Equip
        );
        if (qunque.length > 0) {
            const player = qunque.at(0)?.toArea?.player;
            if (player) {
                const shuangli = player
                    .getEquipCards()
                    .find((v) => v.name === 'shuangli');
                return !!shuangli;
            }
        }
    },
    async cost(room, data: MoveCardEvent, context) {
        const qunque = data.filter(
            (d, c) => c.name === 'qunque' && d.toArea.type === AreaType.Equip
        );
        if (qunque.length > 0) {
            const player = qunque.at(0)?.toArea?.player;
            if (player) {
                const shuangli = player
                    .getEquipCards()
                    .find((v) => v.name === 'shuangli');
                if (shuangli) {
                    return await data.cancle([shuangli]);
                }
            }
        }
    },
});

export const qunque = sgs.CardUseEquip({
    name: 'qunque',
    effects: [qunque_lose.name, qunque_sameequip.name],
});

sgs.setCardData('qunque', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'ue',
});

export const qunque_skill = sgs.Skill({
    name: 'qunque',
    attached_equip: 'qunque',
});

qunque_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardBefore2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player) && this.skill && this.skill.sourceEquip) {
                const _data = data.get(this.skill.sourceEquip);
                if (!_data) return false;
                return (
                    _data.reason === MoveCardReason.Obtain &&
                    _data.toArea.player !== player
                );
            }
        },
        async cost(room, data: MoveCardEvent, context) {
            return await data.cancle([this.skill.sourceEquip]);
        },
        async effect(room, data, context) {
            const { from } = context;
            await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);

qunque_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                this.skill &&
                this.skill.sourceEquip
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            return await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
    })
);

qunque_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player) && data.has_obtain(player)) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: MoveCardEvent) {
            const cards: GameCard[] = data.getCards(
                (d, c) => d.toArea === player.handArea
            );
            return {
                cards,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const cards = context.cards;
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
                                filter(item, selected) {
                                    return (
                                        item !== from &&
                                        room.sameAsKingdom(item, from)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `群雀，你可以将一张牌交给一名与你势力相同的其他角色`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            return await room.giveCards({
                from,
                to: target,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);
