"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yuxi_skill = exports.yuxi = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.yuxi = sgs.CardUseEquip({
    name: 'yuxi',
});
sgs.setCardData('yuxi', {
    type: 3 /* CardType.Equip */,
    subtype: 36 /* CardSubType.Treasure */,
    rhyme: 'i',
});
exports.yuxi_skill = sgs.Skill({
    name: 'yuxi',
    attached_equip: 'yuxi',
    condition(room) {
        return !this.player.isNoneKingdom();
    },
});
exports.yuxi_skill.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Regard_OnlyBig](player) {
        return this.isOwner(player);
    },
}));
exports.yuxi_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "DrawPhaseProceeding" /* EventTriggers.DrawPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        data.ratedDrawnum++;
        return true;
    },
}));
exports.yuxi_skill.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 2 /* PriorityType.Equip */,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            return player.canUseCard({ name: 'zhijizhibi' }, undefined, this.name);
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const zhijizhibi = room.createVirtualCardByNone('zhijizhibi');
        zhijizhibi.custom.method = 1;
        return await room.preUseCard({
            from,
            card: zhijizhibi,
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: 'yuxi.zhijizhibi',
                thinkPrompt: this.name,
                showMainButtons: true,
                canCancle: false,
            },
        });
    },
}));
sgs.loadTranslation({
    ['yuxi.zhijizhibi']: '玉玺：你可以视为使用一张【知己知彼】',
});
