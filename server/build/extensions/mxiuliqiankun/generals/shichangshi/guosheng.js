"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.niqu = exports.cs_guosheng = void 0;
exports.cs_guosheng = sgs.General({
    name: 'mobile.cs_guosheng',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.niqu = sgs.Skill({
    name: 'mobile.cs_guosheng.niqu',
});
exports.niqu.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
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
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `逆取：你可以对一名角色造成1点火焰伤害`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        return await room.damage({
            from,
            to,
            damageType: 1 /* DamageType.Fire */,
            source: data,
            reason: this.name,
        });
    },
}));
exports.cs_guosheng.addSkill(exports.niqu);
