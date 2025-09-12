"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lieren = exports.juxiang = exports.zhurong = void 0;
exports.zhurong = sgs.General({
    name: 'wars.zhurong',
    kingdom: 'shu',
    hp: 2,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.juxiang = sgs.Skill({
    name: 'wars.zhurong.juxiang',
});
exports.juxiang.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CardEffectStart" /* EventTriggers.CardEffectStart */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'nanmanruqin' &&
            data.current.target === player);
    },
    async cost(room, data, context) {
        return await data.invalidCurrent();
    },
}));
exports.juxiang.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'nanmanruqin' &&
            data.from !== player &&
            data.card.hasSubCards());
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.obtainCards({
            player: from,
            cards: data.card.subcards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.lieren = sgs.Skill({
    name: 'wars.zhurong.lieren',
});
exports.lieren.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
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
                            selectable: target.getSelfCards(),
                            data_rows: target.getCardsToArea('he'),
                            windowOptions: {
                                title: '猎刃',
                                timebar: room.responseTime,
                                prompt: `猎刃，请选择一张牌`,
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
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from === player &&
            data.reason === 'sha' &&
            player.canPindian([data.to])) {
            const source = data.source;
            return (source.is(sgs.DataType.UseCardEvent) &&
                source.current.target === data.to);
        }
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        const { from, targets } = context;
        return await room.pindian({
            from,
            targets,
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: 'lieren_pindian',
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.zhurong.addSkill(exports.juxiang);
exports.zhurong.addSkill(exports.lieren);
sgs.loadTranslation({
    ['lieren_pindian']: '烈刃：请选择一张牌拼点',
});
