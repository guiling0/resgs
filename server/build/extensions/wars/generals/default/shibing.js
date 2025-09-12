"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shibingv = exports.shibingn = void 0;
exports.shibingn = sgs.General({
    name: 'default.shibingn',
    kingdom: 'none',
    hp: 2,
    gender: 1 /* Gender.Male */,
    skills: [],
    enable: false,
    hidden: true,
    isWars: true,
});
exports.shibingv = sgs.General({
    name: 'default.shibingv',
    kingdom: 'none',
    hp: 2,
    gender: 2 /* Gender.Female */,
    skills: [],
    enable: false,
    hidden: true,
    isWars: true,
});
sgs.loadTranslation({
    ['shibingn']: '士兵',
    ['shibingv']: '士兵',
});
