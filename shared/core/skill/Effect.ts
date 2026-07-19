import { MapSchema } from '@colyseus/schema';
import { MarkState } from '../schema/MarkState';
import { EffectData, EffectOptions, SkillTag } from './SkillTypes';
import { EffectState } from '../schema/EffectState';
import { Player } from '../player/Player';
import { Skill } from './Skill';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { Room } from '../room/Room';
import { TimingData, TimingName } from '../event/EventTypes';

export class Effect implements MarkHost {
    readonly id: number;
    readonly room: Room;
    readonly skill?: Skill;
    readonly _jsonData: EffectData;
    readonly state: EffectState;
    readonly data: Record<string, any> = {};
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap = new Map<string, Set<string>>();
    readonly options: EffectOptions;
    readonly audios: string[] = [];

    constructor(
        id: number,
        player: Player | undefined,
        data: EffectData,
        room: Room,
        state: EffectState,
        options: EffectOptions,
        fromSkill?: Skill,
    ) {
        this.id = id;
        this.state = state;
        this.state.id = id;
        this.state.playerId = player?.playerId ?? '';
        this.room = room;
        this._jsonData = data;
        this.marksMap = state.markStates;
        this.options = options;
        this.skill = fromSkill;
        this.state.skillId = fromSkill?.id ?? 0;

        //audio
        if (data.settings?.audios === 'extends') {
            if (fromSkill) {
                this.state.audios.push(...fromSkill.audios);
            }
        } else if (data.settings?.audios && data.settings.audios.length > 0) {
            data.settings.audios.forEach((v) => {
                this.audios.push(`${v}.mp3`);
            });
        }
    }

    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    set player(value: Player | undefined) {
        this.state.playerId = value?.playerId ?? '';
    }

    get player(): Player | undefined {
        return this.room.playerMaps.get(this.state.playerId);
    }

    get name() {
        return this._jsonData.name;
    }

    get skillName() {
        return this.skill?.name;
    }

    get hasTrigger() {
        return this._jsonData.has_trigger;
    }

    get hasState() {
        return this._jsonData.has_state;
    }

    get isViewAsOrPlayPhase(): boolean {
        if (!this.hasTrigger) return false;
        const t = this._jsonData.trigger;
        return (
            t === TimingName.UseCardNeed1 ||
            t === TimingName.UseCardNeed2 ||
            t === TimingName.DropCardNeed1 ||
            t === TimingName.DropCardNeed2 ||
            t === TimingName.PlayPhase
        );
    }

    setInvalids(reason: string, state: boolean = true) {
        if (state) {
            if (!this.state.invalids.includes(reason)) {
                this.state.invalids.push(reason);
            }
        } else {
            const idx = this.state.invalids.indexOf(reason);
            if (idx !== -1) {
                this.state.invalids.splice(idx, 1);
            }
        }
    }

    get isInvalid() {
        return this.state.invalids.length > 0;
    }

    get preshow() {
        return this.skill?.preshow ?? true;
    }

    /** 所属武将牌是否明置 */
    isOpen() {
        return this.skill?.isOpen() ?? true;
    }

    /** 移除自身，委托到 SkillManager */
    async removeSelf(removeSkill: boolean = false) {
        await this.room.skill.removeEffect(this, removeSkill);
    }

    hasTag(tag?: SkillTag) {
        if (!this._jsonData.tag) return false;
        return tag === undefined
            ? this._jsonData.tag.length > 0
            : this._jsonData.tag.includes(tag);
    }

    get isLock() {
        return this.hasTag(SkillTag.Lock) || this.isAwake;
    }

    get isLimit() {
        return this.hasTag(SkillTag.Limit);
    }

    get isAwake() {
        return this.hasTag(SkillTag.Awake);
    }

    get isLord() {
        return this.hasTag(SkillTag.Lord);
    }

    get isArray() {
        return this.hasTag(SkillTag.Array);
    }

    /**
     * 效果是否可用。
     * 触发类：需额外检查 limit/awake 标记 + head/deputy 位置。
     * 状态类：仅检查自身及关联技能未被禁用。
     */
    check(data?: TimingData<any>): boolean {
        if (this.isInvalid) return false;
        if (this.skill && !this.skill.check()) return false;

        // 状态类效果无标签和次数约束
        if (this.hasState) return true;

        // 触发类效果：标签检查
        if (this.isLimit || this.isAwake) {
            const count = this.player?.countMark(this.name, this.id) ?? 0;
            if (this.isLimit && count > 0) return false;
            if (this.isAwake && count > 0) return false;
        }
        if (this.hasTag(SkillTag.Head) && this.player) {
            if (!this.player.hasHead()) return false;
        }
        if (this.hasTag(SkillTag.Deputy) && this.player) {
            if (!this.player.hasDeputy()) return false;
        }
        if (this.hasTag(SkillTag.ZhuShuai) && this.player) {
            // TODO: 主帥检查逻辑待实现
        }
        if (this.hasTag(SkillTag.QianFeng) && this.player) {
            // TODO: 先锋检查逻辑待实现
        }
        return true;
    }

    /**
     * 解析最大发动次数。状态类效果无次数概念，返回默认 1。
     * number=固定值，function=根据实时数据计算，-1=无限制。
     */
    getMaxTimes(room: Room, player: Player, data: any): number {
        if (this.hasState) return 1;
        const raw = this._jsonData.times;
        if (raw == null) return 1;
        if (typeof raw === 'function') return raw.call(this, room, player, data) ?? 1;
        return raw;
    }

    /**
     * 是否可以自动发动（无需询问玩家）。
     * 三个条件缺一不可：forced='mute' + selectors 中无 cost + 所属武将牌已明置（若有）。
     */
    canAutoExecute(): boolean {
        if (this._jsonData.settings?.forced !== 'mute') return false;
        if (this._jsonData.selectors?.cost) return false;
        const sg = this.skill?.sourceGeneral;
        if (sg && !sg.put) return false;
        return true;
    }

}
