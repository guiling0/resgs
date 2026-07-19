import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { General } from '../general/General';
import { EventProcess, createTiming } from './EventProcess';
import {
    ChangeStateData,
    ChangeStateType,
    EventType,
    OpenEventData,
    CloseEventData,
    ChainEventData,
    SkipEventData,
    ChangeEventData,
    RemoveEventData,
    TimingName,
} from './EventTypes';

// ===== 类型检测 =====

/**
 * 根据数据形状推断 ChangeState 的子类型。
 *
 * 推断规则（按唯一字段组合）：
 * - `toGeneral` 存在       → Change
 * - `general` 存在         → Remove
 * - `damageType` 存在      → Chain
 * - `toState` + `generals` → Open/Close（toState=true→Open, false→Close）
 * - `toState` 单独存在     → Skip
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

// ===== ChangeStateEvent =====

/**
 * 牌/武将状态改变事件。统一处理 6 种状态变更：
 *   Open（明置）、Close（暗置）、Chain（横置）、Skip（翻面）、Change（变更）、Remove（移除）
 *
 * 执行流程：
 *   ChangeState → ChangeStateAfter → ChangeStateEnd（公共）
 *   Open 额外在 _onChangeStateAfter 中将事件推入 room.deferredOpens
 */
export class ChangeStateEvent extends EventProcess<ChangeStateType> {
    constructor(room: Room, data: ChangeStateData & { _type?: ChangeStateType }) {
        const type = data._type ?? detectChangeStateType(data);
        super(room, type, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return (this.eventData as any).player;
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
            case EventType.Chain: return this._checkToggle('chained');
            case EventType.Skip:  return this._checkToggle('skip');
            case EventType.Open:  return this._checkGeneralFilter(p.getCloseGenerals());
            case EventType.Close: return this._checkGeneralFilter(p.getOpenedGenerals());
            case EventType.Change: {
                const d = this.eventData as ChangeEventData;
                const g = d.general;
                if (typeof g === 'string') {
                    if (g !== 'head' && g !== 'deputy') return false;
                } else if (g !== p.head && g !== p.deputy) {
                    return false;
                }
                if ((g === 'deputy' || g === p.deputy) && !p.hasDeputy()) return false;
                return !!d.toGeneral;
            }
            case EventType.Remove: {
                const d = this.eventData as RemoveEventData;
                if (!d.general) return false;
                if (d.general !== p.head && d.general !== p.deputy) return false;
                return true;
            }
            default:
                return false;
        }
    }

    // ===== 流程回调 =====

    /** ChangeStateAfter Before：执行实际状态变更 */
    private async _onChangeStateAfter(
        _room: Room,
        _data: ChangeStateData,
    ): Promise<void> {
        switch (this.type as ChangeStateType) {
            case EventType.Open:   await this._applyOpen(); break;
            case EventType.Close:  await this._applyClose(); break;
            case EventType.Chain:  await this._applyChain(); break;
            case EventType.Skip:   await this._applySkip(); break;
            case EventType.Change: await this._applyChange(); break;
            case EventType.Remove: await this._applyRemove(); break;
        }
        this.room.event.insertHistory(this);
    }

    // ===== 各状态变更实现 =====

    private async _applyOpen(): Promise<void> {
        const d = this.eventData as OpenEventData;
        for (const g of d.generals) g.turnTo(true);
        this.room.deferredOpens.push(this);
    }

    private async _applyClose(): Promise<void> {
        const d = this.eventData as CloseEventData;
        for (const g of d.generals) g.turnTo(false);
        // TODO Phase 9: 广播暗置动画 + 战报
    }

    private async _applyChain(): Promise<void> {
        const d = this.eventData as ChainEventData;
        d.player.chained = d.toState;
        // TODO Phase 9: 广播横置动画 + 战报
    }

    private async _applySkip(): Promise<void> {
        const d = this.eventData as SkipEventData;
        d.player.skip = d.toState;
        // TODO Phase 9: 广播翻面动画 + 战报
    }

    private async _applyChange(): Promise<void> {
        const d = this.eventData as ChangeEventData;
        this._setPlayerGeneral(
            d.general === d.player.head || d.general === 'head',
            d.toGeneral,
        );
        // TODO Phase 8: 获得新武将技能、归还旧武将
        // TODO Phase 9: 广播变更动画 + 战报
    }

    private async _applyRemove(): Promise<void> {
        const d = this.eventData as RemoveEventData;
        const isHead = d.general === d.player.head;
        const soldierId = isHead ? 'default.shibingn' : 'default.shibingv';
        const soldier = this.room.generals.get(soldierId);
        if (soldier) this._setPlayerGeneral(isHead, soldier);
        // TODO Phase 8: 失去旧武将技能
        // TODO Phase 9: 广播移除动画 + 战报
    }

    // ===== 操作方法 =====

    /** 防止状态改变。仅在 ChangeState 时机可调用。 */
    async prevent(): Promise<this> {
        if (this.trigger === TimingName.ChangeState) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    // ===== 内部辅助 =====

    private _checkToggle(prop: 'chained' | 'skip'): boolean {
        const d = this.eventData as ChainEventData | SkipEventData;
        const p = this.player;
        d.toState = d.toState ?? !p[prop];
        return p[prop] !== d.toState;
    }

    private _checkGeneralFilter(eligible: General[]): boolean {
        const d = this.eventData as OpenEventData | CloseEventData;
        const count = d.generals.length;
        d.generals = d.generals.filter((v) => eligible.includes(v));
        return d.generals.length === count && count > 0;
    }

    private _setPlayerGeneral(isHead: boolean, general: General): void {
        if (isHead) this.player.head = general;
        else this.player.deputy = general;
    }
}
