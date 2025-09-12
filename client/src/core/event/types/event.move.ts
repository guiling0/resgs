import { Area } from '../../area/area';
import { AreaType } from '../../area/area.type';
import { GameCard } from '../../card/card';
import {
    CardPut,
    CardType,
    CardSubType,
    VirtualCardData,
} from '../../card/card.types';
import { CustomString } from '../../custom/custom.type';
import { GameState } from '../../enums';
import { MsgPlayCardMoveAni } from '../../message/message.ani';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { MoveCardReason } from '../../room/room.types';
import { StateEffectType } from '../../skill/skill.types';
import { EventData } from '../data';
import { EventProcess } from '../event';
import { HandleData } from '../event.types';
import { EventTriggers } from '../triggers';

export interface MoveData {
    /** 移动主体 */
    player?: GamePlayer;
    /** 移动的卡牌 */
    cards: GameCard[];
    /** 原区域
     * @description 这个属性仅用于验证牌是否是原区域的牌，
     * 如果不提供则在开始移动事件后默认赋值为该卡牌所在的区域。
     * 如果cards中有多张卡牌，且来自于不同区域。
     * 那么赋值该属性后会忽略掉不是这个区域的卡牌
     * 不赋值的话开始移动事件后会将cards中的所有卡牌按照原区域以及其他设置属性重新进行分类
     */
    fromArea?: Area;
    /** 目标区域 */
    toArea: Area;
    /** 移动原因
     * @description 移动原因诸如“摸牌”“弃置”“使用”“打出”等。而来源于技能方面的移动原因则是triggerData.skill
     */
    reason: MoveCardReason;
    /** 移动方式
     * @description 目前仅影响移动动画播放过程中(客户端)是否显示牌面的信息。
     * 如果一张牌对一名玩家可见，尽管移动方式为背面朝上，那么该客户端的玩家也可以看到这张（些）牌的信息
     * 如果不提供该属性，则默认为卡牌当前的放置方式
     */
    movetype?: CardPut;
    /** 放置方式
     * @description 卡牌在目标区域的放置方式。通常来说，一名玩家能在客户端中看见正面朝上和对自己可见的牌的信息。
     * 如果不提供，则默认为目标区域的默认放置方式
     */
    puttype?: CardPut;
    /** 是否播放移动动画
     * @description 仅用于客户端是否播放移动动画
     */
    animation?: boolean;
    /** 移动动画可见角色
     * @description 移动动画的过程仅对某些玩家可见。如果不提供则默认对所有玩家可见
     */
    moveVisibles?: GamePlayer[];
    /** 移动后牌的可见角色
     * @description 除了区域的默认可见角色外，如果是正面朝上放置的所有角色均可以见。如果是背面朝上只有这里设置的角色可见
     * 例如：观星：准备阶段，你可以将牌堆顶的X张牌扣置入处理区（对你可见）…………
     * 在这个技能中，牌堆顶的X张牌会被置入处理区(客户端表现为移动到屏幕中央，也可以不设置动画)，后续在观星选择中，因为这些牌对诸葛亮可见，所以诸葛亮在排列过程中可以看到每张牌的信息。而其余玩家仅能看到排列的顺序而不清楚这些牌是什么牌
     */
    cardVisibles?: GamePlayer[];
    /** 自定义数据 */
    _data?: any;
    /** 在移动的卡牌上显示文本 */
    label?: CustomString;
    /** 移动时添加一条log */
    log?: CustomString;
    /** 在移动的卡牌上显示视为信息 */
    viewas?: VirtualCardData;
}

