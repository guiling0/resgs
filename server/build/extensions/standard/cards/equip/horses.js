"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zixin_skill = exports.zixin = exports.dayuan_skill = exports.dayuan = exports.chitu_skill = exports.chitu = exports.zhuahuangfeidian_skill = exports.zhuahuangfeidian = exports.hualiu_skill = exports.hualiu = exports.dilu_skill = exports.dilu = exports.jueying_skill = exports.jueying = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
function defensiveMountCorrect(from, to) {
    if (this.isOwner(to)) {
        return 1;
    }
}
function offensiveMountCorrect(from, to) {
    if (this.isOwner(from)) {
        return -1;
    }
}
exports.jueying = sgs.CardUseEquip({
    name: 'jueying',
});
sgs.setCardData('jueying', {
    type: 3 /* CardType.Equip */,
    subtype: 33 /* CardSubType.DefensiveMount */,
    rhyme: 'ing',
});
exports.jueying_skill = sgs.Skill({
    name: 'jueying',
    attached_equip: 'jueying',
});
exports.jueying_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: defensiveMountCorrect,
}));
exports.dilu = sgs.CardUseEquip({
    name: 'dilu',
});
sgs.setCardData('dilu', {
    type: 3 /* CardType.Equip */,
    subtype: 33 /* CardSubType.DefensiveMount */,
    rhyme: 'u',
});
exports.dilu_skill = sgs.Skill({
    name: 'dilu',
    attached_equip: 'dilu',
});
exports.dilu_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: defensiveMountCorrect,
}));
exports.hualiu = sgs.CardUseEquip({
    name: 'hualiu',
});
sgs.setCardData('hualiu', {
    type: 3 /* CardType.Equip */,
    subtype: 33 /* CardSubType.DefensiveMount */,
    rhyme: 'iu',
});
exports.hualiu_skill = sgs.Skill({
    name: 'hualiu',
    attached_equip: 'hualiu',
});
exports.hualiu_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: defensiveMountCorrect,
}));
exports.zhuahuangfeidian = sgs.CardUseEquip({
    name: 'zhuahuangfeidian',
});
sgs.setCardData('zhuahuangfeidian', {
    type: 3 /* CardType.Equip */,
    subtype: 33 /* CardSubType.DefensiveMount */,
    rhyme: 'an',
});
exports.zhuahuangfeidian_skill = sgs.Skill({
    name: 'zhuahuangfeidian',
    attached_equip: 'zhuahuangfeidian',
});
exports.zhuahuangfeidian_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: defensiveMountCorrect,
}));
exports.chitu = sgs.CardUseEquip({
    name: 'chitu',
});
sgs.setCardData('chitu', {
    type: 3 /* CardType.Equip */,
    subtype: 34 /* CardSubType.OffensiveMount */,
    rhyme: 'u',
});
exports.chitu_skill = sgs.Skill({
    name: 'chitu',
    attached_equip: 'chitu',
});
exports.chitu_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: offensiveMountCorrect,
}));
exports.dayuan = sgs.CardUseEquip({
    name: 'dayuan',
});
sgs.setCardData('dayuan', {
    type: 3 /* CardType.Equip */,
    subtype: 34 /* CardSubType.OffensiveMount */,
    rhyme: 'an',
});
exports.dayuan_skill = sgs.Skill({
    name: 'dayuan',
    attached_equip: 'dayuan',
});
exports.dayuan_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: offensiveMountCorrect,
}));
exports.zixin = sgs.CardUseEquip({
    name: 'zixin',
});
sgs.setCardData('zixin', {
    type: 3 /* CardType.Equip */,
    subtype: 34 /* CardSubType.OffensiveMount */,
    rhyme: 'in',
});
exports.zixin_skill = sgs.Skill({
    name: 'zixin',
    attached_equip: 'zixin',
});
exports.zixin_skill.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct]: offensiveMountCorrect,
}));
