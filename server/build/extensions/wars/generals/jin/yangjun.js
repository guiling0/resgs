"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neiji = exports.yangjun = void 0;
exports.yangjun = sgs.General({
    name: 'wars.yangjun',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.neiji = sgs.Skill({
    name: 'wars.yangjun.neiji',
});
exports.neiji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (room.isOtherKingdom(from, item) &&
                                    item.getHandCards().length >= 2);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `内忌：你可以选择一名其他势力的角色同时展示牌`,
                        thinkPrompt: '内忌',
                    },
                };
            },
            choose: () => {
                const execute = room.getPlayer(context.execute);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 2,
                            selectable: execute.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `内忌：请展示两张手牌`,
                        thinkPrompt: '内忌',
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const reqs = await room.doRequestAll([from, target].map((v) => {
            return {
                player: v,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context: { execute: v.playerId },
                },
            };
        }));
        const cards1 = room.getResultCards(reqs[0]);
        const cards2 = room.getResultCards(reqs[1]);
        await room.showCards({
            player: from,
            cards: cards1,
            source: data,
            reason: this.name,
        });
        await room.showCards({
            player: target,
            cards: cards2,
            source: data,
            reason: this.name,
        });
        await room.delay(1);
        const drop1 = await room.dropCards({
            player: from,
            cards: cards1.filter((v) => v.name === 'sha'),
            source: data,
            reason: this.name,
        });
        const drop2 = await room.dropCards({
            player: target,
            cards: cards2.filter((v) => v.name === 'sha'),
            source: data,
            reason: this.name,
        });
        const count1 = drop1?.getMoveCount() ?? 0;
        const count2 = drop2?.getMoveCount() ?? 0;
        const count = count1 + count2;
        if (count >= 2) {
            await room.drawCards({
                player: from,
                count: 3,
                source: data,
                reason: this.name,
            });
            await room.drawCards({
                player: target,
                count: 3,
                source: data,
                reason: this.name,
            });
        }
        if (count <= 1) {
            if (count1 === 0 && count2 > 0) {
                const juedou = room.createVirtualCardByNone('juedou');
                await room.usecard({
                    from,
                    targets: [target],
                    card: juedou,
                    source: data,
                    reason: this.name,
                });
            }
            if (count2 === 0 && count1 > 0) {
                const juedou = room.createVirtualCardByNone('juedou');
                await room.usecard({
                    from: target,
                    targets: [from],
                    card: juedou,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.yangjun.addSkill(exports.neiji);
