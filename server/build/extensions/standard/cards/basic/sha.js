"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.sha = sgs.CardUse({
    name: 'sha',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    timeCondition(room, from, card) {
        return 1;
    },
    distanceCondition(room, from, target, card) {
        return from.rangeOf(target);
    },
    target(room, from, card) {
        const count = room
            .getStates(skill_types_1.StateEffectType.TargetMod_CardLimit, [from, card])
            .at(-1) ?? 1;
        return room.createChoosePlayer({
            count,
            filter(item, selected) {
                return from !== item;
            },
        });
    },
    async onuse(room, data) {
        const { from, card, source } = data;
        data.baseDamage = 1 + from.jiuState;
        from.setProperty('jiuState', 0);
        if (source.is(sgs.DataType.PhaseEvent) &&
            source.trigger === "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */ &&
            source.executor === from) {
            const pass = room
                .getStates(skill_types_1.StateEffectType.TargetMod_PassCountingTime, [
                from,
                card,
                undefined,
            ])
                .some((v) => v);
            if (!pass) {
                from.increaseMark('__sha_times', 1);
            }
        }
    },
    async effect(room, target, data) {
        const { card, from, current, baseDamage = 1 } = data;
        let damageType = 0 /* DamageType.None */;
        if (card.hasAttr(2 /* CardAttr.Thunder */)) {
            damageType = 2 /* DamageType.Thunder */;
        }
        if (card.hasAttr(1 /* CardAttr.Fire */)) {
            damageType = 1 /* DamageType.Fire */;
        }
        await room.damage({
            from,
            to: current.target,
            number: baseDamage,
            damageType,
            channel: card,
            isChain: false,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('sha', {
    type: 1 /* CardType.Basic */,
    subtype: 1 /* CardSubType.Basic */,
    damage: true,
});
