"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luoyi_delay = exports.luoyi = exports.xuchu = void 0;
exports.xuchu = sgs.General({
    name: 'wars.xuchu',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.luoyi = sgs.Skill({
    name: 'wars.xuchu.luoyi',
});
exports.luoyi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "DrawPhaseEnd" /* EventTriggers.DrawPhaseEnd */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 3 /* Phase.Draw */ &&
            data.executor === player);
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
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '裸衣：你可以弃置一张牌，本回合使用【杀】或【决斗】的伤害+1',
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
        const { from } = context;
        const effect = await room.addEffect('luoyi.delay', from);
        effect.setData('turn', room.currentTurn);
    },
}));
exports.xuchu.addSkill(exports.luoyi);
exports.luoyi_delay = sgs.TriggerEffect({
    name: 'luoyi.delay',
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamage1" /* EventTriggers.CauseDamage1 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            data.from === player &&
            (data.reason === 'sha' || data.reason === 'juedou'));
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player?.setMark(this.name, true, {
                    visible: true,
                });
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark(this.name);
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
sgs.loadTranslation({
    [exports.luoyi_delay.name]: '裸衣',
});
