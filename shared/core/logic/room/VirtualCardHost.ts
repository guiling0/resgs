import type { Room } from '../../entity/Room';
import type { GameCard } from '../../entity/GameCard';
import { VirtualCard } from '../../entity/VirtualCard';
import type { VirtualCardOverrides } from '../../entity/VirtualCard';
import type { VirtualCardData } from '../../types/CardTypes';

/** 虚拟牌能力接口——宿主（如 RoomHost）经此声明 vCard 能力 */
export interface VirtualCardAbility {
    /** 创建虚拟牌（重载）：按名+子牌 / 单实体牌 / 无子牌 / 从数据恢复 */
    createVirtualCard(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(name: string, overrides?: VirtualCardOverrides): VirtualCard;
    createVirtualCard(data: VirtualCardData): VirtualCard;
    /** 销毁虚拟牌：断子牌链接并标记销毁 */
    destroyVirtualCard(vc: VirtualCard): void;
}

/**
 * 虚拟牌宿主——权威端虚拟牌创建/销毁能力实现（结算瞬态对象）。
 * 不维护全局列表：实例由事件/调用方持有引用，结算完调用 destroyVirtualCard。
 */
export class VirtualCardHost {
    constructor(readonly room: Room) {}

    create(name: string, subcards: GameCard[], overrides?: VirtualCardOverrides): VirtualCard {
        return new VirtualCard(this.room, name, subcards, overrides);
    }

    createFromCard(card: GameCard, overrides?: VirtualCardOverrides): VirtualCard {
        return new VirtualCard(this.room, card.name, [card], overrides);
    }

    createByNone(name: string, overrides?: VirtualCardOverrides): VirtualCard {
        return new VirtualCard(this.room, name, [], overrides);
    }

    createFromData(data: VirtualCardData): VirtualCard {
        const cards = this.room.getCards(data.subcards);
        return new VirtualCard(this.room, data.name, cards, {
            suit: data.suit,
            color: data.color,
            number: data.number,
            attr: data.attr,
        });
    }

    destroyVirtualCard(vc: VirtualCard): void {
        vc.clearSubCards();
        vc.destroyed = true;
    }
}
