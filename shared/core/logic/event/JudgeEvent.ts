import type { Room } from '../../entity/Room';
import type { Player } from '../../entity/Player';
import type { GameCard } from '../../entity/GameCard';
import { AreaType } from '../../types/AreaTypes';
import { EventProcess, createTiming } from './EventProcess';
import { EventType, TimingName } from '../../types/EventTypes';
import type { JudgeEventData } from '../../types/EventTypes';
import type { VirtualCardData } from '../../types/CardTypes';

/**
 * 判定事件。
 * 执行流程：Judge（取判定牌）→ JudgeCard（改判）→ JudgeResult1 → JudgeResult2
 *   → JudgeResultAfter1 → JudgeResultAfter2 → JudgeEnd
 */
export class JudgeEvent extends EventProcess<EventType.Judge> {
    /** 当前判定是否成功（由 setCard/resetSuccess 设置） */
    success: boolean = false;

    constructor(room: Room, data: JudgeEventData) {
        super(room, EventType.Judge, data);
        this._buildTriggers();
    }

    // ===== 便捷访问器 =====

    get player(): Player {
        return this.eventData.player;
    }

    get card(): GameCard | undefined {
        return this.eventData.card;
    }
    set card(v: GameCard | undefined) {
        this.eventData.card = v;
    }

    get result(): VirtualCardData | undefined {
        return this.eventData.result;
    }
    set result(v: VirtualCardData | undefined) {
        this.eventData.result = v;
    }

    get isSuccess(): ((result: VirtualCardData) => boolean) | undefined {
        return this.eventData.isSuccess;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.Judge, undefined, [
                this.bindWithMark(this._onJudgeAfter),
            ]),
            createTiming(TimingName.JudgeCard),
            createTiming(TimingName.JudgeResult1),
            createTiming(TimingName.JudgeResult2),
            createTiming(TimingName.JudgeResultAfter1, [
                this.bindWithMark(this._onJudgeResultAfter1Before),
            ]),
            createTiming(TimingName.JudgeResultAfter2),
        ];
        this.endTriggers = [createTiming(TimingName.JudgeEnd)];
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    // ===== 流程回调 =====

    /** Judge 之后：从牌堆取牌 → 移到处理区 → setCard */
    private async _onJudgeAfter(_room: Room, _data: JudgeEventData): Promise<void> {
        if (!this.card) {
            const cards = await this.room.getNCards(1);
            if (cards.length === 0) return;

            await this.room.putTo(cards, AreaType.Processing, { reason: 'judge' });
            await this.setCard(cards[0]);
        }
        this.room.event.insertHistory(this);
    }

    /** JudgeResultAfter1 之前：广播判定结果 */
    private async _onJudgeResultAfter1Before(_room: Room, _data: JudgeEventData): Promise<void> {
        // TODO(R9): 广播判定成功/失败动画 + 战报（judge 消息）
    }

    // ===== 操作方法 =====

    /**
     * 设置判定牌（改判技能调用）。
     * 若已有旧判定牌且在处理区，先将其移入弃牌堆；然后为新牌生成判定结果。
     */
    async setCard(card: GameCard): Promise<void> {
        if (this.card && this.card !== card && this.findArea(this.card)?.type === AreaType.Processing) {
            await this.room.putTo([this.card], AreaType.Discard, {
                reason: 'put',
                animation: false,
            });
        }

        this.card = card;
        this.result = card.formatVirtualCardData();
        this.success = this.isSuccess?.(this.result) ?? true;
        // TODO(R9): 广播新判定牌动画
    }

    /** 重新评估判定是否成功（改判后调用） */
    resetSuccess(): void {
        if (this.result) {
            this.success = this.isSuccess?.(this.result) ?? true;
        }
    }
}
