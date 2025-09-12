"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yaozhuo_delay = exports.yaozhuo = exports.cs_xiayun = void 0;
exports.cs_xiayun = sgs.General({
    name: 'mobile.cs_xiayun',
    kingdom: 'qun',
    hp: 1,
    gender: 1 /* Gender.Male */,
    enable: false,
    hidden: true,
});
exports.yaozhuo = sgs.Skill({
    name: 'mobile.cs_xiayun.yaozhuo',
});
exports.yaozhuo.addEffect(sgs.TriggerEffect({
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
                            filter(item, selected) {
                                return (item !== from &&
                                    from.canPindian([item], skill.name));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `谣啄：你可以选择一名其他角色，与他发起拼点`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 2,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `谣啄：请弃置两张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.canPindian([], this.name));
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `quhu_pindian`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            await room.addEffect('yaozhuo.delay', target);
        }
        if (pindian.lose.includes(from)) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.yaozhuo_delay = sgs.TriggerEffect({
    name: 'yaozhuo.delay',
    mark: ['yaozhuo.delay'],
    trigger: "DrawPhaseStart" /* EventTriggers.DrawPhaseStart */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        await data.skip();
        await this.removeSelf();
        return true;
    },
});
exports.cs_xiayun.addSkill(exports.yaozhuo);
sgs.loadTranslation({
    [exports.yaozhuo_delay.name]: '谣啄',
});
