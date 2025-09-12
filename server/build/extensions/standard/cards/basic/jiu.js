"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiu2 = exports.jiu = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.jiu = sgs.CardUse({
    name: 'jiu',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    timeCondition(room, from, card) {
        return 1;
    },
    target(room, from, card) {
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item;
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        const { from, card, source } = data;
        const pass = room
            .getStates(skill_types_1.StateEffectType.TargetMod_PassCountingTime, [
            from,
            card,
            undefined,
        ])
            .some((v) => v);
        if (!pass) {
            from.increaseMark('__jiu_times', 1);
        }
    },
    async effect(room, target, data) {
        const { current } = data;
        current.target.setProperty('jiuState', current.target.jiuState + 1);
    },
});
exports.jiu2 = sgs.CardUse({
    name: 'jiu',
    method: 2,
    trigger: "Dying" /* EventTriggers.Dying */,
    condition(room, from, card, data) {
        return (data.is(sgs.DataType.DyingEvent) &&
            data.player === from &&
            data.player.hp <= 0);
    },
    prompt(room, from, card, context) {
        if (context.prompt)
            return context.prompt;
        else
            return {};
    },
    target(room, from, card) {
        const max = Math.max(...room.players.map((v) => v.indying));
        const player = room.players.find((v) => v.indying === max);
        return room.createChoosePlayer({
            count: 1,
            filter(item, selected) {
                return from === item && item === player && item.hp <= 0;
            },
            auto: true,
        });
    },
    async onuse(room, data) {
        data.baseRecover = 1;
    },
    async effect(room, target, data) {
        const { current, baseRecover = 1 } = data;
        await room.recoverhp({
            player: current.target,
            number: baseRecover,
            source: data,
            reason: this.name,
        });
    },
});
sgs.setCardData('jiu', {
    type: 1 /* CardType.Basic */,
    subtype: 1 /* CardSubType.Basic */,
    recover: true,
    rhyme: 'iu',
});
