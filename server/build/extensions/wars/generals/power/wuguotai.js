"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyi = exports.ganlu = exports.wuguotai = void 0;
exports.wuguotai = sgs.General({
    name: 'wars.wuguotai',
    kingdom: 'wu',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.ganlu = sgs.Skill({
    name: 'wars.wuguotai.ganlu',
});
exports.ganlu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
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
                            count: 2,
                            filter(item, selected) {
                                if (selected.length === 0) {
                                    return true;
                                }
                                else {
                                    if (item.getEquipCards().length === 0 &&
                                        selected[0].getEquipCards()
                                            .length === 0) {
                                        return false;
                                    }
                                    return (Math.abs(selected[0].getEquipCards()
                                        .length -
                                        item.getEquipCards().length) <= from.losshp);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `甘露：你可以选择装备区牌数差不大于${from.losshp}得两名玩家交换装备`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target1, target2], } = context;
        const cards1 = target1.getEquipCards();
        const cards2 = target2.getEquipCards();
        await room.swapCards({
            player: from,
            cards1,
            toArea1: target2.equipArea,
            cards2,
            toArea2: target1.equipArea,
            source: data,
            reason: this.name,
        });
    },
}));
exports.buyi = sgs.Skill({
    name: 'wars.wuguotai.buyi',
});
exports.buyi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "DyingEnd" /* EventTriggers.DyingEnd */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.player &&
            data.player.alive &&
            room.sameAsKingdom(player, data.player)) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            if (uses.length > 0)
                return false;
            const damage = data.getDamage();
            return damage && !!damage.from;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.getDamage().from],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        return await room.command({
            from,
            to,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [to], } = context;
        const command = context.cost;
        if (command && !command.execute) {
            await room.recoverhp({
                player: data.player,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.wuguotai.addSkill(exports.ganlu);
exports.wuguotai.addSkill(exports.buyi);
