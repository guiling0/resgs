import { MapSchema } from '@colyseus/schema';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { Room } from '../room/Room';
import { SkillState } from '../schema/SkillState';
import { SkillData, SkillOptions, SkillTag } from './SkillTypes';
import { MarkState } from '../schema/MarkState';
import { General } from '../general/General';
import { GameCard } from '../card/GameCard';
import { Effect } from './Effect';
import { Player } from '../player/Player';
import { TimingName } from '../event/EventTypes';

export class Skill implements MarkHost {
    readonly id: number;
    readonly room: Room;
    readonly _jsonData: SkillData;
    readonly state: SkillState;
    readonly data: Record<string, any> = {};
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap = new Map<string, Set<string>>();
    readonly options: SkillOptions;
    readonly trueName: string;
    readonly effects: Effect[] = [];
    readonly audios: string[] = [];

    private _sourceGeneral?: General;
    private _sourceEquip?: GameCard;
    private _sourceEffect?: Effect;

    constructor(
        id: number,
        player: Player | undefined,
        data: SkillData,
        room: Room,
        state: SkillState,
        options: SkillOptions,
    ) {
        this.id = id;
        this.state = state;
        this.state.id = id;
        this.state.playerId = player?.playerId ?? '';
        this.room = room;
        this._jsonData = data;
        this.marksMap = state.markStates;
        this.options = options;
        this.state.showui = options.showui ?? 'none';
        this.trueName = data.name.split('.').at(-1)!;

        //audio
        const assets = sgs.skillsAssets.get(data.name);
        if (assets && assets.audios && assets.audios.length > 0) {
            if (data.attached_equip) {
                assets.audios.forEach((v) => {
                    this.audios.push(`audio/equip/${v.url}.mp3`);
                });
            } else {
                assets.audios.forEach((v) => {
                    this.audios.push(`${v.url}.mp3`);
                });
            }
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

    get player() {
        return this.room.playerMaps.get(this.state.playerId);
    }

    get name() {
        return this._jsonData.name;
    }

    set sourceGeneral(value: General) {
        this._sourceGeneral = value;
        this.state.sourceGeneral = value?.id ?? '';
    }

    get sourceGeneral(): General | undefined {
        return this._sourceGeneral;
    }

    set sourceEquip(value: GameCard) {
        this._sourceEquip = value;
        this.state.sourceEquip = value?.id ?? '';
    }

    get sourceEquip(): GameCard | undefined {
        return this._sourceEquip;
    }

    set sourceEffect(value: Effect) {
        this._sourceEffect = value;
        this.state.sourceEffect = value?.id ?? 0;
    }

    get sourceEffect(): Effect | undefined {
        return this._sourceEffect;
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

    set preshow(value: boolean) {
        this.state.preshow = value;
    }

    get preshow() {
        return this.state.preshow;
    }

    /** 所属武将牌是否明置 */
    isOpen() {
        if (this._sourceGeneral) {
            return this._sourceGeneral.put;
        }
        // 装备技能：检查装备牌是否存在/明置
        if (this._sourceEquip) {
            return this._sourceEquip.put;
        }
        return true;
    }

    /** 技能是否可用：未被禁用 + 条件满足 + 武将明置 */
    check(): boolean {
        if (this.isInvalid) return false;
        if (this._jsonData.condition) {
            if (!this._jsonData.condition.call(this, this.room)) return false;
        }
        if (!this.isOpen()) return false;
        return true;
    }

    /** 移除自身，委托到 SkillManager */
    async removeSelf() {
        await this.room.skill.removeSkill(this);
    }

    visible() {
        if (this._jsonData.attached_equip) {
            return !!this.sourceEquip;
        }
        if (
            !this._jsonData.visible ||
            !this._jsonData.visible.call(this, this.room)
        ) {
            return false;
        }

        //TODO 检测主将技/副将技/主帅技/前锋技标签 需要等待player完成

        return true;
    }

    global(player: Player) {
        if (
            this._jsonData.global &&
            this._jsonData.global.call(this, this.room, player)
        ) {
            return true;
        }
        if (
            this._jsonData.attached_equip &&
            this.player === player &&
            !this.sourceEquip
        ) {
            return true;
        }
        return false;
    }

    hasLockEffect() {
        return this.effects.some((v) => v.hasTag(SkillTag.Lock));
    }

    canPreshow() {
        return !this.effects.every((v) => v.hasState || v.isViewAsOrPlayPhase);
    }

    getGlobalAvatarAsset() {
        //TODO 需要完成player
    }
}
