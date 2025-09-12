"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weidi = exports.yongsi = exports.yuanshu = void 0;
exports.yuanshu = sgs.General({
    name: 'wars.yuanshu',
    kingdom: 'qun',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.yongsi = sgs.Skill({
    name: 'wars.yuanshu.yongsi',
});
exports.yongsi.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    audio: ['yuanshu/yongsi1'],
    priorityType: 0 /* PriorityType.None */,
    trigger: "DrawPhaseProceeding" /* EventTriggers.DrawPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOpen() && data.isOwner(this.player);
    },
    regard_skill(room, player, data) {
        if (this.isOwner(player)) {
            return 'yuxi';
        }
    },
    lifecycle: [
        {
            trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
            priority: 'after',
            async on_exec(room, data) {
                const has = room.playerAlives.find((v) => v.getEquipCards().find((c) => c.name === 'yuxi'));
                this.setInvalids(this.name, !!has);
            },
        },
    ],
}));
exports.yongsi.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    audio: ['yuanshu/yongsi2'],
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.current.target === player &&
            data.card.name === 'zhijizhibi' &&
            player.hasHandCards());
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.showCards({
            player: from,
            cards: from.getHandCards(),
            source: data,
            reason: this.name,
        });
    },
}));
exports.weidi = sgs.Skill({
    name: 'wars.yuanshu.weidi',
});
exports.weidi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    context(room, player, data) {
        const targets = [];
        room.getPeriodHistory(room.currentTurn).forEach((v) => {
            if (v.data.is(sgs.DataType.MoveCardEvent)) {
                v.data
                    .filter((d) => d.toArea.type === 91 /* AreaType.Hand */ &&
                    d.fromArea === room.drawArea)
                    .forEach((d) => {
                    if (d.toArea.player &&
                        !targets.includes(d.toArea.player)) {
                        targets.push(d.toArea.player);
                    }
                });
            }
        });
        return {
            targets,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from && targets.includes(item));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '伪帝：你可以令一名本回合获得过牌堆里的牌的其他角色执行军令',
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const count = context.count;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: count,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `伪帝：请将${count}张牌交给${target.gameName}`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [to], } = context;
        return await room.command({
            from,
            to,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [to], } = context;
        const command = context.cost;
        if (command && !command.execute) {
            const count = to.getHandCards().length;
            if (count > 0) {
                await room.obtainCards({
                    player: from,
                    cards: to.getHandCards(),
                    source: data,
                    reason: this.name,
                });
                context.count = count;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                await room.giveCards({
                    from,
                    to,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.yuanshu.addSkill(exports.yongsi);
exports.yuanshu.addSkill(exports.weidi);
