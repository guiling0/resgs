import { Gender } from '../../../../core/general/general.type';

export const shibingn = sgs.General({
    name: 'default.shibingn',
    kingdom: 'none',
    hp: 2,
    gender: Gender.Male,
    skills: [],
    enable: false,
    hidden: true,
    isWars: true,
});

export const shibingv = sgs.General({
    name: 'default.shibingv',
    kingdom: 'none',
    hp: 2,
    gender: Gender.Female,
    skills: [],
    enable: false,
    hidden: true,
    isWars: true,
});

sgs.loadTranslation({
    ['shibingn']: '士兵',
    ['shibingv']: '士兵',
});
