import { GameCard } from '../../card/card';
import { General } from '../../general/general';
import { Gender } from '../../general/general.type';
import { GamePlayer } from '../../player/player';
import { StateEffectType } from '../../skill/skill.types';
import { EventData } from '../data';
import { EventProcess } from '../event';
import { DamageType } from '../event.types';
import { EventTriggers } from '../triggers';

/** 牌状态改变事件 */
export abstract class StateChangeEvent extends EventProcess {
    protected async init(): Promise<void> {
        await super.init();
        this.eventTriggers = [
            EventTriggers.StateChange,
            EventTriggers.StateChanged,
        ];
        this.endTriggers = [EventTriggers.StateChangeEnd];
    }

    protected abstract StateChanged_Before(): Promise<void>;

    /**
     * 防止状态改变
     */
    public async prevent() {
        if (this.trigger === EventTriggers.StateChange) {
            this.isEnd = true;
            this.triggerable = false;
        }
        return this;
    }
}

/** 明置武将牌事件 */
export class OpenEvent extends StateChangeEvent {
    /** 明置的角色 */
    player: GamePlayer;
    /** 明置的武将牌 */
    generals: General[] = [];
    /** 是否明置了主将 */
    is_open_head: boolean = false;
    /** 是否明置了副将将 */
    is_open_deputy: boolean = false;

    protected async init(): Promise<void> {
        await super.init();
        if (this.generals.includes(this.player.head)) {
            this.is_open_head = true;
        }
        if (this.generals.includes(this.player.deputy)) {
            this.is_open_deputy = true;
        }
    }

    protected async StateChanged_Before(): Promise<void> {
        if (this.is_open_head) {
            this.player.setProperty('headOpen', true);
            this.room.sendLog({
                text: '#Open',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `head` },
                    {
                        type: 'string',
                        value: this.player.head.trueName,
                    },
                ],
            });
            for (const skill of this.room.skills) {
                if (skill.sourceGeneral === this.player.head) {
                    await skill.handle();
                }
            }
        }
        if (this.is_open_deputy) {
            this.player.setProperty('deputyOpen', true);
            this.room.sendLog({
                text: '#Open',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `deputy` },
                    {
                        type: 'string',
                        value: this.player.deputy.trueName,
                    },
                ],
            });
            for (const skill of this.room.skills) {
                if (skill.sourceGeneral === this.player.deputy) {
                    await skill.handle();
                }
            }
        }
        this.room.insertHistory(this);
        this.room.opens.push(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        const canopen = this.player.getCanOpenGenerals();
        let count = this.generals.length;
        this.generals = this.generals.filter((v) => canopen.includes(v));
        return this.generals.length === count;
    }
}

/** 暗置武将牌事件 */
export class CloseEvent extends StateChangeEvent {
    /** 暗置的角色 */
    player: GamePlayer;
    /** 暗置的武将牌 */
    generals: General[] = [];
    /** 是否暗置了主将 */
    is_close_head: boolean = false;
    /** 是否暗置了副将将 */
    is_close_deputy: boolean = false;

    protected async init(): Promise<void> {
        await super.init();
        if (this.generals.includes(this.player.head)) {
            this.is_close_head = true;
        }
        if (this.generals.includes(this.player.deputy)) {
            this.is_close_deputy = true;
        }
    }

    protected async StateChanged_Before(): Promise<void> {
        if (this.is_close_head) {
            this.player.setProperty('headOpen', false);
            this.room.sendLog({
                text: '#Close',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `head` },
                    {
                        type: 'string',
                        value: this.player.head.trueName,
                    },
                ],
            });
            this.room.skills.forEach((v) => {
                if (v.sourceGeneral === this.player.head) {
                    v.preshow = true;
                    v.handle();
                }
            });
        }
        if (this.is_close_deputy) {
            this.player.setProperty('deputyOpen', false);
            this.room.sendLog({
                text: '#Close',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: `deputy` },
                    {
                        type: 'string',
                        value: this.player.deputy.trueName,
                    },
                ],
            });
            this.room.skills.forEach((v) => {
                if (v.sourceGeneral === this.player.head) {
                    v.preshow = true;
                    v.handle();
                }
            });
        }
        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        const canclose = this.player.getCanCloseGenerals();
        let count = this.generals.length;
        this.generals = this.generals.filter((v) => canclose.includes(v));
        return this.generals.length === count;
    }
}

