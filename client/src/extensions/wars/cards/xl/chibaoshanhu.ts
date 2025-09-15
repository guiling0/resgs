import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardSubType,
    CardType,
} from '../../../../core/card/card.types';
import { VirtualCard } from '../../../../core/card/vcard';
import { EventTriggers } from '../../../../core/event/triggers';
import { NeedPlayCardData } from '../../../../core/event/types/event.play';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { NeedUseCardData } from '../../../../core/event/types/event.use';
import { Phase } from '../../../../core/player/player.types';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType, SkillTag } from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const chibaoshanhu = sgs.CardUseEquip({
    name: 'chibaoshanhu',
});

sgs.setCardData('chibaoshanhu', {
    type: CardType.Equip,
    subtype: CardSubType.Treasure,
    rhyme: 'u',
});

export const chibaoshanhu_skill = sgs.Skill({
    name: 'chibaoshanhu',
    attached_equip: 'chibaoshanhu',
    global(room, to) {
        return this.player !== to;
    },
});

chibaoshanhu_skill.addEffect(sgs.copy(eyes_reserve));

chibaoshanhu_skill.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Ready &&
                data.executor === player &&
                this.skill &&
                this.skill.sourceEquip
            );
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const cards = context.cards;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: cards,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '赤宝珊瑚',
                                    timebar: room.responseTime,
                                    prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: `赤宝珊瑚`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            const cards = await room.getNCards(2);
            await room.flashCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            context.cards = cards;
            return cards;
        },
        async effect(room, data, context) {
            const { from } = context;
            const cards = context.cost as GameCard[];
            if (cards.some((v) => v.subtype === CardSubType.Treasure)) {
                await room.puto({
                    player: from,
                    cards: [this.skill.sourceEquip],
                    toArea: room.discardArea,
                    source: data,
                    reason: this.name,
                });
            } else {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const gcards = room.getResultCards(req);
                await room.removeCard({
                    player: from,
                    cards: gcards,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
                await room.puto({
                    player: from,
                    cards: cards.filter((v) => v.area === room.processingArea),
                    toArea: room.discardArea,
                    source: data,
                    movetype: CardPut.Up,
                    reason: this.name,
                });
            }
        },
    })
);

chibaoshanhu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedUseCard3,
        can_trigger(room, player, data: NeedUseCardData) {
            if (this.isOwner(player)) {
                const canuses = room
                    .getReserveUpCards()
                    .filter((v) => data.has(v.name, 0));
                if (canuses.length === 0) return false;
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: NeedUseCardData) {
            return {
                canuses: data.cards,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const canuses = context.canuses as {
                        name: string;
                        method?: number;
                    }[];
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: room.getReserveUpCards(),
                                filter(item, selected) {
                                    return (
                                        canuses.find(
                                            (v) => v.name === item.name
                                        ) &&
                                        from.canUseCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            )
                                        )
                                    );
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByOne(
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
                            prompt: `赤宝珊瑚：你可以从后备区明区中使用一张牌`,
                            thinkPrompt: `赤宝珊瑚`,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                            thinkPrompt: `赤宝珊瑚`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            if (from.hasCardsInArea()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                return await room.removeCard({
                    player: from,
                    cards,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            } else {
                return await room.losehp({
                    player: from,

                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

chibaoshanhu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.NeedPlayCard3,
        can_trigger(room, player, data: NeedPlayCardData) {
            if (this.isOwner(player)) {
                const canuses = room
                    .getReserveUpCards()
                    .filter((v) => data.has(v.name));
                if (canuses.length === 0) return false;
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        context(room, player, data: NeedPlayCardData) {
            return {
                canuses: data.cards,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const canuses = context.canuses as string[];
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: room.getReserveUpCards(),
                                filter(item, selected) {
                                    return (
                                        canuses.find((v) => v === item.name) &&
                                        from.canPlayCard(
                                            room.createVirtualCardByOne(
                                                item,
                                                false
                                            )
                                        )
                                    );
                                },
                                onChange(type, item) {
                                    if (type === 'add') {
                                        this._use_or_play_vcard =
                                            room.createVirtualCardByOne(
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
                            prompt: `赤宝珊瑚：你可以从后备区明区中打出一张牌`,
                            thinkPrompt: `赤宝珊瑚`,
                        },
                    };
                },
                choose: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '赤宝珊瑚：请选择一张牌置入后备区',
                            thinkPrompt: `赤宝珊瑚`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            if (from.hasCardsInArea()) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                return await room.removeCard({
                    player: from,
                    cards,
                    puttype: CardPut.Up,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            } else {
                return await room.losehp({
                    player: from,

                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

chibaoshanhu_skill.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        priorityType: PriorityType.Equip,
        trigger: EventTriggers.PlayPhaseProceeding,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                !this.isOwner(player) &&
                data.isOwner(player) &&
                this.player &&
                this.skill &&
                this.skill.sourceEquip
            );
        },
        context(room, player, data) {
            return {
                targets: [this.player],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: from.getSelfCards(),
                                filter(item, selected) {
                                    return (
                                        item.subtype === CardSubType.Treasure
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `赤宝珊瑚：你可以将一张宝物牌塞入${target.gameName}`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from } = context;
            await room.removeCard({
                player: from,
                cards: [this.skill.sourceEquip],
                puttype: CardPut.Up,
                source: data,
                reason: this.name,
                skill: this,
            });
            return true;
        },
        async effect(room, data, context) {
            const {
                from,
                cards,
                targets: [target],
            } = context;
            await room.puto({
                player: from,
                cards,
                toArea: target.equipArea,
                source: data,
                reason: this.name,
            });
        },
    })
);
