"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dangpan = exports.fenmie = exports.huliehuyuan = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.huliehuyuan = sgs.General({
    name: 'xl.huliehuyuan',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isDualImage: true,
    isWars: true,
});
exports.fenmie = sgs.Skill({
    name: 'xl.huliehuyuan.fenmie',
});
exports.fenmie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.set({ attr: [1 /* CardAttr.Fire */] });
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseVCard({
                            step: 1,
                            count: 1,
                            selectable: [sha.vdata],
                            onChange(type, item) {
                                if (type === 'add') {
                                    this._use_or_play_vcard =
                                        room.createVirtualCardByData(item, false);
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '焚灭，你可以失去1点体力，视为使用火【杀】',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('sha')) {
            const phase = room.getCurrentPhase();
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, phase);
            return phase.isOwner(player, 4 /* Phase.Play */) && uses.length < 1;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.losehp({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.dangpan = sgs.Skill({
    name: 'xl.huliehuyuan.dangpan',
});
exports.dangpan.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.TargetMod_PassTimeCheck](from, card, target) {
        if (!target || card.custom.check)
            return this.isOwner(from);
        return (this.isOwner(from) &&
            card.name === 'sha' &&
            card.hasAttr(1 /* CardAttr.Fire */));
    },
}));
exports.dangpan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            (data.to.isYexinjia() || data.to.hasNoneOpen()));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.huliehuyuan.addSkill(exports.fenmie);
exports.huliehuyuan.addSkill(exports.dangpan);