/** 横置/重置事件 */
export class ChainEvent extends StateChangeEvent {
    player: GamePlayer;
    to_state: boolean;
    damageType: DamageType;

    protected async StateChanged_Before(): Promise<void> {
        this.player.setProperty('chained', this.to_state);
        this.room.broadcast({
            type: 'MsgPlayFaceAni',
            player: this.player.playerId,
            ani: 'chain',
            data: {
                to_state: this.to_state,
                damage_type: this.damageType,
            },
            log: {
                text: `#Chained${this.to_state ? 1 : 2}`,
                values: [{ type: 'player', value: this.player.playerId }],
            },
        });
        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        this.to_state = this.to_state ?? !this.player.chained;
        return this.player.chained !== this.to_state;
    }
}

/** 翻面/叠置事件 */
export class SkipEvent extends StateChangeEvent {
    player: GamePlayer;
    to_state: boolean;

    protected async StateChanged_Before(): Promise<void> {
        this.player.setProperty('skip', this.to_state);
        if (this.data.toState) {
            this.room.sendLog({
                text: `#Skip${this.player.deputy ? 3 : 1}`,
                values: [{ type: 'player', value: this.player.playerId }],
            });
        } else {
            this.room.broadcast({
                type: 'None',
                log: {
                    text: `#Skip${this.player.deputy ? 4 : 2}`,
                    values: [{ type: 'player', value: this.player.playerId }],
                },
            });
        }
        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        this.to_state = this.to_state ?? !this.player.skip;
        return this.player.skip !== this.to_state;
    }
}

/** 变更事件 */
export class ChangeEvent extends StateChangeEvent {
    player: GamePlayer;
    /** 要变更的武将牌 */
    general: General | 'head' | 'deputy';
    /** 目标武将牌 */
    to_general: General;
    /** 是否明置了主将 */
    is_change_head: boolean = false;
    /** 是否明置了副将将 */
    is_change_deputy: boolean = false;

    protected async init(): Promise<void> {
        await super.init();
        if (this.general === this.player.head || this.general === 'head') {
            this.is_change_head = true;
            this.general = this.player.head;
        }
        if (this.general === this.player.deputy || this.general === 'deputy') {
            this.is_change_deputy = true;
            this.general = this.player.deputy;
        }
    }

