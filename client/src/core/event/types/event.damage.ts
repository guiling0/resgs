import { FaceAni } from '../../ani.config';
import { VirtualCard } from '../../card/vcard';
import { CustomString } from '../../custom/custom.type';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { EventProcess } from '../event';
import { HandleData, DamageType } from '../event.types';
import { EventTriggers } from '../triggers';

/** 可以防止伤害的时机 */
const preventTriggers = [
    EventTriggers.DamageStart,
    EventTriggers.CauseDamage1,
    EventTriggers.CauseDamage2,
    EventTriggers.InflictDamage1,
    EventTriggers.InflictDamage2,
    EventTriggers.InflictDamage3,
];

/** 伤害事件 */
export class DamageEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<DamageEvent>) {
        return room.damage(data);
    }

    /** 伤害来源 */
    from?: GamePlayer;
    /** 受到伤害的角色 */
    to: GamePlayer;
    /** 伤害类型 */
    damageType?: DamageType = DamageType.None;
    /** 渠道的牌 */
    channel?: VirtualCard;
    /** 伤害值 */
    number: number = 1;
    /** 是否为连环伤害 */
    isChain: boolean = false;

    public triggerChain: boolean = false;

    protected async init(): Promise<void> {
        this.damageType = this.damageType ?? DamageType.None;
        await super.init();
        this.eventTriggers = [
            EventTriggers.DamageStart,
            EventTriggers.CauseDamage1,
            EventTriggers.CauseDamage2,
            EventTriggers.InflictDamage1,
            EventTriggers.InflictDamage2,
            EventTriggers.InflictDamage3,
            EventTriggers.CauseDamaged,
            EventTriggers.InflictDamaged,
        ];
        this.endTriggers = [EventTriggers.DamageEnd];
    }

    protected async [`${EventTriggers.CauseDamaged}_Before`]() {
        await this.room.reducehp({
            player: this.to,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.insertHistory(this);
    }

    protected async [`${EventTriggers.DamageEnd}_After`]() {
        if (this.triggerChain) {
            const players = this.room.playerAlives.filter((v) => v.chained);
            this.room.sortResponse(players);
            while (players.length > 0) {
                const player = players.shift();
                if (player.chained) {
                    await this.room.damage({
                        from: this.from,
                        to: player,
                        damageType: this.damageType,
                        channel: this.channel,
                        number: this.number,
                        isChain: true,
                        source: this,
                        reason: 'damage_chain',
                        skill: this.skill,
                    });
                }
            }
        }
    }

    public check_event(): boolean {
        if (this.from && this.from.death) {
            this.from = undefined;
        }
        return this.to.alive && this.number > 0;
    }

    public check(): boolean {
        return this.to && this.to.alive && this.number > 0;
    }

    /**
     * 防止伤害
     * @returns
     */
    public async prevent() {
        if (preventTriggers.includes(this.trigger as any)) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }

    /**
     * 转移伤害
     */
    public async transfer(to: GamePlayer) {
        if (preventTriggers.includes(this.trigger as any)) {
            if (to === this.to) return;
            await this.prevent();
            await this.room.damage({
                from: this.from,
                to,
                damageType: this.damageType,
                channel: this.channel,
                number: this.number,
                isChain: this.isChain,
                source: this.source,
                reason: this.reason,
                skill: this.skill,
            });
        }
        return this;
    }
}

/** 失去体力事件 */
export class LoseHpEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<LoseHpEvent>) {
        return room.losehp(data);
    }

    /** 失去体力的角色 */
    player: GamePlayer;
    /** 失去体力的数值 */
    number: number = 1;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [EventTriggers.LoseHpStart, EventTriggers.LoseHp];
        this.endTriggers = [EventTriggers.LoseHpEnd];
    }

    protected async [`${EventTriggers.LoseHp}_Before`]() {
        await this.room.reducehp({
            player: this.player,
            number: this.number,
            source: this,
            reason: 'reducehp',
        });
        this.room.insertHistory(this);
    }

    public check_event(): boolean {
        return this.player.alive;
    }

    public check(): boolean {
        return this.player.inthp >= this.number;
    }

    /**
     * 防止失去体力
     * @returns
     */
    public async prevent() {
        if (this.trigger === EventTriggers.LoseHpStart) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}

