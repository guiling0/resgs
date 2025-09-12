"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomPlayerMixin = void 0;
const skill_types_1 = require("../../skill/skill.types");
class RoomPlayerMixin {
    /** 根据ID获取玩家 */
    getPlayer(id) {
        return this._players.find((v) => v.playerId === id);
    }
    /** 根据ID获取一组玩家 */
    getPlayers(ids) {
        return ids?.map((v) => this.getPlayer(v)).filter((v) => v) ?? [];
    }
    /** 获取玩家ID数组 */
    getPlayerIds(players) {
        return players?.map((v) => v.playerId) ?? [];
    }
    /** 根据条件获取玩家 */
    getPlayerByFilter(filter, includeDead = false) {
        return (includeDead ? this.players : this.playerAlives).filter(filter);
    }
    /** 获取符合条件的玩家数 */
    getPlayerCount(filter, includeDead = false) {
        return this.getPlayerByFilter(filter, includeDead).length;
    }
    /** 将玩家列表按照座次顺序排序 */
    sortPlayers(players = this.players, start, includeDead = false) {
        if (players.length === 0)
            return players;
        if (start && players.indexOf(start) === -1) {
            return this.sortPlayers(players, start.right, includeDead);
        }
        players.sort((a, b) => a.seat - b.seat);
        if (start) {
            players.push(...players.splice(0, players.indexOf(start)));
        }
        return players;
    }
    /** 将玩家按照响应顺序排序 */
    sortResponse(players = this.players) {
        return this.sortPlayers(players, this.currentTurn.player);
    }
    /** 获取场上的大势力 */
    getBigKingdom() {
        const player = this.playerAlives.find((v) => {
            if (v.kingdom !== 'none' &&
                this.getStates(skill_types_1.StateEffectType.Regard_OnlyBig, [v]).some((v) => v)) {
                return true;
            }
        });
        if (player) {
            return [player.kingdom];
        }
        const kingdoms = this.getKingdoms();
        const counts = kingdoms.map((v) => {
            let count = this.getPlayerCountByKingdom(v);
            const state = this.getMark('#dangwan');
            const dangwan = this.effects.find((v) => v.id === state);
            if (dangwan &&
                dangwan.check() &&
                dangwan.player &&
                dangwan.player.kingdom === v) {
                count += dangwan.player.getEquipCards().length;
            }
            return {
                kingdom: v,
                count,
            };
        });
        const max = Math.max(...counts.map((v) => v.count));
        if (max > 1) {
            return counts.filter((v) => v.count === max).map((v) => v.kingdom);
        }
        else {
            return [];
        }
    }
    /** 检测指定势力是否超过游戏人数的一半 */
    kingdomIsGreaterThenHalf(kingdom, pre = false) {
        if (kingdom === 'none')
            return false;
        return (this.getPlayerCount((p) => p.kingdom === kingdom, true) +
            (pre ? 1 : 0) >
            Math.floor(this.playerCount / 2));
    }
}
exports.RoomPlayerMixin = RoomPlayerMixin;
