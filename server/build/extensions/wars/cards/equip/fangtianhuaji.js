"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fangtian_delay = exports.fangtian_skill = exports.fangtianhuaji = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.fangtianhuaji = sgs.CardUseEquip({
    name: 'fangtianhuaji',
});
sgs.setCardData('fangtianhuaji', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'i',
});
exports.fangtian_skill = sgs.Skill({
    name: 'fangtianhuaji',
    attached_equip: 'fangtianhuaji',
});
exports.fangtian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 4;
        }
    },
}));
exports.fangtian_skill.addEffect(sgs.TriggerEffect({
    anim: 'fangtianhuaji_skill',
    audio: ['fangtianhuaji'],
    auto_log: 1,
    auto_directline: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "ChooseTarget" /* EventTriggers.ChooseTarget */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const skill = context.effect;
                const from = context.from;
                const sha = context.sha;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: [1, -1],
                            filter(item, selected) {
                                return (sha &&
                                    !targets.includes(item) &&
                                    [...targets, ...selected].every((v) => room.isOtherKingdom(v, item)) &&
                                    from.canUseCard(sha, [item], skill.name, { excluesCardTimesLimit: true }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `方天画戟：你可以令任意名不包含相同势力的角色成为此【杀】的目标`,
                        thinkPrompt: `方天画戟`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player);
    },
    context(room, player, data) {
        return {
            sha: data.card.vdata,
            targets: data.targets,
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.becomTarget(targets);
    },
    async effect(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('fangtian.delay', from);
        effect.setData('data', data);
    },
}));
exports.fangtian_delay = sgs.TriggerEffect({
    name: 'fangtian.delay',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "BeOffset" /* EventTriggers.BeOffset */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && this.getData('data') === data) {
            const _data = data.current;
            return (_data &&
                _data.offset &&
                _data.offset.is(sgs.DataType.UseCardToCardEvent) &&
                _data.offset.card?.name === 'shan');
        }
    },
    async cost(room, data, context) {
        await this.removeSelf();
        data.targetList.forEach((v) => (v.invalid = true));
        return true;
    },
    lifecycle: [
        {
            trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
