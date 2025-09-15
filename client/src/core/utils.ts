import { CardSuit, CardColor, CardSubType, CardType } from './card/card.types';
import { ChooseResultCount } from './choose/choose.types';
import { CustomString } from './custom/custom.type';

export class Utils {
    public static mixins(cur: any, item: any[]) {
        item.forEach((i) => {
            // console.log(i); // [Function: Name] [Function: Age] [Function: IsMan]

            // 使用 Object.getOwnPropertyNames 去获取 i 上的prototype
            Object.getOwnPropertyNames(i.prototype).forEach((name) => {
                // console.log(name); // 打印出 constructor 和  定义的方法
                cur.prototype[name] = i.prototype[name];
            });
        });
    }

    public static getString(value: CustomString) {
        return typeof value === 'string' ? value : value.text;
    }

    /** 整数随机数 */
    public static randomInt(min: number = 0, max: number = 1) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /** 洗牌算法 */
    public static shuffle<T>(arr: T[]): T[] {
        if (!Array.isArray(arr)) return [];
        const length = arr.length;

        // 优化:使用临时变量交换代替数组解构
        for (let i = length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    /** 移除数组中第一个符合条件的元素 */
    public static remove<T extends Object>(
        array: T[],
        target: T | ((value: T, index: number, obj: T[]) => boolean)
    ): T {
        let index = -1;
        if (typeof target === 'function') {
            index = array.findIndex(target);
        } else {
            index = array.findIndex((v) => v === target);
        }
        if (index > -1) {
            const obj = array[index];
            array.splice(index, 1);
            return obj;
        }
    }

    /** 根据花色获取颜色 */
    public static getColorBySuit(suit: CardSuit) {
        if (suit === CardSuit.Club || suit === CardSuit.Spade) {
            return CardColor.Black;
        } else if (suit === CardSuit.Diamond || suit === CardSuit.Heart) {
            return CardColor.Red;
        } else {
            return CardColor.None;
        }
    }

    /** 获取卡牌类别 */
    public static getCardType(name: string): CardType {
        return sgs.card2datas[name]?.type ?? CardType.Basic;
    }

    /** 获取卡牌副类别 */
    public static getCardSubtype(name: string): CardSubType {
        return sgs.card2datas[name]?.subtype ?? CardSubType.Basic;
    }

    /** 获取是否为伤害类卡牌 */
    public static isDamageCard(name: string): boolean {
        return sgs.card2datas[name]?.damage ?? false;
    }

    /** 两张武将牌是否形成珠帘璧合的关系 */
    public static isRelationship(general1: string, general2: string): boolean {
        if (
            sgs.relationships.find(
                (v) =>
                    (v[0] === general1 && v[1] === general2) ||
                    (v[0] === general2 && v[1] === general1)
            )
        ) {
            return true;
        }
        const g1 = sgs.generals.get(general1);
        const g2 = sgs.generals.get(general2);
        if (g1.lord) {
            return g2.kingdom.includes(g1.kingdom);
        }
        if (g2.lord) {
            return g1.kingdom.includes(g2.kingdom);
        }
        return false;
    }

    /**
     * 检测一个数字是否满足一张牌的目标限制条件
     * @param result 需要检测的数字
     * @param count 牌的目标数量限制条件
     * @description 本方法检测{result}是否大于等于count的最小值
     * 如果count是一个数字，则会进行比较
     * 如果count是一个数组，则会与[0]进行比较
     * 无论如何result必须要大于0才可以
     */
    public static testUseCardCount(result: number, count: ChooseResultCount) {
        if (result <= 0) return false;
        if (typeof count === 'number') return result >= count;
        if (Array.isArray(count) && count.length > 0) return result >= count[0];
    }
}
