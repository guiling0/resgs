"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guidao = exports.leiji = exports.zhangjiao = void 0;
exports.zhangjiao = sgs.General({
    name: 'wars.zhangjiao',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.leiji = sgs.Skill({
    name: 'wars.zhangjiao.leiji',
});
exports.leiji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            data.card.name === 'shan');
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '雷击：你可以选择一名其他角色判定，如果是黑桃，对他造成2点雷电伤害',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.judge({
            player: target,
            isSucc(result) {
                return result.suit === 1 /* CardSuit.Spade */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const judge = context.cost;
        if (judge.success) {
            await room.damage({
                from,
                to: target,
                number: 2,
                damageType: 2 /* DamageType.Thunder */,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.leiji.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "CardBePlay" /* EventTriggers.CardBePlay */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            data.card.name === 'shan');
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '雷击：你可以选择一名其他角色判定，如果是黑桃，对他造成2点雷电伤害',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.judge({
            player: target,
            isSucc(result) {
                return result.suit === 1 /* CardSuit.Spade */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const judge = context.cost;
        if (judge.success) {
            await room.damage({
                from,
                to: target,
                number: 2,
                damageType: 2 /* DamageType.Thunder */,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.guidao = sgs.Skill({
    name: 'wars.zhangjiao.guidao',
});
exports.guidao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "JudgeResult1" /* EventTriggers.JudgeResult1 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const skill = this;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return (item.color === 2 /* CardColor.Black */ &&
                                    from.canPlayCard(room.createVirtualCardByOne(item, false), skill.name));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `鬼道：你可以打出一张牌替换判定牌`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.JudgeEvent) &&
            player.hasCardsInArea());
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        const play = room.createVirtualCardByOne(cards.at(0));
        return await room.playcard({
            from,
            card: play,
            source: data,
            reason: this.name,
            notMoveHandle: true,
            skill: this,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const play = context.cost;
        if (play.card.subcards.length === 0)
            return;
        await room.obtainCards({
            player: from,
            cards: [data.card],
            source: data,
            reason: this.name,
        });
        await data.setCard(play.card.subcards[0]);
    },
}));
exports.zhangjiao.addSkill(exports.leiji);
exports.zhangjiao.addSkill(exports.guidao);
