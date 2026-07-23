import { CardState } from '@shared/core/schema/CardState';
import {
    AreaType,
    GameCardData,
    GameCardId,
} from '@shared/core/card/CardTypes';
import { Room } from '../Room';
import { GameCard } from '@shared/core/card/GameCard';
import { CardUseData } from '../../event/EventTypes';

/**
 * 卡牌管理器 — 负责卡牌实例创建、索引构建与查询。
 * 区域移动见 AreaManager，虚拟牌操作见 VirtualCardManager。
 */
export class CardManager {
    constructor(readonly room: Room) {}

    /**
     * 创建实体牌实例并放入区域。
     * @param sync 是否同步到客户端（initStart 批量为 false）
     */
    create(data: GameCardData, initArea?: string): GameCard {
        const state = new CardState();
        const card = new GameCard(data, this.room, state);
        this.room.state.cardStates.set(card.id.toString(), state);
        if (initArea) {
            this.room.area.add(initArea, [card.id]);
        } else if (data.derived) {
            this.room.area.add(AreaType.Treasury, [card.id]);
        } else {
            this.room.area.add(AreaType.Draw, [card.id]);
        }
        return card;
    }

    /**
     * 注册卡牌到房间索引（cards Map + name/type/subtype）。
     * 衍生牌跳过牌名索引。initStart 中批量加载后统一调用。
     * @param sync 是否同步到客户端
     */
    build(card: GameCard, sync: boolean = true) {
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

    /** 获取卡牌 ID 数组 */
    getIds(cards: GameCard[]): GameCardId[] {
        return cards.map((c) => c.id);
    }

    /**
     * 注册牌的使用方式定义（从 sgs.carduses 拷贝到 room）。
     * 1. 按时机索引 cardusesByTiming：timing → CardUseData[]
     * 2. 按牌名索引 carduses：首个同名用 name，后续用 name.timing
     */
    initCardUses(): void {
        // 先按 name 分组，确定各组首个
        const byName = new Map<string, CardUseData[]>();
        for (const data of sgs.carduses) {
            let list = byName.get(data.name);
            if (!list) {
                list = [];
                byName.set(data.name, list);
            }
            list.push(data);
        }

        for (const data of sgs.carduses) {
            // 按时机注册
            let timingList = this.room.cardusesByTiming.get(data.timing);
            if (!timingList) {
                timingList = [];
                this.room.cardusesByTiming.set(data.timing, timingList);
            }
            timingList.push({ ...data });

            // 按牌名注册
            const sameName = byName.get(data.name)!;
            if (sameName[0] === data) {
                this.room.carduses.set(data.name, { ...data });
            } else {
                this.room.carduses.set(`${data.name}.${data.timing}`, { ...data });
            }
        }
    }
}
