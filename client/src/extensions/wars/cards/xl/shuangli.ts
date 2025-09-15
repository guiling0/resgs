import { AreaType } from '../../../../core/area/area.type';
import {
    CardPut,
    CardType,
    CardSubType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DyingEvent } from '../../../../core/event/types/event.die';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType } from '../../../../core/skill/skill.types';

export const shuangli_lose = sgs.TriggerEffect({
    name: 'shuangli_lose',
    auto_log: 1,
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) => c.name === 'shuangli' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const shuangli = data.getCard(
            (d, c) => c.name === 'shuangli' && d.toArea === room.discardArea
        );
        const _data = data.get(shuangli);
        return {
            from: _data.player,
            cards: [shuangli],
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

export const shuangli_sameequip = sgs.TriggerEffect({
    name: 'shuangli_sameequip',
    auto_log: 1,
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore1,
    can_trigger(room, player, data: MoveCardEvent) {
        const shuangli = data.filter(
            (d, c) => c.name === 'shuangli' && d.toArea.type === AreaType.Equip
        );
        if (shuangli.length > 0) {
            const player = shuangli.at(0)?.toArea?.player;
            if (player) {
                const qunque = player
                    .getEquipCards()
                    .find((v) => v.name === 'qunque');
                return !!qunque;
            }
        }
    },
    async cost(room, data: MoveCardEvent, context) {
        const shuangli = data.filter(
            (d, c) => c.name === 'shuangli' && d.toArea.type === AreaType.Equip
        );
        if (shuangli.length > 0) {
            const player = shuangli.at(0)?.toArea?.player;
            if (player) {
                const qunque = player
                    .getEquipCards()
                    .find((v) => v.name === 'qunque');
                if (qunque) {
                    return await data.cancle([qunque]);
                }
            }
        }
    },
});

export const shuangli = sgs.CardUseEquip({
    name: 'shuangli',
    effects: [shuangli_lose.name, shuangli_sameequip.name],
});

sgs.setCardData('shuangli', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'i',
});

export const shuangli_skill = sgs.Skill({
    name: 'shuangli',
    attached_equip: 'shuangli',
});

shuangli_skill.addEffect(
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

shuangli_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item.getMark('wars.mark.yinyangyu', 0) <
                                        2
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `双鲤：你可以令一名“阴阳鱼”标记小于2的角色获得一枚“阴阳鱼”`,
                            thinkPrompt: '双鲤',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yinyangyu',
                player: target.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yinyangyu', target, {
                source: this.name,
                showui: 'mark',
            });
            return true;
        },
    })
);

shuangli_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.Dying,
        can_trigger(room, player, data: DyingEvent) {
            return this.isOwner(player) && this.skill && this.skill.sourceEquip;
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const effect = context.effect;
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createDropCards(from, {
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return item !== effect.skill?.sourceEquip;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `双鲤：你可以弃置一张牌并移除双鲤，令濒死的角色回复1点体力`,
                            thinkPrompt: '双鲤',
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
        async effect(room, data: DyingEvent, context) {
            const { from } = context;
            await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
            await room.recoverhp({
                player: data.player,
                source: data,
                reason: this.name,
            });
        },
    })
);
