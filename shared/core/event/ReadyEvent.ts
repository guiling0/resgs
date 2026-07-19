import { Room } from '../room/Room';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, ReadyEventData, TimingName } from './EventTypes';

/**
 * 游戏准备事件。一局游戏仅触发一次。
 *
 * 时序流程（纯阶段容器，无额外逻辑）：
 *   GameStartBefore → GameAssignRoles → GameAdjustSeats
 *   → GameChooseGeneral → GameChooseGeneralAfter
 *   → GameInitProperty → GameStartReady → GameInitHandCard
 *   → GameStageBefore → GameStage → GameStageAfter → GameStart
 */
export class ReadyEvent extends EventProcess<EventType.Ready> {
    constructor(room: Room, data: ReadyEventData = {}) {
        super(room, EventType.Ready, data);
        this._buildTriggers();
    }

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.GameStartBefore),
            createTiming(TimingName.GameAssignRoles),
            createTiming(TimingName.GameAdjustSeats),
            createTiming(TimingName.GameChooseGeneral),
            createTiming(TimingName.GameChooseGeneralAfter),
            createTiming(TimingName.GameInitProperty),
            createTiming(TimingName.GameStartReady),
            createTiming(TimingName.GameInitHandCard),
            createTiming(TimingName.GameStageBefore),
            createTiming(TimingName.GameStage),
            createTiming(TimingName.GameStageAfter),
            createTiming(TimingName.GameStart),
        ];
    }
}
