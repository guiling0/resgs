import { Room } from '../Room';
import { General } from '@shared/core/general/General';
import { GeneralData, GeneralId } from '@shared/core/general/GeneralType';
import { GeneralState } from '@shared/core/schema/GeneralState';
import { Player } from '@shared/core/player/Player';
import { AreaType } from '@shared/core/card/CardTypes';
import { shuffleArray } from '@shared/core/utils';

/**
 * 武将管理器 — 武将查询、选将分配、变更。
 */
export class GeneralManager {
    constructor(readonly room: Room) {}

    /**
     * 创建武将实例并放入区域。
     * @param sync 是否同步到客户端（initStart 批量为 false）
     */
    create(data: GeneralData, sync: boolean = true): General {
        const state = new GeneralState();
        const general = new General(data, this.room, state);
        if (sync) this.room.state.generalStates.set(general.id, state);

        if (data.enable) {
            this.room.area.add(AreaType.Draw, [general.id]);
            if (!this.room.generalNames.includes(general.trueName)) {
                this.room.generalNames.push(general.trueName);
            }
        } else {
            this.room.area.add(AreaType.Granary, [general.id]);
        }
        return general;
    }

    /**
     * 注册武将到房间索引。
     * @param sync 是否同步到客户端
     */
    build(general: General, sync: boolean = true) {
        if (sync) this.room.state.generalStates.set(general.id, general.state);
        this.room.generals.set(general.id, general);
    }

    /** 按 ID 获取武将 */
    get(id: GeneralId): General | undefined {
        return this.room.generals.get(id);
    }

    /** 批量按 ID 获取武将 */
    gets(ids: GeneralId[]): General[] {
        return ids.map((id) => this.get(id)).filter(Boolean) as General[];
    }

    /** 获取武将 ID 数组 */
    getIds(generals: General[]): GeneralId[] {
        return generals.map((g) => g.id);
    }

    /** 按真名查找武将 */
    getByName(trueName: string): General | undefined {
        for (const g of this.room.generals.values()) {
            if (g.trueName === trueName) return g;
        }
        return undefined;
    }

    /**
     * 获取主公武将列表（去重真名，随机顺序）。
     * @param count 最多返回数量
     */
    getLordGenerals(count: number = 99): General[] {
        const lords: General[] = [];
        for (const g of this.room.generals.values()) {
            if (g.isLord()) lords.push(g);
        }
        shuffleArray(lords);
        const seen = new Set<string>();
        const result: General[] = [];
        for (const g of lords) {
            if (seen.has(g.trueName)) continue;
            seen.add(g.trueName);
            result.push(g);
            if (result.length >= count) break;
        }
        return result;
    }

    /**
     * 随机选取 count 张真名未被选走的武将，并记录到 room.pickedGeneralNames。
     * @param count 选取数量
     */
    pickRandom(count: number = 1): General[] {
        const picked = this.room.pickedGeneralNames;
        const available: string[] = [];
        for (const name of this.room.generalNames) {
            if (!picked.has(name)) available.push(name);
        }
        const result: General[] = [];
        for (let i = 0; i < count && available.length > 0; i++) {
            const idx = Math.floor(Math.random() * available.length);
            const name = available.splice(idx, 1)[0];
            const general = this.getByName(name);
            if (general) {
                result.push(general);
                picked.add(name);
            }
        }
        return result;
    }

    /**
     * 将指定武将的真名从已选集合中释放，允许后续再次被选取。
     * @param generals 需释放的武将列表
     */
    releasePicked(generals: General[]) {
        for (const g of generals) {
            this.room.pickedGeneralNames.delete(g.trueName);
        }
    }

    /**
     * 为玩家分配选将。
     * 1) 按座次顺序处理所有玩家的预选，记录到 pickedGeneralNames
     * 2) 为每位玩家随机补足至 chooseGeneralCount 张
     */
    allocateGenerals(players: Player[]): Map<Player, General[]> {
        const results = new Map<Player, General[]>();

        // 第一轮：按座次处理所有预选
        const ordered = this.room.player.sort(players);
        for (const player of ordered) {
            const generals: General[] = [];
            for (const prechoose of player.preChooseGeneral) {
                const trueName = prechoose.split('.').at(-1) || prechoose;
                if (this.room.pickedGeneralNames.has(trueName)) continue;
                const general = this.get(prechoose);
                if (general) {
                    generals.push(general);
                    this.room.pickedGeneralNames.add(trueName);
                }
            }
            results.set(player, generals);
        }

        // 第二轮：为每位玩家随机补足
        for (const player of ordered) {
            const generals = results.get(player)!;
            const remain = player.chooseGeneralCount - generals.length;
            if (remain > 0) {
                generals.push(...this.pickRandom(remain));
            }
        }

        return results;
    }

    /**
     * 获取用于变更的武将牌。
     * 优先取同势力，同势力已用完时清空 changeGenerals 记录重试。
     * @param kingdomOrPlayer 势力字符串或 Player 实例
     * @param count 需要数量
     */
    getChangeGeneral(
        kingdomOrPlayer: string | Player,
        count: number = 1,
    ): General[] {
        const kingdom =
            typeof kingdomOrPlayer === 'string'
                ? kingdomOrPlayer
                : ([
                      kingdomOrPlayer.kingdom,
                      kingdomOrPlayer.head?.kingdom,
                      kingdomOrPlayer.deputy?.kingdom,
                  ].find(
                      (v) => v && v !== 'none' && !v.includes('ye'),
                  ) ?? '');
        if (!kingdom) return [];

        const result: General[] = [];
        const changed = this.room.changeGenerals;
        for (let i = 0; i < count; i++) {
            let candidates: General[] = [];
            for (const g of this.room.generals.values()) {
                if (
                    !changed.has(g) &&
                    !result.includes(g) &&
                    (g.kingdom === kingdom || g.kingdom2 === kingdom)
                ) {
                    candidates.push(g);
                }
            }
            // 同势力不足时仅清空同势力记录重试
            if (!candidates.length) {
                for (const g of changed) {
                    if (g.kingdom === kingdom || g.kingdom2 === kingdom) {
                        changed.delete(g);
                    }
                }
                for (const g of this.room.generals.values()) {
                    if (
                        !result.includes(g) &&
                        (g.kingdom === kingdom || g.kingdom2 === kingdom)
                    ) {
                        candidates.push(g);
                    }
                }
            }
            if (!candidates.length) continue;
            const chosen =
                candidates[Math.floor(Math.random() * candidates.length)];
            result.push(chosen);
        }
        for (const g of result) changed.add(g);
        return result;
    }
}
