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

    /** 导出虚拟牌数据（供权威端发消息，镜像端消费此类型） */
    toData(): VirtualCardData {
        return {
            name: this.name,
            suit: this.suit,
            color: this.color,
            number: this.number,
            attr: this.attr,
            subcards: this.cardIds,
            data: {},
        };
    }

    /** 是否挂有实体牌 */
    hasSubCards(): boolean {
        return this.subcards.length > 0;
    }

    /** 添加实体牌（去重） */
    addSubCards(cards: GameCard[]): void {
        for (const card of cards) {
            if (!this.subcards.includes(card)) this.subcards.push(card);
        }
        this.room.logger.debug('添加实体牌', { roomId: this.room.roomId, name: this.name, subcards: this.cardIds });
    }

    /** 移除实体牌 */
    delSubCard(card: GameCard): void {
        const idx = this.subcards.indexOf(card);
        if (idx >= 0) this.subcards.splice(idx, 1);
        this.room.logger.debug('移除实体牌', { roomId: this.room.roomId, name: this.name, subcards: this.cardIds });
    }

    /** 清空实体牌 */
    clearSubCards(): void {
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
