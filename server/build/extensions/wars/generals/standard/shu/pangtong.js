"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.niepan = exports.lianhuan = exports.pangtong = void 0;
exports.pangtong = sgs.General({
    name: 'wars.pangtong',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.lianhuan = sgs.Skill({
    name: 'wars.pangtong.lianhuan',
});
exports.lianhuan.addEffect(sgs.TriggerEffect({
    name: 'wars.pangtong.lianhuan.recast',
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    context(room, player, data) {
        return {
            maxTimes: -1,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.suit === 3 /* CardSuit.Club */;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `连环，你可以重铸一张梅花手牌`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.recastCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.lianhuan.addEffect(sgs.TriggerEffect({
    name: 'wars.pangtong.lianhuan.use',
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.has('tiesuolianhuan');
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const tiesuo = room.createVirtualCardByNone('tiesuolianhuan', undefined, false);
                tiesuo.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.suit === 3 /* CardSuit.Club */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    tiesuo.addSubCard(item);
                                if (type === 'remove')
                                    tiesuo.delSubCard(item);
                                tiesuo.set();
                                this._use_or_play_vcard = tiesuo;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `连环，你可以将一张梅花手牌当【铁索连环】使用`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        return true;
    },
}));
exports.niepan = sgs.Skill({
    name: 'wars.pangtong.niepan',
});
exports.niepan.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "Dying" /* EventTriggers.Dying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.dropCards({
            player: from,
            cards: from.getAreaCards(),
            source: data,
            reason: this.name,
        });
        await room.restore({
            player: from,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
        await room.recoverTo({
            player: from,
            number: 3,
            source: data,
            reason: this.name,
        });
    },
}));
exports.pangtong.addSkill(exports.lianhuan);
exports.pangtong.addSkill(exports.niepan);
sgs.loadTranslation({
    ['@method:wars.pangtong.lianhuan.recast']: '重铸梅花牌',
    ['@method:wars.pangtong.lianhuan.use']: '使用铁索连环',
});
