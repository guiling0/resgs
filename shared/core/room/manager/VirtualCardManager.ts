import { GameCard } from '@shared/core/card/GameCard';
import { Room } from '@shared/core/room/Room';
import { VirtualCardData, VirtualSourceData } from '@shared/core/card/CardTypes';
import { VirtualCard } from '@shared/core/card/VirtualCard';

/**
 * 虚拟牌管理器 — 虚拟牌的生命周期（创建/销毁/切断/清空）。
 */
export class VirtualCardManager {
    constructor(readonly room: Room) {}

    /** 按名称+子牌创建虚拟牌 */
    createByName(
        name: string,
        cards: GameCard[],
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard {
        const vc = new VirtualCard(name, cards, overrides);
        this.room.vcards.push(vc);
        return vc;
    }

    /** 创建无子牌的虚拟牌 */
    createByEmpty(
        name: string,
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard {
        const vc = new VirtualCard(name, [], overrides);
        this.room.vcards.push(vc);
        return vc;
    }

    /** 以单张实体牌为子牌创建虚拟牌 */
    createFromCard(
        card: GameCard,
        overrides?: Partial<VirtualSourceData>,
    ): VirtualCard {
        const vc = new VirtualCard(card.name, [card], overrides);
        this.room.vcards.push(vc);
        return vc;
    }

    /** 从 VirtualCardData 数据恢复虚拟牌 */
    createFromData(data: VirtualCardData): VirtualCard {
        const cards = this.room.card.gets(data.subcards);
        const vc = new VirtualCard(data.name, cards, {
            suit: data.suit,
            color: data.color,
            number: data.number,
            attr: data.attr,
        });
        Object.assign(vc.data, data.data);
        this.room.vcards.push(vc);
        return vc;
    }

    /** 销毁虚拟牌：断子牌链接 → 标记销毁 → 移除 */
    destroy(vc: VirtualCard) {
        vc.clearSubCards();
        vc.destroyed = true;
        const idx = this.room.vcards.indexOf(vc);
        if (idx >= 0) this.room.vcards.splice(idx, 1);
    }

    /** 断开虚拟牌与子牌的关联（不销毁虚拟牌本身） */
    break(vc: VirtualCard) {
        vc.clearSubCards();
    }

    /** 清空全部虚拟牌 */
    clear() {
        for (const vc of this.room.vcards) {
            vc.clearSubCards();
            vc.destroyed = true;
        }
        this.room.vcards.length = 0;
    }
}
