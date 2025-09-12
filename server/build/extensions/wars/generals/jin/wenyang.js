"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duanqiu_delay = exports.duanqiu = exports.wenyang = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.wenyang = sgs.General({
    name: 'wars.wenyang',
    kingdom: 'jin',
    hp: 2.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.duanqiu = sgs.Skill({
    name: 'wars.wenyang.duanqiu',
});
exports.duanqiu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 1 /* Phase.Ready */ &&
            data.executor === player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const skill = context.effect;
                const juedou = room.createVirtualCardByNone('juedou', undefined, false);
                juedou.custom.method = 1;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (!item.isNoneKingdom() &&
                                    from.canUseCard(juedou.vdata, [item], skill.name, undefined, selected));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '断虬：你可以选择一名确定势力的角色，对他的势力的所有角色视为使用【决斗】',
                        thinkPrompt: '断虬',
                    },
                };
            },
            target_limit: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            count: [1, -1],
                            filter(item, selected) {
                                return room.sameAsKingdom(target, item);
                            },
                            auto: true,
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        if (!target)
            return false;
        const card = room.createVirtualCardByNone('juedou');
        return await room.preUseCard({
            from,
            card,
            targetSelector: {
                selectorId: this.getSelectorName('target_limit'),
                context,
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const use = context.cost;
        const plays = room.getHistorys(sgs.DataType.PlayCardEvent, (v) => v.source === use && v.card && v.card.name === 'sha', use);
        const effect = await room.addEffect('duanqiu.delay', from);
        from.setMark('duanqiu.states', `${0}/${plays.length}`, {
            visible: true,
        });
        effect.setData('turn', room.currentTurn);
    },
}));
exports.duanqiu_delay = sgs.StateEffect({
    name: 'duanqiu.delay',
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        const state = (this.player.getMark('duanqiu.states') ?? '0/0').split('/');
        const count = Number(state[0]);
        const max = Number(state[1]);
        if (card.subcards.length + count > max) {
            return true;
        }
    },
    lifecycle: [
        //记录使用的牌数
        {
            trigger: "DeclareUseCard" /* EventTriggers.DeclareUseCard */,
            async on_exec(room, data) {
                if (data.card) {
                    const state = (this.player.getMark('duanqiu.states') ?? '0/0').split('/');
                    let count = Number(state[0]);
                    let max = Number(state[1]);
                    count += data.card.subcards.length;
                    this.player.setMark('duanqiu.states', `${count}/${max}`, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    this.player.removeMark('duanqiu.states');
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.wenyang.addSkill(exports.duanqiu);
sgs.loadTranslation({
    ['duanqiu.states']: '断虬',
});
