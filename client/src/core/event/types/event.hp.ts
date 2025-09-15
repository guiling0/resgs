import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { StateEffectType } from '../../skill/skill.types';
import { EventProcess } from '../event';
import { HandleData } from '../event.types';
import { EventTriggers } from '../triggers';

/** 回复体力事件 */
export class RecoverHpEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<RecoverHpEvent>) {
        return room.recoverhp(data);
    }

    /** 回复体力的角色 */
    player: GamePlayer;
    /** 回复体力的数值 */
    number: number = 1;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.RecoverHpStart,
            EventTriggers.RecoverHpAfter,
        ];
        this.endTriggers = [EventTriggers.RecoverHpEnd];
    }

    protected async [`${EventTriggers.RecoverHpAfter}_Before`]() {
        this.player.changeHp(this.player.hp + this.number);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.player.playerId,
            ani: 'recover',
            log: {
                text: '#RecoverHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            },
        });
        this.room.insertHistory(this);
    }

    public check_event(): boolean {
        return this.player.alive;
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        if (!lodash.isNumber(this.number) || this.number <= 0) return false;
        if (
            this.room
                .getStates(StateEffectType.Prohibit_RecoverHp, [
                    this.player,
                    this.number,
                    this.reason,
                ])
                .some((v) => v)
        ) {
            return false;
        }
        const y = this.player.losshp;
        if (y === 0) return false;
        if (y >= this.number) return true;
        if (y < this.number) {
            this.number = y;
            return true;
        }
    }
}

/** 体力上限改变事件 */
export class ChangeMaxHpEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<ChangeMaxHpEvent>) {
        return room.changeMaxHp(data);
    }
    /** 改变体力上限的角色 */
    player: GamePlayer;
    /** 改变体力上限的数值 */
    number: number = 1;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.MaxHpChangeStart,
            EventTriggers.MaxHpChangeAfter,
        ];
        this.endTriggers = [EventTriggers.MaxHpChangeEnd];
    }

    protected async [`${EventTriggers.MaxHpChangeAfter}_Before`]() {
        const newhpmax = Math.max(0, this.player.maxhp + this.number);
        this.player.setProperty('maxhp', newhpmax);
        if (this.player.hp > newhpmax) {
            this.player.changeHp(newhpmax);
        }
        if (this.number > 0) {
            this.room.sendLog({
                text: '#IncreaseMaxHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            });
        }
        if (this.number < 0) {
            this.room.sendLog({
                text: '#ReduceMaxHp',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'number', value: this.number },
                    { type: 'number', value: this.player.hp },
                    { type: 'number', value: this.player.maxhp },
                ],
            });

            if (this.player.maxhp <= 0) {
                this.isEnd = true;
                await this.room.die({
                    player: this.player,
                    source: this,
                    reason: 'die_reducehpmax',
                });
            }
        }
        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        return this.number !== 0;
    }
}
