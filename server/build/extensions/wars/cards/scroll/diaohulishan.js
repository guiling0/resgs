"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diaohulishan_state = exports.diaohulishan = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.diaohulishan = sgs.CardUse({
    name: 'diaohulishan',
    method: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    target(room, from, card) {
        return room.createChoosePlayer({
            count: [1, 2],
            filter(item, selected) {
                return item !== from;
            },
        });
    },
    async effect(room, target, data) {
        const { current } = data;
        const effect = await room.addEffect('diaohulishan.state', current.target);
        effect.setData('turn', room.currentTurn);
    },
});
exports.diaohulishan_state = sgs.StateEffect({
    name: 'diaohulishan.state',
    [skill_types_1.StateEffectType.NotCalcDistance](from) {
        return this.isOwner(from);
    },
    [skill_types_1.StateEffectType.NotCalcSeat](from) {
        return this.isOwner(from);
    },
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return this.isOwner(from) || this.isOwner(target);
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player.setProperty('indiaohu', true);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player.setProperty('indiaohu', false);
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
sgs.setCardData('diaohulishan', {
    type: 2 /* CardType.Scroll */,
    subtype: 21 /* CardSubType.InstantScroll */,
    length: 4,
    rhyme: 'an',
});
sgs.loadTranslation({
    [exports.diaohulishan_state.name]: '调虎离山',
});
