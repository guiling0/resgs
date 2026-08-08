import { ICard } from './ICard';
import { GameCard } from './GameCard';
import type { Room } from './Room';
import { getColorBySuit } from '../utils/CardUtils';
import { CardColor, CardNumber, CardSuit } from '../types/CardTypes';
import type { CardAttr, VirtualCardData } from '../types/CardTypes';

/** 虚拟牌牌面覆盖项（refresh 用，未提供字段按实体牌派生） */
export interface VirtualCardOverrides {
    suit?: CardSuit;
    color?: CardColor;
    number?: CardNumber;
    attr?: CardAttr[];
}

/**
 * 虚拟牌——使用/打出的结算对象，链接实体牌（subcards）派生牌面属性。
 * 仅权威端创建使用（结算瞬态对象），镜像端只消费 toData 导出的 VirtualCardData。
 * 单实体牌继承其花色/点数/属性；多实体牌花色点数取无，颜色按子牌同色判定。
 * @rules terms/card-terms/virtualCard
 * @description 虚拟牌实体——使用/打出结算的虚拟牌运行时对象
 */
export class VirtualCard extends ICard {
    readonly room: Room;
    readonly name: string;
    /** 实体牌列表 */
    readonly subcards: GameCard[] = [];

    /** 是否已销毁（销毁后不可再参与结算） */
    destroyed: boolean = false;

    /** 花色 */
    private _suit: CardSuit = CardSuit.None;
    /** 点数 */
    private _number: CardNumber = CardNumber.None;
    /** 属性列表 */
    private _attr: CardAttr[] = [];
    /** 颜色（refresh 计算） */
    private _color: CardColor = CardColor.None;

    constructor(room: Room, name: string, subcards: GameCard[] = [], overrides?: VirtualCardOverrides) {
        super();
        this.name = name;
        this.room = room;
        this.addSubCards(subcards);
        this.room.logger.debug('创建虚拟牌', { roomId: room.roomId, name: this.name, subcards: this.cardIds });
        this.refresh(overrides);
    }

    /** 花色 */
    get suit(): CardSuit {
        return this._suit;
    }

    /** 点数 */
    get number(): CardNumber {
        return this._number;
    }

    /** 属性列表（副本） */
    get attr(): CardAttr[] {
        return [...this._attr];
    }

    /** 颜色（覆盖项优先，否则按实体牌派生） */
    get color(): CardColor {
        return this._color;
    }

    /** 实体牌 ID 列表 */
    get cardIds(): string[] {
        return this.subcards.map((c) => c.id);
    }

    /** 导出数据缓存（引用稳定，字段随 refresh 同步更新） */
    private _data?: VirtualCardData;

    /** 导出虚拟牌数据（供权威端发消息，镜像端消费此类型；返回引用稳定，供装备/判定记录匹配） */
    toData(): VirtualCardData {
        if (!this._data) {
            this._data = {
                name: this.name,
                suit: this._suit,
                color: this._color,
                number: this._number,
                attr: this._attr,
                subcards: this.cardIds,
                data: {},
            };
        }
        // 同步最新牌面
        this._data.suit = this._suit;
        this._data.color = this._color;
        this._data.number = this._number;
        this._data.attr = this._attr;
        this._data.subcards = this.cardIds;
        return this._data;
    }

    /**
     * 重新设置虚拟牌属性
     * @param overrides 需覆盖的属性（未提供时按实体牌派生）
     * @param _reset 未提供的属性是否更新为默认值（保留参数，兼容移动转移场景调用）
     */
    set(overrides: VirtualCardOverrides = {}, _reset: boolean = true): void {
        this.refresh(overrides);
    }

    /** 是否挂有实体牌 */
    hasSubCards(): boolean {
        return this.subcards.length > 0;
    }

    /** 添加实体牌：建立子牌与虚拟牌的双向链接 */
    addSubCards(cards: GameCard[]): void {
        for (const card of cards) {
            if (card.vcard === this) continue;
            if (card.vcard) {
                card.vcard.delSubCard(card);
            }
            this.subcards.push(card);
            card.vcard = this;
        }
        this.room.logger.debug('添加实体牌', { roomId: this.room.roomId, name: this.name, subcards: this.cardIds });
    }

    /** 移除实体牌：断开子牌与虚拟牌的链接 */
    delSubCard(card: GameCard): void {
        const idx = this.subcards.indexOf(card);
        if (idx >= 0) {
            this.subcards.splice(idx, 1);
            card.vcard = undefined;
        }
        this.room.logger.debug('移除实体牌', { roomId: this.room.roomId, name: this.name, subcards: this.cardIds });
    }

    /** 清空实体牌：断开全部子牌链接 */
    clearSubCards(): void {
        for (const card of this.subcards) {
            card.vcard = undefined;
        }
        this.subcards.length = 0;
        this.room.logger.debug('清空实体牌', { roomId: this.room.roomId, name: this.name });
    }

    /** 刷新牌面属性：显式覆盖优先，未提供时按实体牌派生 */
    refresh(overrides: VirtualCardOverrides = {}): void {
        this._suit = overrides.suit ?? (this.subcards.length === 1 ? this.subcards[0].suit : CardSuit.None);
        this._number = overrides.number ?? (this.subcards.length === 1 ? this.subcards[0].number : CardNumber.None);
        this._attr = overrides.attr ? [...overrides.attr] : this.subcards.length === 1 ? [...this.subcards[0].attr] : [];
        this._color = overrides.color ?? this.defaultColor();
        this.room.logger.debug('刷新虚拟牌属性', {
            roomId: this.room.roomId,
            name: this.name,
            suit: this._suit,
            number: this._number,
            color: this._color,
            attr: this._attr,
        });
    }

    /** 派生颜色：单实体牌继承；多实体牌全黑→黑、全红→红、混合→无色 */
    private defaultColor(): CardColor {
        if (this.subcards.length === 0) return getColorBySuit(this._suit);
        if (this.subcards.length === 1) return this.subcards[0].color;
        const allBlack = this.subcards.every((c) => c.color === CardColor.Black);
        const allRed = this.subcards.every((c) => c.color === CardColor.Red);
        return allBlack ? CardColor.Black : allRed ? CardColor.Red : CardColor.None;
    }
}
