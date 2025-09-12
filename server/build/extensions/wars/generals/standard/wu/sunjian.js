"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yinghun = exports.sunjian = void 0;
exports.sunjian = sgs.General({
    name: 'wars.sunjian',
    kingdom: 'wu',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.yinghun = sgs.Skill({
    name: 'wars.sunjian.yinghun',
});
exports.yinghun.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            player.losshp > 0);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const options = [];
                if (from.losshp > 1) {
                    options.push({
                        text: 'yinghun.draw',
                        values: [{ type: 'number', value: from.losshp }],
                    });
                    options.push({
                        text: 'yinghun.drop',
                        values: [{ type: 'number', value: from.losshp }],
                    });
                }
                else {
                    options.push('confirm');
                }
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                        option: room.createChooseOptions({
                            step: 2,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: from.losshp > 1
                            ? `英魂，请选择一名其他角色并选择一个选项令其执行`
                            : '英魂，请选择一名其他角色让他摸一张牌，再弃置一张牌',
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const target = context.targets.at(0);
                const count = context.count;
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count,
                            selectable: target.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `英魂，你需要弃置${count}张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], req_result, } = context;
        let result = req_result.results.option?.result;
        const drawnum = result.includes('yinghun.draw') ? from.losshp : 1;
        const dropnum = result.includes('yinghun.drop') ? from.losshp : 1;
        context.count = dropnum;
        return await room.drawCards({
            player: target,
            count: drawnum,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        await room.dropCards({
            player: target,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.sunjian.addSkill(exports.yinghun);
sgs.loadTranslation({
    ['yinghun.draw']: '摸{0}弃1',
    ['yinghun.drop']: '摸1弃{0}',
});
