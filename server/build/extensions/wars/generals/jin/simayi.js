"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shunfu = exports.yingshi = exports.simayi_jin = void 0;
exports.simayi_jin = sgs.General({
    name: 'wars.simayi_jin',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.yingshi = sgs.Skill({
    name: 'wars.simayi_jin.yingshi',
});
exports.yingshi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    auto_sort: false,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const from = context.from;
                const zhijizhibi = room.createVirtualCardByNone('zhijizhibi', undefined, false);
                zhijizhibi.custom.method = 1;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 2,
                            filter(item, selected) {
                                if (selected.length === 0) {
                                    return item.canUseCard(zhijizhibi.vdata, undefined, effect.name);
                                }
                                else {
                                    return selected[0].canUseCard(zhijizhibi.vdata, [item], effect.name);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `鹰视：你可以选择两名角色，第一名角色对第二名角色视为使用一张【知己知彼】。`,
                        thinkPrompt: '鹰视',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        if (targets.length >= 2) {
            const zhijizhibi = room.createVirtualCardByNone('zhijizhibi');
            zhijizhibi.custom.method = 1;
            return await room.usecard({
                from: targets[0],
                targets: [targets[1]],
                card: zhijizhibi,
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const { from } = context;
        const use = context.cost;
        if (use.from !== from) {
            await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.shunfu = sgs.Skill({
    name: 'wars.simayi_jin.shunfu',
});
exports.shunfu.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
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
                            count: [1, 3],
                            filter(item, selected) {
                                return (item !== from && item.isNoneKingdom());
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `瞬覆：你可以选择至多三名其他未确定势力的角色，让他们各摸两张牌。他们可以选择是否使用一张无距离限制且不能被响应的【杀】`,
                    },
                };
            },
            target_limit: () => {
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            excluesCardDistanceLimit: true,
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        const length = targets.length;
        for (let i = 0; i < length; i++) {
            await room.drawCards({
                player: targets[i],
                count: 2,
                source: data,
                reason: this.name,
            });
        }
        for (let i = 0; i < length; i++) {
            await room.needUseCard({
                from: targets[i],
                cards: [{ name: 'sha' }],
                reqOptions: {
                    canCancle: true,
                    prompt: `@${this.name}`,
                    thinkPrompt: this.name,
                },
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context: {},
                },
                source: data,
                reason: this.name,
            });
        }
    },
}));
//不能响应
exports.shunfu.addEffect(sgs.TriggerEffect({
    audio: [],
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.card.name === 'sha' &&
            data.reason === this.name);
    },
    async cost(room, data, context) {
        return await data.targetCantResponse([data.current.target]);
    },
}));
exports.simayi_jin.addSkill(exports.yingshi);
exports.simayi_jin.addSkill(exports.shunfu);
sgs.loadTranslation({
    [`@${exports.shunfu.name}`]: '瞬覆：你可以使用一张无距离限制且不能被响应的【杀】',
});
