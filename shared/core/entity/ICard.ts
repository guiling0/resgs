import { Mark } from './Mark';
import { getColorBySuit } from '../utils/CardUtils';
import { CardAttr, CardSubType, CardType } from '../types/CardTypes';
import type { CardColor, CardNumber, CardSuit } from '../types/CardTypes';

/**
 * 卡牌抽象基类——实体牌与虚拟牌的共同牌面能力，继承 Mark 具备标记能力。
 * 子类实现 name/suit/number/attr；color 由花色派生（虚拟牌可覆盖为按源牌计算），type/subtype 由注册表按牌名派生。
 */
export abstract class ICard extends Mark {
    /** 卡牌名（子类实现） */
    abstract readonly name: string;
    /** 花色（子类实现） */
    abstract readonly suit: CardSuit;
    /** 点数（子类实现） */
    abstract readonly number: CardNumber;
    /** 属性列表（子类实现） */
    abstract readonly attr: CardAttr[];

    /** 颜色（由花色派生） */
    get color(): CardColor {
        return getColorBySuit(this.suit);
    }

    /** 卡牌类别（按牌名查 sgs.carddatas，未注册默认基本牌） */
    get type(): CardType {
        return sgs.carddatas.get(this.name)?.type ?? CardType.Basic;
    }

    /** 卡牌副类别（按牌名查 sgs.carddatas，未注册默认基本牌） */
    get subtype(): CardSubType {
        return sgs.carddatas.get(this.name)?.subtype ?? CardSubType.Basic;
    }

    /** 是否含指定属性 */
    hasAttr(attr: CardAttr): boolean {
        return this.attr.includes(attr);
    }

    /** 是否为普通杀（无火/雷属性） */
    isCommonSha(): boolean {
        return this.name === 'sha' && !this.hasAttr(CardAttr.Fire) && !this.hasAttr(CardAttr.Thunder);
    }

    /** 是否为伤害卡牌 */
    isDamageCard(): boolean {
        return !!sgs.carddatas.get(this.name)?.damage;
    }

    /** 是否为回复类卡牌 */
    isRecoverCard(): boolean {
        return !!sgs.carddatas.get(this.name)?.recover;
    }

    /** 是否为基本牌 */
    isBasic(): boolean {
        return this.type === CardType.Basic;
    }

    /** 是否为锦囊牌 */
    isScroll(): boolean {
        return this.type === CardType.Scroll;
    }

    /** 是否为装备牌 */
    isEquip(): boolean {
        return this.type === CardType.Equip;
    }

    /** 是否为延时锦囊牌 */
    isDelayedScroll(): boolean {
        return this.subtype === CardSubType.DelayedScroll;
    }

    /** 是否为即时锦囊牌 */
    isInstantScroll(): boolean {
        return this.subtype === CardSubType.InstantScroll;
    }

    /** 是否为武器 */
    isWeapon(): boolean {
        return this.subtype === CardSubType.Weapon;
    }

    /** 是否为防具 */
    isArmor(): boolean {
        return this.subtype === CardSubType.Armor;
    }

    /** 是否为防御坐骑 */
    isDefensiveMount(): boolean {
        return this.subtype === CardSubType.DefensiveMount;
    }

    /** 是否为进攻坐骑 */
    isOffensiveMount(): boolean {
        return this.subtype === CardSubType.OffensiveMount;
    }

    /** 是否为特殊坐骑 */
    isSpecialMount(): boolean {
        return this.subtype === CardSubType.SpecialMount;
    }

    /** 是否为宝物 */
    isTreasure(): boolean {
        return this.subtype === CardSubType.Treasure;
    }

    /** 是否为坐骑牌 */
    isMount(): boolean {
        return this.isOffensiveMount() || this.isDefensiveMount() || this.isSpecialMount();
    }
}
