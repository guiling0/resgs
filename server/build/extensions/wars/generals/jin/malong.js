"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xunji_delay = exports.xunji = exports.zhuanzhan = exports.malong = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.malong = sgs.General({
    name: 'wars.malong',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhuanzhan = sgs.Skill({
    name: 'wars.malong.zhuanzhan',
});
exports.zhuanzhan.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        const room = this.room;
        if (this.isOwner(from) &&
            room.playerAlives.some((v) => v.isNoneKingdom())) {
            return true;
        }
    },
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        const room = this.room;
        if (this.isOwner(from) &&
            room.playerAlives.some((v) => v.isNoneKingdom()) &&
            card.name === 'sha' &&
            target &&
            !target.isNoneKingdom?.()) {
            return true;
        }
    },
}));
//转战播放配音
exports.zhuanzhan.addEffect(sgs.TriggerEffect({
    priorityType: 0 /* PriorityType.None */,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOpen() && data.card && data.card.name === 'sha') {
            return (data.from === this.player &&
                !!data.targets.find((v) => v.isNoneKingdom()));
        }
    },
}));
exports.xunji = sgs.Skill({
    name: 'wars.malong.xunji',
});
exports.xunji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "ChooseTarget" /* EventTriggers.ChooseTarget */,
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
    getSelectors(room, context) {
        const skill = this;
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
                            count: [1, 2],
                            filter(item, selected) {
                                return (sha &&
                                    !targets.includes(item) &&
                                    from.canUseCard(sha, [item], skill.name, { excluesCardTimesLimit: true }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `勋济：你可以选择至多两名角色也成为【杀】的目标`,
                        thinkPrompt: `勋济`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.becomTarget(targets);
    },
    async effect(room, data, context) {
        const { from } = context;
        const effect = await room.addEffect('xunji.delay', from);
        effect.setData('data', data);
    },
}));
exports.xunji_delay = sgs.TriggerEffect({
    name: 'xunji.delay',
    trigger: "UseCardEnd1" /* EventTriggers.UseCardEnd1 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && this.getData('data') === data;
    },
    async cost(room, data, context) {
        const { from } = context;
        await this.removeSelf();
        const damages = room
            .getHistorys(sgs.DataType.DamageEvent, (v) => v.source === data)
            .map((v) => v.to)
            .filter((v) => v);
        if (data.targets.length &&
            data.targets.every((v) => damages.includes(v))) {
            from.reduceMark('__sha_times', 1);
        }
    },
});
exports.malong.addSkill(exports.zhuanzhan);
exports.malong.addSkill(exports.xunji);
