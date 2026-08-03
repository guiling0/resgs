import { ICard } from './ICard';
import type { Room } from './Room';
import { defaultCardAudio, defaultCardImage } from '../utils/AssetsUtils';
import type { CardGender } from '../utils/AssetsUtils';
import type { CardAnimation, CardAssets } from '../types/AssetsTypes';
import type { CardAttr, CardNumber, CardSuit, GameCardData, GameCardId } from '../types/CardTypes';

/**
 * 实体牌——游戏牌实体，牌面能力继承自 ICard。
 * 源数据（sourceData）保留并对外可读，属性经 getter 动态暴露。
 * 同步挂载场景属 R1 区域管理。
 */
export class GameCard extends ICard {
    readonly room: Room;
    /** 源数据（注册构建的实体牌数据，外部可读；状态效果修正直接改此数据） */
    readonly sourceData: GameCardData;

    constructor(room: Room, data: GameCardData) {
        super();
        this.room = room;
        this.sourceData = { ...data, attr: [...data.attr] };
        this.room.logger.debug('创建实体牌', { roomId: room.roomId, cardId: this.id });
    }

    /** 实体牌 id */
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
