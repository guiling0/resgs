"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
class Utils {
    static mixins(cur, item) {
        item.forEach((i) => {
            // console.log(i); // [Function: Name] [Function: Age] [Function: IsMan]
            // 使用 Object.getOwnPropertyNames 去获取 i 上的prototype
            Object.getOwnPropertyNames(i.prototype).forEach((name) => {
                // console.log(name); // 打印出 constructor 和  定义的方法
                cur.prototype[name] = i.prototype[name];
            });
        });
    }
    static getString(value) {
        return typeof value === 'string' ? value : value.text;
    }
    /** 整数随机数 */
    static randomInt(min = 0, max = 1) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /** 洗牌算法 */
    static shuffle(arr) {
        if (!Array.isArray(arr))
            return [];
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
    static remove(array, target) {
        let index = -1;
        if (typeof target === 'function') {
            index = array.findIndex(target);
        }
        else {
            index = array.findIndex((v) => v === target);
        }
        if (index > -1) {
            const obj = array[index];
            array.splice(index, 1);
            return obj;
        }
    }
    /** 根据花色获取颜色 */
    static getColorBySuit(suit) {
        if (suit === 3 /* CardSuit.Club */ || suit === 1 /* CardSuit.Spade */) {
            return 2 /* CardColor.Black */;
        }
        else if (suit === 4 /* CardSuit.Diamond */ || suit === 2 /* CardSuit.Heart */) {
            return 1 /* CardColor.Red */;
        }
        else {
            return 0 /* CardColor.None */;
        }
    }
    /** 获取卡牌类别 */
    static getCardType(name) {
        return sgs.card2datas[name]?.type ?? 1 /* CardType.Basic */;
    }
    /** 获取卡牌副类别 */
    static getCardSubtype(name) {
        return sgs.card2datas[name]?.subtype ?? 1 /* CardSubType.Basic */;
    }
    /** 获取是否为伤害类卡牌 */
    static isDamageCard(name) {
        return sgs.card2datas[name]?.damage ?? false;
    }
    /** 两张武将牌是否形成珠帘璧合的关系 */
    static isRelationship(general1, general2) {
        if (sgs.relationships.find((v) => (v[0] === general1 && v[1] === general2) ||
            (v[0] === general2 && v[1] === general1))) {
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
    static testUseCardCount(result, count) {
        if (result <= 0)
            return false;
        if (typeof count === 'number')
            return result >= count;
        if (Array.isArray(count) && count.length > 0)
            return result >= count[0];
    }
}
exports.Utils = Utils;
