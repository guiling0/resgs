import { GameCard } from '../card/card';
import { GameRequest } from '../choose/choose.types';
import { Custom, SetMark } from '../custom/custom';
import { EventData } from '../event/data';
import { EventTriggers } from '../event/triggers';
import { General } from '../general/general';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { Skill } from './skill';
import {
    EffectId,
    SkillId,
    SkillTag,
    StateEffectData,
    StateEffectType,
    TriggerEffectContext,
    TriggerEffectData,
} from './skill.types';

export abstract class Effect {
    public readonly data: TriggerEffectData | StateEffectData;

    constructor(id: number, room: GameRoom, player: GamePlayer, skill?: Skill) {
        this.id = id;
        this.room = room;
        this.player = player;
        this.skill = skill;
    }

    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void = (data) => {
        this.room.markChanges.push({
            objType: 'effect',
            objId: this.id,
            key: data.key,
            value: data.value,
            options: data.options,
        });
    };

    /** 技能ID */
    public readonly id: number;
    public get DataId() {
        return this.data.name;
    }
    public get name() {
        return this.skill?.name ?? this.data.name;
    }
    /** 所属房间 */
    public readonly room: GameRoom;
    /** 所属玩家 */
    public readonly player: GamePlayer | undefined;
    /** 所属玩家 */
    public readonly skill: Skill | undefined;
    /** 每名玩家因此技能而视为拥有的技能 */
    public regardSkills: Map<GamePlayer, Skill[]> = new Map();

    /** 技能失效状态 */
    public readonly _invalids: string[] = [];
    /**
     * 设置技能的失效状态
     * @param reason 失效原因
     * @param state 状态 true为该技能因原因失效，false为该技能不再因原因而失效
     */
    public setInvalids(reason: string, state: boolean = true) {
        if (state) {
            if (!this._invalids.includes(reason)) {
                this._invalids.push(reason);
            }
        } else {
            lodash.remove(this._invalids, (v) => v === reason);
        }
    }
    /** 技能是否失效 */
    public get isInvalid() {
        if (this.hasTag(SkillTag.Eternal)) return false;
        return (
            this._invalids.length > 0 ||
            this.room
                .getStates(StateEffectType.Skill_Invalidity, [this])
                .some((v) => v)
        );
    }

    public check(data?: EventData) {
        //技能失效不能发动
        if (this.isInvalid) return false;
        if (this.skill && !this.skill.check()) return false;
        const hd =
            this.skill &&
            this.room
                .getStates(StateEffectType.IgnoreHeadAndDeputy, [this])
                .some((v) => v);
        if (!hd) {
            //主副将技
            if (this.hasTag(SkillTag.Head)) {
                if (
                    this.skill &&
                    this.player &&
                    this.skill.sourceGeneral !== this.player.head
                )
                    return false;
            }
            if (this.hasTag(SkillTag.Deputy)) {
                if (
                    this.skill &&
                    this.player &&
                    this.skill.sourceGeneral !== this.player.deputy
                )
                    return false;
            }
        }
        //限定技
        if (this.isLimit) {
            const limit = this.player?.getMark<string>(`@limit:${this.id}`);
            if (!limit || limit === '@limit-false') return false;
        }
        //阵法技
        if (this.isArray) {
            if (this.room.aliveCount < 4) return false;
        }
        return true;
    }

    /** 检测某玩家是否是该效果的拥有者 */
    public isOwner(player: GamePlayer) {
        return this.player === player;
    }

    /** 所属技能是否明置 */
    public isOpen() {
        return (this.skill?.isOpen() ?? true) || this.hasTag(SkillTag.Secret);
    }

    /** 移除自身 */
    public async removeSelf() {
        await this.room.removeEffect(this);
    }

    public async onObtain() {
        await this.handle();

        if (this.player) {
            this.data.mark.forEach((v) => {
                this.player.setMark(v, true, {
                    visible: true,
                });
            });
        }
    }

