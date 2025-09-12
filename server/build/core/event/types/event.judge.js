"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeEvent = void 0;
const event_1 = require("../event");
/** 判定事件 */
class JudgeEvent extends event_1.EventProcess {
    constructor() {
        super(...arguments);
        /** 判定是否成功 */
        this.success = false;
    }
    static async exec(room, data) {
        return room.judge(data);
    }
    async init() {
        await super.init();
        this.eventTriggers = [
            "Judge" /* EventTriggers.Judge */,
            "BeJudgeCard" /* EventTriggers.BeJudgeCard */,
            "JudgeResult1" /* EventTriggers.JudgeResult1 */,
            "JudgeResult2" /* EventTriggers.JudgeResult2 */,
            "JudgeResulted1" /* EventTriggers.JudgeResulted1 */,
            "JudgeResulted2" /* EventTriggers.JudgeResulted2 */,
        ];
        this.endTriggers = ["JudgeEnd" /* EventTriggers.JudgeEnd */];
    }
    async [`${"Judge" /* EventTriggers.Judge */}_After`]() {
        if (!this.card) {
            const card = await this.room.getNCards(1);
            await this.room.moveCards({
                move_datas: [
                    {
                        cards: card,
                        toArea: this.room.processingArea,
                        reason: 13 /* MoveCardReason.Judge */,
                    },
                ],
                getMoveLabel: (data) => {
                    return {
                        text: '#Move_Judge',
                        values: [
                            { type: 'player', value: this.player.playerId },
                            { type: 'string', value: this.reason },
                        ],
                    };
                },
                source: this,
                reason: 'judge',
            });
            await this.setCard(card[0]);
            await this.room.delay(0.6, false);
        }
        this.room.insertHistory(this);
    }
    async [`${"JudgeResulted1" /* EventTriggers.JudgeResulted1 */}_Before`]() {
        this.success = this.isSucc?.call(this, this.result);
        this.room.broadcast({
            type: 'MsgPlayCardAni',
            card: this.card.id,
            ani: this.success ? 4 /* CardAni.PandingGood */ : 5 /* CardAni.PandingBad */,
            only_process: true,
            log: {
                text: this.success ? '#JudgeSuccess' : '#JudgeLose',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'vcard', value: this.result },
                ],
            },
        });
        await this.room.delay(0.5, false);
    }
    async setCard(card) {
        if (this.card) {
            this.room.broadcast({
                type: 'MsgPlayCardAni',
                card: this.card.id,
                ani: 0 /* CardAni.None */,
                only_process: true,
            });
            //有判定牌把原先的判定牌置入弃牌堆
            if (this.card.area === this.room.processingArea) {
                await this.room.moveCards({
                    move_datas: [
                        {
                            cards: [this.card],
                            toArea: this.room.discardArea,
                            reason: 1 /* MoveCardReason.PutTo */,
                            animation: false,
                        },
                    ],
                    source: this,
                    reason: 'change_judge',
                });
            }
        }
        this.card = card;
        const vcard = this.room.createVirtualCardByOne(this.card, false);
        this.result = vcard.vdata;
        this.success = this.isSucc?.call(this, this.result) ?? true;
        this.room.broadcast({
            type: 'MsgPlayCardAni',
            card: this.card.id,
            ani: this.success ? 2 /* CardAni.PrePandingGood */ : 3 /* CardAni.PrePandingBad */,
            only_process: true,
            log: {
                text: '#JudgeCard',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: this.reason },
                    { type: 'carddata', value: card.id },
                ],
            },
        });
    }
    /** 重置判定是否成功 */
    resetSuccess() {
        this.success = this.isSucc?.call(this, this.result) ?? true;
    }
    check() {
        if (!this.player || this.player.death)
            return false;
        return true;
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
        if (!notMoveHandle &&
            this.card &&
            this.card.area === this.room.processingArea) {
            await this.room.moveCards({
                move_datas: [
                    {
                        cards: [this.card],
                        toArea: this.room.discardArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                        animation: false,
                    },
                ],
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
exports.JudgeEvent = JudgeEvent;
