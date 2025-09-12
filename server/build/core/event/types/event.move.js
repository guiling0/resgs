"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveCardData = exports.ShowCardsData = exports.FlashCardsData = exports.SwapCardsData = exports.GiveCardsData = exports.RecastCardsData = exports.ObtainCardsData = exports.DropCardsData = exports.DrawCardsData = exports.PutToCardsData = exports.MoveCardEvent = void 0;
const card_1 = require("../../card/card");
const skill_types_1 = require("../../skill/skill.types");
const data_1 = require("../data");
const event_1 = require("../event");
/** 移动事件 */
class MoveCardEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 移动中卡牌上显示的文本 */
        this.getMoveLabel = () => {
            return '';
        };
        /** 显示的战报 */
        this.log = () => {
            return '';
        };
    }
    static async exec(room, data) {
        return room.moveCards(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = [
            "MoveCardFixed" /* EventTriggers.MoveCardFixed */,
            "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */,
            "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
            "MoveCardAfter1" /* EventTriggers.MoveCardAfter1 */,
            "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
        ];
        this.endTriggers = ["MoveCardEnd" /* EventTriggers.MoveCardEnd */];
        this.classify();
    }
    async [`${"MoveCardAfter1" /* EventTriggers.MoveCardAfter1 */}_Before`]() {
        const ani = {
            type: 'MsgPlayCardMoveAni',
            data: [],
        };
        //移动牌
        for (const data of this.move_datas) {
            for (const card of data.cards) {
                const from = card.area, to = data.toArea;
                if (!from || !to)
                    continue;
                from.remove([card]);
                to.add([card]);
                card.put = data.puttype;
                card._visibles.length = 0;
                await this.handleVirtualCard(card, from, to);
            }
            ani.data.push({
                cards: this.room.getCardIds(data.cards),
                fromArea: data.fromArea.areaId,
                toArea: data.toArea.areaId,
                movetype: data.movetype,
                puttype: data.puttype,
                animation: data.animation,
                moveVisibles: this.room.getPlayerIds(data.moveVisibles),
                cardVisibles: this.room.getPlayerIds(data.cardVisibles),
                isMove: true,
                label: data.label ?? this.getMoveLabel(data),
                log: data.log ?? this.log(data),
                viewas: data.viewas,
            });
        }
        this.room.broadcast(ani);
        this.room.insertHistory(this);
    }
    async processCompleted() {
        if (this.room.gameState !== 1 /* GameState.Gaming */)
            return;
        this.isEnd = this.isComplete = true;
        const history = this.room.historys.findLast((v) => v.data === this);
        if (history) {
            history.endIndex = this.room.historys.length;
        }
        lodash.remove(this.room.events, (c) => c === this);
    }
    async handleVirtualCard(card, fromArea, toArea) {
        if (!(card instanceof card_1.GameCard))
            return;
        //清除所有标记
        card.removeAllMark();
        if (card.type === 3 /* CardType.Equip */) {
            //原区域为装备区 删除记录的装备牌
            if (fromArea.type === 92 /* AreaType.Equip */) {
                await fromArea.player.removeEquip(card);
            }
            //目标区域为装备区 记录装备牌
            if (toArea.type === 92 /* AreaType.Equip */) {
                await toArea.player.setEquip(card);
            }
        }
        if (!card.vcard)
            return;
        //延时锦囊
        if (card.vcard.subtype === 22 /* CardSubType.DelayedScroll */) {
            //原区域为判定区 删除记录的延时锦囊牌
            if (fromArea.type === 93 /* AreaType.Judge */) {
                fromArea.player.delDelayedScroll(card.vcard);
            }
            //目标区域为判定区 记录延时锦囊牌
            if (toArea.type === 93 /* AreaType.Judge */) {
                toArea.player.setDelayedScroll(card.vcard);
            }
            //处理区移动至判定区，重新设置属性
            if (fromArea.type === 3 /* AreaType.Processing */ &&
                toArea.type === 93 /* AreaType.Judge */) {
                card.vcard.set();
            }
            //判定区移动至判定区，重新设置属性
            if (fromArea.type === 93 /* AreaType.Judge */ &&
                toArea.type === 93 /* AreaType.Judge */) {
                card.vcard.set({}, true);
            }
            //移动到不为处理区或判定区的区域：删除虚拟牌
            if (toArea.type !== 3 /* AreaType.Processing */ &&
                toArea.type !== 93 /* AreaType.Judge */) {
                this.room.deleteVirtualCard(card.vcard);
            }
            return;
        }
        //其他
        if (toArea.type !== 3 /* AreaType.Processing */) {
            this.room.breakVirtualCard(card.vcard);
        }
    }
    check_event() {
        return this.move_datas.length > 0;
    }
    check() {
        return this.move_datas.length > 0;
    }
    /** 对移动数据分类 */
    classify() {
        const _data = [];
        this.move_datas.forEach((v) => {
            if (!v)
                return;
            if (!v.toArea)
                return;
            v.reason = v.reason ?? 1 /* MoveCardReason.PutTo */;
            v.puttype = v.puttype ?? v.toArea.defaultPut;
            v.animation = v.animation ?? true;
            if (v.fromArea) {
                v.cards = v.cards.filter((c) => c.area === v.fromArea);
            }
            v.cards.forEach((card) => {
                if (!card)
                    return;
                const fromArea = card.area;
                if (fromArea === v.toArea)
                    return;
                const movetype = v.movetype ?? card.put;
                const move = _data.find((d) => (v.player ? d.player === v.player : true) &&
                    d.fromArea === fromArea &&
                    d.toArea === v.toArea &&
                    d.reason === v.reason &&
                    d.movetype === movetype &&
                    d.puttype === v.puttype &&
                    d.animation === v.animation &&
                    d.moveVisibles === v.moveVisibles &&
                    d.cardVisibles === v.cardVisibles);
                if (move) {
                    move.cards.push(card);
                }
                else {
                    _data.push({
                        player: v.player,
                        cards: [card],
                        fromArea,
                        toArea: v.toArea,
                        reason: v.reason,
                        movetype,
                        puttype: v.puttype,
                        animation: v.animation,
                        moveVisibles: v.moveVisibles,
                        cardVisibles: v.cardVisibles,
                        label: v.label,
                        log: v.log,
                        viewas: v.viewas,
                    });
                }
            });
        });
        this.move_datas = _data;
    }
    /** 增加移动数据 */
    add(data) {
        this.move_datas.push(data);
        this.classify();
    }
    /**
     * 修改指定牌的移动数据
     * @param cards 要修改的牌
     * @param new_data 新的移动参数，未提供的参数将与每张牌的原本移动参数相同
     */
    update(cards, new_data = {}) {
        const new_cards = new_data?.cards ?? [];
        cards.forEach((v, i) => {
            const data = this.get(v);
            if (data)
                lodash.remove(data.cards, (c) => c === v);
            this.add(Object.assign({}, data ?? {}, new_data, {
                cards: [new_cards[i] ? new_cards[i] : v],
                fromArea: undefined,
            }));
        });
        this.classify();
    }
    /** 获取移动中一名角色失去牌的数据
     * @param player 要检测的角色
     * @param pos 检测的位置
     */
    getLoseDatas(player, pos = 'h') {
        return this.filter((d, c) => {
            if (pos.includes('h') && d.fromArea === player.handArea) {
                return true;
            }
            if (pos.includes('e') && d.fromArea === player.equipArea) {
                return true;
            }
            if (pos.includes('j') && d.fromArea === player.judgeArea) {
                return true;
            }
            if (pos.includes('u') && d.fromArea === player.upArea) {
                return true;
            }
            if (pos.includes('s') && d.fromArea === player.sideArea) {
                return true;
            }
        });
    }
    /** 移动中是否包含一名角色失去牌的数据 */
    has_lose(player, pos = 'h') {
        return !!this.has_filter((d, c) => {
            if (pos.includes('h') && d.fromArea === player.handArea) {
                return true;
            }
            if (pos.includes('e') && d.fromArea === player.equipArea) {
                return true;
            }
            if (pos.includes('j') && d.fromArea === player.judgeArea) {
                return true;
            }
            if (pos.includes('u') && d.fromArea === player.upArea) {
                return true;
            }
            if (pos.includes('s') && d.fromArea === player.sideArea) {
                return true;
            }
        });
    }
    /** 获取移动中一名角色获得牌的数据
     * @param player 要检测的角色
     * @param pos 检测的位置
     */
    getObtainDatas(player) {
        return this.filter((d, c) => {
            return d.toArea === player.handArea;
        });
    }
    /** 移动中是否包含一名角色获得牌的数据 */
    has_obtain(player) {
        return this.has_filter((d, c) => {
            return d.toArea === player.handArea;
        });
    }
    /**
     * 取消移动
     * @param cards [可选]取消移动的牌。如果不提供则等同于防止此次移动
     * @description 只有时机处于“移动至目标区域前1”和“移动至目标区域前2”这两个时机可以进行取消移动
     */
    async cancle(cards, prevent = true) {
        if (this.trigger === "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */ ||
            this.trigger === "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */) {
            if (!cards)
                return this.preventMove();
            this.move_datas.forEach((v) => {
                cards.forEach((c1) => lodash.remove(v.cards, (c2) => c1 === c2));
            });
            this.move_datas = this.move_datas.filter((v) => v.cards.length > 0);
            if (this.data.length === 0 && prevent) {
                await this.preventMove();
            }
        }
        return this;
    }
    /**
     * 防止移动
     * @description 只有时机处于“移动至目标区域前1”和“移动至目标区域前2”这两个时机可以进行防止移动
     */
    async preventMove() {
        if (this.trigger === "MoveCardBefore1" /* EventTriggers.MoveCardBefore1 */ ||
            this.trigger === "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
    /** 是否包含指定牌的移动 */
    has(card) {
        return !!this.get(card);
    }
    /** 获取指定牌的移动对象 */
    get(card) {
        return this.move_datas.find((v) => v.cards.includes(card));
    }
    /** 获取本次移动中符合条件的牌 */
    getCard(filter) {
        const datas = this.filter(filter);
        if (datas.length > 0) {
            return datas[0].cards.find((v) => filter(datas[0], v));
        }
    }
    getCards(filter) {
        const cards = [];
        this.move_datas.forEach((v) => {
            v.cards.forEach((c) => {
                if (filter(v, c)) {
                    cards.push(c);
                }
            });
        });
        return cards;
    }
    /** 获取移动中符合条件的移动数据 */
    filter(filter) {
        return this.move_datas.filter((v) => v.cards.find((c) => filter(v, c)));
    }
    /** 移动中是否包含符合条件的数据 */
    has_filter(filter) {
        return !!this.move_datas.find((v) => v.cards.find((c) => filter(v, c)));
    }
    /** 获取移动的牌数 */
    getMoveCount() {
        return this.move_datas.reduce((total, curr) => {
            return total + curr.cards.length;
        }, 0);
    }
}
exports.MoveCardEvent = MoveCardEvent;
/** 置于置入 */
class PutToCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 需要移动的牌 */
        this.cards = [];
        /** 是否播放动画 */
        this.animation = true;
    }
    static async exec(room, data) {
        const puto = room.cast(PutToCardsData, data);
        if (puto.check()) {
            const data = {
                player: puto.player,
                cards: puto.cards,
                toArea: puto.toArea,
                reason: 1 /* MoveCardReason.PutTo */,
                movetype: puto.movetype,
                puttype: puto.puttype,
                animation: puto.animation,
                moveVisibles: puto.moveVisibles,
                cardVisibles: puto.cardVisibles,
            };
            return await room.moveCards(Object.assign({
                move_datas: [data],
                getMoveLabel: (data) => {
                    return puto.getMoveLabel(data);
                },
                log: (data) => {
                    return puto.getLog(data);
                },
            }, puto.copy()));
        }
    }
    getMoveLabel(data) {
        return {
            text: '#Move_PutTo',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'area', value: this.toArea.areaId },
            ],
        };
    }
    getLog(data) {
        return {
            text: '#PutToCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'number', value: data.cards.length },
                { type: '[carddata]', value: this.room.getCardIds(data.cards) },
                { type: 'area', value: data.toArea.areaId },
            ],
        };
    }
    check() {
        //TODO 置于置入检测
        //1.装备牌不能置入有对应装备的装备栏或已废除的装备栏
        //2.延时锦囊牌置入判定区时需要进行一次系统对其的合法性检测
        return this.cards.length > 0;
        // data.custom = data.custom || {};
        // data.data.forEach((v) => {
        //     if (v.cards.length === 0) return;
        //     if (v.toArea.disable) {
        //         v.cards.length = 0;
        //         v.update = true;
        //         return;
        //     }
        //     if (v.toArea.type === AreaType.Equip) {
        //         const player = v.toArea.player;
        //         v.cards.slice().forEach((card) => {
        //             const equip = player.getEquip(card.subtype as number);
        //             //TODO 废除装备栏
        //             if (equip) {
        //                 sgs.utils.remove(v.cards, card);
        //                 v.update = true;
        //             }
        //         });
        //     }
        //     if (v.toArea.type === AreaType.Judge) {
        //         const player = v.toArea.player;
        //         const vcard = v.cards[0].vcard;
        //         if (vcard) {
        //             //1.目标角色的判定区里不能有同名的虚拟牌
        //             if (player.judgeCards.find((c) => c.name === vcard.name)) {
        //                 v.cards.length = 0;
        //                 v.update = true;
        //             } else {
        //                 if (
        //                     this.getStates(
        //                         `${StateSkillType.Prohibit}_cantUse`,
        //                         [
        //                             {
        //                                 type: 'preusecard',
        //                                 from: undefined,
        //                                 card: vcard,
        //                                 source: data.source,
        //                                 reason: data.reason,
        //                                 skill: data.skill,
        //                                 c: data.c,
        //                             },
        //                             vcard,
        //                             player,
        //                         ]
        //                     ).some((v) => v)
        //                 ) {
        //                     v.cards.length = 0;
        //                     v.update = true;
        //                 }
        //             }
        //         } else {
        //             v.cards.length = 0;
        //             v.update = true;
        //         }
        //     }
        // });
        // data.data = data.data.filter((v) => v.cards.length > 0);
        // return data.data.length > 0;
    }
}
exports.PutToCardsData = PutToCardsData;
/** 摸牌 */
class DrawCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 摸牌的数量 */
        this.count = 1;
        /** 摸牌的位置 */
        this.drawPos = 'top';
    }
    static async exec(room, data) {
        const draw = room.cast(DrawCardsData, data);
        const cards = await room.getNCards(draw.count, draw.drawPos);
        if (draw.check()) {
            return await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: draw.player,
                        cards: cards,
                        toArea: draw.player.handArea,
                        reason: 11 /* MoveCardReason.Draw */,
                    },
                ],
                getMoveLabel: (data) => {
                    return draw.getMoveLabel(data);
                },
                log: (data) => {
                    return draw.getLog(data);
                },
            }, draw.copy()));
        }
    }
    check() {
        return this.player && this.player.alive && this.count > 0;
    }
    getMoveLabel(data) {
        return {
            text: '#Move_Draw',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }
    getLog(data) {
        return {
            text: '#DrawCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'string', value: this.drawPos },
                { type: 'number', value: data.cards.length },
                {
                    type: '[carddata]',
                    value: this.room.getCardIds(data.cards),
                },
            ],
        };
    }
}
exports.DrawCardsData = DrawCardsData;
/** 弃牌 */
class DropCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 弃置的牌 */
        this.cards = [];
    }
    static async exec(room, data) {
        const drop = room.cast(DropCardsData, data);
        if (drop.check()) {
            return await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: drop.player,
                        cards: drop.cards,
                        toArea: room.discardArea,
                        reason: 6 /* MoveCardReason.DisCard */,
                    },
                ],
                getMoveLabel: (data) => {
                    return drop.getMoveLabel(data);
                },
                log: (data) => {
                    return drop.getLog(data);
                },
            }, drop.copy()));
        }
    }
    check() {
        if (!this.cards || this.cards.length === 0)
            return false;
        this.cards = this.cards.filter((v) => {
            return !this.room
                .getStates(skill_types_1.StateEffectType.Prohibit_DropCards, [
                this.player,
                this.cards.at(0),
                this.reason,
            ])
                .some((i) => i);
        });
        return this.cards.length > 0;
    }
    getMoveLabel(data) {
        const from = data.fromArea.player;
        if (!from || from === this.player) {
            return {
                text: '#Move_Drop',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                ],
            };
        }
        else {
            return {
                text: '#Move_Drop2',
                values: [
                    { type: 'player', value: from.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'player', value: this.player.playerId },
                ],
            };
        }
    }
    getLog(data) {
        const from = data.fromArea.player;
        if (!from || from === this.player) {
            return {
                text: '#DropCard1',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'number', value: data.cards.length },
                    {
                        type: '[carddata]',
                        value: this.room.getCardIds(data.cards),
                    },
                ],
            };
        }
        else {
            return {
                text: '#DropCard2',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'player', value: from.playerId },
                    { type: 'number', value: data.cards.length },
                    {
                        type: '[carddata]',
                        value: this.room.getCardIds(data.cards),
                    },
                ],
            };
        }
    }
}
exports.DropCardsData = DropCardsData;
/** 获得牌 */
class ObtainCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 弃置的牌 */
        this.cards = [];
    }
    static async exec(room, data) {
        const obtain = room.cast(ObtainCardsData, data);
        if (obtain.check()) {
            return await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: obtain.player,
                        cards: obtain.cards,
                        toArea: obtain.player.handArea,
                        reason: 10 /* MoveCardReason.Obtain */,
                        movetype: obtain.movetype,
                    },
                ],
                getMoveLabel: (data) => {
                    return obtain.getMoveLabel(data);
                },
                log: (data) => {
                    return obtain.getLog(data);
                },
            }, obtain.copy()));
        }
    }
    check() {
        if (!this.cards)
            return false;
        if (!this.player || this.player.death)
            return false;
        this.cards = this.cards.filter((v) => v.area !== this.player.handArea);
        if (this.cards.length === 0)
            return false;
        return true;
    }
    getMoveLabel(data) {
        return {
            text: '#Move_Obtain',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }
    getLog(data) {
        const from = data.fromArea.player;
        if (!from || from === this.player) {
            return {
                text: '#ObtainCard1',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'number', value: data.cards.length },
                    {
                        type: '[carddata]',
                        value: this.room.getCardIds(data.cards),
                    },
                ],
            };
        }
        else {
            return {
                text: '#ObtainCard2',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'player', value: from.playerId },
                    { type: 'number', value: data.cards.length },
                    {
                        type: '[carddata]',
                        value: this.room.getCardIds(data.cards),
                    },
                ],
            };
        }
    }
}
exports.ObtainCardsData = ObtainCardsData;
/** 重铸牌 */
class RecastCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 重铸的牌 */
        this.cards = [];
        /** 采用默认重铸摸牌，即不管重铸多少张都摸1张 */
        this.defaultDraw = true;
    }
    static async exec(room, data) {
        const recast = room.cast(RecastCardsData, data);
        if (recast.check()) {
            const _recast = await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: recast.player,
                        cards: data.cards,
                        toArea: room.discardArea,
                        reason: 4 /* MoveCardReason.Recast */,
                    },
                ],
                getMoveLabel: (data) => {
                    return recast.getMoveLabel(data);
                },
                log: (data) => {
                    return recast.getLog(data);
                },
            }, recast.copy()));
            const _draw = await room.drawCards(Object.assign({}, {
                player: recast.player,
                count: recast.defaultDraw ? 1 : recast.cards.length,
            }, recast.copy()));
            return {
                recast: _recast,
                draw: _draw,
            };
        }
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        this.cards = this.cards.filter((v) => v.area?.player === this.player);
        return this.cards.length > 0;
    }
    getMoveLabel(data) {
        return {
            text: '#Move_Recast',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }
    getLog(data) {
        return {
            text: '#RecastCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'string', value: this.reason },
                { type: '[carddata]', value: this.room.getCardIds(data.cards) },
            ],
        };
    }
}
exports.RecastCardsData = RecastCardsData;
/** 交给牌 */
class GiveCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 交给的牌 */
        this.cards = [];
    }
    static async exec(room, data) {
        const give = room.cast(GiveCardsData, data);
        if (give.check()) {
            return await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: give.from,
                        cards: give.cards,
                        toArea: give.to.handArea,
                        reason: 7 /* MoveCardReason.Give */,
                        movetype: give.movetype,
                    },
                ],
                getMoveLabel: (data) => {
                    return give.getMoveLabel(data);
                },
                log: (data) => {
                    return give.getLog(data);
                },
            }, give.copy()));
        }
    }
    check() {
        if (!this.cards)
            return false;
        if (!this.from || this.from.death)
            return false;
        if (!this.to || this.to.death)
            return false;
        this.cards = this.cards.filter((v) => !this.to.getHandCards().includes(v));
        if (this.cards.length === 0)
            return false;
        return true;
    }
    getMoveLabel(data) {
        return {
            text: '#Move_Give',
            values: [
                { type: 'player', value: this.from.playerId },
                { type: 'player', value: this.to.playerId },
            ],
        };
    }
    getLog(data) {
        return {
            text: '#GiveCard',
            values: [
                { type: 'player', value: this.from.playerId },
                { type: 'string', value: this.reason },
                { type: 'player', value: this.to.playerId },
                { type: 'number', value: data.cards.length },
                {
                    type: '[carddata]',
                    value: this.room.getCardIds(data.cards),
                },
            ],
        };
    }
}
exports.GiveCardsData = GiveCardsData;
/** 交换牌 */
class SwapCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 第一叠牌 */
        this.cards1 = [];
        /** 第二叠牌 */
        this.cards2 = [];
    }
    static async exec(room, data) {
        const swap = room.cast(SwapCardsData, data);
        if (swap.check()) {
            const up_cards = [...swap.cards1, ...swap.cards2].filter((v) => v.put === 1 /* CardPut.Up */);
            const down_cards = [...swap.cards1, ...swap.cards2].filter((v) => v.put === 2 /* CardPut.Down */);
            const to_process = await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: swap.player,
                        cards: up_cards,
                        puttype: 1 /* CardPut.Up */,
                        toArea: room.processingArea,
                        reason: 9 /* MoveCardReason.Swap */,
                        animation: false,
                    },
                    {
                        player: swap.player,
                        cards: down_cards,
                        puttype: 2 /* CardPut.Down */,
                        toArea: room.processingArea,
                        reason: 9 /* MoveCardReason.Swap */,
                        animation: false,
                    },
                ],
            }, swap.copy()));
            const _swap = await room.moveCards(Object.assign({
                move_datas: [
                    {
                        player: swap.player,
                        cards: swap.cards1,
                        toArea: swap.toArea1,
                        reason: 9 /* MoveCardReason.Swap */,
                        animation: true,
                    },
                    {
                        player: swap.player,
                        cards: swap.cards2,
                        toArea: swap.toArea2,
                        reason: 9 /* MoveCardReason.Swap */,
                        animation: true,
                    },
                ],
                getMoveLabel: (data) => {
                    return swap.getMoveLabel(data);
                },
                log: (data) => {
                    return swap.getLog(data);
                },
            }, swap.copy()));
            return {
                to_process,
                swap: _swap,
            };
        }
    }
    check() {
        if (!this.cards1 || !this.cards2)
            return false;
        if (!this.toArea1 || !this.toArea2)
            return false;
        if (this.cards1.length === 0 && this.cards2.length === 0)
            return false;
        return true;
    }
    getMoveLabel(data) {
        return '';
    }
    getLog(data) {
        return '';
    }
}
exports.SwapCardsData = SwapCardsData;
/** 亮出牌 */
class FlashCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 亮出的牌 */
        this.cards = [];
    }
    static async exec(room, data) {
        const flash = room.cast(FlashCardsData, data);
        if (flash.check()) {
            const draw_cards = [];
            const other_cards = [];
            flash.cards.forEach((v) => {
                if (v.area === room.drawArea) {
                    draw_cards.push(v);
                }
                else {
                    room.propertyChanges.push(['card', v.id, 'flash', true]);
                    other_cards.push(v);
                }
            });
            if (other_cards.length > 0) {
                const ani = {
                    type: 'MsgPlayCardMoveAni',
                    data: [],
                };
                other_cards.forEach((v) => {
                    const _data = ani.data.find((d) => d.fromArea === v.area.areaId);
                    if (_data)
                        _data.cards.push(v.id);
                    else
                        ani.data.push({
                            cards: [v.id],
                            fromArea: v.area.areaId,
                            toArea: room.processingArea.areaId,
                            movetype: 1 /* CardPut.Up */,
                            puttype: 1 /* CardPut.Up */,
                            animation: true,
                            moveVisibles: [],
                            cardVisibles: [],
                            isMove: false,
                            label: flash.getMoveLabel(undefined),
                            log: undefined,
                        });
                });
                room.broadcast(ani);
            }
            if (draw_cards.length > 0) {
                await room.moveCards(Object.assign({
                    move_datas: [
                        {
                            player: flash.player,
                            cards: draw_cards,
                            toArea: room.processingArea,
                            reason: 1 /* MoveCardReason.PutTo */,
                            movetype: 1 /* CardPut.Up */,
                            puttype: 1 /* CardPut.Up */,
                        },
                    ],
                    getMoveLabel: (data) => {
                        return flash.getMoveLabel(data);
                    },
                    // log: (data: MoveData) => {
                    //     return flash.getLog(data);
                    // },
                }, flash.copy()));
            }
            return flash;
        }
    }
    check() {
        if (!this.cards)
            return false;
        return this.cards.length > 0;
    }
    getMoveLabel(data) {
        if (this.player) {
            return {
                text: '#Move_Flash1',
                values: [{ type: 'player', value: this.player.playerId }],
            };
        }
        else {
            return '#Move_Flash2';
        }
    }
    getLog(data) {
        return '';
    }
}
exports.FlashCardsData = FlashCardsData;
/** 展示牌 */
class ShowCardsData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 展示的牌 */
        this.cards = [];
    }
    static async exec(room, data) {
        const show = room.cast(ShowCardsData, data);
        if (show.check()) {
            const ani = {
                type: 'MsgPlayCardMoveAni',
                data: [],
            };
            const down_cards = show.cards.filter((v) => v.put === 2 /* CardPut.Down */);
            down_cards.forEach((v) => v.turnTo(1 /* CardPut.Up */));
            show.cards.forEach((v) => {
                const _data = ani.data.find((d) => d.fromArea === v.area.areaId);
                if (_data)
                    _data.cards.push(v.id);
                else
                    ani.data.push({
                        cards: [v.id],
                        fromArea: v.area.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: show.getMoveLabel(undefined),
                        log: show.getLog(undefined),
                    });
            });
            room.broadcast(ani);
            await room.delay(1);
            down_cards.forEach((v) => v.turnTo(2 /* CardPut.Down */));
            room.broadcast({ type: 'None' });
            return show;
        }
    }
    check() {
        if (!this.cards)
            return false;
        return this.cards.length > 0;
    }
    getMoveLabel(data) {
        if (this.player) {
            return {
                text: '#Move_Show1',
                values: [{ type: 'player', value: this.player.playerId }],
            };
        }
        else {
            return '#Move_Show2';
        }
    }
    getLog(data) {
        return {
            text: '#ShowCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'string', value: this.reason },
                { type: '[carddata]', value: this.room.getCardIds(this.cards) },
            ],
        };
    }
}
exports.ShowCardsData = ShowCardsData;
/** 移除牌 */
class RemoveCardData extends data_1.EventData {
    constructor() {
        super(...arguments);
        /** 需要移动的牌 */
        this.cards = [];
        /** 是否播放动画 */
        this.animation = true;
    }
    static async exec(room, data) {
        const puto = room.cast(RemoveCardData, data);
        if (puto.check()) {
            const data = {
                player: puto.player,
                cards: puto.cards,
                toArea: room.reserveArea,
                reason: 1 /* MoveCardReason.PutTo */,
                movetype: puto.movetype,
                puttype: puto.puttype,
                animation: puto.animation,
                moveVisibles: puto.moveVisibles,
                cardVisibles: puto.cardVisibles,
            };
            const move = await room.moveCards(Object.assign({
                move_datas: [data],
                getMoveLabel: (data) => {
                    return puto.getMoveLabel(data);
                },
                log: (data) => {
                    return puto.getLog(data);
                },
            }, puto.copy()));
            const bagong = room.getEffect(room.getMark('#bagongbizhengshu'));
            if (bagong && bagong.isOpen() && bagong.check()) {
                return [move];
            }
            let move2;
            const cards = room.reserveArea.cards.filter((v) => v.put === 1 /* CardPut.Up */);
            const execute = puto.skill?.player ?? puto.player;
            if (cards.length > Math.min(8, room.playerCount)) {
                if (execute) {
                    const req = await room.doRequest({
                        player: execute,
                        get_selectors: {
                            selectorId: room.base_selectors.getSelectorName('remove_handle'),
                            context: {
                                effect: room.base_selectors,
                                count: cards.length -
                                    Math.min(8, room.playerCount),
                            },
                        },
                    });
                    const _cards = room.getResultCards(req);
                    move2 = await room.puto({
                        player: execute,
                        cards: _cards,
                        toArea: room.discardArea,
                        source: puto,
                        reason: 'remove_hanlde',
                    });
                }
                else {
                    const _cards = cards.slice(0, cards.length - Math.min(8, room.playerCount));
                    move2 = await room.puto({
                        player: execute,
                        cards: _cards,
                        toArea: room.discardArea,
                        source: puto,
                        reason: 'remove_hanlde',
                    });
                }
            }
            return [move, move2];
        }
    }
    getMoveLabel(data) {
        return {
            text: '#Move_Remove',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'string', value: this.reason },
            ],
        };
    }
    getLog(data) {
        return {
            text: '#RemoveCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'number', value: data.cards.length },
                { type: '[carddata]', value: this.room.getCardIds(data.cards) },
            ],
        };
    }
    check() {
        return this.cards.length > 0;
    }
}
exports.RemoveCardData = RemoveCardData;
