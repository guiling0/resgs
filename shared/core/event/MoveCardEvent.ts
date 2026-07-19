import { Room } from '../room/Room';
import { Player } from '../player/Player';
import { GameCard } from '../card/GameCard';
import {
    AreaId,
    AreaType,
    CardSubType,
    CardType,
} from '../card/CardTypes';
import { RichString } from '../RichText';
import { parseAreaId } from '../utils';
import { EventProcess, createTiming } from './EventProcess';
import {
    EventType,
    MoveCardData,
    MoveEventData,
    TimingName,
} from './EventTypes';

// ===== 区域工具函数 =====

/** 从 AreaId 中解析区域类型 */
function areaTypeOf(areaId: AreaId): AreaType {
    return parseAreaId(areaId).areaType as AreaType;
}

/** 从玩家区域 ID 中获取所属玩家 */
function playerOf(areaId: AreaId, room: Room): Player | undefined {
    const { playerId } = parseAreaId(areaId);
    return playerId ? room.playerMaps.get(playerId) : undefined;
}

/** 获取区域的默认放置方式：手牌区背面朝上(false)，其他正面朝上(true) */
function getDefaultPut(areaId: AreaId): boolean {
    return parseAreaId(areaId).areaType !== AreaType.Hand;
}

// ===== MoveCardEvent =====

/**
 * 移动卡牌事件。
 *
 * 执行流程：
 *   MoveCardFixed → MoveCardBefore1 → MoveCardBefore2
 *   → MoveCardAfter1（执行实际移动）→ MoveCardAfter2 → MoveCardEnd
 *
 * 在 MoveCardBefore1/2 期间可调用 cancel()/preventMove() 来取消或阻止移动。
 */
export class MoveCardEvent extends EventProcess<EventType.Move> {
    /** 分类后的移动数据 */
    move_datas: MoveCardData[];

    /** 移动标签生成函数（可由调用方覆盖） */
    getMoveLabel?: (data: MoveCardData) => RichString = () => '';
    /** 战报生成函数（可由调用方覆盖） */
    log?: (data: MoveCardData) => RichString = () => '';

    constructor(room: Room, data: MoveEventData) {
        super(room, EventType.Move, data);
        this.move_datas = data.datas ?? [];
        this.getMoveLabel = data.getMoveLabel;
        this.log = data.log;
        this._buildTriggers();
    }

    // ===== 访问器：向前兼容 d.fromArea 直接访问 =====

    /** eventData.datas 便捷访问 */
    get datas(): MoveCardData[] {
        return this.eventData.datas;
    }
    set datas(v: MoveCardData[]) {
        this.eventData.datas = v;
    }

    // ===== Timing 构建 =====

    private _buildTriggers(): void {
        this.eventTriggers = [
            createTiming(TimingName.MoveCardFixed, [
                this.bindWithMark(this._onMoveCardFixed),
            ]),
            createTiming(TimingName.MoveCardBefore1),
            createTiming(TimingName.MoveCardBefore2),
            createTiming(TimingName.MoveCardAfter1, [
                this.bindWithMark(this._onMoveCardAfter1),
            ]),
            createTiming(TimingName.MoveCardAfter2),
        ];
        this.endTriggers = [
            createTiming(TimingName.MoveCardEnd),
        ];
    }

    // ===== 生命周期 =====

    protected async init(): Promise<void> {
        await super.init();
        this.classify();
    }

    check(): boolean {
        return this.move_datas.length > 0;
    }

    checkEvent(): boolean {
        return this.check();
    }

    // ===== 流程回调 =====

    /** MoveCardFixed: 固定移动（对移动数据做最终校正，子类或外部可覆写） */
    private async _onMoveCardFixed(
        _room: Room,
        _data: MoveEventData,
    ): Promise<void> {
        // 默认空实现，预留扩展点
    }

