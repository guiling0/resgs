"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhiman = exports.sanyao = exports.masu = void 0;
exports.masu = sgs.General({
    name: 'wars.masu',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.sanyao = sgs.Skill({
    name: 'wars.masu.sanyao',
});
exports.sanyao.addEffect(sgs.TriggerEffect({
    auto_directline: 1,
    auto_log: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const max = Math.max(...room.playerAlives.map((v) => v.hp));
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item.hp === max;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `散谣：你可以弃置一张牌对体力值最大的角色造成1点伤害`,
                    },
                };
            },
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
exports.zhiman = sgs.Skill({
    name: 'wars.masu.zhiman',
});
exports.zhiman.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.to &&
            data.to !== player);
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: [
                                ...target.getEquipCards(),
                                ...target.getJudgeCards(),
                            ],
                            data_rows: target.getCardsToArea('ej'),
                            windowOptions: {
                                title: '制蛮',
                                timebar: room.responseTime,
                                prompt: '制蛮：请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: this.name,
                    },
                };
            },
            change: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: '制蛮：你可以令其变更',
                    thinkPrompt: this.name,
                });
            },
        };
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        await data.prevent();
        return true;
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        if (target.getEquipCards().length > 0 ||
            target.getJudgeCards().length > 0) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
        if (room.sameAsKingdom(from, target)) {
            const change = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('change'),
                    context,
                },
            });
            if (!change.result.cancle) {
                await room.chooseYesOrNo(target, {
                    prompt: '@zhiman',
                    thinkPrompt: this.name,
                }, async () => {
                    await room.change({
                        player: target,
                        general: 'deputy',
                        source: data,
                        reason: this.name,
                    });
                });
            }
        }
    },
}));
exports.masu.addSkill(exports.sanyao);
exports.masu.addSkill(exports.zhiman);
sgs.loadTranslation({
    ['@zhimen']: '制蛮：是否变更',
});
