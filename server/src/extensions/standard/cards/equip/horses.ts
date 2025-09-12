import { CardType, CardSubType } from '../../../../core/card/card.types';
import { GamePlayer } from '../../../../core/player/player';
import { StateEffect } from '../../../../core/skill/effect';
import { StateEffectType } from '../../../../core/skill/skill.types';

function defensiveMountCorrect(
    this: StateEffect,
    from: GamePlayer,
    to: GamePlayer
) {
    if (this.isOwner(to)) {
        return 1;
    }
}

function offensiveMountCorrect(
    this: StateEffect,
    from: GamePlayer,
    to: GamePlayer
) {
    if (this.isOwner(from)) {
        return -1;
    }
}

export const jueying = sgs.CardUseEquip({
    name: 'jueying',
});
sgs.setCardData('jueying', {
    type: CardType.Equip,
    subtype: CardSubType.DefensiveMount,
    rhyme: 'ing',
});
export const jueying_skill = sgs.Skill({
    name: 'jueying',
    attached_equip: 'jueying',
});
jueying_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: defensiveMountCorrect,
    })
);

export const dilu = sgs.CardUseEquip({
    name: 'dilu',
});
sgs.setCardData('dilu', {
    type: CardType.Equip,
    subtype: CardSubType.DefensiveMount,
    rhyme: 'u',
});
export const dilu_skill = sgs.Skill({
    name: 'dilu',
    attached_equip: 'dilu',
});
dilu_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: defensiveMountCorrect,
    })
);

export const hualiu = sgs.CardUseEquip({
    name: 'hualiu',
});
sgs.setCardData('hualiu', {
    type: CardType.Equip,
    subtype: CardSubType.DefensiveMount,
    rhyme: 'iu',
});
export const hualiu_skill = sgs.Skill({
    name: 'hualiu',
    attached_equip: 'hualiu',
});
hualiu_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: defensiveMountCorrect,
    })
);

export const zhuahuangfeidian = sgs.CardUseEquip({
    name: 'zhuahuangfeidian',
});
sgs.setCardData('zhuahuangfeidian', {
    type: CardType.Equip,
    subtype: CardSubType.DefensiveMount,
    rhyme: 'an',
});
export const zhuahuangfeidian_skill = sgs.Skill({
    name: 'zhuahuangfeidian',
    attached_equip: 'zhuahuangfeidian',
});
zhuahuangfeidian_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: defensiveMountCorrect,
    })
);

export const chitu = sgs.CardUseEquip({
    name: 'chitu',
});
sgs.setCardData('chitu', {
    type: CardType.Equip,
    subtype: CardSubType.OffensiveMount,
    rhyme: 'u',
});
export const chitu_skill = sgs.Skill({
    name: 'chitu',
    attached_equip: 'chitu',
});
chitu_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: offensiveMountCorrect,
    })
);

export const dayuan = sgs.CardUseEquip({
    name: 'dayuan',
});
sgs.setCardData('dayuan', {
    type: CardType.Equip,
    subtype: CardSubType.OffensiveMount,
    rhyme: 'an',
});
export const dayuan_skill = sgs.Skill({
    name: 'dayuan',
    attached_equip: 'dayuan',
});
dayuan_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: offensiveMountCorrect,
    })
);

export const zixin = sgs.CardUseEquip({
    name: 'zixin',
});
sgs.setCardData('zixin', {
    type: CardType.Equip,
    subtype: CardSubType.OffensiveMount,
    rhyme: 'in',
});
export const zixin_skill = sgs.Skill({
    name: 'zixin',
    attached_equip: 'zixin',
});
zixin_skill.addEffect(
    sgs.StateEffect({
        [StateEffectType.Distance_Correct]: offensiveMountCorrect,
    })
);
