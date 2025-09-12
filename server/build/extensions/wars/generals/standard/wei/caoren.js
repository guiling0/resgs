"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jushou = exports.caoren = void 0;
exports.caoren = sgs.General({
    name: 'wars.caoren',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jushou = sgs.Skill({
    name: 'wars.caoren.jushou',
});
exports.jushou.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
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
                            filter(item, selected) {
                                if (item.type === 3 /* CardType.Equip */) {
                                    return from.canUseCard(room.createVirtualCardByOne(item, false).vdata);
                                }
                                else {
                                    return from.canDropCard(item);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: '据守：请选择一张装备牌使用或一张非装备牌弃置',
                        thinkPrompt: this.skill.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 6 /* Phase.End */ &&
            data.executor === player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = room.getKingdomCount();
        return await room.drawCards({
            player: from,
            count,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const draw = context.cost;
        const count = draw.getMoveCount();
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const card = room.getResultCards(req).at(0);
        if (card) {
            if (card.type === 3 /* CardType.Equip */) {
                await room.preUseCard({
                    from,
                    card: room.createVirtualCardByOne(card),
                    source: data,
                    reason: this.name,
                });
            }
            else {
                await room.dropCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
            }
        }
        if (count > 2) {
            await room.skip({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.caoren.addSkill(exports.jushou);
