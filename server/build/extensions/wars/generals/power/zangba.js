"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hengjiang = exports.renxia = exports.zangba = void 0;
exports.zangba = sgs.General({
    name: 'wars.zangba',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.renxia = sgs.Skill({
    name: 'wars.zangba.renxia',
});
exports.renxia.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.has('tiesuolianhuan')) {
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 1;
        }
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
                                return item.suit === 1 /* CardSuit.Spade */;
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
                        prompt: `捍御：你可以将一张黑桃手牌当【铁索连环】使用`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        await data.exec();
        await room.chain({
            player: from,
            to_state: true,
            source: data,
            reason: this.name,
        });
    },
}));
exports.hengjiang = sgs.Skill({
    name: 'wars.zangba.hengjiang',
});
exports.hengjiang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "InflictDamage3" /* EventTriggers.InflictDamage3 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.damageType !== 0 /* DamageType.None */ &&
            player.chained);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from && item.chained;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `横江：你可以选择一名处于铁索连环的角色，解除他的铁索连环状态并移除他的副将`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from, targets: [player], } = context;
        await room.chain({
            player,
            to_state: false,
            source: data,
            reason: this.name,
        });
        if (room.differentAsKingdom(from, player)) {
            await room.remove({
                player,
                general: player.deputy,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.zangba.addSkill(exports.renxia);
exports.zangba.addSkill(exports.hengjiang);
