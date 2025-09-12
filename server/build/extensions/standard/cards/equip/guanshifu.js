"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guanshi_skill = exports.guanshifu = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.guanshifu = sgs.CardUseEquip({
    name: 'guanshifu',
});
sgs.setCardData('guanshifu', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'u',
});
exports.guanshi_skill = sgs.Skill({
    name: 'guanshifu',
    attached_equip: 'guanshifu',
});
exports.guanshi_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 3;
        }
    },
}));
exports.guanshi_skill.addEffect(sgs.TriggerEffect({
    anim: 'guanshifu_skill',
    audio: ['guanshifu'],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "BeOffset" /* EventTriggers.BeOffset */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 2,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.name !== 'guanshifu';
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `贯石斧：你可以弃置两张牌让【杀】依然对${target.gameName}造成伤害`,
                        thinkPrompt: '贯石斧',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.UseCardEvent)) {
            const { from, current, card } = data;
            return (card.name === 'sha' &&
                player === from &&
                current.target.alive);
        }
    },
    context(room, player, data) {
        return {
            targets: [data.current.target],
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
        data.insert(["CardEffect" /* EventTriggers.CardEffect */, "CardEffected" /* EventTriggers.CardEffected */]);
    },
}));