    protected async StateChanged_Before(): Promise<void> {
        let source: string;
        if (this.is_change_head) {
            this.general = this.player.head;
            this.player.setProperty('headOpen', true);
            this.player.setProperty('_head', this.to_general.id);
            source = 'head_general';
        } else if (this.is_change_deputy) {
            this.general = this.player.deputy;
            this.player.setProperty('deputyOpen', true);
            this.player.setProperty('_deputy', this.to_general.id);
            source = 'deputy_general';
        } else {
            this.general = this.player.head;
        }
        if (source) {
            this.room.sendLog({
                text: '#Change',
                values: [
                    { type: 'player', value: this.player.playerId },
                    {
                        type: 'string',
                        value: source === 'head_general' ? `head` : `deputy`,
                    },
                    {
                        type: 'string',
                        value: this.general.trueName,
                    },
                    {
                        type: 'string',
                        value: this.to_general.trueName,
                    },
                ],
            });
            //武将牌归还到武将堆
            this.player.handArea.remove([this.general]);
            this.room.generalArea.add([this.general]);
            //失去所有该武将牌上的技能
            while (true) {
                const skill = this.room.skills.find(
                    (v) =>
                        v.sourceGeneral === this.general &&
                        v.player === this.player &&
                        v.options.source === source
                );
                if (skill) await skill.removeSelf();
                else break;
            }
            //设置新武将
            this.room.generalArea.remove([this.to_general]);
            this.player.handArea.add([this.to_general]);
            this.room.recordGeneral(this.to_general.id, ['isChangePick']);
            //获得新技能
            for (const skill_name of this.to_general.skills) {
                const skill = await this.room.addSkill(
                    skill_name,
                    this.player,
                    {
                        source,
                        showui: 'default',
                    }
                );
            }
        }

        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        if (typeof this.general === 'string') {
            if (this.general !== 'head' && this.general !== 'deputy')
                return false;
        } else {
            if (
                this.general !== this.player.head &&
                this.general !== this.player.deputy
            )
                return false;
        }
        if (this.general === 'deputy' || this.general === this.player.deputy) {
            if (this.player.general_mode === 'single') return false;
        }
        if (!this.to_general) {
            const kindoms = [
                this.player.kingdom,
                this.player.head?.kingdom,
                this.player.deputy?.kingdom,
            ];
            const kindom = kindoms.find(
                (v) => v && v !== 'none' && !v.includes('ye')
            );
            if (kindom) {
                this.to_general = this.room.generalArea
                    .get(
                        1,
                        General,
                        'top',
                        (v) => v.kingdom === kindom || v.kingdom2 === kindom
                    )
                    .at(0);
            }
        }
        if (!this.to_general) return false;
        return true;
    }
}

/** 移除事件 */
export class RemoveEvent extends StateChangeEvent {
    player: GamePlayer;
    /** 要变更的武将牌 */
    general: General;
    /** 是否明置了主将 */
    is_remove_head: boolean = false;
    /** 是否明置了副将将 */
    is_remove_deputy: boolean = false;

    protected async init(): Promise<void> {
        await super.init();
        if (this.general === this.player.head) {
            this.is_remove_head = true;
        }
        if (this.general === this.player.deputy) {
            this.is_remove_deputy = true;
        }
    }

    protected async StateChanged_Before(): Promise<void> {
        let pos: string;
        if (this.is_remove_head) {
            this.player.setProperty('headOpen', true);
            this.player.setProperty(
                '_head',
                this.general.gender === Gender.Female
                    ? 'default.shibingv'
                    : 'default.shibingn'
            );
            pos = 'head';
        }
        if (this.is_remove_deputy) {
            this.player.setProperty('deputyOpen', true);
            this.player.setProperty(
                '_deputy',
                this.general.gender === Gender.Female
                    ? 'default.shibingv'
                    : 'default.shibingn'
            );
            pos = 'deputy';
        }
        if (pos) {
            this.room.sendLog({
                text: '#Remove',
                values: [
                    { type: 'player', value: this.player.playerId },
                    { type: 'string', value: pos },
                    {
                        type: 'string',
                        value: this.general.trueName,
                    },
                ],
            });
            //武将牌归还到武将堆
            this.player.handArea.remove([this.general]);
            this.room.generalArea.add([this.general]);
            this.room.recordGeneral(this.general.id, ['isRemovals']);
            //失去所有该武将牌上的技能
            while (true) {
                const skill = this.room.skills.find(
                    (v) => v.sourceGeneral === this.general
                );
                if (skill) await skill.removeSelf();
                else break;
            }
        }
        this.room.insertHistory(this);
    }

    public check(): boolean {
        if (!this.player || this.player.death) return false;
        if (!this.general) return false;
        if (
            this.general !== this.player.head &&
            this.general !== this.player.deputy
        )
            return false;
        if (this.general.isLord() || this.general.isShibing()) return false;
        return true;
    }
}

export class RestoreData extends EventData {
    player: GamePlayer;
}
