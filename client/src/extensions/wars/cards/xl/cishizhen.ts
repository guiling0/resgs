import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const cishizhen_lose = sgs.TriggerEffect({
    name: 'cishizhen_lose',
    auto_log: 1,
    priorityType: PriorityType.GlobalRule,
    trigger: EventTriggers.MoveCardBefore2,
    can_trigger(room, player, data: MoveCardEvent) {
        return data.has_filter(
            (d, c) => c.name === 'cishizhen' && d.toArea === room.discardArea
        );
    },
    context(room, player, data: MoveCardEvent) {
        const cishizhen = data.getCard(
            (d, c) => c.name === 'cishizhen' && d.toArea === room.discardArea
        );
        const _data = data.get(cishizhen);
        return {
            from: _data.player,
            cards: [cishizhen],
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

export const cishizhen = sgs.CardUseEquip({
    name: 'cishizhen',
    effects: [cishizhen_lose.name],
});

sgs.setCardData('cishizhen', {
    type: CardType.Equip,
    subtype: CardSubType.Weapon,
    rhyme: 'en',
});

export const cishizhen_skill = sgs.Skill({
    name: 'cishizhen',
    attached_equip: 'cishizhen',
});

cishizhen_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Range_Initial](from) {
            if (this.isOwner(from)) {
                return 1;
            }
        },
        [StateEffectType.Range_Within](from, to) {
            if (this.isOwner(from)) {
                const equips = to.getEquipCards();
                return (
                    !equips.find((v) => v.name === 'xijia') && equips.length > 0
                );
            }
        },
    })
);

cishizhen_skill.addEffect(
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

cishizhen_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedUseCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const skill = context.effect;
                    const from = context.from;
                    const cards = context.cards;
                    const sha = room.createVirtualCardByOne(cards.at(0), false);
                    sha.sourceData.name = 'sha';
                    sha.custom.method = 1;
                    sha.custom.canuse = from.canUseCard(
                        sha,
                        undefined,
                        skill.name,
                        { excluesCardDistanceLimit: true }
                    );

                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [sha.vdata],
                                filter(item, selected) {
                                    return item.custom.canuse;
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                            target: room.createChoosePlayer({
                                excluesCardDistanceLimit: true,
                                filter(item, selected) {
                                    return !item
                                        .getEquipCards()
                                        .find((v) => v.name === 'xijia');
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `磁石阵：你可以将此牌当无距离限制的【杀】使用`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedUseCardData) &&
                this.skill &&
                this.skill.sourceEquip
            ) {
                return data.from === player && data.has('sha');
            }
        },
        context(room, player, data) {
            return {
                cards: [this.skill.sourceEquip],
            };
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

cishizhen_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedPlayCard3,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const skill = context.effect;
                    const from = context.from;
                    const cards = context.cards;
                    const sha = room.createVirtualCardByOne(cards.at(0), false);
                    sha.sourceData.name = 'sha';
                    sha.custom.method = 1;
                    sha.custom.canuse = from.canUseCard(
                        sha,
                        undefined,
                        skill.name,
                        { excluesCardDistanceLimit: true }
                    );

                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: [sha.vdata],
                                filter(item, selected) {
                                    return item.custom.canuse;
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByData(
                                                item,
                                                false
                                            );
                                    }
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `磁石阵：你可以将此牌当【杀】打出`,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.NeedPlayCardData) &&
                this.skill &&
                this.skill.sourceEquip
            ) {
                return data.from === player && data.has('sha');
            }
        },
        context(room, player, data) {
            return {
                cards: [this.skill.sourceEquip],
            };
        },
        async cost(room, data, context) {
            return true;
        },
    })
);

cishizhen_skill.addEffect(sgs.copy(eyes_reserve));
