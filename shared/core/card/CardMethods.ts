import { CardAttr, CardType, CardSubType } from './CardTypes';

export interface ICard {
    name: string;
    attr: CardAttr[];
    type: CardType;
    subtype: CardSubType;
}

function hasAttr(this: ICard, attr: CardAttr) {
    return this.attr.includes(attr);
}

function isCommonSha(this: ICard) {
    return (
        this.name === 'sha' &&
        !this.attr.includes(CardAttr.Fire) &&
        !this.attr.includes(CardAttr.Thunder)
    );
}

function isDamageCard(this: ICard) {
    return sgs.carddatas.get(this.name)?.damage;
}

function isRecoverCard(this: ICard) {
    return sgs.carddatas.get(this.name)?.recover;
}

function isBasic(this: ICard) {
    return this.type === CardType.Basic;
}

function isScroll(this: ICard) {
    return this.type === CardType.Scroll;
}

function isEquip(this: ICard) {
    return this.type === CardType.Equip;
}

function isDelayedScroll(this: ICard) {
    return this.subtype === CardSubType.DelayedScroll;
}

function isInstantScroll(this: ICard) {
    return this.subtype === CardSubType.InstantScroll;
}

function isWeapon(this: ICard) {
    return this.subtype === CardSubType.Weapon;
}

function isArmor(this: ICard) {
    return this.subtype === CardSubType.Armor;
}

function isDefensiveMount(this: ICard) {
    return this.subtype === CardSubType.DefensiveMount;
}

function isOffensiveMount(this: ICard) {
    return this.subtype === CardSubType.OffensiveMount;
}

function isSpecialMount(this: ICard) {
    return this.subtype === CardSubType.SpecialMount;
}

function isTreasure(this: ICard) {
    return this.subtype === CardSubType.Treasure;
}

function isMount(this: ICard) {
    return (
        this.subtype === CardSubType.OffensiveMount ||
        this.subtype === CardSubType.DefensiveMount ||
        this.subtype === CardSubType.SpecialMount
    );
}

export const CardMethods = {
    hasAttr,
    isCommonSha,
    isDamageCard,
    isRecoverCard,
    isBasic,
    isScroll,
    isEquip,
    isDelayedScroll,
    isInstantScroll,
    isWeapon,
    isArmor,
    isDefensiveMount,
    isOffensiveMount,
    isSpecialMount,
    isTreasure,
    isMount,
};
