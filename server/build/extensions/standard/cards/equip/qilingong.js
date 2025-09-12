"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qilingong_skill = exports.qilingong = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.qilingong = sgs.CardUseEquip({
    name: 'qilingong',
});
sgs.setCardData('qilingong', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'ong',
});
exports.qilingong_skill = sgs.Skill({
    name: 'qilingong',
    attached_equip: 'qilingong',
});
exports.qilingong_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 5;
        }
    },
}));
exports.qilingong_skill.addEffect(sgs.TriggerEffect({
    anim: 'qilingong_skill',
    audio: ['qilingong'],
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
                            selectable: target.getHorses(),
                            data_rows: [
                                {
                                    title: 'equipArea',
                                    cards: target.getHorses(),
                                },
                            ],
                            windowOptions: {
                                title: '麒麟弓',
                                timebar: room.responseTime,
                                prompt: `麒麟弓：请选择一张牌`,
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '麒麟弓',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.is(sgs.DataType.DamageEvent)) {
            const { from, reason, to } = data;
            return (reason === 'sha' &&
                player === from &&
                to.getHorses().length > 0);
        }
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        const { from, targets: { [0]: target }, } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
