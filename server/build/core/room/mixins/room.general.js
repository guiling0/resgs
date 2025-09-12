"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomGeneralMixin = void 0;
class RoomGeneralMixin {
    /** 获取武将牌 */
    getGeneral(id) {
        return this.generals.get(id);
    }
    /** 获取一组武将牌 */
    getGenerals(ids = []) {
        return ids.map((v) => this.getGeneral(v)).filter((v) => v) ?? [];
    }
    /** 获取一组武将牌的ID */
    getGeneralIds(generals) {
        return generals?.map((v) => v.id) ?? [];
    }
    /** 从武将牌堆中获得所有指定名字的武将牌 */
    getGeneralByName(name) {
        return this.generalArea.generals.filter((v) => v.trueName === name);
    }
    /** 记录武将 */
    recordGeneral(generalId, records) {
        if (!this.generalsRecords[generalId]) {
            this.generalsRecords[generalId] = { generalId };
        }
        records.forEach((v) => {
            this.generalsRecords[generalId][v] = true;
        });
    }
    /** 给所有玩家分配备选武将 */
    async allocateGenerals() {
        const count = this.options.chooseGeneralCount * this.playerCount;
        if (this.generalNames.length < count) {
            await this.gameOver([], 'InsufficientQuantityGeneral');
            return undefined;
        }
        const names = sgs.utils.shuffle(this.generalNames).slice();
        this.generalArea.shuffle();
        const map = new Map();
        for (const player of this.players) {
            const selectable = [];
            for (let a = 0; a < this.options.chooseGeneralCount; a++) {
                if (player.prechooses && player.prechooses.length) {
                    const name = player.prechooses.shift();
                    const index = names.indexOf(name);
                    if (index !== -1) {
                        selectable.push(name);
                        lodash.remove(names, (v) => v === name);
                        continue;
                    }
                }
                const name = names.shift();
                selectable.push(name);
            }
            map.set(player, selectable.map((v) => {
                const gs = this.getGeneralByName(v);
                const id = gs[sgs.utils.randomInt(0, gs.length - 1)].id;
                this.recordGeneral(id, ['isOffered']);
                return id;
            }));
        }
        map.set('unUse', names);
        return map;
    }
}
exports.RoomGeneralMixin = RoomGeneralMixin;
