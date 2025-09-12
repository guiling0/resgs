"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICard = void 0;
class ICard {
    hasAttr(attr) {
        return this.attr.includes(attr);
    }
    isCommonSha() {
        return (this.name === 'sha' &&
            !this.attr.includes(1 /* CardAttr.Fire */) &&
            !this.attr.includes(2 /* CardAttr.Thunder */));
    }
    isDamageCard() {
        return sgs.utils.isDamageCard(this.name);
    }
    isHorse() {
        return (this.subtype === 34 /* CardSubType.OffensiveMount */ ||
            this.subtype === 33 /* CardSubType.DefensiveMount */ ||
            this.subtype === 35 /* CardSubType.SpecialMount */);
    }
}
exports.ICard = ICard;
