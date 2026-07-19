import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { GameCard } from '../card/GameCard';
import { AreaType, VirtualCardData } from '../card/CardTypes';
import { parseAreaId } from '../utils';
import { EventProcess, createTiming } from './EventProcess';
import {
    EventType,
    JudgeEventData,
    TimingName,
} from './EventTypes';

/**
 * 判定事件。
 *
 * 执行流程：
 *   Judge → JudgeCard → JudgeResult1 → JudgeResult2
 *   → JudgeResultAfter1 → JudgeResultAfter2 → JudgeEnd
 *
 * - Judge After：从牌堆取牌 → putTo(处理区) → setCard（创建虚拟牌）
 * - JudgeCard 时机：技能改判（调用 setCard 替换判定牌）
 * - JudgeResultAfter1 Before：广播判定结果动画
 * - JudgeEnd After：将所有因此事件置入处理区的牌移回弃牌堆
 */
export class JudgeEvent extends EventProcess<EventType.Judge> {
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

    /** 当前判定是否成功（由 setCard/resetSuccess 设置） */
    success?: boolean = false;

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.Judge, undefined, [
                this.bindWithMark(this._onJudgeAfter),
            ]),
            createTiming(TimingName.JudgeCard),
            createTiming(TimingName.JudgeResult1),
            createTiming(TimingName.JudgeResult2),
            // TODO Phase 9: JudgeResultAfter1 Before 广播判定结果动画
            createTiming(TimingName.JudgeResultAfter1),
            createTiming(TimingName.JudgeResultAfter2),
        ];
        this.endTriggers = [
            createTiming(TimingName.JudgeEnd),
        ];
    }

    // ===== 生命周期 =====

    check(): boolean {
        return !!this.player && this.player.alive;
    }

    // ===== 流程回调 =====

    /** Judge After：从牌堆取牌 → 移到处理区 → setCard */
    private async _onJudgeAfter(
        _room: Room,
        _data: JudgeEventData,
    ): Promise<void> {
        if (!this.card) {
            const cards = await this.room.getNCards(1);
            if (cards.length === 0) return;

            await this.room.putTo(cards, AreaType.Processing, { reason: 'judge' });
            await this.setCard(cards[0]);
            // TODO Phase 9: await this.room.delay(0.6)
        }
        this.room.event.insertHistory(this);
    }

    // ===== 操作方法 =====

    /**
     * 设置判定牌（改判技能调用）。
     *
     * 若已有旧判定牌且在处理区，先将其移入弃牌堆；
     * 然后为新牌创建虚拟牌作为判定结果。
     */
    async setCard(card: GameCard): Promise<void> {
        if (
            this.card &&
            this.card !== card &&
            parseAreaId(this.card.area).areaType === AreaType.Processing
        ) {
            await this.room.putTo([this.card], AreaType.Discard, {
                reason: 'put',
                animation: false,
            });
        }

        this.card = card;

        this.result = card.formatVirtualCardData();
        this.success = this.isSuccess?.(this.result) ?? true;

        // TODO Phase 9: 广播新判定牌动画
    }

    /** 重新评估判定是否成功（改判后调用） */
    resetSuccess(): void {
        if (this.result) {
            this.success = this.isSuccess?.(this.result) ?? true;
        }
    }
}
