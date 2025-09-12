"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hanbing_skill = exports.hanbingjian = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.hanbingjian = sgs.CardUseEquip({
    name: 'hanbingjian',
});
sgs.setCardData('hanbingjian', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'an',
});
exports.hanbing_skill = sgs.Skill({
    name: 'hanbingjian',
    attached_equip: 'hanbingjian',
});
exports.hanbing_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
}));
exports.hanbing_skill.addEffect(sgs.TriggerEffect({
    anim: 'hanbingjian_skill',
    audio: ['hanbingjian'],
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '寒冰剑',
                                timebar: room.responseTime,
                                prompt: `寒冰剑：请选择一张牌（还剩${context.count}张）`,
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '寒冰剑',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
            const { from, reason, to } = data;
            return (reason === 'sha' && player === from && to.hasCardsInArea());
        }
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
        const { from, targets: { [0]: target }, } = context;
        let count = 2;
        while (count-- > 0 &&
            target.hasCanDropCards('he', from, 1, this.name)) {
            context.count = count + 1;
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
