"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kuanggu = exports.weiyan = void 0;
exports.weiyan = sgs.General({
    name: 'wars.weiyan',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.kuanggu = sgs.Skill({
    name: 'wars.weiyan.kuanggu',
});
exports.kuanggu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const options = ['kuanggu_draw', 'kuanggu_recover'];
                const draw = room.createEventData(sgs.DataType.DrawCardsData, {
                    player: from,
                    count: 1,
                    reason: this.name,
                    source: undefined,
                });
                if (!draw.check())
                    options[0] = '!' + options[0];
                const recover = room.createEventData(sgs.DataType.RecoverHpEvent, {
                    player: from,
                    number: 1,
                    reason: this.name,
                    source: undefined,
                });
                if (!recover.check())
                    options[1] = '!' + options[1];
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: `狂骨，你可以选择一项`,
                        thinkPrompt: `狂骨`,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.data.kuanggu);
    },
    async cost(room, data, context) {
        const { from } = context;
        const result = context.req_result.results.option.result;
        if (result.includes('kuanggu_draw')) {
            return await room.drawCards({
                player: from,
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('kuanggu_recover')) {
            return await room.recoverhp({
                player: from,
                source: data,
                reason: this.name,
            });
        }
    },
    lifecycle: [
        {
            trigger: "ReduceHpStart" /* EventTriggers.ReduceHpStart */,
            priority: 'before',
            async on_exec(room, data) {
                //扣减体力前检测距离
                if (data.is(sgs.DataType.ReduceHpEvent)) {
                    const damage = data.getDamage();
                    if (damage &&
                        damage.from === this.player &&
                        this.player.distanceTo(damage.to) <= 1) {
                        damage.data.kuanggu = true;
                    }
                }
            },
        },
    ],
}));
exports.weiyan.addSkill(exports.kuanggu);
sgs.loadTranslation({
    ['kuanggu_draw']: '摸一张牌',
    ['kuanggu_recover']: '回复一点体力',
});
