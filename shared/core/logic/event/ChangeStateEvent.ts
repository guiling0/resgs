import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { General } from '../../entity/General';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type {
    ChangeEventData,
    ChangeStateData,
    ChangeStateType,
    ChainEventData,
    CloseEventData,
    OpenEventData,
    RemoveEventData,
    SkipEventData,
} from '../../types/EventTypes';

// ===== 类型检测 =====

/**
 * 根据数据形状推断 ChangeState 的子类型。
 * - `toGeneral` 存在 → Change
 * - `general` 存在 → Remove
 * - `damageType` 存在 → Chain
 * - `toState` + `generals` → Open/Close（toState=true→Open, false→Close）
 * - `toState` 单独存在 → Skip
 */
export function detectChangeStateType(data: ChangeStateData): ChangeStateType {
    if ('toGeneral' in data) return EventType.Change;
    if ('general' in data) return EventType.Remove;
    if ('damageType' in data) return EventType.Chain;
    if ('toState' in data && 'generals' in data) {
        return data.toState ? EventType.Open : EventType.Close;
    }
    return EventType.Skip;
}

/**
 * 武将牌状态改变事件。统一处理 6 种状态变更：
 *   Open（明置）、Close（暗置）、Chain（连环）、Skip（翻面）、Change（变更）、Remove（移除）
 * 执行流程：ChangeState → ChangeStateAfter（执行实际变更）→ ChangeStateEnd（公共）
 * Open 额外在 ChangeStateAfter 中将事件推入 deferredOpens（明置时机延后分发）。
 */
export class ChangeStateEvent extends EventProcess<ChangeStateType> {
    constructor(room: Room, data: ChangeStateData & { _type?: ChangeStateType }) {
        const type = data._type ?? detectChangeStateType(data);
        super(room, type, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return (this.eventData as unknown as { player: Player }).player;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.ChangeState),
            createTiming(TimingName.ChangeStateAfter, [
                this.bindWithMark(this._onChangeStateAfter),
            ]),
        ];
    }

    // ===== 生命周期 =====

    check(): boolean {
        const p = this.player;
        if (!p || p.death) return false;

        switch (this.type as ChangeStateType) {
            case EventType.Chain:
                return this._checkToggle('chained');
            case EventType.Skip:
                return this._checkToggle('skip');
            case EventType.Open:
                return this._checkGeneralFilter(false);
            case EventType.Close:
                return this._checkGeneralFilter(true);
            case EventType.Change:
                // TODO(R8): 主副将数据就绪后校验（general 归属/副将存在性）
                return false;
            case EventType.Remove:
                // TODO(R8): 主副将数据就绪后校验（general 归属）
                return false;
            default:
                return false;
        }
    }

    // ===== 流程回调 =====

    /** ChangeStateAfter 之前：执行实际状态变更 */
    private async _onChangeStateAfter(_room: Room, _data: ChangeStateData): Promise<void> {
        switch (this.type as ChangeStateType) {
            case EventType.Open:
                this._applyOpen();
                break;
            case EventType.Close:
                this._applyClose();
                break;
            case EventType.Chain:
                this._applyChain();
                break;
            case EventType.Skip:
                this._applySkip();
                break;
            case EventType.Change:
                // TODO(R8): 变更武将（主副将数据就绪后实现）
                break;
            case EventType.Remove:
                // TODO(R8): 移除武将（主副将数据就绪后实现）
                break;
        }
        this.room.event.insertHistory(this);
    }

    // ===== 各状态变更实现 =====

    private _applyOpen(): void {
        const d = this.eventData as unknown as OpenEventData;
        for (const g of d.generals) g.turnTo(true);
        this.room.deferredOpens.push(this);
    }

    private _applyClose(): void {
        const d = this.eventData as unknown as CloseEventData;
        for (const g of d.generals) g.turnTo(false);
        // TODO(R9): 广播暗置动画 + 战报
    }

    private _applyChain(): void {
        const d = this.eventData as unknown as ChainEventData;
        d.player.chained = d.toState;
        // TODO(R9): 广播横置动画 + 战报
    }

    private _applySkip(): void {
        const d = this.eventData as unknown as SkipEventData;
        d.player.skip = d.toState;
        // TODO(R9): 广播翻面动画 + 战报
    }

    // ===== 操作方法 =====

    /** 防止状态改变（仅在 ChangeState 时机可调用） */
    async prevent(): Promise<this> {
        if (this.trigger === TimingName.ChangeState) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    // ===== 内部辅助 =====

    /** 连环/翻面：toState 未指定时取当前状态取反 */
    private _checkToggle(prop: 'chained' | 'skip'): boolean {
        const d = this.eventData as unknown as ChainEventData | SkipEventData;
        const p = this.player;
        d.toState = d.toState ?? !p[prop];
        return p[prop] !== d.toState;
    }

    /**
     * 明置/暗置：过滤已在目标状态的武将（明置检查未明置的，暗置检查已明置的），
     * 过滤后数量不变且 >0 才通过。
     */
    private _checkGeneralFilter(currentPut: boolean): boolean {
        const d = this.eventData as unknown as OpenEventData | CloseEventData;
        const count = d.generals.length;
        d.generals = d.generals.filter((g) => g.put === currentPut);
        return d.generals.length === count && count > 0;
    }
}