    /** MoveCardAfter1 Before：执行实际卡牌移动 */
    private async _onMoveCardAfter1(
        _room: Room,
        _data: MoveEventData,
    ): Promise<void> {
        for (const data of this.move_datas) {
            // position='top' 时反转卡牌顺序，实现"依次放在顶部=最后一张在最上面"
            if (data.pos === 'top') {
                data.cards.reverse();
            }

            for (const card of data.cards) {
                const fromArea = card.area;
                const toArea = data.toArea;
                if (!fromArea || !toArea) continue;
                if (fromArea === toArea) continue;

                // 移动卡牌
                this.room.area.remove(fromArea, [card.id]);
                this.room.area.add(toArea, [card.id], data.pos ?? 'bottom');

                // 移动到处理区时通知父事件追踪
                if (this.source && areaTypeOf(toArea) === AreaType.Processing) {
                    this.source._trackProcessingCard(card);
                }

                // 设置放置方式
                if (data.putType !== undefined) {
                    card.turnTo(data.putType);
                }

                // 清空非@never标记
                card.clearMark();

                // 执行移动后处理器
                if (data.handler) {
                    await data.handler(card);
                }

                // 处理虚拟牌／装备关联
                await this.handleVirtualCard(card, fromArea, toArea);
            }
        }

        // TODO Phase 9: 构建动画消息并通过 BroadcastManager 广播
        // const ani: MsgPlayCardMoveAni = { type: 'MsgPlayCardMoveAni', data: [] };
        // for (const data of this.move_datas) { ... ani.data.push({...}); }
        // this.room.broadcast(ani);

        this.room.event.insertHistory(this);
    }

    // ===== 虚拟牌处理 =====

    /**
     * 移动后处理虚拟牌及装备牌关联。
     *
     * 流程：
     *   1. 装备牌 — 离开/进入装备区时更新玩家装备记录
     *   2. 延时锦囊 — 离开/进入判定区时更新判定记录
     *   3. 移动到非处理区 ─ 切断/删除虚拟牌关联
     */
    protected async handleVirtualCard(
        card: GameCard,
        fromArea: AreaId,
        toArea: AreaId,
    ): Promise<void> {
        const fromType = areaTypeOf(fromArea);
        const toType = areaTypeOf(toArea);
        const fromPlayer = playerOf(fromArea, this.room);
        const toPlayer = playerOf(toArea, this.room);

        // 装备牌
        if (card.type === CardType.Equip) {
            if (fromType === AreaType.Equip && fromPlayer) {
                // TODO Phase 11: player.removeEquip(card)
            }
            if (toType === AreaType.Equip && toPlayer) {
                // TODO Phase 11: player.setEquip(card)
            }
        }

        if (!card.vcard) return;

        // 延时锦囊
        if (card.vcard.subtype === CardSubType.DelayedScroll) {
            // 离开判定区
            if (fromType === AreaType.Judge && fromPlayer) {
                // TODO Phase 11: fromPlayer.delDelayedScroll(card.vcard)
            }
            // 进入判定区
            if (toType === AreaType.Judge && toPlayer) {
                // TODO Phase 11: toPlayer.setDelayedScroll(card.vcard)
            }
            // 处理区 → 判定区：重新设置属性
            if (fromType === AreaType.Processing && toType === AreaType.Judge) {
                card.vcard.refresh();
            }
            // 判定区 → 判定区：转移，重新设置属性
            if (fromType === AreaType.Judge && toType === AreaType.Judge) {
                card.vcard.refresh({}, true);
            }
            // 移出处理区和判定区：删除虚拟牌
            if (
                toType !== AreaType.Processing &&
                toType !== AreaType.Judge
            ) {
                this.room.vcard.destroy(card.vcard);
            }
            return;
        }

        // 其他虚拟牌：移动到非处理区则切断
        if (toType !== AreaType.Processing) {
            this.room.vcard.break(card.vcard);
        }
    }

    // ===== 移动数据操作 =====

