"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ganglie = exports.xiahoudun = void 0;
exports.xiahoudun = sgs.General({
    name: 'wars.xiahoudun',
    kingdom: 'wei',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.ganglie = sgs.Skill({
    name: 'wars.xiahoudun.ganglie',
});
exports.ganglie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    auto_directline: 1,
    forced: 'cost',
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 2,
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '刚烈，你需要弃置两张手牌，否则受到1点伤害',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            player === data.to);
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.suit !== 2 /* CardSuit.Heart */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const from = context.from;
        const target = context.targets.at(0);
        const judge = context.cost;
        if (target && judge.success) {
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            if (cards.length === 2) {
                await room.dropCards({
                    player: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
            else {
                await room.damage({
                    from,
                    to: target,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.xiahoudun.addSkill(exports.ganglie);
