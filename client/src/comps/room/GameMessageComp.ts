import { ServerConfig } from '../../config';
import { GameCard } from '../../core/card/card';
import { CardPut } from '../../core/card/card.types';
import {
    ChooseData,
    GameRequest,
    PlayPhaseResule,
    RequestOptionData,
} from '../../core/choose/choose.types';
import { Custom, SetMark } from '../../core/custom/custom';
import { CustomString } from '../../core/custom/custom.type';
import { GameState } from '../../core/enums';
import {
    MsgGameStart,
    Message,
    MsgGameOver,
    MsgAddSkill,
    MsgRemoveSkill,
    MsgAddEffect,
    MsgRemoveEffect,
    MsgRequest,
    MsgGameChat,
    MsgGamePrompt,
    MsgChangeBgmAndBg,
    MsgSkillState,
    MsgBuildGameCard,
} from '../../core/message/message';
import {
    MsgPlayCardAni,
    MsgPlayCardMoveAni,
    MsgPlayDirectLine,
    MsgPlayFaceAni,
    MsgPlayGlobalAni,
} from '../../core/message/message.ani';
import { MsgDelay } from '../../core/message/message.exter';
import { MsgWindow } from '../../core/message/message.window';
import { GamePlayer } from '../../core/player/player';
import { PlayerId } from '../../core/player/player.types';
import { GameRoom } from '../../core/room/room';
import { StateEffect, TriggerEffect } from '../../core/skill/effect';
import { Skill } from '../../core/skill/skill';
import {
    EffectId,
    EffectType,
    TriggerEffectContext,
} from '../../core/skill/skill.types';
import { res } from '../../enums';
import { S } from '../../singleton';
import { UICard } from '../../ui/UICard';
import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { UIMark } from '../../ui/UIMark';
import { UIOptionButton } from '../../ui/UIOptionButton';
import { UISeat } from '../../ui/UISeat';
import { UISkillButton } from '../../ui/UISkillButton';
import { GameChooseComp } from '../choose/GameChooseComp';
import { SeatComp } from '../player/SeatComp';
import { SelfSeatComp } from '../player/SelfSeatComp';
import { RoomGameComp } from './RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export class GameMessageComp extends Laya.Script {
    declare owner: UIGameRoom;

    public game: RoomGameComp;
    public choose: GameChooseComp;

    public _requests: GameRequest[] = [];

    onStart(): void {
        this.game = this.owner.getComponent(RoomGameComp);
        this.choose = this.owner.addComponent(GameChooseComp);
    }

    onMsgGameStart(data: MsgGameStart, msg: Message) {
        S.ui.playBgm(`${ServerConfig.res_url}/audio/system/background.mp3`);
        const { options, players } = data;
        this.game.startTime = Date.now();
        const room = new GameRoom(this.game.room.roomId, options);
        this.game.game = room;
        room.initStart(players);
        if (this.game.selfId === 'alone') {
            room.players.forEach((v) => {
                v.controlId = 'alone';
            });
        }
        const spectate = data.spectate.find(
            (v) => v.playerId === this.game.room.sessionId
        );
        if (spectate) {
            this.game._selfId = spectate.spectateBy;
            this.game.spectate = true;
        }
        //selfseat
        const self = room.getPlayer(this.game.selfId);
        if (!self) {
            S.ui.toast('找不到主视角玩家');
            this.game.onUpdate = () => {};
            return;
        }
        self.__self = true;
        const comp = this.owner.selfseat.getComponent(SelfSeatComp);
        comp.isSelf = true;
        comp.bind(self, this.game);
        this.game.players.set(self.playerId, comp);
        //seat
        const prefab = Laya.loader.getRes(`resources/room/seat.lh`);
        room.players.forEach((v) => {
            if (v === self) return;
            const node = prefab.create() as UISeat;
            node.pos(959, 539);
            this.owner.players.addChild(node);
            const comp = node.getComponent(SeatComp);
            comp.bind(v, this.game);
            this.game.players.set(v.playerId, comp);
        });
        room.gameState = GameState.Gaming;
        room.vcardids = 99999;
        this.owner.circle.text = room.circleCount.toString();
        this.owner.cardcount.text = room.drawArea.count.toString();
    }

    onMsgChangeBgmAndBg(data: MsgChangeBgmAndBg, msg: Message) {
        const { bg_url, bgm_url, bgm_loop } = data;
        if (bg_url) {
            if (bg_url.startsWith('resources/')) {
                this.owner.bg.loadImage(bg_url);
            } else {
                this.owner.bg.loadImage(`${ServerConfig.res_url}/${bg_url}`);
            }
        }
        if (bgm_url) {
            const old = S.ui.currentBgm;
            const url = bgm_url.startsWith('resources/')
                ? bgm_url
                : `${ServerConfig.res_url}/${bgm_url}`;
            if (bgm_loop) {
                S.ui.playBgm(url);
            } else {
                S.ui.playBgm(url);
            }
        }
    }

    onLog(log: CustomString) {
        this.owner.logLabel.text += `${this.game.getTranslation(log)}\n`;
        if (!this.game.isLockLog) {
            this.owner.logPanel.scroller.scrollBottom(true);
        }
    }

    onAudio(
        audio:
            | string
            | {
                  type: 'death' | 'skill';
                  player?: PlayerId;
                  effect?: number;
              }
    ) {
        if (typeof audio === 'string') {
            if (!audio.startsWith('resources/')) {
                audio = `${ServerConfig.res_url}/${audio}`;
            }
            S.ui.playAudio(audio);
        } else {
            if (audio.type === 'death') {
                const player = this.game.game.getPlayer(audio.player);
                if (player && player.getMainGeneral())
                    S.ui.playAudio(
                        `${ServerConfig.res_url}/${player
                            .getMainGeneral()
                            .getAssetsUrl('death')}`
                    );
            }
            if (audio.type === 'skill') {
                const effect = this.game.game.getEffect(audio.effect);
                if (effect && effect instanceof TriggerEffect) {
                    if (effect.audios) {
                        if (effect.audios.length) {
                            const url = effect.audios.shift();
                            effect.audios.push(url);
                            S.ui.playAudio(`${ServerConfig.res_url}/${url}`);
                        }
                    } else if (
                        effect.skill &&
                        effect.skill.audios &&
                        effect.skill.audios.length
                    ) {
                        const url = effect.skill.audios.shift();
                        effect.skill.audios.push(url);
                        S.ui.playAudio(`${ServerConfig.res_url}/${url}`);
                    }
                }
            }
        }
    }

    onPropertyChange(
        data: [string, string | number | undefined, string, any][]
    ) {
        data.forEach((v) => {
            switch (v[0]) {
                case 'room':
                    const room = this.game as any;
                    if (!room || !room.game) return;
                    if (room[v[2]] !== undefined) {
                        if (typeof room[v[2]] === 'function') {
                            room[v[2]].call(room, v[3]);
                        } else {
                            room[v[2]] = v[3];
                        }
                    } else {
                        room.game[v[2]] = v[3];
                    }
                    break;
                case 'player':
                    const player = this.game.players.get(v[1] as string) as any;
                    if (!player || !player.player) return;
                    if (player[v[2]] !== undefined) {
                        if (typeof player[v[2]] === 'function') {
                            player[v[2]].call(player, v[3]);
                        } else {
                            player[v[2]] = v[3];
                        }
                    } else {
                        player.player[v[2]] = v[3];
                    }
                    break;
                case 'card':
                    const card = this.game.game.getCard(v[1] as string) as any;
                    if (card[v[2]] !== undefined) {
                        card[v[2]] = v[3];
                    }
                    [
                        ...this.game.card.hand_cards,
                        ...this.game.card.process_cards,
                        ...this.game.card.cards,
                    ].forEach((c) => {
                        if (c.type === 'card' && c.card === card) {
                            if (!this.game.card.process_cards.includes(c)) {
                                c.setCard(
                                    card,
                                    card.canVisible(this.game.self)
                                );
                            }
                            if (v[2] === 'label') {
                                const _d = JSON.parse(v[3]);
                                if (
                                    !_d.only_process ||
                                    !this.game.card.hand_cards.includes(c)
                                ) {
                                    c.setLabel(
                                        this.game.getTranslation(_d.label)
                                    );
                                }
                            }
                        }
                    });
                    break;
            }
        });
    }

    onMarkChange(data: SetMark[]) {
        data.forEach((v) => {
            const { objType, objId, key, value, options } = v;
            let obj: Custom;
            switch (objType) {
                case 'player':
                    obj = this.game.game.getPlayer(objId as string);
                    break;
                case 'room':
                    obj = this.game.game;
                    break;
                case 'card':
                    obj = this.game.game.getCard(objId as string);
                    break;
                case 'general':
                    obj = this.game.game.getGeneral(objId as string);
                    break;
                case 'skill':
                    obj = this.game.game.getSkill(objId as number);
                    break;
                case 'effect':
                    obj = this.game.game.getEffect(objId as number);
                    break;
            }
            if (obj) {
                if (!obj._mark) obj._mark = {};
                if (value === undefined) {
                    delete obj._mark[key];
                } else {
                    if (obj._mark[key]) {
                        obj._mark[key].value = value;
                        if (options) {
                            obj._mark[key].options = options as any;
                        }
                    } else {
                        obj._mark[key] = {
                            value,
                            options: {
                                values: options?.values,
                                visible: options?.visible ?? false,
                                type: options?.type as any,
                                areaId: options?.areaId,
                                url: options?.url,
                            },
                        };
                    }
                }
                //TODO 刷新标记显示
                switch (objType) {
                    case 'player':
                        const ui = this.game.players.get(objId as string);
                        if (ui) {
                            ui.renderMark(key);
                        }
                        break;
                    case 'room':
                        break;
                    case 'card':
                        this.game.card.handleCardsMark(obj as GameCard, key);
                        break;
                    case 'general':
                        break;
                    case 'skill':
                        break;
                    case 'effect':
                        break;
                }
            }
        });
    }

    onMsgGameChat(data: MsgGameChat) {
        const { player, text } = data;
        this.game.players.get(player)?.onChat(text);
    }

    onMsgGamePrompt(data: MsgGamePrompt) {
        const { text } = data;
        S.ui.toast(text);
    }

    onMsgBuildGameCard(data: MsgBuildGameCard) {
        const initArea = this.game.game.areas.get(data.initArea);
        const card = new GameCard(this.game.game, data.data);
        card.put = CardPut.Down;
        if (initArea) {
            initArea.add([card]);
        } else {
            if (data.data.derived) {
                this.game.game.treasuryArea.add([card]);
            } else {
                this.game.game.drawArea.add([card]);
            }
        }
        this.game.game.buildCard(card);
        this.game.renderCardText();
    }

    onMsgGameOver(data: MsgGameOver, msg: Message) {
        if (data.wins.length === 0) {
            this.game.playGlobalAni('gameover_ping');
        } else if (data.wins.includes(this.game.selfId)) {
            this.game.playGlobalAni('gameover_win');
        } else {
            this.game.playGlobalAni('gameover_lose');
        }
        let mvp: GamePlayer,
            mvp_score = 0;
        data.scores.forEach((v) => {
            const player = this.game.game.getPlayer(v.player);
            const score =
                v.score.kill +
                v.score.damage +
                v.score.recover +
                v.score.damage_count +
                v.score.recover_count;
            if (score >= mvp_score) {
                mvp = player;
                mvp_score = score;
            }
        });
        this.owner.mvp_txt
            .setVar('username', mvp.username)
            .setVar('score', mvp_score);
        this.owner.timerOnce(1500, this, () => {
            this.owner.game_over.visible = true;
            this.owner.mvp.visible = true;
            const general = mvp.getGenerls().at(0);
            this.owner.avatar_mvp.loadImage(
                `${ServerConfig.res_url}/${general.getAssetsUrl('image')}`
            );
            this.owner.game_over.on(Laya.Event.CLICK, () => {
                this.game.table.backThis();
            });
        });
        //自动保存录像
        const gameReplay = {
            name: `${this.game.self.gameName}-${new Date().toLocaleString(
                'zh-CN',
                {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }
            )}`,
            self: this.game.selfId,
            date: Date.now(),
            messages: this.game._messaged,
            chats: this.game.chats,
            reconnect: this.game._reconnecting_data,
        };
        S.replay.saveReplay(gameReplay).then(() => {
            S.ui.toast('录像已保存');
        });
    }

    onMsgAddSkill(data: MsgAddSkill, msg: Message) {
        const { id, skill, player, options } = data;
        const _data = sgs.getSkill(skill);
        if (!_data) return;
        const _skill = new Skill(
            id,
            this.game.game,
            this.game.game.getPlayer(player),
            _data,
            options
        );
        this.game.game.skills.push(_skill);
        if (options.source.includes(`equip:`)) {
            _skill.sourceEquip = this.game.game.getCard(
                options.source.split(':')[1]
            );
        }
        if (options.source.includes(`effect:`)) {
            _skill.sourceEffect = this.game.game.getEffect(
                Number(options.source.split(':')[1])
            );
        }
        if (options.showui === 'mark') {
            const card = UICard.createSkill(_skill);
            this.owner.cards.addChild(card);
            this.game.skills.push(card);
            if (_skill.player === this.game.self) {
                const mark = UIMark.create(
                    `${ServerConfig.res_url}/image/marks/@${_skill.trueName}.png`,
                    ''
                );
                this.owner.markbg_.addChild(mark);
                mark.size(42, 42);
                (_skill as any)['__mark'] = mark;
            }
        } else {
            let has = false;
            if (_skill.sourceEquip && _skill.player === this.game.self) {
                //找到对应的装备
                const equip = [
                    this.game.selfComp.owner.equip31,
                    this.game.selfComp.owner.equip32,
                    this.game.selfComp.owner.equip33,
                    this.game.selfComp.owner.equip34,
                    this.game.selfComp.owner.equip35,
                    this.game.selfComp.owner.equip36,
                ].find((v) => v.card === _skill.sourceEquip);
                if (equip) {
                    has = true;
                    equip.skill = _skill;
                }
            }
            const btn = UISkillButton.create(_skill);
            this.game.skills.push(btn);
            btn.item.onLongClick(() => {
                this.game.card.showInfo(
                    `${sgs.getTranslation(_skill.name)}\n${sgs.getTranslation(
                        `@desc:${_skill.name}`
                    )}`
                );
            });
        }
        this.game.renderSkill();
    }

    onMsgSkillState(data: MsgSkillState, msg: Message) {
        const { id, preshow } = data;
        const btn = this.game.skills.find((v) => v.skill?.id === id);
        btn.skill.preshow = preshow;
        if (btn instanceof UISkillButton) {
            btn.setPreShow(preshow);
        }
    }

    onMsgRemoveSkill(data: MsgRemoveSkill, msg: Message) {
        const { id } = data;
        const skill = this.game.game.getSkill(id);
        if (!skill) return;
        if ((skill as any)['__mark']) {
            (skill as any)['__mark'].destroy();
        }
        lodash.remove(this.game.game.skills, (s) => s === skill);
        this.game.skills.forEach((v) => {
            if (v.skill === skill) {
                v.skill = undefined;
            }
        });
        this.game.renderSkill();
    }

    onMsgAddEffect(data: MsgAddEffect, msg: Message) {
        const { id, skill, player, effect_name } = data;
        const _data = sgs.getEffect(effect_name);
        if (!_data) return;
        const _skill = this.game.game.getSkill(skill);
        if (_data.type === EffectType.Trigger) {
            const effect = new TriggerEffect(
                id,
                this.game.game,
                this.game.game.getPlayer(player),
                _data,
                _skill
            );
            this.game.game.effects.push(effect);
            this.game.game.trigger_effects.push(effect);
            if (effect.skill) {
                effect.skill.effects.push(effect);
                effect.skill.trigger_effects.push(effect);
            }
            if (_data.name === 'base_selectors') {
                this.game.game.base_selectors = effect;
            }
        }
        if (_data.type === EffectType.State) {
            const effect = new StateEffect(
                id,
                this.game.game,
                this.game.game.getPlayer(player),
                _data,
                _skill
            );
            this.game.game.effects.push(effect);
            this.game.game.state_effects.push(effect);
            if (effect.skill) {
                effect.skill.effects.push(effect);
                effect.skill.state_effects.push(effect);
            }
        }
    }

    onMsgRemoveEffect(data: MsgRemoveEffect, msg: Message) {
        const { id } = data;
        const effect = this.game.game.getEffect(id);
        if (!effect) return;
        lodash.remove(this.game.game.effects, (e) => e === effect);
        lodash.remove(this.game.game.trigger_effects, (e) => e === effect);
        lodash.remove(this.game.game.state_effects, (e) => e === effect);
    }

    onMsgDelay(data: MsgDelay, msg: Message) {
        const { ms } = data;
        this.game.players.forEach((v) => v.startCountDown(ms, ''));
    }

    onMsgRequest(data: MsgRequest, msg: Message) {
        const { id, player, get_selectors, complete } = data;
        this.owner.bancountry.visible = false;
        if (!complete) {
            const req: GameRequest = {
                id,
                player: this.game.game.getPlayer(player),
                room: this.game.game,
                get_selectors: {
                    selectorId: get_selectors.selectorId,
                    context: this.game.game.toData_Context(
                        get_selectors.context
                    ),
                },
                complete: false,
                timeout: false,
                result: {
                    cancle: false,
                    use_or_play_card: undefined,
                    selected_skill: undefined,
                    playphase: PlayPhaseResule.End,
                    results: {},
                    sort_result: [],
                },
            };
            (req as any).isSelf = req.player.playerId === this.game.selfId;
            this.game.game.fillRequest(req);
            this._requests.push(req);

            //技能特殊处理
            if (get_selectors.selectorId.split('.').at(-1) === 'use_skill') {
                const can_use_skills: {
                    selectorId: string;
                    context: TriggerEffectContext;
                }[] = [];
                get_selectors.context.can_use_skills.forEach((v: any) => {
                    can_use_skills.push({
                        selectorId: v.selectorId,
                        context: this.game.game.toData_Context(v.context),
                    });
                });
                //设定prompt
                let prompt: CustomString = '';
                let notopen = false;
                if (can_use_skills.length === 0) {
                    this.game.startChoose(req);
                } else if (can_use_skills.length === 1) {
                    const effect = can_use_skills[0].context.effect;
                    if (effect && effect.isOpen()) {
                        if (
                            effect.skill &&
                            effect.skill.options.source === 'mark.huashen'
                        ) {
                            prompt = 'mark.huashen';
                        } else {
                            prompt = effect.name;
                        }
                    } else {
                        prompt = 'skill';
                        notopen = true;
                    }
                } else {
                    const one = [
                        ...new Set(
                            can_use_skills
                                .map((v) => {
                                    const effect = v.context.effect;
                                    return effect?.skill;
                                })
                                .filter((v) => v)
                        ).values(),
                    ];
                    if (one.length === 0) {
                        prompt = 'skill';
                    } else if (one.length === 1) {
                        if (
                            one[0] &&
                            one[0].options.source === 'mark.huashen'
                        ) {
                            prompt = 'mark.huashen';
                        } else {
                            prompt = one[0].name;
                        }
                    } else {
                        prompt = 'skill';
                    }
                    notopen = one.some((v) => !v.isOpen());
                }

                const {
                    showTimebar = true,
                    ms = this.game.game.responseTime,
                    isAllShowTimebar = false,
                    // thinkPrompt,
                } = req.options;
                if (showTimebar) {
                    this.game.players
                        .get(req.player.playerId)
                        ?.startCountDown(ms, prompt);
                    if (isAllShowTimebar || notopen) {
                        this.game.players.forEach((v) => {
                            if (v.player.alive) {
                                v.startCountDown(ms, 'skill');
                            }
                        });
                    }
                }
                if (
                    req.player.controlId === this.game.selfId &&
                    !this.choose.request
                ) {
                    (req as any).promise =
                        this.getSkillInvokeResult(can_use_skills);
                    (req as any).promise.then((result: any) => {
                        if (result.effect) {
                            req.result.selected_skill = result.effect.id;
                        }
                        if (result.exec) {
                            //重新填充
                            const selectors = result.selector;
                            req.selectors = selectors?.selectors ?? {};
                            req.options = selectors?.options ?? {
                                showMainButtons: false,
                            };
                            this.game.startChoose(req);
                        } else {
                            req.result.cancle = true;
                            this.game.response(req);
                        }
                    });
                }
            } else {
                if (
                    req.player.controlId === this.game.selfId &&
                    !this.choose.request
                ) {
                    this.choose.start(req);
                }
                const {
                    showTimebar = true,
                    ms = this.game.game.responseTime,
                    prompt,
                    thinkPrompt,
                    isAllShowTimebar = false,
                } = req.options;
                if (showTimebar) {
                    this.game.players
                        .get(req.player.playerId)
                        ?.startCountDown(ms, thinkPrompt);
                    if (isAllShowTimebar) {
                        this.game.players.forEach((v) => {
                            if (v.player.alive) {
                                v.startCountDown(ms, thinkPrompt);
                            }
                        });
                    }
                }
            }
        }

        if (complete) {
            const req = this._requests.find((v) => v.id === id);
            if (req) {
                if ((req as any).promise) {
                    this.owner.selfseat.confirm_skill.visible = false;
                    this.owner.selfseat.cancle_skill.visible = false;
                    this.owner.selfseat.confirm_skill.offAll(Laya.Event.CLICK);
                    this.owner.selfseat.cancle_skill.offAll(Laya.Event.CLICK);
                    this.owner.selfseat.prompt.text = '';
                    this.owner.selfseat.options.children
                        .slice()
                        .forEach((v) => v.destroy());
                }
                lodash.remove(this._requests, (r) => r === req);
                if (this._requests.length === 0) {
                    this.game.players.forEach((v) => {
                        v.endCountDown();
                        v.owner.bprompt.text = ``;
                        //清除所有prompt类型的标记
                        // if (!v.player._mark) return;
                        // Object.keys(v.player._mark).forEach((key) => {
                        //     const mark = v.player._mark[key];
                        //     if (
                        //         mark &&
                        //         mark.options &&
                        //         mark.options.type === 'prompt'
                        //     ) {
                        //         v.player.removeMark(key);
                        //     }
                        // });
                    });
                }
            }
            if (this.choose?.originalRequest?.id === id) {
                this.choose.end();
            }
        }
    }

    onMsgPlayFaceAni(data: MsgPlayFaceAni, msg: Message) {
        this.game.players.get(data.player)?.playFaceAni(data.ani, data.data);
    }

    onMsgPlayCardMoveAni(data: MsgPlayCardMoveAni, msg: Message) {
        this.game.card.onMoveCards(data.data);
    }

    onMsgPlayCardAni(data: MsgPlayCardAni, msg: Message) {
        const { card, ani, only_process } = data;
        const cards = [
            ...this.game.card.process_cards,
            ...this.game.card.cards,
        ];
        if (!only_process) cards.push(...this.game.card.hand_cards);

        cards.forEach((v) => {
            if (v.type === 'card' && v.card?.id === card) {
                v.playAni(ani);
            }
        });
    }

    onMsgPlayGlobalAni(data: MsgPlayGlobalAni, msg: Message) {
        this.game.playGlobalAni(data.ani, data.data);
    }

    onMsgWindow(data: MsgWindow, msg: Message) {
        this.game.window.serverWindow(data);
    }

    onMsgPlayDirectLine(data: MsgPlayDirectLine, msg: Message) {
        const { source, targets, playType } = data;
        this.game.ani.playDirectLine(source, targets, playType);
    }

    async getSkillInvokeResult(
        skills: {
            selectorId: string;
            context: TriggerEffectContext;
        }[] = []
    ): Promise<{
        effect: TriggerEffect;
        selector: {
            selectors?: {
                [key: string]: ChooseData;
            };
            options?: RequestOptionData;
        };
        exec: boolean;
    }> {
        let result: {
            effect: TriggerEffect;
            selector: {
                selectors?: {
                    [key: string]: ChooseData;
                };
                options?: RequestOptionData;
            };
        };
        //skill有多个
        if (skills.length > 1) {
            const buttons: UIOptionButton[] = [];
            this.owner.selfseat.prompt.text = `请选择一个技能`;
            let canCancleCount = 0;
            result = await new Promise<typeof result>((resolve, reject) => {
                skills.forEach((v) => {
                    let canCancle = false;
                    const { selectorId, context } = v;
                    const effect = context.effect;
                    if (!effect) return;
                    let selector = this.game.game.getSelectors(
                        selectorId,
                        context
                    );
                    if (effect.data.forced === 'cost') canCancle = true;
                    else if (
                        selector &&
                        selector.options &&
                        selector.options.canCancle
                    )
                        canCancle = true;
                    let _name = effect.skill?.name ?? effect.name;
                    const btn = UIOptionButton.create(
                        this.game.getTranslation(_name)
                    );
                    this.owner.selfseat.options.addChild(btn);
                    btn.item.onClick(() => {
                        resolve({
                            effect,
                            selector,
                        });
                    });
                    buttons.push(btn);
                    if (canCancle) canCancleCount++;
                });
                if (canCancleCount === skills.length) {
                    const btn = UIOptionButton.create(
                        this.game.getTranslation('cancle')
                    );
                    this.owner.selfseat.options.addChild(btn);
                    btn.item.onClick(() => {
                        resolve({
                            effect: undefined,
                            selector: undefined,
                        });
                    });
                    buttons.push(btn);
                }
            });
            this.owner.selfseat.prompt.text = '';
            buttons.forEach((v) => v.destroy());
        } else {
            const { selectorId, context } = skills[0];
            const effect = context.effect;
            let selector = this.game.game.getSelectors(selectorId, context);
            result = {
                effect,
                selector,
            };
        }
        //询问是否发动
        if (result && result.effect) {
            let canCancle = false;
            // const cancancle = result.selector?.options?.canCancle ?? false;
            // let notopen = result.effect.skill && !result.effect.skill.isOpen();
            // 设置选中技能按钮状态
            if (result.effect?.skill) {
                const skillUI = this.game.skills.find(
                    (s) => s.skill === result.effect.skill
                );
                skillUI?.item?.setSelected(true);
            }
            const exec = await new Promise<boolean>((reslove) => {
                if (result.effect.data.forced === 'cost') canCancle = true;
                else if (
                    result.selector &&
                    Object.keys(result.selector.selectors).length > 0
                ) {
                    if (
                        result.selector.options &&
                        !result.selector.options.canCancle &&
                        !result.effect.isOpen()
                    ) {
                        canCancle = true;
                    } else {
                        reslove(true);
                        return;
                    }
                } else {
                    if (!result.effect.isOpen()) {
                        canCancle = true;
                    }
                }
                if (canCancle) {
                    this.owner.selfseat.buttons.visible = true;
                    this.owner.selfseat.confirm_skill.visible = true;
                    this.owner.selfseat.cancle_skill.visible = true;
                    this.owner.selfseat.confirm_skill.on(
                        Laya.Event.CLICK,
                        () => {
                            reslove(true);
                        }
                    );
                    this.owner.selfseat.cancle_skill.on(
                        Laya.Event.CLICK,
                        () => {
                            reslove(false);
                        }
                    );
                    let _name = result.effect.skill?.name ?? result.effect.name;
                    this.owner.selfseat.prompt.text = `是否发动技能：${this.game.getTranslation(
                        _name
                    )}`;
                } else {
                    reslove(true);
                }
            });
            this.owner.selfseat.buttons.visible = false;
            this.owner.selfseat.confirm_skill.visible = false;
            this.owner.selfseat.cancle_skill.visible = false;
            this.owner.selfseat.confirm_skill.offAll(Laya.Event.CLICK);
            this.owner.selfseat.cancle_skill.offAll(Laya.Event.CLICK);
            this.owner.selfseat.prompt.text = '';

            if (!exec) {
                return {
                    effect: result.effect,
                    selector: undefined,
                    exec: false,
                };
            }
        }
        return Object.assign(result, { exec: true });
    }
}
