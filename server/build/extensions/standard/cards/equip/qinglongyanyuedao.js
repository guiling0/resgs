"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qinglong_skill = exports.qinglongyanyuedao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.qinglongyanyuedao = sgs.CardUseEquip({
    name: 'qinglongyanyuedao_bs',
});
sgs.setCardData('qinglongyanyuedao_bs', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ao',
});
exports.qinglong_skill = sgs.Skill({
    name: 'qinglongyanyuedao_bs',
    attached_equip: 'qinglongyanyuedao_bs',
});
exports.qinglong_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 3;
        }
    },
}));
exports.qinglong_skill.addEffect(sgs.TriggerEffect({
    anim: 'qinglongyanyuedao_skill',
    audio: ['qinglongyanyuedao'],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "BeOffset" /* EventTriggers.BeOffset */,
    getSelectors(room, context) {
        return {
            target_limit: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            excluesCardDistanceLimit: true,
                            excluesCardTimesLimit: true,
                            filter(item, selected) {
                                return item === target;
                            },
                        }),
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
        const { from } = context;
        return await room.needUseCard({
            from,
            cards: [{ name: 'sha' }],
            reqOptions: {
                canCancle: true,
                prompt: `@qinglongyanyuedao`,
                thinkPrompt: this.name,
            },
            targetSelector: {
                selectorId: this.getSelectorName('target_limit'),
                context,
            },
            source: data,
            reason: this.name,
        });
    },
}));
sgs.loadTranslation({
    ['@qinglongyanyuedao']: '青龙偃月刀：你可以继续使用杀',
});
