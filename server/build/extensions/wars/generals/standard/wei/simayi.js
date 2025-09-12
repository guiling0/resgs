"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guicai = exports.fankui = exports.simayi = void 0;
exports.simayi = sgs.General({
    name: 'wars.simayi',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.fankui = sgs.Skill({
    name: 'wars.simayi.fankui',
});
exports.fankui.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    auto_directline: 1,
    forced: 'cost',
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.DamageEvent) &&
            player === data.to &&
            data.from &&
            data.from.hasCardsInArea());
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '反馈',
                                timebar: room.responseTime,
                                prompt: `反馈：请选择一张牌`,
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: this.skill.name,
                    },
                };
            },
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
        return await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.guicai = sgs.Skill({
    name: 'wars.simayi.guicai',
});
exports.guicai.addEffect(sgs.TriggerEffect({
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
                                return from.canPlayCard(room.createVirtualCardByOne(item, false), skill.name);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `鬼才：你可以打出一张牌代替判定牌`,
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
        const play = context.cost;
        if (play.card.subcards.length === 0)
            return;
        await data.setCard(play.card.subcards[0]);
    },
}));
exports.simayi.addSkill(exports.fankui);
exports.simayi.addSkill(exports.guicai);