    /**
     * 对移动数据分类赋默认值并归类。
     *
     * 每条移动数据：
     * 1. 填充默认值（reason/putType/animation/pos/toast/moveType/fromArea）
     * 2. 将相同 (player, fromArea, toArea, reason, moveType, putType, ...) 的卡牌合并到同一组
     */
    public classify(): void {
        const result: MoveCardData[] = [];

        for (const v of this.move_datas) {
            if (!v) continue;
            if (!v.toArea) continue;

            // 填充默认值
            v.reason = v.reason ?? 'put';
            v.putType = v.putType ?? getDefaultPut(v.toArea);
            v.animation = v.animation ?? true;
            v.pos = v.pos ?? 'bottom';
            v.toast = v.toast ?? false;

            // 若指定了 fromArea，只保留该区域的牌
            if (v.fromArea) {
                v.cards = v.cards.filter((c) => c.area === v.fromArea);
            }

            for (const card of v.cards) {
                if (!card) continue;
                const fromArea = card.area;
                if (fromArea === v.toArea) continue;

                const movetype = v.moveType ?? card.put;

                // 查找相同设置的数据组，尝试合并
                const existing = result.find(
                    (d) =>
                        (v.player ? d.player === v.player : true) &&
                        d.fromArea === fromArea &&
                        d.toArea === v.toArea &&
                        d.reason === v.reason &&
                        d.moveType === movetype &&
                        d.putType === v.putType &&
                        d.animation === v.animation &&
                        d.visiblePlayers === v.visiblePlayers &&
                        d.cardVisiblePlayers === v.cardVisiblePlayers &&
                        d.pos === v.pos &&
                        d.toast === v.toast &&
                        (!v.handler || v.handler === d.handler),
                );

                if (existing) {
                    existing.cards.push(card);
                } else {
                    result.push({
                        player: v.player,
                        cards: [card],
                        fromArea,
                        toArea: v.toArea,
                        pos: v.pos,
                        reason: v.reason,
                        moveType: movetype,
                        putType: v.putType,
                        animation: v.animation,
                        visiblePlayers: v.visiblePlayers,
                        cardVisiblePlayers: v.cardVisiblePlayers,
                        label: v.label,
                        log: v.log,
                        toast: v.toast,
                        viewas: v.viewas,
                        handler: v.handler,
                        _data: v._data,
                    });
                }
            }
        }

        this.move_datas = result;
        this.eventData.datas = result;
    }

    /** 增加一条移动数据，可选延迟归类（批量添加时最后统一调用 classify） */
    public add(data: MoveCardData, reclassify: boolean = true): void {
        this.move_datas.push(data);
        if (reclassify) this.classify();
    }

