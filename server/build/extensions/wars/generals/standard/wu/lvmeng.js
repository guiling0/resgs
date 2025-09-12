"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mouduan = exports.keji = exports.lvmeng = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.lvmeng = sgs.General({
    name: 'wars.lvmeng',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.keji = sgs.Skill({
    name: 'wars.lvmeng.keji',
});
exports.keji.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "DropPhaseProceeding" /* EventTriggers.DropPhaseProceeding */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const uses = [];
            room.getHistorys(sgs.DataType.PhaseEvent, (v) => v.isOwner(player, 4 /* Phase.Play */), room.currentTurn).forEach((v) => {
                uses.push(...room.getHistorys(sgs.DataType.UseCardEvent, (d) => d.from === player, v));
                uses.push(...room.getHistorys(sgs.DataType.UseCardToCardEvent, (d) => d.from === player, v));
            });
            return !uses.find((v1) => uses.find((v2) => v1.card.color !== 0 /* CardColor.None */ &&
                v2.card.color !== 0 /* CardColor.None */ &&
                v1.card.color !== v2.card.color));
        }
    },
    async cost(room, data, context) {
        context.from.setMark(this.name, true);
        return true;
    },
    lifecycle: [
        {
            trigger: "DropPhaseEnd" /* EventTriggers.DropPhaseEnd */,
            priority: 'after',
            async on_exec(room, data) {
                this.player.removeMark(this.name);
            },
        },
    ],
}));
exports.keji.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from) && from.hasMark(this.name)) {
            return 4;
        }
    },
}));
exports.mouduan = sgs.Skill({
    name: 'wars.lvmeng.mouduan',
});
exports.mouduan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const uses = [];
            room.getHistorys(sgs.DataType.PhaseEvent, (v) => v.isOwner(player, 4 /* Phase.Play */), room.currentTurn).forEach((v) => {
                uses.push(...room.getHistorys(sgs.DataType.UseCardEvent, (d) => d.from === player, v));
                uses.push(...room.getHistorys(sgs.DataType.UseCardToCardEvent, (d) => d.from === player, v));
            });
            if (uses.length < 3)
                return false;
            const suits = [];
            const types = [];
            uses.forEach((v) => {
                if (!suits.includes(v.card.suit) &&
                    v.card.suit !== 0 /* CardSuit.None */)
                    suits.push(v.card.suit);
                if (!types.includes(v.card.type) &&
                    v.card.type !== 0 /* CardType.None */)
                    types.push(v.card.type);
            });
            return suits.length === 4 || types.length === 3;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.moveFiled(from, 'ej', {
            canCancle: true,
            showMainButtons: true,
            prompt: this.name,
        }, data, this.name);
    },
}));
exports.lvmeng.addSkill(exports.keji);
exports.lvmeng.addSkill(exports.mouduan);