    public async onLose() {
        if ((this.isLimit && this, this.player)) {
            this.player.removeMark(`@limit:${this.id}`);
        }

        if (this.player) {
            this.data.mark.forEach((v) => {
                this.player.removeMark(v);
            });
        }

        const cards: GameCard[] = [];
        this.room.playerAlives.forEach((v) => {
            //将所有因此技能移动至角色武将牌上和武将牌旁的牌置入弃牌堆
            v.upArea.cards.forEach((c) => {
                const move = this.room.getLastOneHistory(
                    sgs.DataType.MoveCardEvent,
                    (d) => d.has(c)
                );
                if (move && this.name === move.reason) {
                    cards.push(c);
                }
            });
            v.sideArea.cards.forEach((c) => {
                const move = this.room.getLastOneHistory(
                    sgs.DataType.MoveCardEvent,
                    (d) => d.has(c)
                );
                if (move && this.name === move.reason) {
                    cards.push(c);
                }
            });
            //所有因此技能添加的标记失去
            const marks = Object.keys(v._mark).filter((key) => {
                const mark = v._mark[key];
                return mark && this.name === mark.options.source;
            });
            if (marks.length) {
                marks.forEach((key) => {
                    v.removeMark(key);
                });
            }
        });
        if (cards.length > 0) {
            await this.room.puto({
                player: this.player,
                cards,
                toArea: this.room.discardArea,
                source: this.room.events.at(-1),
                reason: 'remove_handle',
            });
        }
    }

    public async handle() {
        if (this.isLimit && this.player) {
            const visible = this.isOpen();
            const limit =
                this.player.getMark<string>(`@limit:${this.id}`) ??
                '@limit-true';
            this.player.setMark(`@limit:${this.id}`, limit, {
                type: 'img',
                visible: visible ? true : [this.player.playerId],
                url: limit,
            });
        }

        if (!this.isOpen()) {
            const cards: GameCard[] = [];
            this.room.playerAlives.forEach((v) => {
                //将所有因此技能移动至角色武将牌上和武将牌旁的牌置入弃牌堆
                v.upArea.cards.forEach((c) => {
                    const move = this.room.getLastOneHistory(
                        sgs.DataType.MoveCardEvent,
                        (d) => d.has(c)
                    );
                    if (move && this.name === move.reason) {
                        cards.push(c);
                    }
                });
                v.sideArea.cards.forEach((c) => {
                    const move = this.room.getLastOneHistory(
                        sgs.DataType.MoveCardEvent,
                        (d) => d.has(c)
                    );
                    if (move && this.name === move.reason) {
                        cards.push(c);
                    }
                });
                //所有因此技能添加的标记失去
                const marks = Object.keys(v._mark).filter((key) => {
                    const mark = v._mark[key];
                    return mark && this.name === mark.options.source;
                });
                if (marks.length) {
                    marks.forEach((key) => {
                        v.removeMark(key);
                    });
                }
            });
            if (cards.length > 0) {
                await this.room.puto({
                    player: this.player,
                    cards,
                    toArea: this.room.discardArea,
                    source: this.room.events.at(-1),
                    reason: 'remove_handle',
                });
            }
        }
    }

    public hasTag(tag?: SkillTag) {
        return tag === undefined
            ? this.data.tag && this.data.tag.length > 0
            : this.data?.tag.includes(tag);
    }

    /** 是否为锁定技 */
    public get isLock() {
        return this.data.tag?.includes(SkillTag.Lock) || this.isAwake;
    }

    /** 是否为限定技 */
    public get isLimit() {
        return this.data.tag?.includes(SkillTag.Limit) || this.isAwake;
    }

    /** 是否为觉醒技 */
    public get isAwake() {
        return this.data.tag?.includes(SkillTag.Awake);
    }

    /** 是否为主公技/君主技 */
    public get isLord() {
        return this.data.tag?.includes(SkillTag.Lord);
    }

    /** 是否为阵法技 */
    public get isArray() {
        return (
            this.data.tag?.includes(SkillTag.Array_Quene) ||
            this.data.tag?.includes(SkillTag.Array_Siege)
        );
    }
}

export class TriggerEffect extends Effect {
    public readonly data: TriggerEffectData;