    /**
     * 修改指定牌的移动数据。
     * @param cards 要修改的牌
     * @param newData 新的移动参数，未提供的将沿用原参数
     */
    public update(
        cards: GameCard[],
        newData: Partial<MoveCardData> = {},
    ): void {
        const newCards = newData.cards ?? [];
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (!card) continue;
            const old = this.get(card);
            if (old) {
                const idx = old.cards.indexOf(card);
                if (idx >= 0) old.cards.splice(idx, 1);
            }
            this.move_datas.push({
                ...old ?? {},
                ...newData,
                cards: [newCards[i] ?? card],
                fromArea: undefined,
            } as MoveCardData);
        }
        this.classify();
    }

    // ===== 查询方法 =====

    /** 获取本次移动中包含指定牌的 MoveCardData */
    get(card: GameCard): MoveCardData | undefined {
        return this.move_datas.find((v) => v.cards.includes(card));
    }

    /** 本次移动中是否包含指定牌的移动 */
    has(card: GameCard): boolean {
        return !!this.get(card);
    }

    /**
     * 获取一名玩家在此次移动中会失去的牌的数据。
     * @param player 目标玩家
     * @param pos 检测位置（h=手牌, e=装备, j=判定, u=牌上, s=牌旁）
     */
    getLoseDatas(player: Player, pos: string = 'he'): MoveCardData[] {
        return this.filter((d, c) => {
            const fromType = areaTypeOf(d.fromArea!);
            const toType = areaTypeOf(d.toArea);
            const fromPlayer = playerOf(d.fromArea!, this.room);
            if (fromPlayer !== player) return false;

            // 手牌区 → 非手牌区/装备区
            if (
                pos.includes('h') &&
                fromType === AreaType.Hand &&
                toType !== AreaType.Hand &&
                toType !== AreaType.Equip
            ) {
                return true;
            }
            // 装备区 → 非手牌区/装备区
            if (
                pos.includes('e') &&
                fromType === AreaType.Equip &&
                toType !== AreaType.Hand &&
                toType !== AreaType.Equip
            ) {
                return true;
            }
            // 判定区
            if (pos.includes('j') && fromType === AreaType.Judge) {
                return true;
            }
            // 武将牌上
            if (pos.includes('u') && fromType === AreaType.Up) {
                return true;
            }
            // 武将牌旁
            if (pos.includes('s') && fromType === AreaType.Side) {
                return true;
            }
            return false;
        });
    }

    /** 移动中是否包含一名角色失去牌的数据 */
    hasLose(player: Player, pos: string = 'he'): boolean {
        return this.getLoseDatas(player, pos).length > 0;
    }

    /**
     * 获取一名玩家此次移动中会失去的牌。
     * @param player 目标玩家
     * @param pos 检测位置（h=手牌, e=装备, j=判定, u=牌上, s=牌旁）
     */
    getLoseCards(player: Player, pos: string = 'he'): GameCard[] {
        const cards: GameCard[] = [];
        for (const d of this.getLoseDatas(player, pos)) {
            cards.push(...d.cards);
        }
        return cards;
    }

    /**
     * 获取一名玩家此次移动中会获得的牌的数据。
     * （原区域不为该玩家手牌区，且目标区域为该玩家的手牌区视为获得）
     */
    getObtainDatas(player: Player): MoveCardData[] {
        const handArea = player.getAreaId(AreaType.Hand);
        return this.filter((d, c) => {
            if (d.toArea !== handArea) return false;
            const fromPlayer = d.fromArea
                ? playerOf(d.fromArea, this.room)
                : undefined;
            return fromPlayer !== player;
        });
    }

    /** 移动中是否包含一名角色获得牌的数据 */
    hasObtain(player: Player): boolean {
        return this.getObtainDatas(player).length > 0;
    }

    /**
     * 获取一名玩家此次移动中会获得的牌。
     * （原区域不为该玩家手牌区，且目标区域为该玩家的手牌区视为获得）
     */
    getObtainCards(player: Player): GameCard[] {
        const cards: GameCard[] = [];
        for (const d of this.getObtainDatas(player)) {
            cards.push(...d.cards);
        }
        return cards;
    }

    /** 获取本次移动中所有失去和获得牌的数据 */
    getRelatedDatas(player: Player, pos: string = 'he'): {
        lose: MoveCardData[];
        obtain: MoveCardData[];
    } {
        return {
            lose: this.getLoseDatas(player, pos),
            obtain: this.getObtainDatas(player),
        };
    }

    /** 获取本次移动中符合条件的牌 */
    getCards(
        filter: (data: MoveCardData, card: GameCard) => boolean = () => true,
    ): GameCard[] {
        const cards: GameCard[] = [];
        for (const v of this.move_datas) {
            for (const c of v.cards) {
                if (filter(v, c)) {
                    cards.push(c);
                }
            }
        }
        return cards;
    }

    /** 获取本次移动中符合条件的牌（返回第一张，短路查找） */
    getCard(
        filter: (data: MoveCardData, card: GameCard) => boolean = () => true,
    ): GameCard | undefined {
        for (const d of this.move_datas) {
            const c = d.cards.find((c) => filter(d, c));
            if (c) return c;
        }
        return undefined;
    }

    /** 获取符合条件的移动数据 */
    filter(
        filter: (data: MoveCardData, card: GameCard) => boolean,
    ): MoveCardData[] {
        return this.move_datas.filter((v) =>
            v.cards.find((c) => filter(v, c)),
        );
    }

    /** 移动中是否包含符合条件的数据 */
    has_filter(
        filter: (data: MoveCardData, card: GameCard) => boolean,
    ): boolean {
        return this.filter(filter).length > 0;
    }

    /** 获取移动的总牌数 */
    getMoveCount(): number {
        return this.move_datas.reduce(
            (total, curr) => total + curr.cards.length,
            0,
        );
    }

    /** 判断一张牌的上一次移动是否为此移动事件 */
    isLast(card: GameCard): boolean {
        // TODO Phase 6: 通过 GameFlowManager 的历史记录查询
        return false;
    }

    // ===== 按原因分类的查询方法（各操作共享）=====

    /**
     * 获取某玩家因指定原因会失去的牌的数据。
     * （仅当原区域属于该玩家时视为"失去"）
     */
    getLoseByReason(player: Player, reason: string, pos: string = 'he'): MoveCardData[] {
        return this.filter((d, _c) => {
            if (d.reason !== reason) return false;
            const fromPlayer = d.fromArea ? playerOf(d.fromArea, this.room) : undefined;
            return fromPlayer === player;
        });
    }

    /** getLoseByReason 的 GameCard[] 版本 */
    getLoseCardsByReason(player: Player, reason: string, pos: string = 'he'): GameCard[] {
        const cards: GameCard[] = [];
        for (const d of this.getLoseByReason(player, reason, pos)) {
            cards.push(...d.cards);
        }
        return cards;
    }

    /** 是否有因指定原因失去牌的数据 */
    hasLoseByReason(player: Player, reason: string, pos: string = 'he'): boolean {
        return this.getLoseByReason(player, reason, pos).length > 0;
    }

    /**
     * 获取某玩家因指定原因会获得的牌的数据。
     * （仅当目标区域为该玩家手牌区且原区域不属于该玩家时视为"获得"）
     */
    getObtainByReason(player: Player, reason: string): MoveCardData[] {
        const handArea = player.getAreaId(AreaType.Hand);
        return this.filter((d, _c) => {
            if (d.reason !== reason) return false;
            if (d.toArea !== handArea) return false;
            const fromPlayer = d.fromArea ? playerOf(d.fromArea, this.room) : undefined;
            return fromPlayer !== player;
        });
    }

    /** getObtainByReason 的 GameCard[] 版本 */
    getObtainCardsByReason(player: Player, reason: string): GameCard[] {
        const cards: GameCard[] = [];
        for (const d of this.getObtainByReason(player, reason)) {
            cards.push(...d.cards);
        }
        return cards;
    }

    /** 是否有因指定原因获得牌的数据 */
    hasObtainByReason(player: Player, reason: string): boolean {
        return this.getObtainByReason(player, reason).length > 0;
    }

    // ===== 取消与阻止 =====

    /**
     * 取消移动。
     *
     * 仅在 MoveCardBefore1 / MoveCardBefore2 时机可调用。
     * @param cards 要取消移动的牌。不提供则等同于 preventMove()
     * @param prevent 取消后若所有牌都被取消，是否自动阻止事件
     */
    async cancel(
        cards?: GameCard[],
        prevent: boolean = true,
    ): Promise<this> {
        if (
            this.trigger !== TimingName.MoveCardBefore1 &&
            this.trigger !== TimingName.MoveCardBefore2
        ) {
            return this;
        }

        if (!cards) {
            return this.preventMove();
        }

        const cancelSet = new Set(cards);
        for (const v of this.move_datas) {
            v.cards = v.cards.filter((c) => !cancelSet.has(c));
        }
        this.move_datas = this.move_datas.filter(
            (v) => v.cards.length > 0,
        );

        if (this.move_datas.length === 0 && prevent) {
            await this.preventMove();
        }
        return this;
    }

    /**
     * 阻止整个移动事件。
     *
     * 仅在 MoveCardBefore1 / MoveCardBefore2 时机可调用。
     */
    async preventMove(): Promise<this> {
        if (
            this.trigger === TimingName.MoveCardBefore1 ||
            this.trigger === TimingName.MoveCardBefore2
        ) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}