/** 移动事件 */
export class MoveCardEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<MoveCardEvent>) {
        return room.moveCards(data);
    }

    /** 移动数据 */
    move_datas: MoveData[];
    /** 移动中卡牌上显示的文本 */
    getMoveLabel: (data: MoveData) => CustomString = () => {
        return '';
    };
    /** 显示的战报 */
    log: (data: MoveData) => CustomString = () => {
        return '';
    };

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.MoveCardFixed,
            EventTriggers.MoveCardBefore1,
            EventTriggers.MoveCardBefore2,
            EventTriggers.MoveCardAfter1,
            EventTriggers.MoveCardAfter2,
        ];
        this.endTriggers = [EventTriggers.MoveCardEnd];
        this.classify();
    }

    protected async [`${EventTriggers.MoveCardAfter1}_Before`]() {
        const ani: MsgPlayCardMoveAni = {
            type: 'MsgPlayCardMoveAni',
            data: [],
        };
        //移动牌
        for (const data of this.move_datas) {
            for (const card of data.cards) {
                const from = card.area,
                    to = data.toArea;
                if (!from || !to) continue;
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

    public async processCompleted(): Promise<void> {
        if (this.room.gameState !== GameState.Gaming) return;
        this.isEnd = this.isComplete = true;
        const history = this.room.historys.findLast((v) => v.data === this);
        if (history) {
            history.endIndex = this.room.historys.length;
        }
        lodash.remove(this.room.events, (c) => c === this);
    }

    protected async handleVirtualCard(
        card: GameCard,
        fromArea: Area,
        toArea: Area
    ) {
        if (!(card instanceof GameCard)) return;
        //清除所有标记
        card.removeAllMark();
        if (card.type === CardType.Equip) {
            //原区域为装备区 删除记录的装备牌
            if (fromArea.type === AreaType.Equip) {
                await fromArea.player.removeEquip(card);
            }
            //目标区域为装备区 记录装备牌
            if (toArea.type === AreaType.Equip) {
                await toArea.player.setEquip(card);
            }
        }
        if (!card.vcard) return;
        //延时锦囊
        if (card.vcard.subtype === CardSubType.DelayedScroll) {
            //原区域为判定区 删除记录的延时锦囊牌
            if (fromArea.type === AreaType.Judge) {
                fromArea.player.delDelayedScroll(card.vcard);
            }
            //目标区域为判定区 记录延时锦囊牌
            if (toArea.type === AreaType.Judge) {
                toArea.player.setDelayedScroll(card.vcard);
            }
            //处理区移动至判定区，重新设置属性
            if (
                fromArea.type === AreaType.Processing &&
                toArea.type === AreaType.Judge
            ) {
                card.vcard.set();
            }
            //判定区移动至判定区，重新设置属性
            if (
                fromArea.type === AreaType.Judge &&
                toArea.type === AreaType.Judge
            ) {
                card.vcard.set({}, true);
            }
            //移动到不为处理区或判定区的区域：删除虚拟牌
            if (
                toArea.type !== AreaType.Processing &&
                toArea.type !== AreaType.Judge
            ) {
                this.room.deleteVirtualCard(card.vcard);
            }
            return;
        }
        //其他
        if (toArea.type !== AreaType.Processing) {
            this.room.breakVirtualCard(card.vcard);
        }
    }

    public check_event(): boolean {
        return this.move_datas.length > 0;
    }

    public check(): boolean {
        return this.move_datas.length > 0;
    }

    /** 对移动数据分类 */
    public classify() {
        const _data: MoveData[] = [];
        this.move_datas.forEach((v) => {
            if (!v) return;
            if (!v.toArea) return;
            v.reason = v.reason ?? MoveCardReason.PutTo;
            v.puttype = v.puttype ?? v.toArea.defaultPut;
            v.animation = v.animation ?? true;
            if (v.fromArea) {
                v.cards = v.cards.filter((c) => c.area === v.fromArea);
            }
            v.cards.forEach((card) => {
                if (!card) return;
                const fromArea = card.area;
                if (fromArea === v.toArea) return;
                const movetype = v.movetype ?? card.put;
                const move = _data.find(
                    (d) =>
                        (v.player ? d.player === v.player : true) &&
                        d.fromArea === fromArea &&
                        d.toArea === v.toArea &&
                        d.reason === v.reason &&
                        d.movetype === movetype &&
                        d.puttype === v.puttype &&
                        d.animation === v.animation &&
                        d.moveVisibles === v.moveVisibles &&
                        d.cardVisibles === v.cardVisibles
                );
                if (move) {
                    move.cards.push(card);
                } else {
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
    public add(data: MoveData) {
        this.move_datas.push(data);
        this.classify();
    }

    /**
     * 修改指定牌的移动数据
     * @param cards 要修改的牌
     * @param new_data 新的移动参数，未提供的参数将与每张牌的原本移动参数相同
     */
    public update(cards: GameCard[], new_data: Partial<MoveData> = {}) {
        const new_cards = new_data?.cards ?? [];
        cards.forEach((v, i) => {
            const data = this.get(v);
            if (data) lodash.remove(data.cards, (c) => c === v);
            this.add(
                Object.assign({}, data ?? {}, new_data, {
                    cards: [new_cards[i] ? new_cards[i] : v],
                    fromArea: undefined,
                }) as MoveData
            );
        });
        this.classify();
    }

    /** 获取移动中一名角色失去牌的数据
     * @param player 要检测的角色
     * @param pos 检测的位置
     */
    public getLoseDatas(player: GamePlayer, pos: string = 'h'): MoveData[] {
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
    public has_lose(player: GamePlayer, pos: string = 'h') {
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
    public getObtainDatas(player: GamePlayer): MoveData[] {
        return this.filter((d, c) => {
            return d.toArea === player.handArea;
        });
    }

    /** 移动中是否包含一名角色获得牌的数据 */
    public has_obtain(player: GamePlayer) {
        return this.has_filter((d, c) => {
            return d.toArea === player.handArea;
        });
    }

    /**
     * 取消移动
     * @param cards [可选]取消移动的牌。如果不提供则等同于防止此次移动
     * @description 只有时机处于“移动至目标区域前1”和“移动至目标区域前2”这两个时机可以进行取消移动
     */
    public async cancle(cards?: GameCard[], prevent: boolean = true) {
        if (
            this.trigger === EventTriggers.MoveCardBefore1 ||
            this.trigger === EventTriggers.MoveCardBefore2
        ) {
            if (!cards) return this.preventMove();
            this.move_datas.forEach((v) => {
                cards.forEach((c1) =>
                    lodash.remove(v.cards, (c2) => c1 === c2)
                );
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
    public async preventMove() {
        if (
            this.trigger === EventTriggers.MoveCardBefore1 ||
            this.trigger === EventTriggers.MoveCardBefore2
        ) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    /** 是否包含指定牌的移动 */
    has(card: GameCard) {
        return !!this.get(card);
    }

    /** 获取指定牌的移动对象 */
    get(card: GameCard) {
        return this.move_datas.find((v) => v.cards.includes(card));
    }

    /** 获取本次移动中符合条件的牌 */
    getCard(filter: (data: MoveData, card: GameCard) => boolean) {
        const datas = this.filter(filter);
        if (datas.length > 0) {
            return datas[0].cards.find((v) => filter(datas[0], v));
        }
    }

    getCards(filter: (data: MoveData, card: GameCard) => boolean) {
        const cards: GameCard[] = [];
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
    filter(filter: (data: MoveData, card: GameCard) => boolean) {
        return this.move_datas.filter((v) => v.cards.find((c) => filter(v, c)));
    }

    /** 移动中是否包含符合条件的数据 */
    has_filter(filter: (data: MoveData, card: GameCard) => boolean) {
        return !!this.move_datas.find((v) => v.cards.find((c) => filter(v, c)));
    }

    /** 获取移动的牌数 */
    getMoveCount() {
        return this.move_datas.reduce((total, curr) => {
            return total + curr.cards.length;
        }, 0);
    }
}

/** 置于置入 */
export class PutToCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<PutToCardsData>) {
        const puto = room.cast(PutToCardsData, data);
        if (puto.check()) {
            const data: MoveData = {
                player: puto.player,
                cards: puto.cards,
                toArea: puto.toArea,
                reason: MoveCardReason.PutTo,
                movetype: puto.movetype,
                puttype: puto.puttype,
                animation: puto.animation,
                moveVisibles: puto.moveVisibles,
                cardVisibles: puto.cardVisibles,
            };
            return await room.moveCards(
                Object.assign(
                    {
                        move_datas: [data],
                        getMoveLabel: (data: MoveData) => {
                            return puto.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return puto.getLog(data);
                        },
                    },
                    puto.copy()
                )
            );
        }
    }

    /** 操作的角色 */
    player: GamePlayer;
    /** 需要移动的牌 */
    cards: GameCard[] = [];
    /** 目标区域 */
    toArea: Area;
    /** 移动方式 */
    movetype?: CardPut;
    /** 放置方式 */
    puttype?: CardPut;
    /** 是否播放动画 */
    animation?: boolean = true;
    /** 移动动画可见角色 */
    moveVisibles?: GamePlayer[];
    /** 移动后牌的可见角色 */
    cardVisibles?: GamePlayer[];

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_PutTo',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'area', value: this.toArea.areaId },
            ],
        };
    }

    public getLog(data: MoveData): CustomString {
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

    public check(): boolean {
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

/** 摸牌 */
export class DrawCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<DrawCardsData>) {
        const draw = room.cast(DrawCardsData, data);
        const cards = await room.getNCards(draw.count, draw.drawPos);
        if (draw.check()) {
            return await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: draw.player,
                                cards: cards,
                                toArea: draw.player.handArea,
                                reason: MoveCardReason.Draw,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return draw.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return draw.getLog(data);
                        },
                    },
                    draw.copy()
                )
            );
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 摸牌的数量 */
    count: number = 1;
    /** 摸牌的位置 */
    drawPos: 'top' | 'bottom' = 'top';

    public check(): boolean {
        return this.player && this.player.alive && this.count > 0;
    }

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_Draw',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }

    public getLog(data: MoveData): CustomString {
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

/** 弃牌 */
export class DropCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<DropCardsData>) {
        const drop = room.cast(DropCardsData, data);
        if (drop.check()) {
            return await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: drop.player,
                                cards: drop.cards,
                                toArea: room.discardArea,
                                reason: MoveCardReason.DisCard,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return drop.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return drop.getLog(data);
                        },
                    },
                    drop.copy()
                )
            );
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 弃置的牌 */
    cards: GameCard[] = [];

    public check(): boolean {
        if (!this.cards || this.cards.length === 0) return false;
        this.cards = this.cards.filter((v) => {
            return !this.room
                .getStates(StateEffectType.Prohibit_DropCards, [
                    this.player,
                    this.cards.at(0),
                    this.reason,
                ])
                .some((i) => i);
        });
        return this.cards.length > 0;
    }

    public getMoveLabel(data: MoveData): CustomString {
        const from = data.fromArea.player;
        if (!from || from === this.player) {
            return {
                text: '#Move_Drop',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                ],
            };
        } else {
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

    public getLog(data: MoveData): CustomString {
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
        } else {
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

/** 获得牌 */
export class ObtainCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<ObtainCardsData>) {
        const obtain = room.cast(ObtainCardsData, data);
        if (obtain.check()) {
            return await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: obtain.player,
                                cards: obtain.cards,
                                toArea: obtain.player.handArea,
                                reason: MoveCardReason.Obtain,
                                movetype: obtain.movetype,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return obtain.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return obtain.getLog(data);
                        },
                    },
                    obtain.copy()
                )
            );
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 弃置的牌 */
    cards: GameCard[] = [];
    /** 移动方式 */
    movetype?: CardPut;

    public check(): boolean {
        if (!this.cards) return false;
        if (!this.player || this.player.death) return false;
        this.cards = this.cards.filter((v) => v.area !== this.player.handArea);
        if (this.cards.length === 0) return false;
        return true;
    }

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_Obtain',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }

    public getLog(data: MoveData): CustomString {
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
        } else {
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

/** 重铸牌 */
export class RecastCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<RecastCardsData>) {
        const recast = room.cast(RecastCardsData, data);
        if (recast.check()) {
            const _recast = await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: recast.player,
                                cards: data.cards,
                                toArea: room.discardArea,
                                reason: MoveCardReason.Recast,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return recast.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return recast.getLog(data);
                        },
                    },
                    recast.copy()
                )
            );
            const _draw = await room.drawCards(
                Object.assign(
                    {},
                    {
                        player: recast.player,
                        count: recast.defaultDraw ? 1 : recast.cards.length,
                    },
                    recast.copy()
                )
            );
            return {
                recast: _recast,
                draw: _draw,
            };
        }
    }

    /** 操作的角色 */
    player: GamePlayer;
    /** 重铸的牌 */
    cards: GameCard[] = [];
    /** 采用默认重铸摸牌，即不管重铸多少张都摸1张 */
    defaultDraw: boolean = true;

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        this.cards = this.cards.filter((v) => v.area?.player === this.player);
        return this.cards.length > 0;
    }

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_Recast',
            values: [{ type: 'player', value: this.player.playerId }],
        };
    }

    public getLog(data: MoveData): CustomString {
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

/** 交给牌 */
export class GiveCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<GiveCardsData>) {
        const give = room.cast(GiveCardsData, data);
        if (give.check()) {
            return await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: give.from,
                                cards: give.cards,
                                toArea: give.to.handArea,
                                reason: MoveCardReason.Give,
                                movetype: give.movetype,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return give.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return give.getLog(data);
                        },
                    },
                    give.copy()
                )
            );
        }
    }
    /** 谁交给 */
    from: GamePlayer;
    /** 交给谁 */
    to: GamePlayer;
    /** 交给的牌 */
    cards: GameCard[] = [];
    /** 移动方式 */
    movetype?: CardPut;

    public check(): boolean {
        if (!this.cards) return false;
        if (!this.from || this.from.death) return false;
        if (!this.to || this.to.death) return false;
        this.cards = this.cards.filter(
            (v) => !this.to.getHandCards().includes(v)
        );
        if (this.cards.length === 0) return false;
        return true;
    }

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_Give',
            values: [
                { type: 'player', value: this.from.playerId },
                { type: 'player', value: this.to.playerId },
            ],
        };
    }

    public getLog(data: MoveData): CustomString {
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

/** 交换牌 */
export class SwapCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<SwapCardsData>) {
        const swap = room.cast(SwapCardsData, data);
        if (swap.check()) {
            const up_cards = [...swap.cards1, ...swap.cards2].filter(
                (v) => v.put === CardPut.Up
            );
            const down_cards = [...swap.cards1, ...swap.cards2].filter(
                (v) => v.put === CardPut.Down
            );
            const to_process = await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: swap.player,
                                cards: up_cards,
                                puttype: CardPut.Up,
                                toArea: room.processingArea,
                                reason: MoveCardReason.Swap,
                                animation: false,
                            },
                            {
                                player: swap.player,
                                cards: down_cards,
                                puttype: CardPut.Down,
                                toArea: room.processingArea,
                                reason: MoveCardReason.Swap,
                                animation: false,
                            },
                        ],
                    },
                    swap.copy()
                )
            );
            const _swap = await room.moveCards(
                Object.assign(
                    {
                        move_datas: [
                            {
                                player: swap.player,
                                cards: swap.cards1,
                                toArea: swap.toArea1,
                                reason: MoveCardReason.Swap,
                                animation: true,
                            },
                            {
                                player: swap.player,
                                cards: swap.cards2,
                                toArea: swap.toArea2,
                                reason: MoveCardReason.Swap,
                                animation: true,
                            },
                        ],
                        getMoveLabel: (data: MoveData) => {
                            return swap.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return swap.getLog(data);
                        },
                    },
                    swap.copy()
                )
            );
            return {
                to_process,
                swap: _swap,
            };
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 第一叠牌 */
    cards1: GameCard[] = [];
    /** 第二叠牌 */
    cards2: GameCard[] = [];
    /** 第一叠牌的目标区域 */
    toArea1: Area;
    /** 第二叠牌的目标区域 */
    toArea2: Area;

    public check(): boolean {
        if (!this.cards1 || !this.cards2) return false;
        if (!this.toArea1 || !this.toArea2) return false;
        if (this.cards1.length === 0 && this.cards2.length === 0) return false;
        return true;
    }

    public getMoveLabel(data: MoveData): CustomString {
        return '';
    }

    public getLog(data: MoveData): CustomString {
        return '';
    }
}