    constructor(
        id: number,
        room: GameRoom,
        player: GamePlayer,
        data: TriggerEffectData,
        skill?: Skill
    ) {
        super(id, room, player, skill);
        this.data = data;
        if (data.audio) {
            this.audios = [];
            if (this.skill && this.skill.data.attached_equip) {
                data.audio.forEach((v) => {
                    this.audios.push(`audio/equip/${v}.mp3`);
                });
            } else {
                data.audio.forEach((v) => {
                    this.audios.push(`generals/${v}.mp3`);
                });
            }
        }
        if (this.audios) sgs.utils.shuffle(this.audios);
    }

    public audios: string[];

    public check(data: EventData): boolean {
        if (!super.check(data)) return false;
        //lifes
        const lifes = this.room.lifes.get(EventTriggers.onCheck);
        if (lifes && lifes.before.length) {
            const before = lifes.before.find((v) => v.effect === this);
            if (before) {
                before.life.on_check?.call(this, this.room, data) ?? true;
                if (!before) return false;
            }
            const after = lifes.before.find((v) => v.effect === this);
            if (after) {
                after.life.on_check?.call(this, this.room, data) ?? true;
                if (!after) return false;
            }
        }
        //国战化身耦合检测-有标签的技能不通过检测
        if (this.skill && this.skill.getData('huashen_source')) {
            const general = this.skill.getData<General>('huashen_source');
            if (this.room.getData(`huashen_cost_${general.id}`)) return false;
            if (this.hasTag()) return false;
        }
        if (
            this.skill &&
            this.skill.sourceGeneral &&
            !this.isOpen() &&
            !this.hasTag(SkillTag.Secret) &&
            this.player
        ) {
            if (
                this.room
                    .getStates(StateEffectType.Prohibit_Open, [
                        this.player,
                        [this.skill.sourceGeneral],
                        'useskill',
                    ])
                    .some((v) => v)
            ) {
                return false;
            }
        }
        if (data) {
            //国战化身耦合检测-于一个时机发动过技能不通过检测
            if (this.skill && this.skill.getData('huashen_source')) {
                if (data.data[`wars.huashen.${data.trigger}`]) return false;
            }
            if (
                Array.isArray(this.data.trigger) &&
                !this.data.trigger.includes(data.trigger)
            )
                return false;
            if (
                !Array.isArray(this.data.trigger) &&
                data.trigger !== this.data.trigger
            )
                return false;
            const can_trigger = Boolean(
                this.data.can_trigger.call(
                    this,
                    this.room,
                    data.triggerCurrent,
                    data
                )
            );
            if (!can_trigger) return false;
        }
        return true;
    }

    public getContext(data: EventData): TriggerEffectContext {
        const context =
            this.data.context?.call(
                this,
                this.room,
                data.triggerCurrent,
                data
            ) ?? {};
        context.effect = this;
        context.maxTimes = context.maxTimes ?? 1;
        context.from = context.from ?? data.triggerCurrent ?? this.player;
        return context;
    }

    public getSelectorName(name: string) {
        return `${this.data.name}.${name}`;
    }

    public inTrigger(trigger: EventTriggers) {
        if (Array.isArray(this.data.trigger)) {
            return this.data.trigger.includes(trigger);
        } else {
            return this.data.trigger === trigger;
        }
    }
}

export class StateEffect extends Effect {
    public readonly data: StateEffectData;

    constructor(
        id: number,
        room: GameRoom,
        player: GamePlayer,
        data: StateEffectData,
        skill?: Skill
    ) {
        super(id, room, player, skill);
        this.data = data;
    }

    public check(): boolean {
        //lifes
        const lifes = this.room.lifes.get(EventTriggers.onCheck);
        if (lifes && lifes.before.length) {
            const before = lifes.before.find((v) => v.effect === this);
            if (before) {
                before.life.on_check?.call(this, this.room) ?? true;
                if (!before) return false;
            }
            const after = lifes.before.find((v) => v.effect === this);
            if (after) {
                after.life.on_check?.call(this, this.room) ?? true;
                if (!after) return false;
            }
        }
        //国战化身耦合检测-不通过检测
        if (this.skill && this.skill.getData('huashen_source')) {
            return false;
        }
        if (!super.check()) return false;
        if (!this.isOpen()) return false;
        return true;
    }
}

export interface Effect extends Custom {}
