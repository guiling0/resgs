"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yicheng = exports.xusheng = void 0;
exports.xusheng = sgs.General({
    name: 'wars.xusheng',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.yicheng = sgs.Skill({
    name: 'wars.xusheng.yicheng',
});
exports.yicheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.card.name === 'sha' &&
            room.sameAsKingdom(player, data.current.target));
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const target = context.targets.at(0);
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: {
                        text: `${sgs.cac_skill(this.name)}，令{0}摸一张牌`,
                        values: [
                            { type: 'player', value: target.playerId },
                        ],
                    },
                });
            },
            choose: () => {
                const from = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                if (item.type === 3 /* CardType.Equip */ &&
                                    item.area === from.handArea) {
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
                        prompt: '疑城：请选择一张手牌中的装备牌使用或一张其他牌弃置',
                        thinkPrompt: this.skill.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [player], } = context;
        return await room.drawCards({
            player,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { targets: [player], } = context;
        const req = await room.doRequest({
            player,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const card = room.getResultCards(req).at(0);
        if (card) {
            if (card.type === 3 /* CardType.Equip */ &&
                card.area === player.handArea) {
                await room.preUseCard({
                    from: player,
                    card: room.createVirtualCardByOne(card),
                    source: data,
                    reason: this.name,
                });
            }
            else {
                await room.dropCards({
                    player,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.xusheng.addSkill(exports.yicheng);
