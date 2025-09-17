import { CustomString } from '../../custom/custom.type';
import { GamePlayer } from '../../player/player';
import { GameRoom } from '../../room/room';
import { MoveCardReason } from '../../room/room.types';
import { EventProcess } from '../event';
import { DamageType, HandleData } from '../event.types';
import { EventTriggers, Triggers } from '../triggers';
import { ReduceHpEvent } from './event.damage';
import { DropCardsData, MoveData, PutToCardsData } from './event.move';

/**
 * 濒死事件
 */
export class DyingEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<DyingEvent>) {
        return room.dying(data);
    }

    /** 濒死的角色*/
    player: GamePlayer;

    protected async init(): Promise<void> {
        super.init();
        this.eventTriggers = [
            EventTriggers.EntryDying,
            EventTriggers.EntryDyinged,
            EventTriggers.Dying,
        ];
        this.endTriggers = [EventTriggers.DyingEnd];
        this.player.setProperty('indying', this.eventId);
        this.room.sendLog({
            text: '#Dying',
            values: [
                { type: 'player', value: this.player.playerId },
                { type: 'number', value: 1 - this.player.hp },
            ],
        });
        this.room.insertHistory(this);
    }

    protected async [`${EventTriggers.Dying}_Before`]() {
        this.triggerNot = true;
        await this.room.trigger(EventTriggers.Dying, this, undefined, () => {
            return this.check_event();
        });
    }

    protected async [`${EventTriggers.Dying}_After`]() {
        this.player.setProperty('indying', -this.eventId);
        this.triggerNot = false;
        if (this.player.hp <= 0) {
            await this.room.die({
                player: this.player,
                source: this,
                reason: 'die_dying',
            });
        }
    }

    public check_event(): boolean {
        if (this.player.hp > 0 && this.player.indying === this.eventId) {
            this.player.setProperty('indying', -this.eventId);
        }
        return this.player.hp <= 0;
    }

    public check(): boolean {
        return this.player && this.player.alive;
    }

    public getDamage() {
        if (
            this.source instanceof ReduceHpEvent &&
            this.reason === 'dying_reducehp'
        ) {
            return this.source.getDamage();
        }
    }
}

/**
 * 死亡事件
 */
export class DieEvent extends EventProcess {
    static async exec(room: GameRoom, data: HandleData<DieEvent>) {
        return room.die(data);
    }

