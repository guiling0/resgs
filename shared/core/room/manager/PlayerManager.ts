import { Player } from '@shared/core/player/Player';
import { Room } from '../Room';

/**
 * 玩家管理器 — 负责玩家查询、座次排序、响应顺序。
 */
export class PlayerManager {
    constructor(readonly room: Room) {}

    /** 按 ID 获取玩家 */
    get(id: string): Player | undefined {
        return this.room.playerMaps.get(id);
    }

    /** 批量按 ID 获取玩家 */
    gets(ids: string[]): (Player | undefined)[] {
        return ids.map((id) => this.get(id));
    }

    /** 获取玩家 ID 数组 */
    getIds(players: Player[] = this.room.players): string[] {
        return players.map((p) => p.playerId);
    }

    /** 按条件筛选玩家 */
    filter(
        fn: (p: Player) => boolean,
        includeDead: boolean = false,
    ): Player[] {
        return (includeDead ? this.room.players : this.room.alives).filter(fn);
    }

    /** 按条件统计玩家数 */
    count(fn: (p: Player) => boolean, includeDead: boolean = false): number {
        return this.filter(fn, includeDead).length;
    }

    /**
     * 按座次排序（原地修改数组）。
     * - clockwise=false（默认）：逆时针序（三国杀正常回合顺序）
     * - start 不在列表中时递归向其相邻玩家方向查找
     */
    sort(
        players: Player[] = this.room.players,
        start?: Player,
        clockwise: boolean = false,
    ): Player[] {
        if (players.length === 0) return players;
        if (start && players.indexOf(start) === -1) {
            if (clockwise) {
                return this.sort(players, start.left, clockwise);
            } else {
                return this.sort(players, start.right, clockwise);
            }
        }
        players.sort((a, b) =>
            clockwise ? b.seat - a.seat : a.seat - b.seat,
        );
        if (start) {
            players.push(...players.splice(0, players.indexOf(start)));
        }
        return players;
    }

    /** 按响应顺序排序（从当前回合/seat=1 玩家开始逆时针） */
    sortResponse(players: Player[] = this.room.players): Player[] {
        // TODO: 有当前回合玩家时以 currentTurn.player 为起点
        const start = this.room.players.find((v) => v.seat === 1);
        return this.sort(players, start);
    }

    /** 按顺时针排序 */
    sortClockwise(players: Player[] = this.room.players): Player[] {
        // TODO: 有当前回合玩家时以 currentTurn.player 为起点
        const start = this.room.players.find((v) => v.seat === 1);
        return this.sort(players, start, true);
    }
}
