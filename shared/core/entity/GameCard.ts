import { ICard } from './ICard';
import type { Room } from './Room';
import { sync } from '../state/decorators';
import { defaultCardAudio, defaultCardImage } from '../utils/AssetsUtils';
import type { CardGender } from '../utils/AssetsUtils';
import type { CardAnimation, CardAssets } from '../types/AssetsTypes';
import type { CardAttr, CardNumber, CardSuit, GameCardData, GameCardId, VirtualCardData } from '../types/CardTypes';
import type { Area } from './Area';
import type { VirtualCard } from './VirtualCard';

/**
 * 实体牌——游戏牌实体，牌面能力继承自 ICard。
 * 源数据（sourceData）保留并对外可读，属性经 getter 动态暴露。
 * 同步挂载场景属 R1 区域管理。
 * @rules terms/card-terms/GameCard
 * @description 游戏牌实体类——对局中每张牌的运行时对象
 */
export class GameCard extends ICard {
    readonly room: Room;
    /** 当前所在区域（加入区域时设置，移出时清空） */
    area?: Area;
    /** 源数据（注册构建的实体牌数据，外部可读；状态效果修正直接改此数据） */
    readonly sourceData: GameCardData;
    /** 放置方式（true=正面朝上，false=背面朝上）——TODO(R1): 区域管理的放置同步语义细化 */
    @sync() put: boolean = false;
    /** 关联虚拟牌（使用/打出结算中的临时关联）——TODO(R1): 区域管理维护 */
    vcard?: VirtualCard;

    constructor(room: Room, data: GameCardData) {
        super();
        this.room = room;
        this.sourceData = { ...data, attr: [...data.attr] };
        // 登记实体牌索引
        room.cards.set(this.id, this);
        // 登记牌名索引（衍生牌不登记，按类别/副类别分组）
        if (!this.derived && !room.cardNames.includes(this.name)) {
            room.cardNames.push(this.name);
            const type = this.type;
            let byType = room.cardNamesToType.get(type);
            if (!byType) {
                byType = new Set();
                room.cardNamesToType.set(type, byType);
            }
            byType.add(this.name);
            const subtype = this.subtype;
            let bySubtype = room.cardNamesToSubType.get(subtype);
            if (!bySubtype) {
                bySubtype = new Set();
                room.cardNamesToSubType.set(subtype, bySubtype);
            }
            bySubtype.add(this.name);
        }
    }

    /**
     * 实体牌 id
     * @rules terms/value-terms/cardId
     * @description 每张游戏牌都有独立的 ID
     */
    get id(): GameCardId {
        return this.sourceData.id;
    }

    /** 卡牌名 */
    get name(): string {
        return this.sourceData.name;
    }

    /** 花色 */
    get suit(): CardSuit {
        return this.sourceData.suit;
    }

    /** 点数 */
    get number(): CardNumber {
        return this.sourceData.number;
    }

    /** 属性列表（副本） */
    get attr(): CardAttr[] {
        return [...this.sourceData.attr];
    }

    /** 是否为衍生牌 */
    get derived(): boolean {
        return this.sourceData.derived;
    }

    /** 设置放置方式（正面/背面） */
    turnTo(put: boolean): void {
        if (this.put === put) return;
        this.put = put;
    }

    /** 生成以本牌为子牌的虚拟牌数据（判定/展示场景用） */
    formatVirtualCardData(): VirtualCardData {
        return {
            name: this.name,
            suit: this.suit,
            color: this.color,
            number: this.number,
            attr: this.attr,
            subcards: [this.id],
            data: {},
        };
    }

    // ===== 动态资源（按牌名，未配置走默认路径模板） =====

    /** 牌资源（未注册返回 undefined） */
    get resources(): CardAssets | undefined {
        return sgs.cardAssets.get(this.name);
    }

    /** 牌图（完整 url） */
    getImage(): string {
        return this.resources?.image ?? defaultCardImage(this.name);
    }

    /** 配音（完整 url；animationName 指定动画分支时取该分支专属配音，未命中走默认配音） */
    getAudio(gender: CardGender, animationName?: string): string {
        if (animationName) {
            const anim = this.resources?.animations?.find((a) => a.name === animationName);
            const audio = gender === 'male' ? anim?.audioMale : anim?.audioFemale;
            if (audio) return audio;
        }
        return defaultCardAudio(this.name, gender);
    }

    /** 动画分支 */
    getAnimation(name: string): CardAnimation | undefined {
        return this.resources?.animations?.find((a) => a.name === name);
    }
}
