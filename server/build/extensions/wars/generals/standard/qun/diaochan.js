"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.biyue = exports.lijian = exports.diaochan = void 0;
exports.diaochan = sgs.General({
    name: 'wars.diaochan',
    kingdom: 'qun',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.lijian = sgs.Skill({
    name: 'wars.diaochan.lijian',
});
exports.lijian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    auto_sort: false,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const juedou = room.createVirtualCardByNone('juedou', undefined, false);
                juedou.custom.method = 1;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 2,
                            filter(item, selected) {
                                if (item === from ||
                                    item.gender !== 1 /* Gender.Male */)
                                    return false;
                                if (selected.length === 0) {
                                    return true;
                                }
                                else {
                                    return item.canUseCard(juedou.vdata, [
                                        selected[0],
                                    ]);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `离间：你可以选择两名其他男性角色，后者对前者者视为使用【决斗】`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets, cards } = context;
        if (targets.length >= 2) {
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const { from, targets, cards } = context;
        const juedou = room.createVirtualCardByNone('juedou');
        juedou.custom.method = 1;
        await room.usecard({
            from: targets[1],
            targets: [targets[0]],
            card: juedou,
            source: data,
            reason: this.name,
        });
    },
}));
exports.biyue = sgs.Skill({
    name: 'wars.diaochan.biyue',
});
exports.biyue.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.diaochan.addSkill(exports.lijian);
exports.diaochan.addSkill(exports.biyue);
