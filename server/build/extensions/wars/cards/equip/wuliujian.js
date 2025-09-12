"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wuliujian_skill = exports.wuliujian = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.wuliujian = sgs.CardUseEquip({
    name: 'wuliujian',
});
sgs.setCardData('wuliujian', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'an',
});
exports.wuliujian_skill = sgs.Skill({
    name: 'wuliujian',
    attached_equip: 'wuliujian',
});
exports.wuliujian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 2;
        }
    },
    [skill_types_1.StateEffectType.Range_Correct](from) {
        const room = this.room;
        if (!this.isOwner(from) && room.sameAsKingdom(this.player, from)) {
            return 1;
        }
    },
}));