    /** 濒死的角色*/
    player: GamePlayer;
    /** 击杀者 */
    killer: GamePlayer;

    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.BeforeDeath,
            EventTriggers.ConfirmRole,
            EventTriggers.Death,
            EventTriggers.Deathed,
        ];
        this.endTriggers = [EventTriggers.DieEnd];

        this.player.setProperty('headOpen', true);
        this.player.setProperty('deputyOpen', true);
        this.room.insertHistory(this);
    }

    protected async [`${EventTriggers.BeforeDeath}_After`]() {
        this.player.setProperty('death', true);
        this.player.definWarsKindom();
        for (const skill of this.room.skills) {
            if (
                skill.sourceGeneral === this.player.head ||
                skill.sourceGeneral === this.player.deputy
            ) {
                await skill.handle();
            }
        }

        const killer = this.getDamage()?.from;
        this.killer = killer;

        let log: CustomString;
        if (killer === this.player) {
            log = {
                text: '#Death1',
                values: [{ type: 'player', value: killer.playerId }],
            };
        } else if (killer) {
            log = {
                text: '#Death3',
                values: [
                    { type: 'player', value: killer.playerId },
                    { type: 'player', value: this.player.playerId },
                ],
            };
        } else {
            log = {
                text: '#Death2',
                values: [{ type: 'player', value: this.player.playerId }],
            };
        }
        this.room.broadcast({
            type: 'None',
            log,
            // audio: this.player.getMainGeneral()?.getAssetsUrl('death'),
            audio: {
                type: 'death',
                player: this.player.playerId,
            },
        });
    }

    protected async [`${EventTriggers.Death}_After`]() {
        //将手牌和装备牌弃置
        const drop = this.room.createEventData(DropCardsData, {
            player: this.player,
            cards: [
                ...this.player.handArea.cards,
                ...this.player.equipArea.cards,
            ],
            source: this,
            reason: 'die_handle',
        });
        await this.room.moveCards({
            move_datas: [
                {
                    player: this.player,
                    cards: [
                        ...this.player.handArea.cards,
                        ...this.player.equipArea.cards,
                    ],
                    toArea: this.room.discardArea,
                    reason: MoveCardReason.DisCard,
                },
            ],
            getMoveLabel: (data: MoveData) => {
                return drop.getMoveLabel(data);
            },
            log: (data: MoveData) => {
                return drop.getLog(data);
            },
            source: this,
            reason: 'die_handle',
        });
        //清除所有牌面信息
        if (this.player.rest === 0) {
            Object.keys(this.player._mark).forEach((v) => {
                if (
                    v !== '__offline' &&
                    v !== '__trustship' &&
                    v !== '__escape' &&
                    v.at(0) !== '$'
                ) {
                    this.player.removeMark(v);
                }
            });
            this.player.upArea.cards.forEach((v) => {
                if (v.hasMark('$not_die_handle')) {
                    v.removeAllMark();
                }
            });
            this.player.sideArea.cards.forEach((v) => {
                if (v.hasMark('$not_die_handle')) {
                    v.removeAllMark();
                }
            });
            this.player.upArea.generals.forEach((v) => {
                if (v.hasMark('$not_die_handle')) {
                    v.removeAllMark();
                }
            });
            this.player.sideArea.generals.forEach((v) => {
                if (v.hasMark('$not_die_handle')) {
                    v.removeAllMark();
                }
            });
        }
        //判定区，武将牌上，武将牌旁置入弃牌堆
        const putto = this.room.createEventData(PutToCardsData, {
            player: this.player,
            cards: [
                ...this.player.judgeArea.cards,
                ...this.player.upArea.cards,
                ...this.player.sideArea.cards,
            ],
            toArea: this.room.discardArea,
            source: this,
            reason: 'die_handle',
        });
        await this.room.moveCards({
            move_datas: [
                {
                    cards: [
                        ...this.player.judgeArea.cards,
                        ...this.player.upArea.cards,
                        ...this.player.sideArea.cards,
                    ],
                    toArea: this.room.discardArea,
                    reason: MoveCardReason.PutTo,
                },
            ],
            getMoveLabel: (data: MoveData) => {
                return putto.getMoveLabel(data);
            },
            log: (data: MoveData) => {
                return putto.getLog(data);
            },
            source: this,
            reason: 'die_handle',
        });

        //复原武将牌
        if (this.player.chained) {
            this.player.setProperty('chained', false);
            this.room.broadcast({
                type: 'MsgPlayFaceAni',
                player: this.player.playerId,
                ani: 'chain',
                data: {
                    to_state: false,
                    damage_type: DamageType.None,
                },
            });
        }
        if (this.player.skip) {
            this.player.setProperty('skip', false);
        }

        if (this.player.rest === 0) {
            //所有武将牌加入武将牌堆
            // this.player.handArea.remove([this.player.head, this.player.deputy]);
            const up_generals = this.player.upArea.generals.filter(
                (v) => !v.hasMark('$not_die_handle')
            );
            this.player.upArea.remove(up_generals);
            const side_generals = this.player.sideArea.generals.filter(
                (v) => !v.hasMark('$not_die_handle')
            );
            this.player.sideArea.remove(up_generals);
            this.room.generalArea.add([
                // this.player.head,
                // this.player.deputy,
                ...up_generals,
                ...side_generals,
            ]);
        }
    }
    protected async [`${EventTriggers.Deathed}_After`]() {
        if (this.room.mode.name === 'wars') {
            if (this.player.head?.isLord()) {
                this.room.setData(`lord_${this.player.head.kingdom}_die`, true);
                this.room.removeData(`lord_${this.player.head.kingdom}`);
                this.room.players.forEach((v) => {
                    if (
                        v.kingdom === this.player.head.kingdom &&
                        v !== this.player
                    ) {
                        v.setProperty('kingdom', `ye_${v.kingdom}`);
                    }
                });
            }
        }
    }

    protected async [`${EventTriggers.DieEnd}_After`]() {
        if (this.player.death && this.player.rest === 0) {
            //失去所有技能
            while (true) {
                const skill = this.room.skills.find(
                    (v) => v.player === this.player
                );
                if (skill) {
                    await skill.removeSelf();
                } else {
                    break;
                }
            }
        }
    }

    public check(): boolean {
        return this.player && this.player.alive;
    }

    public async trigger_func(trigger: Triggers): Promise<void> {
        this.trigger = trigger;
        this.triggerable = true;
        const before = (this as any)[`${trigger}_Before`];
        const after = (this as any)[`${trigger}_After`];
        if (before && typeof before === 'function') {
            await before.call(this);
        }
        if (this.triggerable && !this.triggerNot) {
            await this.room.trigger(trigger, this, this.room.players);
        }
        if (after && typeof after === 'function') {
            await after.call(this);
        }
    }

    public getDamage() {
        if (this.source instanceof DyingEvent && this.reason === 'die_dying') {
            return this.source.getDamage();
        }
    }
}
