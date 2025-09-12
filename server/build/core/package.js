"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = void 0;
class Package {
    constructor(name) {
        this.name = name;
        /** 所有游戏牌 */
        this.cards = [];
        /** 所有武将牌 */
        this.generals = [];
    }
    /** 增加游戏牌 */
    addGameCards(cards) {
        cards.forEach((v) => {
            v.package = this.name;
            this.cards.push(v);
        });
    }
    /** 增加武将牌 */
    addGenerals(generals) {
        generals.forEach((v) => {
            if (!v)
                return;
            v.package.push(this.name);
            this.generals.push(v);
        });
    }
}
exports.Package = Package;
