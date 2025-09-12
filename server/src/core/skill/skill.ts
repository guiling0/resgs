import { GameCard } from '../card/card';
import { Custom, SetMark } from '../custom/custom';
import { EventTriggers } from '../event/triggers';
import { General } from '../general/general';
import { GamePlayer } from '../player/player';
import { GameRoom } from '../room/room';
import { TriggerEffect, StateEffect, Effect } from './effect';
import {
    SkillData,
    SkillOptions,
    SkillTag,
    StateEffectType,
} from './skill.types';

export class Skill {
    constructor(
        id: number,
        room: GameRoom,
        player: GamePlayer,
        data: SkillData,
        options: SkillOptions
    ) {
        this.id = id;
        this.room = room;
        this.player = player;
        this.data = data;
        this.options = options;
        this.trueName = data.name.split('.').at(-1);

        if (player) {
            if (options.source === 'head_general') {
                this.sourceGeneral = player.head;
            }
            if (options.source === 'deputy_general') {
                this.sourceGeneral = player.deputy;
            }
        }

        if (this.options.source.includes('effect:')) {
            this.sourceEffect = this.room.getEffect(
                Number(this.options.source.split(':')[1])
            );
        }

        if (data.audio) {
            this.audios = [];
            if (this.data.attached_equip) {
                data.audio.forEach((v) => {
                    this.audios.push(`audio/equip/${v}.mp3`);
                });
            } else {
                data.audio.forEach((v) => {
                    this.audios.push(`generals/${v}.mp3`);
                });
            }
        } else {
            this.setAudio();
        }
        this.audios = this.audios ?? [];
        sgs.utils.shuffle(this.audios);
    }

    protected setAudio() {
        const assets = sgs.skillAssets[this.name];
        if (assets && assets.audios && assets.audios.length) {
            this.audios = [];
            assets.audios.forEach((v) => {
                this.audios.push(`${v}.mp3`);
            });
        }
    }

    public broadcastCustom: (
        data: Omit<SetMark, 'type' | 'objType' | 'objId'>
    ) => void = (data) => {
        this.room.markChanges.push({
            objType: 'skill',
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
        return this.data.name;
    }
    public trueName: string;
    /** 所属房间 */
    public readonly room: GameRoom;
    /** 所属玩家 */
    public readonly player: GamePlayer | undefined;
    /** 技能数据 */
    public readonly data: SkillData;
    /** 技能设置 */
    public readonly options: SkillOptions;
    /** 所有效果 */
    public readonly effects: Effect[] = [];
    /** 所有触发效果 */
    public readonly trigger_effects: TriggerEffect[] = [];
    /** 所有状态效果 */
    public readonly state_effects: StateEffect[] = [];
    /** 技能失效状态 */
    public readonly _invalids: string[] = [];
    /**
     * 设置技能的失效状态
     * @param reason 失效原因
     * @param state 状态 true为该技能因原因失效，false为该技能不再因原因而失效
     */
    public setInvalids(reason: string, state: boolean = true) {
        if (state && !this._invalids.includes(reason)) {
            this._invalids.push(reason);
        } else {
            const index = this._invalids.indexOf(reason);
            if (index > -1) {
                this._invalids.splice(index, 1);
            }
        }
    }
    /** 技能是否失效 */
    public get isInvalid() {
        return this._invalids.length > 0;
    }
    public audios: string[];
    /** 是否预亮 */
    public preshow: boolean = true;
    /** 所属武将牌 */
    public readonly sourceGeneral: General;
    /** 所属装备牌 */
    public sourceEquip: GameCard;
    /** 所属效果  */
    public sourceEffect: Effect;
    /** 所属武将牌是否明置
     * @description 如果该技能没有拥有者或来源不为武将牌，则返回true
     */
    public isOpen() {
        if (!this.player) return true;
        if (this.sourceGeneral === this.player.head)
            return this.player.headOpen;
        if (this.sourceGeneral === this.player.deputy)
            return this.player.deputyOpen;
        return true;
    }

    public check() {
        if (this.sourceEffect && this.sourceEffect.skill !== this) {
            if (!this.sourceEffect.isOpen()) return false;
            if (!this.sourceEffect.check()) return false;
        }
        //未预亮不能发动
        if (!this.preshow) return false;
        //技能失效不能发动
        if (this.isInvalid) return false;
        if (this.data.condition && !this.data.condition.call(this, this.room))
            return false;
        return true;
    }

    /** 失去本技能 */
    async removeSelf() {
        await this.room.removeSkill(this);
    }

    async handle() {
        for (const effect of this.effects) {
            await effect.handle();
        }
        if (this.isOpen() && !this.preshow) {
            this.preshow = true;
            this.room.broadcast({
                type: 'MsgSkillState',
                id: this.id,
                preshow: true,
            });
        }
    }

    public visible() {
        if (this.data.attached_equip) {
            return !this.player.equipCards.find((v) => v.name === this.name);
        }
        if (!this.data.visible || !this.data.visible.call(this, this.room)) {
            return false;
        }
        //忽略主副将技标签，只要效果中有被忽略的就显示
        const hd = this.effects.some((e) =>
            this.room
                .getStates(StateEffectType.IgnoreHeadAndDeputy, [e])
                .some((v) => v)
        );
        if (!hd) {
            const head = this.effects.some((v) => v.hasTag(SkillTag.Head));
            if (head && this.sourceGeneral !== this.player.head) {
                return false;
            }
            const deputy = this.effects.some((v) => v.hasTag(SkillTag.Deputy));
            if (deputy && this.sourceGeneral !== this.player.deputy) {
                return false;
            }
        }
        return true;
    }

    public global(player: GamePlayer) {
        if (this.data.attached_equip) {
            return !this.player.equipCards.find((v) => v.name === this.name);
        }
        return (
            this.data.global && this.data.global.call(this, this.room, player)
        );
    }

    /** 是否包含锁定技标签的效果 */
    public hasLockEffect() {
        return this.effects.some((v) => v.hasTag(SkillTag.Lock));
    }

    /** 是否可以设置预亮 */
    public canPreshow() {
        return (
            !this.effects.length ||
            !this.effects.every((v) => {
                if (v instanceof StateEffect) return true;
                if (v instanceof TriggerEffect) {
                    if (v.inTrigger(EventTriggers.NeedUseCard1)) return true;
                    if (v.inTrigger(EventTriggers.NeedUseCard2)) return true;
                    if (v.inTrigger(EventTriggers.NeedUseCard3)) return true;
                    if (v.inTrigger(EventTriggers.NeedPlayCard1)) return true;
                    if (v.inTrigger(EventTriggers.NeedPlayCard2)) return true;
                    if (v.inTrigger(EventTriggers.NeedPlayCard3)) return true;
                    if (v.inTrigger(EventTriggers.PlayPhaseProceeding))
                        return true;
                }
                return false;
            })
        );
    }
}

export interface Skill extends Custom {}
