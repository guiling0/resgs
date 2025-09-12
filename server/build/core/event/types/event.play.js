"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCardEvent = exports.PrePlayCardData = exports.NeedPlayCardData = void 0;
const data_1 = require("../data");
const event_1 = require("../event");
class NeedPlayCardData extends data_1.EventData {
    /** 检测是否是否包含指定的牌 */
    has(name) {
        return !!this.cards.find((v) => v === name);
    }
}
exports.NeedPlayCardData = NeedPlayCardData;
class PrePlayCardData extends data_1.EventData {
}
exports.PrePlayCardData = PrePlayCardData;
class PlayCardEvent extends event_1.EventProcess {
    async init() {
        await super.init();
        this.eventTriggers = ["CardBePlay" /* EventTriggers.CardBePlay */];
        this.endTriggers = ["PlayCardEnd" /* EventTriggers.PlayCardEnd */];
        let viewas;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: 3 /* MoveCardReason.Play */,
                    animation: true,
                    viewas,
                    label: {
                        text: '#Move_Play',
                        values: [{ type: 'player', value: this.from.playerId }],
                    },
                },
            ],
            source: this,
            reason: 'play',
        });
        //客户端播放相关动画
        if (this.card.subcards.length === 0) {
            this.room.broadcast({
                type: 'MsgPlayCardMoveAni',
                data: [
                    {
                        cards: [this.card.vdata],
                        fromArea: this.from.handArea.areaId,
                        toArea: this.room.processingArea.areaId,
                        movetype: 1 /* CardPut.Up */,
                        puttype: 1 /* CardPut.Up */,
                        animation: true,
                        moveVisibles: [],
                        cardVisibles: [],
                        isMove: false,
                        label: {
                            text: '#Move_Play',
                            values: [
                                { type: 'player', value: this.from.playerId },
                            ],
                        },
                    },
                ],
            });
        }
        const a = this.from.getCardUseAniAndAudio(this.card.sourceData);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.from.playerId,
            ani: a.ani_name,
            audio: this.card.transform || this.skill ? undefined : a.audio_url,
            log: {
                text: '#PlayCard',
                values: [
                    { type: 'player', value: this.from.playerId },
                    { type: 'vcard', value: this.card.vdata },
                ],
            },
        });
        this.room.insertHistory(this);
    }
}
exports.PlayCardEvent = PlayCardEvent;
