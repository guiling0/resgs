import { CardAni } from '../../ani.config';
import { GameCard } from '../../card/card';
import { VirtualCardData } from '../../card/card.types';
import { GameState } from '../../enums';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { MoveCardReason } from '../../room/room.types';
import { EventProcess } from '../event';
import { HandleData } from '../event.types';
import { EventTriggers } from '../triggers';
import { MoveData } from './event.move';

/** 判定事件 */
export class JudgeEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<JudgeEvent>) {
        return room.judge(data);
    }
    /** 进行判定的角色 */
    player: GamePlayer;
    /** 判定牌 */
    card?: GameCard;
    /** 判定结果 */
    result?: VirtualCardData;
    /** 判定是否成功 */
    success?: boolean = false;
    /** 是否成功 */
    isSucc?: (result: VirtualCardData) => boolean;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.Judge,
            EventTriggers.BeJudgeCard,
            EventTriggers.JudgeResult1,
            EventTriggers.JudgeResult2,
            EventTriggers.JudgeResulted1,
            EventTriggers.JudgeResulted2,
        ];
        this.endTriggers = [EventTriggers.JudgeEnd];
    }

    protected async [`${EventTriggers.Judge}_After`]() {
        if (!this.card) {
            const card = await this.room.getNCards(1);
            await this.room.moveCards({
                move_datas: [
                    {
                        cards: card,
                        toArea: this.room.processingArea,
                        reason: MoveCardReason.Judge,
                    },
                ],
                getMoveLabel: (data: MoveData) => {
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

    protected async [`${EventTriggers.JudgeResulted1}_Before`]() {
        this.success = this.isSucc?.call(this, this.result);
        this.room.broadcast({
            type: 'MsgPlayCardAni',
            card: this.card.id,
            ani: this.success ? CardAni.PandingGood : CardAni.PandingBad,
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

    public async setCard(card: GameCard) {
        if (this.card) {
            this.room.broadcast({
                type: 'MsgPlayCardAni',
                card: this.card.id,
                ani: CardAni.None,
                only_process: true,
            });
            //有判定牌把原先的判定牌置入弃牌堆
            if (this.card.area === this.room.processingArea) {
                await this.room.moveCards({
                    move_datas: [
                        {
                            cards: [this.card],
                            toArea: this.room.discardArea,
                            reason: MoveCardReason.PutTo,
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
            ani: this.success ? CardAni.PrePandingGood : CardAni.PrePandingBad,
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
    public resetSuccess() {
        this.success = this.isSucc?.call(this, this.result) ?? true;
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        return true;
    }

    public async processCompleted() {
        if (this.room.gameState !== GameState.Gaming) return;
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
        if (
            !notMoveHandle &&
            this.card &&
            this.card.area === this.room.processingArea
        ) {
            await this.room.moveCards({
                move_datas: [
                    {
                        cards: [this.card],
                        toArea: this.room.discardArea,
                        reason: MoveCardReason.PutTo,
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
                    await this.room.trigger(EventTriggers.Opened, open);
                }
                //若事件列表中没有事件，通知客户端删除UI处理区里的所有牌
                this.room.setProperty(
                    'clearUiProcessArea',
                    this.room.clearUiProcessArea + 1
                );
            }
        }
    }
}
