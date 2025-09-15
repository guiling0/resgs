import { EventData } from '../../event/data';
import { PhaseEvent } from '../../event/types/event.turn';
import { GameRoom } from '../room';
import { HistoryData } from '../room.types';

export class RoomHistoryMixin {
    /** 增加一个历史数据 */
    public insertHistory(this: GameRoom, data: EventData) {
        const history: HistoryData = {
            data,
            startIndex: this.historys.length,
            endIndex: -1,
        };
        this.historys.push(history);
        return history;
    }

    /**
     * 获取符合条件的历史数据
     * @param data_type 获取的数据类型 用于类型验证和代码提示
     * @param filter 条件
     * @param data [可选]从一个数据期间获取，而非获取全部
     */
    public getHistorys<T extends EventData>(
        this: GameRoom,
        data_type: new (id: number, room: GameRoom) => T,
        filter: (data: T) => boolean,
        data?: EventData,
        end?: EventData
    ): T[] {
        const source = data ? this.getPeriodHistory(data, end) : this.historys;
        if (!source.length) return [];
        const result: T[] = [];
        for (const history of source) {
            const item = history.data;
            if (item instanceof data_type && filter(item)) {
                result.push(item);
            }
        }
        return result;
    }

    /**
     * 是否有符合条件的历史数据
     * @param data_type 获取的数据类型 用于类型验证和代码提示
     * @param filter 条件
     * @param data [可选]从一个数据期间获取，而非获取全部
     */
    public hasHistorys<T extends EventData>(
        this: GameRoom,
        data_type: new (id: number, room: GameRoom) => T,
        filter: (data: T) => boolean,
        data?: EventData,
        end?: EventData
    ): boolean {
        const source = data ? this.getPeriodHistory(data, end) : this.historys;
        if (!source.length) return false;
        for (const history of source) {
            const item = history.data;
            if (item instanceof data_type && filter(item)) {
                return true;
            }
        }
    }

    /**
     * 获取上一个符合条件的历史数据
     * @param data_type 获取的数据类型 用于类型验证和代码提示
     * @param filter 条件
     * @param data [可选]从一个数据期间获取，而非获取全部
     */
    public getLastOneHistory<T extends EventData>(
        this: GameRoom,
        data_type: new (id: number, room: GameRoom) => T,
        filter: (data: T) => boolean,
        data?: EventData
    ): T {
        const source = data ? this.getPeriodHistory(data) : this.historys;
        if (!source.length) return undefined;

        // 从后向前查找，性能更优
        for (let i = source.length - 1; i >= 0; i--) {
            const item = source[i].data;
            if (item instanceof data_type && filter(item)) {
                return item;
            }
        }
        return undefined;
    }

    /** 获取一个数据期间的历史数据 */
    public getPeriodHistory(this: GameRoom, data: EventData, end?: EventData) {
        if (!this.historys.length) return [];

        const historys = this.historys; // 避免重复访问
        let startIdx = -1;
        let endIdx = -1;

        // 反向遍历同时查找start和end
        for (let i = historys.length - 1; i >= 0; i--) {
            const item = historys[i];

            if (startIdx === -1 && item.data === data) {
                startIdx = item.startIndex;
                if (end === undefined) break;
            }

            if (end !== undefined && endIdx === -1 && item.data === end) {
                endIdx = item.startIndex;
                if (startIdx !== -1) break;
            }
        }

        if (startIdx === -1) return [];

        // 统一处理切片逻辑
        const endIndex =
            endIdx > -1
                ? endIdx + 1
                : historys[startIdx]?.endIndex > -1
                ? historys[startIdx].endIndex
                : historys.length;

        return historys.slice(startIdx, endIndex);
    }

    /** 获取当前正在执行的阶段 */
    public getCurrentPhase(this: GameRoom) {
        return this.getLastOneHistory(PhaseEvent, () => true);
    }
}
