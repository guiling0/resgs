"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuangren_delay = exports.shuangren_v2025 = exports.jiling_v2025 = exports.shuangren = exports.jiling = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.jiling = sgs.General({
    name: 'wars.jiling',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.shuangren = sgs.Skill({
    name: 'wars.jiling.shuangren',
});
exports.shuangren.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.canPindian([], this.name));
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
                                return (item !== from &&
                                    from.canPindian([item], skill.name));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `双刃：你可以选择一名其他角色进行拼点`,
                        thinkPrompt: this.name,
                    },
                };
            },
            target_limit: () => {
                const from = context.from;
                const kingdom = context.kindom;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return room.sameAsKingdom({ kingdom }, item);
                            },
                            excluesCardDistanceLimit: true,
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `shuangren_pindian`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            await room.preUseCard({
                from,
                card: room.createVirtualCardByNone('sha'),
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context: {
                        from,
                        kindom: target.kingdom,
                    },
                },
                reqOptions: {
                    canCancle: false,
                    showMainButtons: true,
                    prompt: `@${this.name}`,
                    thinkPrompt: this.name,
                },
                source: data,
                reason: this.name,
            });
        }
        if (pindian.lose.includes(from)) {
            await data.end();
        }
    },
}));
exports.jiling.addSkill(exports.shuangren);
sgs.loadTranslation({
    ['shuangren_pindian']: '双刃：请选择一张牌拼点',
    [`@${exports.shuangren.name}`]: '双刃：请选择一名角色，视为对他使用【杀】',
    [`shuangren.delay`]: '双刃',
});
exports.jiling_v2025 = sgs.General({
    name: 'wars.v2025.jiling',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.shuangren_v2025 = sgs.Skill({
    name: 'wars.v2025.jiling.shuangren',
});
exports.shuangren_v2025.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.canPindian([], this.name));
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
                                return (item !== from &&
                                    from.canPindian([item], skill.name));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `双刃：你可以选择一名其他角色进行拼点`,
                        thinkPrompt: this.name,
                    },
                };
            },
            target_limit: () => {
                const from = context.from;
                const kingdom = context.kindom;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return room.sameAsKingdom({ kingdom }, item);
                            },
                            excluesCardDistanceLimit: true,
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `shuangren_pindian`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            await room.preUseCard({
                from,
                card: room.createVirtualCardByNone('sha'),
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context: {
                        from,
                        kindom: target.kingdom,
                    },
                },
                reqOptions: {
                    canCancle: false,
                    showMainButtons: true,
                    prompt: `@${this.name}`,
                    thinkPrompt: this.name,
                },
                source: data,
                reason: this.name,
            });
        }
        if (pindian.lose.includes(from)) {
            await room.addEffect('shuangren.delay', from);
        }
    },
}));
exports.shuangren_delay = sgs.StateEffect({
    name: 'shuangren.delay',
    mark: ['shuangren.delay'],
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (this.isOwner(from) &&
            target &&
            target instanceof sgs.DataType.GamePlayer) {
            return from !== target;
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.jiling_v2025.addSkill(exports.shuangren_v2025);
