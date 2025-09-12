"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchGeneralData = exports.WatchHandData = void 0;
const data_1 = require("../data");
/** 观看一名角色的手牌 */
class WatchHandData extends data_1.EventData {
    check() {
        if (!this.watcher || this.watcher.death)
            return false;
        if (!this.player)
            return false;
        return this.player.hasHandCards();
    }
    static temp(watcher, cards) {
        cards.forEach((v) => {
            v.setVisible(`watch_${watcher.playerId}`);
        });
        watcher.room.sendLog({
            text: '#WatchHand_Temp',
            values: [
                { type: 'player', value: watcher.playerId },
                {
                    type: '[carddata]',
                    value: watcher.room.getCardIds(cards),
                },
            ],
        });
    }
    static temp_end(watcher, cards) {
        cards.forEach((v) => {
            v.setVisible(`@reduce:watch_${watcher.playerId}`);
        });
    }
}
exports.WatchHandData = WatchHandData;
/** 观看武将牌 */
class WatchGeneralData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 是否观看主将 */
        this.is_watch_head = false;
        /** 是否观看副将 */
        this.is_watch_deputy = false;
        /** 是否仅观看暗置的武将牌 */
        this.onlyConcealed = true;
    }
    check() {
        if (!this.watcher || this.watcher.death)
            return false;
        this.generals = this.generals
            .filter((v) => {
            const head = this.room.players.find((g) => g._head === v.id);
            if (head && !head.headOpen && head.hasHead()) {
                this.player = head;
                this.is_watch_head = true;
                return true;
            }
            const deputy = this.room.players.find((g) => g._deputy === v.id);
            if (deputy && !deputy.deputyOpen && deputy.hasDeputy()) {
                this.player = deputy;
                this.is_watch_deputy = true;
                return true;
            }
        })
            .filter((v) => v);
        return this.generals.length > 0;
    }
}
exports.WatchGeneralData = WatchGeneralData;
