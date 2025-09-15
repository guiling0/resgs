import { CardPut, VirtualCardData } from '../../card/card.types';
import { VirtualCard } from '../../card/vcard';
import { RequestOptionData } from '../../choose/choose.types';
import { GamePlayer } from '../../player/player';
import { MoveCardReason } from '../../room/room.types';
import { TriggerEffect } from '../../skill/effect';
import { Skill } from '../../skill/skill';
import { TriggerEffectContext } from '../../skill/skill.types';
import { EventData } from '../data';
import { EventProcess } from '../event';
import { EventTriggers } from '../triggers';

export class NeedPlayCardData extends EventData {
    /** 打出者 */
    from: GamePlayer;
    /** 需要打出的牌
     * @description 如果不提供这个属性，则它可以打出所有牌
     */
    cards: string[];
    /** 发起的打出牌询问的设置 */
    reqOptions?: RequestOptionData;
    /** 是否已经打出过牌 */
    played: PlayCardEvent;

    /** 检测是否是否包含指定的牌 */
    has(name: string) {
        return !!this.cards.find((v) => v === name);
    }
}

export class PrePlayCardData extends EventData {
    /** 打出者 */
    from: GamePlayer;
    /** 需要打出的牌
     * @description 该属性不能直接提供否则可能会导致不合法的打出牌。如果未确定打出的牌，则需要调用需要打出牌方法
     */
    can_play_cards?: string[];
    /** 可以使用的技能
     * @description 该属性不能直接提供否则可能会导致不合法的打出牌。如果未确定打出的牌，则需要调用需要打出牌方法
     */
    can_use_skills?: Map<TriggerEffect, TriggerEffectContext>;
    /** 确定的打出的牌 如果提供该属性，则会跳过客户端询问*/
    card: VirtualCard;
    /** 实体牌的选择标准及范围
     * @description 如不提供实体牌的选择标准及范围，则采用默认的标准和范围(手牌区里的一张与需要使用的牌同名的牌)。
     */
    cardSelector?: {
        selectorId: string;
        context: TriggerEffectContext;
    };
    /** 发起的打出牌询问的设置
     * 如果该打出不可取消，则会检测打出者能否按照cardSelector的方式打出牌，如果不能打出则不会询问
     */
    reqOptions?: RequestOptionData;
    /** 是否已经打出过牌 */
    played: PlayCardEvent;
    transform: TriggerEffect;
}

export class PlayCardEvent extends EventProcess {
    /** 打出者 */
    from: GamePlayer;
    /** 确定的打出的牌 */
    card: VirtualCard;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [EventTriggers.CardBePlay];
        this.endTriggers = [EventTriggers.PlayCardEnd];
        let viewas: VirtualCardData;
        if (this.card.transform || this.skill) {
            viewas = this.card.vdata;
        }
        //将所有实体牌置入处理区
        await this.room.moveCards({
            move_datas: [
                {
                    cards: this.card.subcards,
                    toArea: this.room.processingArea,
                    reason: MoveCardReason.Play,
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
                        movetype: CardPut.Up,
                        puttype: CardPut.Up,
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
