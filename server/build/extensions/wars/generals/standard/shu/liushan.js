"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xiangle = exports.fangquan_delay = exports.fangquan = exports.liushan = void 0;
exports.liushan = sgs.General({
    name: 'wars.liushan',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.fangquan = sgs.Skill({
    name: 'wars.liushan.fangquan',
});
exports.fangquan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    audio: [`liushan/fangquan1`],
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseStart" /* EventTriggers.PlayPhaseStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && !data.isComplete);
    },
    async cost(room, data, context) {
        await room.currentTurn.skipPhase();
        const effect = await room.addEffect('fangquan.delay', this.player);
        effect.setData('turn', room.currentTurn);
        return true;
    },
}));
exports.fangquan_delay = sgs.TriggerEffect({
    name: 'fangquan.delay',
    auto_directline: 1,
    audio: ['liushan/fangquan2'],
    priorityType: 1 /* PriorityType.General */,
    trigger: "TurnEnd" /* EventTriggers.TurnEnd */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data === this.getData('turn');
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                        target: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item != from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `放权，你可以选择一名其他角色，令他获得一个额外回合`,
                        thinkPrompt: '放权',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        await this.removeSelf();
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { targets: [target], } = context;
        await room.executeExtraTurn(room.createEventData(sgs.DataType.TurnEvent, {
            player: target,
            isExtra: true,
            phases: room.getRatedPhases(),
            skipPhases: [],
            source: undefined,
            reason: this.name,
        }));
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.xiangle = sgs.Skill({
    name: 'wars.liushan.xiangle',
});
exports.xiangle.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 1,
                            selectable: target.getHandCards(),
                            filter(item, selected) {
                                return item.type === 1 /* CardType.Basic */;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `享乐，你需要弃置一张基本牌，否则【杀】对${context.from?.gameName}无效`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.current.target === player);
    },
    async cost(room, data, context) {
        context.targets = [data.from];
        const req = await room.doRequest({
            player: data.from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        const drop = await room.dropCards({
            player: data.from,
            cards,
            source: data,
            reason: this.name,
        });
        if (!drop) {
            await data.invalidCurrent();
        }
        return true;
    },
}));
exports.liushan.addSkill(exports.fangquan);
exports.liushan.addSkill(exports.xiangle);
sgs.loadTranslation({
    [exports.fangquan_delay.name]: '放权',
});
