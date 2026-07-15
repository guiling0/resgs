import { CardState } from '@shared/core/schema/CardState';
import { AreaType, GameCardData, GameCardId } from '@shared/core/card/CardTypes';
import { Room } from '../Room';
import { GameCard } from '@shared/core/card/GameCard';

/**
 * 卡牌管理器 — 负责卡牌实例创建、索引构建与查询。
 * 区域移动见 AreaManager，虚拟牌操作见 VirtualCardManager。
 */
export class CardManager {
    constructor(readonly room: Room) {}

    /**
     * 创建实体牌实例并放入区域。
     * - 有 initArea → 放入指定区域
     * - 衍生牌 → 府库  /  普通牌 → 牌堆
     */
    create(data: GameCardData, initArea?: string): GameCard {
        const state = new CardState();
        const card = new GameCard(data, this.room, state);
        if (initArea) {
            this.room.area.add(initArea, [card.id]);
        } else if (data.derived) {
            this.room.area.add(AreaType.Treasury, [card.id]);
        } else {
            this.room.area.add(AreaType.Draw, [card.id]);
        }
        this.build(card);
        // TODO: 通知客户端 build 处理
        // TODO: 若房间卡牌使用技能未注册该牌名则注册
        this.room.state.cardStates.set(card.id.toString(), state);
        return card;
    }

    /**
     * 构建卡牌索引：注册到 room.cards + 更新牌名/类型/副类型索引。
     * 衍生牌跳过牌名索引。
     */
    build(card: GameCard) {
        if (!card) return;
        this.room.cards.set(card.id, card);
        if (!this.room.cardNames.includes(card.name) && !card.derived) {
            const name = card.name;
            this.room.cardNames.push(name);
            const type = card.type;
            if (!this.room.cardNamesToType.has(type))
                this.room.cardNamesToType.set(type, new Set());
            this.room.cardNamesToType.get(type)!.add(name);
            const subtype = card.subtype;
            if (!this.room.cardNamesToSubType.has(subtype))
                this.room.cardNamesToSubType.set(subtype, new Set());
            this.room.cardNamesToSubType.get(subtype)!.add(name);
        }
    }

    /** 按 ID 获取卡牌 */
    get(id: GameCardId): GameCard | undefined {
        return this.room.cards.get(id);
    }

    /** 批量获取卡牌（过滤无效 ID） */
    gets(ids: GameCardId[]): GameCard[] {
        return ids.map((id) => this.get(id)).filter(Boolean) as GameCard[];
    }
}
