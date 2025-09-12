"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qiangxi = exports.dianwei = void 0;
exports.dianwei = sgs.General({
    name: 'wars.dianwei',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.qiangxi = sgs.Skill({
    name: 'wars.dianwei.qiangxi',
});
exports.qiangxi.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player, 4 /* Phase.Play */);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: [0, 1],
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.subtype === 31 /* CardSubType.Weapon */;
                            },
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                if (this.selectors.card.result.length ===
                                    0 &&
                                    from.hp <= 0)
                                    return false;
                                return item !== from && from.rangeOf(item);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `强袭，选择一张武器牌弃置（可以不选），再选择一名攻击范围内的角色，对他造成1点伤害`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        if (cards.length === 0) {
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
        else {
            return await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        await room.damage({
            from,
            to: target,
            source: data,
            reason: this.name,
        });
    },
}));
exports.dianwei.addSkill(exports.qiangxi);
