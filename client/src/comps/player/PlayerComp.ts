import { playerPos, ServerConfig } from '../../config';
import { FaceAni } from '../../core/ani.config';
import {
    CardSubType,
    CardSuit,
    CardType,
    GameCardId,
    VirtualCardData,
} from '../../core/card/card.types';
import { CustomString } from '../../core/custom/custom.type';
import { DamageType } from '../../core/event/event.types';
import { General } from '../../core/general/general';
import { GamePlayer } from '../../core/player/player';
import { Phase } from '../../core/player/player.types';
import { SkillTag } from '../../core/skill/skill.types';
import { S } from '../../singleton';
import { UICard } from '../../ui/UICard';
import { UIEquip } from '../../ui/UIEquip';
import { UIEquipHalf } from '../../ui/UIEquipHalf';
import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UIIcon } from '../../ui/UIIcon';
import { UIMark } from '../../ui/UIMark';
import { UISeat } from '../../ui/UISeat';
import { UISelfSeat } from '../../ui/UISelfSeat';
import { UITextMark } from '../../ui/UITextMark';
import { RoomGameComp } from '../room/RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export abstract class PlayerComp extends Laya.Script {
    declare owner: UISeat | UISelfSeat;

    // 脏检查标记
    public _dirtyFlags: Record<string, boolean> = {
        handCardCount: false,
        campMode: false,
        general: false,
        head: false,
        deputy: false,
        kingdom: false,
        role: false,
        mark: false,
    };

    public isSelf: boolean = false;

    public player: GamePlayer;
    public room: RoomGameComp;
    public get game() {
        return this.room.game;
    }

    onAwake(): void {
        this.stateMetaX = this.owner.turnstate.x;
    }

    bind(player: GamePlayer, room: RoomGameComp) {
        this.player = player;
        this.room = room;
        if (!this.isSelf) {
            const count = this.game.playerCount;
            const players = this.game.sortPlayers(
                this.game.players,
                room.selfComp.player
            );
            const index = players.indexOf(player);
            if (index > 0) {
                const pos = playerPos.default[count][index - 1];
                Laya.Tween.create(this.owner)
                    .duration(500)
                    .ease(Laya.Ease.expoOut)
                    .to('x', pos.x)
                    .to('y', pos.y)
                    .to('scaleX', pos.scale)
                    .to('scaleY', pos.scale);
            }
        }
        //playername
        this.owner.playername.text = this.player.username;
    }

    /** 倒计时的最大值 */
    protected _maxtime: number = 0;
    /** 倒计时当前值 */
    protected _time: number = 0;
    /** 开始倒计时 */
    public startCountDown(time: number, prompt?: CustomString) {
        if (this.owner.timebar.visible) {
            this.endCountDown();
        }
        if (prompt) {
            this.owner.think_prompt.setVar(
                'prompt',
                this.room.getTranslation(prompt)
            );
        }
        this.owner.timebar.visible = true;
        this.owner.timebar.value = 1;
        this._time = this._maxtime = time;
        this.onCountDown();
        this.owner.timer.loop(1000, this, this.onCountDown);
    }
    /** 结束倒计时 */
    public endCountDown() {
        if (this.owner.timebar.visible) {
            this.owner.timer.clear(this, this.onCountDown);
            this.owner.timebar.visible = false;
            Laya.Tween.killAll(this.owner.timebar);
            this.owner.event('CountDownEnd');
            this.owner.think_prompt.setVar('prompt', '');
        }
    }
    /** 倒计时缓动 */
    protected onCountDown() {
        this._time -= 1;
        Laya.Tween.create(this.owner.timebar)
            .duration(1000)
            .to('value', this._time / this._maxtime);
        if (this._time < -1) {
            this.endCountDown();
        }
    }

    onUpdate(): void {
        this.owner.hps.layout.refresh(true);
        this.render();
    }

    //card
    //所有判定牌
    public judgeCards: UIIcon[] = [];

    public render() {
        // 只渲染标记为脏的部分
        if (this._dirtyFlags.handCardCount) {
            this.renderHandCardCount();
            this._dirtyFlags.handCardCount = false;
        }
        if (this._dirtyFlags.campMode) {
            this.renderCampMode();
            this.renderKingdom();
            this.renderHpmax();
            this.renderIntHp();
            this._dirtyFlags.campMode = false;
        }
        if (this._dirtyFlags.general) {
            this.renderGeneral();
            this.renderKingdom();
            this._dirtyFlags.general = false;
        }
        if (this._dirtyFlags.head) {
            this.renderHead();
            this.renderKingdom();
            this._dirtyFlags.head = false;
        }
        if (this._dirtyFlags.deputy) {
            this.renderDeputy();
            this.renderKingdom();
            this._dirtyFlags.deputy = false;
        }
        if (this._dirtyFlags.kingdom) {
            this.renderKingdom();
            this._dirtyFlags.kingdom = false;
        }
        if (this._dirtyFlags.role) {
            this.renderRole();
            this._dirtyFlags.role = false;
        }
        if (this._dirtyFlags.mark) {
            if (!this.player) return;
            if (!this.player._mark) this.player._mark = {};
            Object.keys(this.player._mark).forEach((v) => {
                this.renderMark(v);
            });
            this._dirtyFlags.mark = false;
        }
    }

    /** 刷新手牌数量 */
    public renderHandCardCount() {
        this.owner.handlabel.text = this.player.handArea.count.toString();
    }

    public set camp_mode(value: 'role' | 'kingdom') {
        this.player.camp_mode = value;
        this._dirtyFlags.campMode = true;
    }
    public get camp_mode() {
        return this.player.camp_mode;
    }
    public renderCampMode() {
        if (this.camp_mode === 'role') {
            this.owner.guozhan_k_mark.visible = false;
            this.owner.k_mark.visible = true;
        } else {
            this.owner.guozhan_k_mark.visible = true;
            this.owner.k_mark.visible = false;
        }
    }

    /** 主将武将牌 */
    public set _head(value: string) {
        this.player._head = value;
        this._dirtyFlags.head = true;
        this._dirtyFlags.general = true;
    }
    public get _head() {
        return this.player._head;
    }
    public get head() {
        return this.player.head;
    }
    public abstract renderHead(): void;

    /** 副将武将牌 */
    public set _deputy(value: string) {
        this.player._deputy = value;
        this._dirtyFlags.deputy = true;
        this._dirtyFlags.general = true;
    }
    public get _deputy() {
        return this.player._deputy;
    }
    public get deputy() {
        return this.player.deputy;
    }
    public abstract renderDeputy(): void;

    public set general_mode(value: 'single' | 'dual') {
        this.player.general_mode = value;
        this.renderGeneral();
    }

    public get general_mode() {
        return this.player.general_mode;
    }

    /** 刷新武将数量显示 */
    public renderGeneral() {
        this.owner.getController('gmode').selectedPage = this.general_mode;
        this.renderHead();
        this.renderDeputy();
    }

    /** 主将是否明置 */
    public set headOpen(value: boolean) {
        if (this.player.headOpen && !value) {
            const his_generals =
                this.player.room.getData<Set<General>>('watch_generals');
            if (!his_generals) {
                const set = new Set();
                set.add(this.head);
                this.player.room.setData('watch_generals', set);
            } else {
                his_generals.add(this.head);
                this.player.room.setData('watch_generals', his_generals);
            }
        }
        this.player.headOpen = value;
        this._dirtyFlags.head = true;
    }
    public get headOpen() {
        return this.player.headOpen;
    }

    /** 副将是否明置 */
    public set deputyOpen(value: boolean) {
        if (this.player.deputyOpen && !value) {
            const his_generals =
                this.player.room.getData<Set<General>>('watch_generals');
            if (!his_generals) {
                const set = new Set();
                set.add(this.deputy);
                this.player.room.setData('watch_generals', set);
            } else {
                his_generals.add(this.deputy);
                this.player.room.setData('watch_generals', his_generals);
            }
        }
        this.player.deputyOpen = value;
        this._dirtyFlags.deputy = true;
    }
    public get deputyOpen() {
        return this.player.deputyOpen;
    }

    //HP
    protected hpImages: Laya.GImage[] = [];

    /** 体力上限 */
    public set shield(value: number) {
        this.player.shield = value;
        this.renderShield();
    }
    public get shield() {
        return this.player.shield;
    }
    public renderShield() {
        this.owner.shield.visible = this.player.shield > 0;
        this.owner.shield_label.text = this.player.shield.toString();
    }

    /** 体力上限 */
    public set maxhp(value: number) {
        this.player.maxhp = value;
        this.renderHpmax();
    }
    public get maxhp() {
        return this.player.maxhp;
    }
    public renderHpmax(): void {
        this.hpImages.forEach((v) => v.removeSelf());
        this.hpImages.length = 0;
        this.owner.hplabel.visible = this.maxhp > 5;
        const maxhp = this.maxhp > 5 ? 1 : this.maxhp;
        for (let i = 0; i < maxhp; i++) {
            const icon = new Laya.GImage();
            icon.autoSize = false;
            if (this.isSelf) {
                icon.size(27, 26);
            } else {
                icon.size(15, 13);
            }
            icon.loadImage(
                `resources/room/texture/game/${
                    this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                }${this.isSelf ? '/self' : ''}/hp0.png`
            );
            this.owner.hps.addChild(icon);
            this.hpImages.push(icon);
        }
        this.owner.hplabel
            .setVar('maxhp', this.maxhp)
            .setVar('inthp', this.inthp);
        this.renderIntHp();
    }

    /** 体力 */
    public set inthp(value: number) {
        this.player.inthp = value;
        this.renderIntHp();
    }
    public get inthp() {
        return this.player.inthp;
    }
    public renderIntHp() {
        const pre = this.inthp / this.maxhp;
        if (this.maxhp > 5) {
            this.owner.hplabel.setVar('inthp', this.inthp);
            if (pre > 0.67) {
                this.hpImages[0].loadImage(
                    `resources/room/texture/game/${
                        this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                    }${this.isSelf ? '/self' : ''}/hp1.png`
                );
                this.owner.hplabel.color = '#00FF00';
            } else if (pre > 0.34) {
                this.hpImages[0].loadImage(
                    `resources/room/texture/game/${
                        this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                    }${this.isSelf ? '/self' : ''}/hp2.png`
                );
                this.owner.hplabel.color = '#FFFF00';
            } else if (pre > 0) {
                this.hpImages[0].loadImage(
                    `resources/room/texture/game/${
                        this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                    }${this.isSelf ? '/self' : ''}/hp3.png`
                );
                this.owner.hplabel.color = '#FF0000';
            } else {
                this.hpImages[0].loadImage(
                    `resources/room/texture/game/${
                        this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                    }${this.isSelf ? '/self' : ''}/hp0.png`
                );
                this.owner.hplabel.color = '#FF0000';
            }
        } else {
            this.hpImages.forEach((v, i) => {
                if (this.maxhp - this.inthp > i) {
                    v.loadImage(
                        `resources/room/texture/game/${
                            this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                        }${this.isSelf ? '/self' : ''}/hp0.png`
                    );
                    return;
                }
                if (pre > 0.67) {
                    v.loadImage(
                        `resources/room/texture/game/${
                            this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                        }${this.isSelf ? '/self' : ''}/hp1.png`
                    );
                } else if (pre > 0.34) {
                    v.loadImage(
                        `resources/room/texture/game/${
                            this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                        }${this.isSelf ? '/self' : ''}/hp2.png`
                    );
                } else if (pre > 0) {
                    v.loadImage(
                        `resources/room/texture/game/${
                            this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                        }${this.isSelf ? '/self' : ''}/hp3.png`
                    );
                } else {
                    v.loadImage(
                        `resources/room/texture/game/${
                            this.camp_mode === 'kingdom' ? 'hp' : 'rolehp'
                        }${this.isSelf ? '/self' : ''}/hp0.png`
                    );
                }
            });
        }
    }

    /** 座位 */
    public set seat(value: number) {
        this.player.seat = value;
        this.setSeatSprite();
    }
    public get seat() {
        return this.player.seat;
    }
    protected abstract setSeatSprite(): void;

    //阶段显示
    protected stateMetaX = 0;
    protected stateTween: Laya.Tween;
    /** 阶段显示 */
    public set phase(value: Phase) {
        if (this.phase !== value) {
            if (this.stateTween) {
                this.stateTween.kill();
                if (this.phase !== Phase.None) {
                    this.owner.turnstate.loadImage(
                        `resources/room/texture/game/turnstate/${this.phase}.png`
                    );
                } else {
                    this.owner.turnstate.texture = undefined;
                }
                this.owner.turnstate.x = this.stateMetaX;
            }
            this.stateTween = Laya.Tween.create(this.owner.turnstate)
                .duration(300)
                .to('x', this.stateMetaX + 50)
                .to('alpha', 0)
                .then(() => {
                    if (value !== Phase.None) {
                        this.owner.turnstate.loadImage(
                            `resources/room/texture/game/turnstate/${value}.png`
                        );
                    } else {
                        this.owner.turnstate.texture = undefined;
                    }
                    this.owner.turnstate.x = this.stateMetaX;
                    this.stateTween = Laya.Tween.create(this.owner.turnstate)
                        .duration(300)
                        .from('x', this.stateMetaX - 50)
                        .to('alpha', 1);
                });
        } else {
            this.owner.turnstate.loadImage(
                `resources/room/texture/game/turnstate/${value}.png`
            );
        }
        this.player.phase = value;
    }
    public get phase() {
        return this.player.phase;
    }

    /** 势力 */
    public set kingdom(value: string) {
        this.player.kingdom = value;
        this._dirtyFlags.kingdom = true;
    }
    public get kingdom() {
        return this.player.kingdom;
    }
    public abstract renderKingdom(): void;

    /** 身份 */
    public set role(value: string) {
        this.player.role = value;
        this._dirtyFlags.role = true;
    }
    public get role() {
        return this.player.role;
    }
    /** 刷新身份 */
    public renderRole(): void {
        this.owner.figure.loadImage(
            `resources/room/texture/game/figure/${this.player.role}.png`
        );
    }

    /** 设置frame */
    public abstract setFrame(name: string, visible?: boolean): void;

    /** 翻面状态 */
    public set skip(value: boolean) {
        this.player.skip = value;
        if (this.room.game.options.mode === 'wars') {
            this.setFrame('diezhi', value);
        } else {
            this.setFrame('fanmian', value);
        }
    }
    public get skip() {
        return this.player.skip;
    }

    /** 是否死亡 */
    public set death(value: boolean) {
        this.player.death = value;
        //TODO 显示死亡图片
        this.owner.death.visible = value;
        // this.owner.death.loadImage(``)
        this.owner.main.grayed = value;
    }
    public get death() {
        return this.player.death;
    }

    public set rest(value: number) {
        this.player.rest = value;
        this.owner.rest.visible = value > 0;
        this.owner.rest.setVar('count', value);
    }

    public get rest() {
        return this.player.rest;
    }

    /** 是否处于回合内 */
    public set inturn(value: boolean) {
        this.player.inturn = value;
        if (value) {
            this.playFaceAni('huihe');
            // this.playFaceAni('array', { type: 'quene' });
            // this.playFaceAni('array', { type: 'siege' });
        }
        // this.setFrame('inturn', value);
        // if (value) {
        //     this.playeAni('huihe');
        //     this.playZhenfa(SkillTag.Array_Quene);
        //     this.playZhenfa(SkillTag.Array_Siege);
        // } else {
        //     this.roomComp.players.forEach((v) => {
        //         v.endPlayZhenfa();
        //     });
        // }
    }
    public get inturn() {
        return this.player.inturn;
    }

    /** 是否处于出牌阶段 */
    public set inplayphase(value: boolean) {
        this.player.inplayphase = value;
        this.setFrame('inplayphase', value);
    }
    public get inplayphase() {
        return this.player.inplayphase;
    }

    /** 是否处于响应中 */
    public set inresponse(value: boolean) {
        this.player.inresponse = value;
        this.setFrame('inresponse', value);
    }
    public get inresponse() {
        return this.player.inresponse;
    }

    /** 是否处于掉虎离山状态 */
    public set indiaohu(value: boolean) {
        this.player.indiaohu = value;
        this.setFrame('diaohulishan', value);
    }
    public get indiaohu() {
        return this.player.indiaohu;
    }

    /** 酒状态 */
    public set jiuState(value: number) {
        this.player.jiuState = value;
        this.setFrame('jiuState', value > 0);
    }
    public get jiuState() {
        return this.player.jiuState;
    }

    /** 是否处于濒死状态 */
    public set indying(value: number) {
        this.player.indying = value;
        this.setFrame('indying', value > 0);
    }
    public get indying() {
        return this.player.indying;
    }

    /** 设置一张等待判定的判定牌
     */
    public setDelayedScroll(data: VirtualCardData) {
        const card = this.game.createVirtualCardByData(data, false, false);
        if (card.subtype === CardSubType.DelayedScroll) {
            const find = this.player.judgeCards.find((v) => v.id === card.id);
            if (!find) {
                this.player.judgeCards.push(card);
                const ui = UIIcon.create(card);
                this.judgeCards.push(ui);
                this.owner.judges.addChild(ui);
            }
        }
    }

    /** 删除一张等待判定的判定牌
     */
    public delDelayedScroll(data: VirtualCardData) {
        const card = this.game.createVirtualCardByData(data, false, false);
        if (card.subtype === CardSubType.DelayedScroll) {
            const find = this.player.judgeCards.find((v) => v.id === card.id);
            if (find) {
                lodash.remove(this.player.judgeCards, (v) => v === find);
                this.judgeCards
                    .find((v) => v.card && v.card.id === card.id)
                    ?.destroy();
            }
        }
    }

    /** 设置装备牌
     */
    public async setEquip(data: GameCardId) {
        const card = this.player.room.getCard(data);
        if (card.type !== CardType.Equip) return;
        const type: 31 | 32 | 33 | 34 | 35 | 36 = card.subtype as any;
        const equip: UIEquip | UIEquipSelf | UIEquipHalf =
            this.owner[`equip${type}`];
        if (!this.player.equipCards.includes(card)) {
            this.player.equipCards.push(card);
        }
        equip.set(card);
        Laya.Tween.create(equip)
            .from('x', equip.x + 50)
            .duration(500);
        // .ease(Laya.Ease.expoInOut)
    }

    /** 移除装备牌
     */
    public async removeEquip(data: GameCardId) {
        const card = this.player.room.getCard(data);
        if (card.type !== CardType.Equip) return;
        const type: 31 | 32 | 33 | 34 | 35 | 36 = card.subtype as any;
        const equip: UIEquip | UIEquipSelf | UIEquipHalf =
            this.owner[`equip${type}`];
        lodash.remove(this.player.equipCards, (v) => v === card);
        equip?.set(undefined);
    }

    public playFaceAni(ani: string, data: any = {}, addTo: any = this.owner) {
        if (ani === 'chain') {
            this.owner.tiesuo.visible = true;
            const { to_state, damage_type = DamageType.None } = data;
            if (to_state) {
                this.owner.tiesuo.play('play', false);
                S.ui.playAudio(
                    `${ServerConfig.res_url}/audio/system/chained.mp3`
                );
            } else {
                if (!damage_type) {
                    this.owner.tiesuo.play('play6', false);
                }
                if (damage_type === DamageType.Fire) {
                    this.owner.tiesuo.play('play4', false);
                }
                if (damage_type === DamageType.Thunder) {
                    this.owner.tiesuo.play('play5', false);
                }
            }
            return;
        }
        // if (ani === 'array') {
        //     if (this.game.aliveCount < 4) return;
        //     if (!data) return;
        //     if (data.type === 'quene') {
        //         const quene = this.game.getQueue(this.player);
        //         const skill = this.game.skills.find(
        //             (v) =>
        //                 v.player === this.player &&
        //                 v.effects.find((e) => e.hasTag(SkillTag.Array_Quene)) &&
        //                 v.isOpen()
        //         );
        //         if (skill) {
        //             const kingdom =
        //                 this.kingdom === 'none' || this.kingdom.includes('ye')
        //                     ? 'qun'
        //                     : this.kingdom;
        //             quene.forEach((v) => {
        //                 const comp = this.room.players.get(v.playerId);
        //                 if (comp) {
        //                     comp.owner.zhenfa_icon.loadAtlas(
        //                         `animation/zhenfa/icon/zhenfa_icon_${kingdom}.atlas`
        //                     );
        //                     comp.owner.zhenfa_icon.loadAtlas(
        //                         `animation/zhenfa/zi/zhenfa_zi_${kingdom}.atlas`
        //                     );
        //                     comp.owner.zhenfa_icon.visible = true;
        //                     comp.owner.zhenfa_zi.visible = true;
        //                     comp.owner.clearTimer(comp, comp.endZhenfa);
        //                     comp.owner.timerOnce(5000, comp, comp.endZhenfa);
        //                 }
        //             });
        //         }
        //     }
        //     if (data.type === 'siege') {
        //         const sieges = this.game.getSiege(this.player);
        //         const self = sieges.find((v) => v.from.includes(this.player));
        //         const skill = this.game.skills.find(
        //             (v) =>
        //                 v.player === this.player &&
        //                 v.effects.find((e) => e.hasTag(SkillTag.Array_Quene)) &&
        //                 v.isOpen()
        //         );
        //         if (sieges.length > 1 && skill && self) {
        //             const kingdom =
        //                 this.kingdom === 'none' || this.kingdom.includes('ye')
        //                     ? 'qun'
        //                     : this.kingdom;
        //             sieges.forEach((s) => {
        //                 s.from.forEach((v) => {
        //                     const comp = this.room.players.get(v.playerId);
        //                     if (comp) {
        //                         comp.owner.zhenfa_jiaji.loadAtlas(
        //                             `animation/zhenfa/jiaji/zhenfa_jiaji_${kingdom}.atlas`
        //                         );
        //                         comp.owner.zhenfa_jiaji.visible = true;
        //                         comp.owner.clearTimer(comp, comp.endZhenfa);
        //                         comp.owner.timerOnce(
        //                             5000,
        //                             comp,
        //                             comp.endZhenfa
        //                         );
        //                     }
        //                 });
        //             });
        //         }
        //     }
        //     return;
        // }
        if (ani === 'skilltext') {
            this.owner.skill_name.text = this.room.getTranslation(data.name);
            const x = this.isSelf ? 1788 : 80;
            Laya.Tween.create(this.owner.skill_name)
                .duration(500)
                .to('x', x)
                .ease(Laya.Ease.expoOut)
                .onStart(() => {
                    this.owner.skill_name.x = x + 120;
                })
                .then(() => {
                    this.owner.timer.once(500, this, () => {
                        this.owner.skill_name.text = '';
                        this.owner.skill_name.x = x;
                    });
                });
            return;
        }
        const config = FaceAni[ani];
        if (!config) return;
        if (config.type === 'spine') {
            Laya.loader.load(config.url, Laya.Loader.SPINE).then(() => {
                const sprite = Laya.Pool.getItemByClass('spine', Laya.Sprite);
                const node = (this.isSelf ? config.node_self : config.node) ?? [
                    0, 0, 0.5, 0.5, 1, 1,
                ];
                sprite.size(100, 100);
                sprite.anchor(node[2], node[3]);
                sprite.scale(node[4], node[5]);
                sprite.pos(node[0], node[1]);
                addTo.addChild?.(sprite);
                const spine =
                    sprite.getComponent(Laya.Spine2DRenderNode) ||
                    sprite.addComponent(Laya.Spine2DRenderNode);
                spine.source = config.url;
                spine.skinName = config.skinName ?? 'default';
                spine.useFastRender = config.useFastRender ?? true;
                sprite.once(Laya.Event.STOPPED, () => {
                    sprite.removeSelf();
                    Laya.Pool.recover('spine', sprite);
                });
                spine.play(config.animName ?? 'play', false);
            });
        }
        if (config.type === 'sk') {
            Laya.loader.load(config.url).then((templet: Laya.Templet) => {
                //创建模式为1，可以启用换装
                const sk = templet.buildArmature(0);
                const node = (this.isSelf ? config.node_self : config.node) ?? [
                    0, 0, 0.5, 0.5, 1, 1,
                ];
                sk.size(100, 100);
                sk.anchor(node[2], node[3]);
                sk.scale(node[4], node[5]);
                sk.pos(node[0], node[1]);
                addTo.addChild?.(sk);
                sk.on(Laya.Event.STOPPED, () => {
                    sk.removeSelf();
                });
                sk.skinName = config.animName ?? 'default';
                sk.play(config.animName ?? 'play', false);
                return sk;
            });
        }
        if (config.type === 'frame') {
            Laya.loader.load(config.url).then(() => {
                const sprite = Laya.Pool.getItemByClass(
                    'frameani',
                    Laya.Animation
                );
                const node = (this.isSelf ? config.node_self : config.node) ?? [
                    0, 0, 0.5, 0.5, 1, 1,
                ];
                sprite.size(100, 100);
                sprite.anchor(node[2], node[3]);
                sprite.scale(node[4], node[5]);
                sprite.pos(node[0], node[1]);
                sprite.source = config.url;
                sprite.interval = config.frame ?? 60;
                sprite.autoPlay = true;
                sprite.loop = false;
                sprite.wrapMode = 0;
                sprite.once(Laya.Event.COMPLETE, () => {
                    sprite.removeSelf();
                    Laya.Pool.recover('frameani', sprite);
                });
                addTo.addChild?.(sprite);
                return sprite;
            });
        }
    }

    public endZhenfa() {
        this.owner.zhenfa_jiaji.visible = false;
        this.owner.zhenfa_icon.visible = false;
        this.owner.zhenfa_icon.visible = false;
    }

    public set refreshMark(value: boolean | string) {
        if (typeof value === 'boolean') {
            this._dirtyFlags.mark = true;
        } else {
            this.renderMark(value);
        }
    }

    public get refreshMark() {
        return true;
    }

    public renderMark(key: string) {
        let node =
            (this.owner.marks.getChildByName(key) as UITextMark) ??
            (this.owner.images.getChildByName(key) as UIMark);
        const mark = this.player._mark[key];
        if (!mark) {
            if (node) {
                if (node instanceof UIMark) {
                    this.owner.images.removeChild(node);
                } else if (node instanceof UITextMark) {
                    this.owner.marks.removeChild(node);
                }
                //马车特殊处理
                if (key === 'mark.zi') {
                    if (this.isSelf) {
                        this.room.card.field_show = false;
                        this.room.card.refreshHandCards();
                    }
                }
                node.removeSelf();
                node.destroy();
            }
            return;
        }
        const options = mark.options ?? {
            visible: false,
        };
        if (!options.values) options.values = [];
        const visible = options.visible;
        let view = false;
        if (typeof visible === 'boolean') view = visible;
        else if (Array.isArray(visible))
            view = visible.includes(this.room.self?.playerId);
        if (view) {
            if (!node) {
                if (options.type === 'img') {
                    node = UIMark.create(
                        // `${ServerConfig.res_url}/image/marks/${mark.value}.png`,
                        `${ServerConfig.res_url}/image/marks/${options.url}.png`,
                        mark.value
                    );
                    node.name = key;
                    this.owner.images.addChild(node);
                    return;
                } else if (options.type === 'prompt') {
                    this.owner.bprompt.text = this.room.getTranslation({
                        text: mark.value,
                        values: options.values,
                    });
                    return;
                } else {
                    node = UITextMark.create(key);
                    node.name = key;
                    this.owner.marks.addChild(node);
                }
            }
            if (node) {
                if (node instanceof UIMark) {
                    node.set(
                        `${ServerConfig.res_url}/image/marks/${options.url}.png`,
                        mark.value
                    );
                } else if (node instanceof UITextMark) {
                    const key_text = this.room.getTranslation({
                        text: key,
                        values: options.values,
                    });
                    if (options.type === 'img') {
                    }
                    //马车特殊处理
                    else if (key === 'mark.zi') {
                        if (this.isSelf) {
                            this.room.card.field_show = true;
                            this.room.card.refreshHandCards();
                        }
                        node.set(
                            `${key_text}[${this.room.card.field_cards.length}]`
                        );
                    } else if (options.type === 'cards') {
                        const area = this.room.game.areas.get(options.areaId);
                        if (area) {
                            const cards = area.cards.filter((v) =>
                                v.hasMark(key)
                            );
                            node.set(`${key_text}[${cards.length}]`);
                            node.offAll(Laya.Event.CLICK);
                            node.on(Laya.Event.CLICK, () => {
                                this.room.window.showCardsWindow(
                                    node.text,
                                    cards
                                );
                            });
                        }
                    } else if (options.type === 'generals') {
                        // const area = this.room.game.areas.get(options.areaId);
                        const cards = [
                            ...this.room.game.generals.values(),
                        ].filter((v) => v.hasMark(key));
                        node.set(`${key_text}[${cards.length}]`);
                        node.offAll(Laya.Event.CLICK);
                        node.on(Laya.Event.CLICK, () => {
                            this.room.window.showCardsWindow(node.text, cards);
                        });
                    } else if (options.type === 'command') {
                        // const area = this.room.game.areas.get(options.areaId);
                        let cards = mark.value;
                        if (Array.isArray(cards)) {
                            node.set(`${key_text}[${cards.length}]`);
                        } else {
                            cards = [cards];
                            node.set(`${key_text}[1]`);
                        }
                        node.offAll(Laya.Event.CLICK);
                        node.on(Laya.Event.CLICK, () => {
                            this.room.window.showCardsWindow(node.text, cards);
                        });
                    } else if (options.type === 'suit') {
                        let suit = mark.value as CardSuit;
                        node.set(
                            `${key_text}[${sgs.getTranslation(
                                `img_suit${suit}`
                            )}]`
                        );
                    } else if (options.type === '[suit]') {
                        let text = ``;
                        if (
                            Array.isArray(mark.value) &&
                            mark.value.length &&
                            typeof mark.value.at(0) === 'number'
                        ) {
                            mark.value.forEach((value) => {
                                text += sgs.getTranslation(`img_suit${value}`);
                            });
                        }
                        node.set(`${key_text}[${text}]`);
                    } else if (Array.isArray(mark.value)) {
                        let text = '';
                        mark.value.forEach((value) => {
                            if (typeof value === 'string') {
                                text += sgs.getTranslation(value) + '-';
                            } else if (typeof value === 'number') {
                                text += value.toString() + '-';
                            } else if (typeof value === 'boolean') {
                                text += value ? '是' : '否' + '-';
                            } else if (
                                Reflect.has(value, 'text') &&
                                Reflect.has(value, 'values')
                            ) {
                                text += this.room.getTranslation(value) + '-';
                            }
                        });
                        node.set(
                            `${key_text}[${text.slice(0, text.length - 1)}]`
                        );
                    } else if (typeof mark.value === 'string') {
                        node.set(
                            `${key_text}[${sgs.getTranslation(mark.value)}]`
                        );
                    } else if (typeof mark.value === 'number') {
                        node.set(`${key_text}[${mark.value.toString()}]`);
                    } else if (typeof mark.value === 'boolean') {
                        node.set(`${key_text}`);
                    } else if (
                        Reflect.has(mark.value, 'text') &&
                        Reflect.has(mark.value, 'values')
                    ) {
                        node.set(
                            `${key_text}[${this.room.getTranslation(
                                mark.value
                            )}]`
                        );
                    }
                }
            }
        } else {
            node?.destroy();
        }
    }

    onChat(message: string) {
        this.owner.paopao.clearTimer(this, this.onChatTimerEnd);
        this.owner.paopao.visible = true;
        this.owner.paopao.chatLabel.text = message;
        this.owner.paopao.timerOnce(3500, this, this.onChatTimerEnd);
    }

    onChatTimerEnd() {
        this.owner.paopao.visible = false;
    }
}
