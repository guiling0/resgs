"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PindianEvent = void 0;
const skill_types_1 = require("../../skill/skill.types");
const event_1 = require("../event");
/** 拼点事件 */
class PindianEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 拼点目标 */
        this.targets = [];
        /** 拼点的牌 */
        this.cards = new Map();
        /** 没赢的角色 */
        this.lose = [];
        /** 拼点弹窗 */
        this.windowId = 0;
        /** 当前结算角色ID */
        this.currentId = 0;
    }
    static async exec(room, data) {
        return room.pindian(data);
    }
    /** 当前结算角色 */
    get current() {
        return this.targets[this.currentId - 1];
    }
    async init() {
        await super.init();
        this.eventTriggers = ["Pindian" /* EventTriggers.Pindian */, "PindianShow" /* EventTriggers.PindianShow */];
        this.endTriggers = ["PindianEnd" /* EventTriggers.PindianEnd */];
        if (this.targets.length > 1) {
            this.room.sortResponse(this.targets);
        }
        if (!this.cards.has(this.from)) {
            this.cards.set(this.from, undefined);
        }
        this.targets.forEach((v) => {
            if (!this.cards.has(v)) {
                this.cards.set(v, undefined);
            }
        });
        const window = this.room.window({
            create: true,
            data: {
                type: 'items',
                datas: [
                    {
                        title: '#hide',
                        items: [...this.cards.keys()].map((v) => {
                            const card = this.cards.get(v);
                            return {
                                title: {
                                    text: '##player',
                                    values: [
                                        {
                                            type: 'player',
                                            value: v.playerId,
                                        },
                                    ],
                                },
                                card: this.cards.get(v)?.id,
                            };
                        }),
                    },
                ],
            },
            options: {
                title: this.reason,
            },
        });
        this.windowId = window;
        this.room.insertHistory(this);
        this.room.sendLog({
            text: '#PindianStart',
            values: [
                { type: 'player', value: this.from.playerId },
                {
                    type: '[player]',
                    value: this.room.getPlayerIds(this.targets),
                },
                { type: 'string', value: this.reason },
            ],
        });
    }
    async [`${"Pindian" /* EventTriggers.Pindian */}_After`]() {
        //所有人共同选择拼点牌
        const reqs = await this.room.doRequestAll([...this.cards.keys()]
            .map((v) => {
            if (!this.cards.get(v)) {
                return {
                    player: v,
                    get_selectors: {
                        selectorId: this.room.base_selectors.getSelectorName('choose_pindian'),
                        context: {
                            effect: this.room.base_selectors,
                            from: v,
                            options: this.reqOptions,
                        },
                    },
                };
            }
        })
            .filter((v) => v));
        //赋值拼点牌
        reqs.forEach((v) => {
            if (v) {
                const result = v.result.results.card.result;
                this.cards.set(v.player, result.at(0));
            }
        });
        //将所有牌同时置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: [...this.cards.values().filter((v) => v)],
                    toArea: this.room.processingArea,
                    reason: 8 /* MoveCardReason.Pindian */,
                    animation: false,
                    puttype: 2 /* CardPut.Down */,
                },
            ],
            source: this,
            reason: 'pindian',
        });
    }
    async [`${"PindianShow" /* EventTriggers.PindianShow */}_Before`]() {
        //将所有拼点牌亮出
        this.cards.forEach((v, k) => {
            v.turnTo(1 /* CardPut.Up */);
            this.room.sendLog({
                text: '#PindianCard',
                values: [
                    { type: 'player', value: k.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'carddata', value: v.id },
                ],
            });
        });
        const datas = {
            type: 'items',
            datas: [
                {
                    title: '#hide',
                    items: [...this.cards.keys()].map((v) => {
                        const card = this.cards.get(v);
                        return {
                            title: {
                                text: '##player',
                                values: [
                                    {
                                        type: 'player',
                                        value: v.playerId,
                                    },
                                ],
                            },
                            card: this.cards.get(v)?.id,
                        };
                    }),
                },
            ],
        };
        //刷新窗口数据
        this.room.window({
            options: {
                title: this.reason,
                id: this.windowId,
            },
            data: datas,
        });
        this.cards.forEach((v, k) => {
            v.setLabel({
                text: '#Move_Pindian',
                values: [
                    { type: 'player', value: k.playerId },
                    {
                        type: 'string',
                        value: this.reason,
                    },
                ],
            }, true);
        });
        for (let i = 0; i < this.targets.length; i++) {
            this.insert(["PindianResulted" /* EventTriggers.PindianResulted */]);
        }
    }
    async [`${"PindianResulted" /* EventTriggers.PindianResulted */}_Before`]() {
        this.currentId++;
        const card1 = this.cards.get(this.from);
        const card2 = this.cards.get(this.current);
        this.lose = [];
        if (card1 && card2) {
            const _cards = new Map();
            _cards.set(this.from, card1);
            _cards.set(this.current, card2);
            const state = this.room
                .getStates(skill_types_1.StateEffectType.Regard_PindianResult, [
                _cards,
                this.reason,
            ])
                .filter((v) => v)
                .at(-1);
            if (state) {
                if (Array.isArray(state)) {
                    if (state.length === 0) {
                        this.lose.push(this.from, this.current);
                    }
                    else {
                        if (state.includes(this.current)) {
                            this.lose.push(this.current);
                        }
                        else {
                            this.win = this.current;
                        }
                        if (state.includes(this.from)) {
                            this.lose.push(this.from);
                        }
                        else {
                            this.win = this.from;
                        }
                    }
                }
                else {
                    if (state === this.from) {
                        this.win = this.from;
                        this.lose.push(this.current);
                    }
                    if (state === this.current) {
                        this.win = this.current;
                        this.lose.push(this.from);
                    }
                }
            }
            else {
                let number1 = card1.number, number2 = card2.number;
                if (number1 > 13)
                    number1 = 13;
                if (number1 < 1)
                    number1 = 1;
                if (number2 > 13)
                    number2 = 13;
                if (number2 < 1)
                    number2 = 1;
                if (number1 > number2) {
                    this.win = this.from;
                    this.lose.push(this.current);
                }
                else if (number1 < number2) {
                    this.win = this.current;
                    this.lose.push(this.from);
                }
                else {
                    this.win = undefined;
                    this.lose.push(this.from, this.current);
                }
            }
            //结果
            if (this.win) {
                this.room.sendLog({
                    text: '#PindianResult',
                    values: [
                        { type: 'player', value: this.from.playerId },
                        { type: 'player', value: this.current.playerId },
                        { type: 'string', value: this.reason },
                        { type: 'player', value: this.win.playerId },
                    ],
                });
            }
            else {
                this.room.sendLog({
                    text: '#PindianResult',
                    values: [
                        { type: 'player', value: this.from.playerId },
                        { type: 'player', value: this.current.playerId },
                        { type: 'string', value: this.reason },
                        { type: 'string', value: '#not_win' },
                    ],
                });
            }
            //赢的卡牌播放动画
            const win_card = this.cards.get(this.win);
            if (win_card) {
                this.room.broadcast({
                    type: 'MsgPlayCardAni',
                    ani: 6 /* CardAni.PindianWin */,
                    card: win_card.id,
                    only_process: true,
                });
            }
            //没赢的卡牌播放动画
            const lose_cards = this.lose.map((v) => this.cards.get(v));
            if (lose_cards.length > 0) {
                lose_cards.forEach((v) => {
                    this.room.broadcast({
                        type: 'MsgPlayCardAni',
                        ani: 7 /* CardAni.PindianLose */,
                        card: v.id,
                        only_process: true,
                    });
                });
            }
        }
        await this.room.delay(3);
        if (this.eventTriggers.length === 0) {
            this.room.window({
                close: true,
                options: { id: this.windowId },
            });
        }
    }
    setCard(player, card) {
        if (this.cards.has(player)) {
            this.cards.set(player, card);
        }
    }
    check() {
        if (!this.from || this.from.death)
            return false;
        if (!this.targets)
            return false;
        this.targets = this.targets.filter((v) => v && v.alive && v !== this.from && v.hasHandCards());
        if (this.targets.length === 0)
            return false;
        return this.from.canPindian(this.targets, this.reason);
    }
    async processCompleted() {
        if (this.room.gameState !== 1 /* GameState.Gaming */)
            return;
        this.isEnd = this.isComplete = true;
        const history = this.room.historys.findLast((v) => v.data === this);
        if (history) {
            history.endIndex = this.room.historys.length;
        }
        let notMoveHandle = false;
        if (typeof this.notMoveHandle === 'function') {
            notMoveHandle = this.notMoveHandle(this) ?? false;
        }
        if (typeof this.notMoveHandle === 'boolean') {
            notMoveHandle = this.notMoveHandle ?? false;
        }
        if (!notMoveHandle) {
            await this.room.moveCards({
                move_datas: [...this.cards.keys()].map((v) => {
                    const card = this.cards.get(v);
                    if (card && card.area === this.room.processingArea) {
                        return {
                            player: v,
                            cards: [card],
                            toArea: this.room.discardArea,
                            reason: 1 /* MoveCardReason.PutTo */,
                            animation: true,
                            label: {
                                text: '#Move_Pindian',
                                values: [
                                    { type: 'player', value: v.playerId },
                                    {
                                        type: 'string',
                                        value: this.reason,
                                    },
                                ],
                            },
                        };
                    }
                    else {
                        return {
                            cards: [],
                            toArea: this.room.discardArea,
                            reason: 1 /* MoveCardReason.PutTo */,
                        };
                    }
                }),
                source: this,
                reason: 'process',
            });
        }
        if (this.room.events.includes(this)) {
            lodash.remove(this.room.events, (c) => c === this);
            if (this.room.events.length === 0) {
                //若事件列表中没有事件，进行明置后处理
                while (this.room.opens.length > 0) {
                    const open = this.room.opens.shift();
                    await this.room.trigger("Opened" /* EventTriggers.Opened */, open);
                }
                //若事件列表中没有事件，通知客户端删除UI处理区里的所有牌
                this.room.setProperty('clearUiProcessArea', this.room.clearUiProcessArea + 1);
            }
        }
    }
}
exports.PindianEvent = PindianEvent;