/** 扣减体力事件 */
export class ReduceHpEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<ReduceHpEvent>) {
        return room.reducehp(data);
    }

    /** 扣减体力的角色 */
    player: GamePlayer;
    /** 扣减体力的数值 */
    number: number;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.ReduceHpStart,
            EventTriggers.ReduceHp,
            EventTriggers.ReduceHpAfter,
        ];
        this.endTriggers = [EventTriggers.ReduceHpEnd];

        const damage = this.getDamage();
        if (
            damage &&
            this.player.chained &&
            damage.damageType !== DamageType.None
        ) {
            await this.room.chain({
                player: this.player,
                to_state: false,
                damageType: damage.damageType,
                source: this,
                reason: 'chain_conduct',
            });
            if (
                !damage.isChain &&
                this.room.getPlayerByFilter((v) => v.chained).length > 0
            ) {
                damage.triggerChain = true;
            }
        }
    }

    protected async [`${EventTriggers.ReduceHp}_After`]() {
        // this.player.changeHp(this.player.hp - this.number);

        const damage = this.getDamage();
        if (damage) {
            if (this.player.shield) {
                const s = this.player.shield - this.number;
                this.player.shield -= this.number;
                if (this.player.shield < 0) {
                    this.player.changeHp(
                        this.player.hp - this.player.shield * -1
                    );
                }
                this.player.setProperty('shield', this.player.shield);
            } else {
                this.player.changeHp(this.player.hp - this.number);
            }
            let log: CustomString;
            if (damage.from) {
                log = {
                    text: '#DamageLog1',
                    values: [
                        { type: 'player', value: damage.from.playerId },
                        { type: 'player', value: damage.to.playerId },
                        { type: 'number', value: damage.number },
                        {
                            type: 'string',
                            value: `damage${damage.damageType}`,
                        },
                        { type: 'number', value: damage.to.hp },
                        { type: 'number', value: damage.to.maxhp },
                    ],
                };
            } else {
                log = {
                    text: '#DamageLog2',
                    values: [
                        { type: 'player', value: damage.to.playerId },
                        { type: 'number', value: damage.number },
                        {
                            type: 'string',
                            value: `damage${damage.damageType}`,
                        },
                        { type: 'number', value: damage.to.hp },
                        { type: 'number', value: damage.to.maxhp },
                    ],
                };
            }
            this.room.broadcast({
                type: 'MsgPlayFaceAni',
                player: damage.to.playerId,
                ani: 'damage',
                audio: `./audio/system/damage${
                    this.number > 3 ? 3 : this.number
                }.mp3`,
                log,
            });
        }
        const lose = this.getLosehp();
        if (lose) {
            this.player.changeHp(this.player.hp - this.number);
            this.room.broadcast({
                type: 'MsgPlayFaceAni',
                player: this.player.playerId,
                ani: 'losehp',
                audio: './audio/system/losehp.mp3',
                log: {
                    text: '#LoseHp',
                    values: [
                        { type: 'player', value: lose.player.playerId },
                        { type: 'number', value: this.number },
                        { type: 'number', value: lose.player.hp },
                        { type: 'number', value: lose.player.maxhp },
                    ],
                },
            });
        }
        this.room.insertHistory(this);
    }

    protected async [`${EventTriggers.ReduceHpAfter}_After`]() {
        if (this.player.inthp <= 0) {
            await this.room.dying({
                player: this.player,
                source: this,
                reason: 'dying_reducehp',
            });
        }
    }

    public check_event(): boolean {
        return this.player.alive;
    }

    public check(): boolean {
        return this.player && this.player.alive;
    }

    /** 获取对应的伤害事件 */
    getDamage() {
        if (this.source instanceof DamageEvent && this.reason === 'reducehp') {
            return this.source;
        }
    }

    /** 获取对应的失去体力事件 */
    getLosehp() {
        if (this.source instanceof LoseHpEvent && this.reason === 'reducehp') {
            return this.source;
        }
    }
}