/** 亮出牌 */
export class FlashCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<FlashCardsData>) {
        const flash = room.cast(FlashCardsData, data);
        if (flash.check()) {
            const draw_cards: GameCard[] = [];
            const other_cards: GameCard[] = [];
            flash.cards.forEach((v) => {
                if (v.area === room.drawArea) {
                    draw_cards.push(v);
                } else {
                    room.propertyChanges.push(['card', v.id, 'flash', true]);
                    other_cards.push(v);
                }
            });
            if (other_cards.length > 0) {
                const ani: MsgPlayCardMoveAni = {
                    type: 'MsgPlayCardMoveAni',
                    data: [],
                };
                other_cards.forEach((v) => {
                    const _data = ani.data.find(
                        (d) => d.fromArea === v.area.areaId
                    );
                    if (_data) (_data.cards as string[]).push(v.id);
                    else
                        ani.data.push({
                            cards: [v.id],
                            fromArea: v.area.areaId,
                            toArea: room.processingArea.areaId,
                            movetype: CardPut.Up,
                            puttype: CardPut.Up,
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
                await room.moveCards(
                    Object.assign(
                        {
                            move_datas: [
                                {
                                    player: flash.player,
                                    cards: draw_cards,
                                    toArea: room.processingArea,
                                    reason: MoveCardReason.PutTo,
                                    movetype: CardPut.Up,
                                    puttype: CardPut.Up,
                                },
                            ],
                            getMoveLabel: (data: MoveData) => {
                                return flash.getMoveLabel(data);
                            },
                            // log: (data: MoveData) => {
                            //     return flash.getLog(data);
                            // },
                        },
                        flash.copy()
                    )
                );
            }
            return flash;
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 亮出的牌 */
    cards: GameCard[] = [];

    public check(): boolean {
        if (!this.cards) return false;
        return this.cards.length > 0;
    }

    public getMoveLabel(data: MoveData): CustomString {
        if (this.player) {
            return {
                text: '#Move_Flash1',
                values: [{ type: 'player', value: this.player.playerId }],
            };
        } else {
            return '#Move_Flash2';
        }
    }

    public getLog(data: MoveData): CustomString {
        return '';
    }
}

/** 展示牌 */
export class ShowCardsData extends EventData {
    static async exec(room: GameRoom, data: HandleData<ShowCardsData>) {
        const show = room.cast(ShowCardsData, data);
        if (show.check()) {
            const ani: MsgPlayCardMoveAni = {
                type: 'MsgPlayCardMoveAni',
                data: [],
            };
            const down_cards = show.cards.filter((v) => v.put === CardPut.Down);
            down_cards.forEach((v) => v.turnTo(CardPut.Up));
            show.cards.forEach((v) => {
                const _data = ani.data.find(
                    (d) => d.fromArea === v.area.areaId
                );
                if (_data) (_data.cards as string[]).push(v.id);
                else
                    ani.data.push({
                        cards: [v.id],
                        fromArea: v.area.areaId,
                        toArea: room.processingArea.areaId,
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
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
            down_cards.forEach((v) => v.turnTo(CardPut.Down));
            room.broadcast({ type: 'None' });
            return show;
        }
    }
    /** 操作的角色 */
    player: GamePlayer;
    /** 展示的牌 */
    cards: GameCard[] = [];

    public check(): boolean {
        if (!this.cards) return false;
        return this.cards.length > 0;
    }

    public getMoveLabel(data: MoveData): CustomString {
        if (this.player) {
            return {
                text: '#Move_Show1',
                values: [{ type: 'player', value: this.player.playerId }],
            };
        } else {
            return '#Move_Show2';
        }
    }

    public getLog(data: MoveData): CustomString {
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

/** 移除牌 */
export class RemoveCardData extends EventData {
    static async exec(room: GameRoom, data: HandleData<RemoveCardData>) {
        const puto = room.cast(RemoveCardData, data);
        if (puto.check()) {
            const data: MoveData = {
                player: puto.player,
                cards: puto.cards,
                toArea: room.reserveArea,
                reason: MoveCardReason.PutTo,
                movetype: puto.movetype,
                puttype: puto.puttype,
                animation: puto.animation,
                moveVisibles: puto.moveVisibles,
                cardVisibles: puto.cardVisibles,
            };
            const move = await room.moveCards(
                Object.assign(
                    {
                        move_datas: [data],
                        getMoveLabel: (data: MoveData) => {
                            return puto.getMoveLabel(data);
                        },
                        log: (data: MoveData) => {
                            return puto.getLog(data);
                        },
                    },
                    puto.copy()
                )
            );
            const bagong = room.getEffect(
                room.getMark<number>('#bagongbizhengshu')
            );
            if (bagong && bagong.isOpen() && bagong.check()) {
                return [move];
            }
            let move2: MoveCardEvent;
            const cards = room.reserveArea.cards.filter(
                (v) => v.put === CardPut.Up
            );
            const execute = puto.skill?.player ?? puto.player;
            if (cards.length > Math.min(8, room.playerCount)) {
                if (execute) {
                    const req = await room.doRequest({
                        player: execute,
                        get_selectors: {
                            selectorId:
                                room.base_selectors.getSelectorName(
                                    'remove_handle'
                                ),
                            context: {
                                effect: room.base_selectors,
                                count:
                                    cards.length -
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
                } else {
                    const _cards = cards.slice(
                        0,
                        cards.length - Math.min(8, room.playerCount)
                    );
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

    /** 操作的角色 */
    player: GamePlayer;
    /** 需要移动的牌 */
    cards: GameCard[] = [];
    /** 移动方式 */
    movetype?: CardPut;
    /** 放置方式 */
    puttype?: CardPut;
    /** 是否播放动画 */
    animation?: boolean = true;
    /** 移动动画可见角色 */
    moveVisibles?: GamePlayer[];
    /** 移动后牌的可见角色 */
    cardVisibles?: GamePlayer[];

    public getMoveLabel(data: MoveData): CustomString {
        return {
            text: '#Move_Remove',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'string', value: this.reason },
            ],
        };
    }

    public getLog(data: MoveData): CustomString {
        return {
            text: '#RemoveCard',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'number', value: data.cards.length },
                { type: '[carddata]', value: this.room.getCardIds(data.cards) },
            ],
        };
    }

    public check(): boolean {
        return this.cards.length > 0;
    }
}
