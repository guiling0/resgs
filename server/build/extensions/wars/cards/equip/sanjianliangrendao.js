"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanjian_skill = exports.sanjianliangrendao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.sanjianliangrendao = sgs.CardUseEquip({
    name: 'sanjianliangrendao',
});
sgs.setCardData('sanjianliangrendao', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ao',
});
exports.sanjian_skill = sgs.Skill({
    name: 'sanjianliangrendao',
    attached_equip: 'sanjianliangrendao',
});
exports.sanjian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 3;
        }
    },
}));
exports.sanjian_skill.addEffect(sgs.TriggerEffect({
    anim: 'sanjianliangrendao_skill',
    audio: [],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    getSelectors(room, context) {
        const from = context.from;
        const target = context.targets.at(0);
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (target && target.distanceTo(item) === 1);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `三尖两刃刀：你可以弃置一张手牌并选择一个角色，对他造成1点普通伤害`,
                        thinkPrompt: `三尖两刃刀`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.from &&
            data.reason === 'sha' &&
            data.to.alive);
    },
    context(room, player, data) {
        return {
            targets: [data.to],
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
