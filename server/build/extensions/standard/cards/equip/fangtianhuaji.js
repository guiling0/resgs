"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fangtian_skill = exports.fangtianhuaji = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.fangtianhuaji = sgs.CardUseEquip({
    name: 'fangtianhuaji_bs',
});
sgs.setCardData('fangtianhuaji_bs', {
    type: 3 /* CardType.Equip */,
    subtype: 31 /* CardSubType.Weapon */,
    rhyme: 'i',
});
exports.fangtian_skill = sgs.Skill({
    name: 'fangtianhuaji_bs',
    attached_equip: 'fangtianhuaji_bs',
});
exports.fangtian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Range_Initial](from) {
        if (this.isOwner(from)) {
            return 4;
        }
    },
    [skill_types_1.StateEffectType.TargetMod_CardLimit](from, card) {
        if (this.isOwner(from) && card.name === 'sha') {
            if (card.subcards.length &&
                card.subcards.every((v) => v.area === from.handArea) &&
                card.subcards.length === from.handArea.count)
                return [1, 3];
        }
    },
}));
