import { Room } from 'colyseus.js';
import { CustomString } from '../../core/custom/custom.type';
import { Message } from '../../core/message/message';
import { GameRoom } from '../../core/room/room';
import { UIGameRoom } from '../../ui/UIGameRoom';
import { PlayerComp } from '../player/PlayerComp';
import { GameMessageComp } from './GameMessageComp';
import { RoomTableComp } from './RoomTableComp';
import { SelfSeatComp } from '../player/SelfSeatComp';
import { FaceAni, GlobalAni } from '../../core/ani.config';
import { UIBanCountry } from '../../ui/UIBanCountry';
import { UICard } from '../../ui/UICard';
import {
    CardAttr,
    CardColor,
    CardSuit,
    SourceData,
    VirtualCardData,
} from '../../core/card/card.types';
import { GameCard } from '../../core/card/card';
import { VirtualCard } from '../../core/card/vcard';
import { S } from '../../singleton';
import { UIOptionButton } from '../../ui/UIOptionButton';
import { GameWindowComp } from './GameWindowComp';
import { GameRequest } from '../../core/choose/choose.types';
import { GameChooseComp } from '../choose/GameChooseComp';
import { GameCardComp } from './GameCardComp';
import { GameAniComp } from './GameAniComp';
import { UIEquipSelf } from '../../ui/UIEquipSelf';
import { UISkillButton } from '../../ui/UISkillButton';
import { AssetsUrlMapping } from '../../urlmap';
import { ServerConfig } from '../../config';
import { RoomState } from '../../models/RoomStata';
import { ChatMessage, RoomReconnectData } from '../../core/room/room.types';
import { SetMark } from '../../core/custom/custom';
import { MsgPlayCardMoveAni } from '../../core/message/message.ani';
import { AreaType } from '../../core/area/area.type';
import { EntityTypeEnum } from '../../enums';
import { GamePlayer } from '../../core/player/player';
import { UIInfoItem } from '../../ui/UIInfoItem';
import { SeatComp } from '../player/SeatComp';
import { UISeat } from '../../ui/UISeat';

const { regClass, property } = Laya;

@regClass()
export class RoomGameComp extends Laya.Script {
    declare owner: UIGameRoom;

    public room: Room<RoomState>;
    public table: RoomTableComp;
    public game: GameRoom;

    protected playerInfoType = 0;
    protected currentPlayerInfo: GamePlayer;
    public isLockLog: boolean = false;

    public currentUserName: string;

    /** 开始时间 */
    startTime: number;
    /** 已处理的消息 */
    public _messaged: { message: Message; frame: number; isExcept: boolean }[] =
        [];
    public chats: ChatMessage[] = [];
    /** 按顺序处理消息 */
    public _msgId: number = -1;
    /** 暂停处理 */
    public _pause: boolean = true;
    /** 重连中 */
    public _reconnecting: RoomReconnectData;
    /** 记录重连数据 */
    public _reconnecting_data: RoomReconnectData;
    /** 所有玩家 */
    public players: Map<string, PlayerComp> = new Map();

    public jubaos: { [key: string]: boolean } = {};
    public pingbis: { [key: string]: boolean } = {};

    public _spectate: boolean = false;

    public set spectate(value: boolean) {
        this._spectate = value;
        this.owner.selfseat.looking.visible = value;
    }

    public get spectate() {
        return this._spectate;
    }

    public message: GameMessageComp;
    public window: GameWindowComp;
    public card: GameCardComp;
    public ani: GameAniComp;

    //技能按钮
    public skills: (UISkillButton | UIEquipSelf | UICard)[] = [];

    public get self() {
        return this.selfComp?.player;
    }

    public _selfId: string;
    public get selfId() {
        return this._selfId ?? this.room.sessionId;
    }

    public get selfComp() {
        return this.players.get(this.selfId) as SelfSeatComp;
    }

    init(room: Room<RoomState>, table: RoomTableComp) {
        this.room = room;
        this.table = table;
    }

    // 游戏循环状态
    private _lastRenderTime = 0;
    private _renderInterval = 33; // 约30FPS
    protected _bigrender = 0;

    onAwake(): void {
        this.owner.stands.itemRenderer = this.refreshListItem.bind(this);
        this.owner.stands.numItems =
            this.table._players.length + this.table._spectates.length;

        this.message = this.owner.addComponent(GameMessageComp);
        this.window = this.owner.addComponent(GameWindowComp);
        this.card = this.owner.addComponent(GameCardComp);
        this.ani = this.owner.addComponent(GameAniComp);

        this.owner.round.on(Laya.Event.CLICK, this, () => {
            this.owner.log.visible = !this.owner.log.visible;
        });
        this.owner.liaotian.on(Laya.Event.CLICK, this, () => {
            this.table.owner.chat.visible = !this.table.owner.chat.visible;
        });

        this.owner.tuoguan.on(Laya.Event.CLICK, this, this.onTuoguan);

        this.skills.push(this.owner.selfseat.equip31);
        this.skills.push(this.owner.selfseat.equip32);
        this.skills.push(this.owner.selfseat.equip33);
        this.skills.push(this.owner.selfseat.equip34);
        this.skills.push(this.owner.selfseat.equip35);
        this.skills.push(this.owner.selfseat.equip36);

        this.owner.touxiang.on(Laya.Event.CLICK, this, this.onTouxiang);

        this.owner.bg.on(Laya.Event.CLICK, this, () => {
            this.owner.log.visible = false;
            this.table.owner.chat.visible = false;
            this.owner.playerinfo.visible = false;
            this.currentPlayerInfo = undefined;
        });

        this.owner.shezhi.on(
            Laya.Event.CLICK,
            this.table,
            this.table.onSettingShow
        );

        this.owner.general_skills.on(Laya.Event.CLICK, this, () => {
            this.playerInfoType = 0;
            if (this.currentPlayerInfo) {
                this.showPlayerInfo(this.currentPlayerInfo);
            }
        });
        this.owner.equip_skills.on(Laya.Event.CLICK, this, () => {
            this.playerInfoType = 1;
            if (this.currentPlayerInfo) {
                this.showPlayerInfo(this.currentPlayerInfo);
            }
        });
        this.owner.player_close.on(Laya.Event.CLICK, this, () => {
            this.owner.playerinfo.visible = false;
            this.currentPlayerInfo = undefined;
        });

        this.owner.btn_lock.on(Laya.Event.CLICK, this, () => {
            this.isLockLog = !this.isLockLog;
            this.owner.btn_lock.text = this.isLockLog ? '解锁' : '锁定';
        });

        this.owner.popup_jubao.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                this.jubao(this.currentUserName);
            }
        });
        this.owner.popup_pingbi.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                this.pingbi(this.currentUserName);
            }
        });
    }

    protected refreshListItem(index: number, item: Laya.GTextField) {
        let username: string;
        if (index >= this.table._players.length) {
            username =
                this.table._spectates[index - this.table._players.length];
            item.text = `(旁观)${username}`;
        } else {
            username = this.table._players[index];
            item.text = username;
        }
        item.offAll(Laya.Event.CLICK);
        item.on(Laya.Event.CLICK, this, () => {
            if (S.client.isAdmin) {
                Laya.GRoot.inst.showPopup(this.table.owner.popup_admin);
                this.table.currentUserName = username;
            } else {
                Laya.GRoot.inst.showPopup(this.owner.popup);
                this.currentUserName = username;
            }
        });
    }

    onUpdate(): void {
        this.gameLoop();
    }

    // 游戏主循环
    private gameLoop(): void {
        const now = Laya.Browser.now();
        const delta = now - this._lastRenderTime;

        if (delta >= this._renderInterval) {
            this._lastRenderTime = now - (delta % this._renderInterval);
            this._bigrender++;
            if (this._reconnecting) {
                this.handleReconnect();
            }
            // 执行每帧逻辑
            this.onFrameUpdate();
            // 执行定时刷新逻辑
            this.renderTime();
        }

        if (this.table.owner.video_data) {
            try {
                this.handleMessage_Replay();
            } catch (e) {
                console.log(e);
            }
        } else {
            this._msgId++;
            try {
                this.handleMessage();
            } catch (e) {
                console.log(e);
            }
        }

        if (this._bigrender >= 20) {
            this._bigrender = 0;
            this.players.forEach((v) => {
                v._dirtyFlags.kingdom = true;
                v._dirtyFlags.head = true;
                v._dirtyFlags.deputy = true;
            });
        }
    }

    // 统一的每帧更新逻辑
    private onFrameUpdate(): void {
        if (this._pause) return;
        try {
            this.renderCardText();
        } catch (e) {
            console.log(e);
        }
    }

    protected handleMessage_Replay() {
        const msg = this.table?._message.get(this.table._frame);
        if (msg) {
            let { audio, log, propertyChanges, markChanges } = msg.message.data;
            if (audio) {
                this.message.onAudio(audio);
            }
            if (markChanges) {
                this.message.onMarkChange(markChanges);
            }
            if (propertyChanges) {
                this.message.onPropertyChange(propertyChanges);
            }
            if (log && !msg.isExcept) {
                this.message.onLog(log);
            }
            if (!msg.isExcept) {
                const func = (this.message as any)[
                    `on${msg.message.data.type}`
                ];
                if (func && typeof func === 'function') {
                    func.call(this.message, msg.message.data, msg.message);
                }
            }
            this.table._message.delete(this._msgId);
        }
    }

    protected handleMessage() {
        if (this.table?._message.size === 0) {
            this._msgId--;
            // console.log('message size = 0');
            this._pause = true;
            return;
        }
        const msg = this.table?._message.get(this._msgId);
        if (!msg) {
            // console.log(`messageId=${this._msgId} is undefined`);
            this._msgId--;
            this._pause = true;
            this.getMessage(this._msgId);
        } else {
            // console.log(`messageId=${this._msgId} is handle`, msg);
            msg.frame = this.table._frame;
            msg.isExcept =
                msg.message.except && msg.message.except.includes(this.selfId);
            let { audio, log, propertyChanges, markChanges } = msg.message.data;
            this._messaged.push(lodash.cloneDeep(msg));
            if (audio) {
                this.message.onAudio(audio);
            }
            if (markChanges) {
                this.message.onMarkChange(markChanges);
            }
            if (propertyChanges) {
                this.message.onPropertyChange(propertyChanges);
            }
            if (log && !msg.isExcept) {
                this.message.onLog(log);
            }
            if (!msg.isExcept) {
                const func = (this.message as any)[
                    `on${msg.message.data.type}`
                ];
                if (func && typeof func === 'function') {
                    func.call(this.message, msg.message.data, msg.message);
                }
            }
            this.table._message.delete(this._msgId);
        }
    }

    protected handleReconnect() {
        if (!this._reconnecting) return;
        const data = this._reconnecting;
        this._reconnecting_data = this._reconnecting;
        this._reconnecting = undefined;
        this._pause = true;
        S.ui.playBgm(`${ServerConfig.res_url}/audio/system/background.mp3`);
        const { roomId, options, players, _mark, selfId } = data;
        this._selfId = selfId;
        this.owner.frameOnce(10, this, () => {
            this.message.onMsgGameStart(
                {
                    type: 'MsgGameStart',
                    options,
                    players,
                    spectate: [],
                },
                undefined
            );
            this.owner.frameOnce(10, this, () => {
                const marks: SetMark[] = [];
                const move: MsgPlayCardMoveAni = {
                    type: 'MsgPlayCardMoveAni',
                    data: [],
                };
                data.cards.forEach((v) => {
                    const card = this.game.getCard(v.id);
                    if (!card) {
                        this.message.onMsgBuildGameCard({
                            type: 'MsgBuildGameCard',
                            data: v.sourceData,
                            initArea: this.game.granaryArea.areaId,
                        });
                    }
                    move.data.push({
                        cards: [v.id],
                        fromArea: this.game.getCard(v.id).area.areaId,
                        toArea: v.area,
                        movetype: v.put,
                        puttype: v.put,
                        animation: v.area.includes(AreaType.Hand.toString())
                            ? true
                            : false,
                        moveVisibles: [],
                        cardVisibles: v.visibles,
                        isMove: true,
                    });
                    //marks
                    if (v._mark) {
                        Object.keys(v._mark).forEach((key) => {
                            const value = v._mark[key];
                            marks.push({
                                objType: 'card',
                                objId: v.id,
                                key: key,
                                value: value.value,
                                options: value.options,
                            });
                        });
                    }
                });
                this.message.onMarkChange(marks);
                this.message.onMsgPlayCardMoveAni(move, undefined);
                this.owner.frameOnce(10, this, () => {
                    const marks: SetMark[] = [];
                    const datas: [
                        string,
                        string | number | undefined,
                        string,
                        any
                    ][] = [
                        ['room', roomId, 'turnCount', data.turnCount],
                        ['room', roomId, 'circleCount', data.circleCount],
                        ['room', roomId, 'shuffleCount', data.shuffleCount],
                    ];
                    data.players.forEach((v) => {
                        datas.push([
                            'player',
                            v.playerId,
                            'controlId',
                            v.controlId,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'skipWuxie',
                            v.skipWuxie,
                        ]);
                        datas.push(['player', v.playerId, 'seat', v.seat]);
                        datas.push(['player', v.playerId, 'phase', v.phase]);
                        datas.push([
                            'player',
                            v.playerId,
                            'kingdom',
                            v.kingdom,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'chained',
                            v.chained,
                        ]);
                        datas.push(['player', v.playerId, 'skip', v.skip]);
                        datas.push(['player', v.playerId, 'death', v.death]);
                        datas.push(['player', v.playerId, 'inturn', v.inturn]);
                        datas.push([
                            'player',
                            v.playerId,
                            'inplayphase',
                            v.inplayphase,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'inresponse',
                            v.inresponse,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'insubtarget',
                            v.insubtarget,
                        ]);
                        if (v._indying.length) {
                            datas.push([
                                'player',
                                v.playerId,
                                'indying',
                                lodash.max(v._indying),
                            ]);
                        }
                        datas.push([
                            'player',
                            v.playerId,
                            'camp_mode',
                            v.camp_mode,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'general_mode',
                            v.general_mode,
                        ]);
                        datas.push(['player', v.playerId, 'maxhp', v.maxhp]);
                        datas.push(['player', v.playerId, 'inthp', v.inthp]);
                        datas.push(['player', v.playerId, 'hp', v.hp]);
                        datas.push(['player', v.playerId, 'shield', v.shield]);
                        datas.push(['player', v.playerId, '_head', v._head]);
                        datas.push([
                            'player',
                            v.playerId,
                            '_deputy',
                            v._deputy,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'headOpen',
                            v.headOpen,
                        ]);
                        datas.push([
                            'player',
                            v.playerId,
                            'deputyOpen',
                            v.deputyOpen,
                        ]);
                        v.judgeCards.forEach((j) => {
                            datas.push([
                                'player',
                                v.playerId,
                                'setDelayedScroll',
                                j,
                            ]);
                        });
                        v.equipCards.forEach((j) => {
                            datas.push(['player', v.playerId, 'setEquip', j]);
                        });
                        //marks
                        if (v._mark) {
                            Object.keys(v._mark).forEach((key) => {
                                const value = v._mark[key];
                                marks.push({
                                    objType: 'player',
                                    objId: v.playerId,
                                    key: key,
                                    value: value.value,
                                    options: value.options,
                                });
                            });
                        }
                    });
                    this.message.onPropertyChange(datas);
                    this.message.onMarkChange(marks);
                    this.owner.frameOnce(10, this, () => {
                        const marks: SetMark[] = [];
                        data.generals.forEach((v) => {
                            const general = this.game.getGeneral(v.id);
                            if (general) {
                                const area = this.game.areas.get(v.area);
                                if (area) area.add([general]);
                                general.put = v.put;
                                general.visibles = v.visibles;
                            }
                            //marks
                            if (v._mark) {
                                Object.keys(v._mark).forEach((key) => {
                                    const value = v._mark[key];
                                    marks.push({
                                        objType: 'general',
                                        objId: v.id,
                                        key: key,
                                        value: value.value,
                                        options: value.options,
                                    });
                                });
                            }
                        });
                        this.message.onMarkChange(marks);
                        this.owner.frameOnce(10, this, () => {
                            const marks: SetMark[] = [];
                            data.skills.forEach((v) => {
                                this.message.onMsgAddSkill(
                                    {
                                        type: 'MsgAddSkill',
                                        id: v.id,
                                        skill: v.name,
                                        player: v.player,
                                        options: v.options,
                                    },
                                    undefined
                                );
                                //marks
                                if (v._mark) {
                                    Object.keys(v._mark).forEach((key) => {
                                        const value = v._mark[key];
                                        marks.push({
                                            objType: 'skill',
                                            objId: v.id,
                                            key: key,
                                            value: value.value,
                                            options: value.options,
                                        });
                                    });
                                }
                            });
                            this.message.onMarkChange(marks);
                            this.owner.frameOnce(10, this, () => {
                                const marks: SetMark[] = [];
                                data.effects.forEach((v) => {
                                    this.message.onMsgAddEffect(
                                        {
                                            type: 'MsgAddEffect',
                                            id: v.id,
                                            player: v.player,
                                            effect_name: v.name,
                                            skill: v.skill,
                                        },
                                        undefined
                                    );
                                    //marks
                                    if (v._mark) {
                                        Object.keys(v._mark).forEach((key) => {
                                            const value = v._mark[key];
                                            marks.push({
                                                objType: 'effect',
                                                objId: v.id,
                                                key: key,
                                                value: value.value,
                                                options: value.options,
                                            });
                                        });
                                    }
                                });
                                this.message.onMarkChange(marks);
                                this.owner.frameOnce(10, this, () => {
                                    const marks: SetMark[] = [];
                                    if (_mark) {
                                        Object.keys(_mark).forEach((key) => {
                                            const value = _mark[key];
                                            marks.push({
                                                objType: 'room',
                                                objId: roomId,
                                                key: key,
                                                value: value.value,
                                                options: value.options,
                                            });
                                        });
                                    }
                                    this.message.onMarkChange(marks);
                                    this.owner.frameOnce(10, this, () => {
                                        this.players.forEach(
                                            (v) => (v.refreshMark = true)
                                        );
                                        this._pause = false;
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /** 开始询问 */
    startChoose(req: GameRequest) {
        if (
            req.player.controlId === this.selfId &&
            !this.message.choose.request
        ) {
            this.message.choose.start(req);
        }
    }

    /** 刷新时间 */
    protected renderTime() {
        if (this._messaged.length === 0) return;
        const start = this.startTime;
        const now = Date.now();
        const timeDiff = Math.abs(start - now);
        // 计算差值的小时、分钟和秒数
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        this.owner.time.text = `${hours < 10 ? '0' + hours : hours}:${
            minutes < 10 ? '0' + minutes : minutes
        }:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    /** 刷新牌数显示 */
    public renderCardText() {
        if (!this.game) return;
        this.owner.cardcount.text = `${this.game.drawArea.count}`;
        this.owner.game_info
            .setVar('draw', this.game.drawArea.count)
            .setVar('drop', this.game.discardArea.count)
            .setVar('shuffle', this.game.shuffleCount)
            .setVar('circle', this.game.circleCount);
        this.owner.btn_discard.title = `弃牌堆：[b][color=#ffff00]${this.game.discardArea.count}[/color][/b]`;
        this.owner.houbeiqu_up.text = `${
            this.game.getReserveUpCards().length
        }/${Math.min(8, this.game.playerCount)}`;
        this.owner.houbeiqu_down.text = `${
            this.game.getReserveDownCards().length
        }`;
        this.owner.houbeiqu.visible = this.game.reserveArea.count > 0;
        this.players.forEach((v) => {
            const maxhand = v.player.maxhand;
            if (maxhand !== v.player.inthp) {
                v.owner.handlabel.text = `${v.player.handArea.count}/${maxhand}`;
            } else {
                v.owner.handlabel.text = `${v.player.handArea.count}`;
            }
            if (v instanceof SeatComp) {
                const visibles = v.player.handArea.cards.filter((c) =>
                    c.canVisible(this.self)
                );
                if (visibles.length > 0) {
                    v.owner.handbg.visible = true;
                    v.owner.hand_label.text = visibles
                        .map((v) => sgs.getTranslation(`@acronym:${v.name}`))
                        .join('');
                } else {
                    v.owner.handbg.visible = false;
                }
            }
        });
    }

    /** 刷新按钮 */
    public renderSkill() {
        const isSingle =
            this.owner.selfseat.getController('gmode').selectedPage ===
            'single';
        let mark = false;
        this.skills.slice().forEach((v) => {
            if (v instanceof UIEquipSelf) return;
            if (v instanceof UICard) {
                this.owner.cards.addChild(v);
                v.visible = false;
                if (v.skill && v.skill.player === this.self) {
                    mark = true;
                }
                return;
            }
            if (!v.skill) {
                v.destroy();
                return;
            }
            const skill = v.skill;
            if (!skill) return;
            if (skill.options.showui === 'none') {
                v.visible = false;
                return;
            }
            v.visible = true;
            const isOwnedSkill = skill.player === this.self;
            const source = skill.options.source;

            if (skill.options.showui === 'default') {
                if (isOwnedSkill) {
                    // 当前玩家拥有的技能，showui为default
                    if (source === 'head_general') {
                        this.owner.selfseat.general_head.skills.addChild(v);
                    } else if (source === 'deputy_general') {
                        this.owner.selfseat.general_deputy.skills.addChild(v);
                    } else {
                        if (isSingle) {
                            this.owner.selfseat.general_head.skills.addChild(v);
                        } else {
                            this.owner.selfseat.general_deputy.skills.addChild(
                                v
                            );
                        }
                    }
                    v.visible = skill.visible();
                } else if (
                    !isOwnedSkill &&
                    skill.isOpen() &&
                    skill.global(this.self)
                ) {
                    // 非当前玩家拥有的技能，showui为default且global为true
                    this.owner.selfseat.skills.addChild(v);
                    v.visible = true;
                } else {
                    // 其他情况添加到other区域但不显示
                    this.owner.selfseat.none_skills.addChild(v);
                    v.visible = false;
                }
            } else if (skill.options.showui === 'other') {
                this.owner.selfseat.skills.addChild(v);
                v.visible = isOwnedSkill
                    ? skill.visible()
                    : skill.isOpen && skill.global(this.self);
            } else {
                // 其他情况添加到other区域但不显示
                this.owner.selfseat.none_skills.addChild(v);
                v.visible = false;
            }

            if (skill.sourceEffect && !skill.check()) {
                v.visible = false;
            }
        });
        // 分别处理主将和副将区域
        const skillsAreas = [
            this.owner.selfseat.general_head.skills,
            this.owner.selfseat.general_deputy.skills,
        ] as const;

        skillsAreas.forEach((area) => {
            // 获取当前区域所有可见技能按钮
            const buttons = Array.from(area.children)
                .filter(
                    (child): child is UISkillButton =>
                        child instanceof UISkillButton && child.visible
                )
                .filter((v) => {
                    if (!v.skill) {
                        area.removeChild(v);
                        return false;
                    }
                    v.setPreShow(v.skill.preshow);
                    if (!v.skill.isOpen() && v.skill.canPreshow()) {
                        v.item.onClick(() => {
                            this.setPreshow(v, !v.skill.preshow);
                        });
                        v.item.setCanClick(true);
                    }
                    return true;
                });

            // 设置所有按钮为默认模式1
            buttons.forEach((button) => {
                button.set(button.skill, 1);
            });

            // 判断按钮数量是否为奇数
            const isOdd = buttons.length % 2 === 1;

            // 数量为奇数时设置第一个按钮为模式2
            if (isOdd && buttons.length > 0) {
                buttons[0].set(buttons[0].skill, 2);
            }
        });

        Array.from(this.owner.selfseat.skills.children).forEach((child) => {
            if (child instanceof UISkillButton) {
                if (!child.skill) {
                    this.owner.selfseat.skills.removeChild(child);
                    return;
                }

                // 设置所有按钮为默认模式1
                child.set(child.skill, 1);
            }
        });

        if (mark) {
            this.owner.markbg.visible = true;
        } else {
            this.owner.markbg.visible = false;
        }

        this.skills = this.skills.filter(
            (v) => v instanceof UIEquipSelf || !!v.skill
        );
    }

    /** 询问返回 */
    public response(request: GameRequest) {
        if (this.spectate) return;
        if (this.table.owner.video_data) return;
        request.complete = true;
        this.room.send('response', {
            id: request.id,
            timeout: request.timeout,
            cancle: request.result.cancle,
            use_or_play_card: request.result.use_or_play_card,
            selected_skill: request.result.selected_skill,
            playphase: request.result.playphase,
            results: this.game.toJson_SelectorResult(request.selectors),
            sort_result: request.result.sort_result,
        });
        this.message.choose.clearAllChild();
    }

    /** 获取丢失的包 */
    public getMessage(msgId: number) {
        this.room.send('getMessage', { id: msgId + 1 });
    }

    public setPreshow(skill_ui: UISkillButton, value: boolean) {
        if (!(skill_ui instanceof UISkillButton)) return;
        if (!skill_ui.skill) return;
        const orgin = skill_ui.skill.preshow;
        skill_ui.skill.preshow = value;
        skill_ui.setPreShow(skill_ui.skill.preshow);
        if (value !== orgin) {
            this.room.send('skill_preshow', {
                skillId: skill_ui.skill.id,
                value,
            });
        }
    }

    /** 举报玩家 */
    public jubao(username: string) {
        if (this.jubaos[username]) return;
        this.room.send('jubao', { username });
        this.jubaos[username] = true;
        S.ui.toast('已记录该玩家的恶意行为');
    }

    public pingbi(username: string) {
        if (this.pingbis[username]) return;
        this.room.send('pingbi', { username });
        this.pingbis[username] = true;
        S.ui.toast('已屏蔽该玩家的发言');
    }

    /** 获取翻译 */
    public getTranslation(value: CustomString): string {
        if (!value) return '';
        if (typeof value === 'string') {
            return sgs.getTranslation(value);
        }
        const translation = sgs.getTranslation(value.text);
        // if (translation === value.text) return value.text;
        return translation.replace(/\{\d+\}/g, (match) => {
            const index = Number(match[1]);
            if (!lodash.isNumber(index)) return;
            let cv = value.values.at(index);
            if (!cv) return;
            switch (cv.type) {
                case 'player':
                    return (
                        this.game.getPlayer(cv.value)?.gameName ?? '未知玩家'
                    );
                case 'card':
                    return `【${
                        this.game.getCard(cv.value)?.name ?? '未知卡牌'
                    }】`;
                case '[player]':
                    return this.game
                        .getPlayers(cv.value)
                        .map((v) => v.gameName)
                        .join('');
                case '[card]':
                    return this.game
                        .getCards(cv.value)
                        .map((v) => `【${v.name}】`)
                        .join('');
                case 'number':
                    return cv.value.toString();
                case 'string':
                    return this.getTranslation(cv.value);
                case '[string]':
                    return cv.value.map((v) => this.getTranslation(v)).join('');
                case 'carddata':
                    return this.cardParseString(this.game.getCard(cv.value));
                case '[carddata]':
                    return this.game
                        .getCards(cv.value)
                        .map((v) => this.cardParseString(v))
                        .join('');
                case 'vcard':
                    return this.cardParseString(cv.value);
                case '[vcard]':
                    return cv.value
                        .map((v) => this.cardParseString(v))
                        .join('');
                case 'area':
                    const area1 = this.game.areas.get(cv.value);
                    return area1
                        ? sgs.getTranslation(`string:area${area1.type}`)
                        : '未知区域';
                case 'area_pro':
                    const area = this.game.areas.get(cv.value);
                    let v = area
                        ? sgs.getTranslation(`string:area${area.type}`)
                        : '未知区域';
                    if (area?.player) {
                        v = `${area.player.gameName ?? '未知玩家'}` + v;
                    }
                    return v;
                default:
                    return '';
            }
        });
    }

    /** 将卡牌转化成文本 */
    public cardParseString(card: GameCard | VirtualCard | VirtualCardData) {
        if (!card) return '';
        let data, subcards: GameCard[];
        if (card instanceof GameCard) {
            if (!card.canVisible(this.selfComp.player)) {
                return '';
            }
            data = card.sourceData;
        } else if (card instanceof VirtualCard) {
            data = card.sourceData;
            subcards = card.subcards;
        } else {
            data = card;
            subcards = this.game.getCards(card.subcards);
        }
        if (data) {
            let attr = '';
            let value = '';
            if (data.name === 'sha') {
                if (data.attr.includes(CardAttr.Thunder)) {
                    attr = '雷';
                } else if (data.attr.includes(CardAttr.Fire)) {
                    attr = '火';
                }
            } else if (card.name === 'wuxiekeji') {
                if (data.attr.includes(CardAttr.Country)) {
                    attr = '国';
                }
            }
            value = `[color=#ffff00]${attr}【${sgs.getTranslation(
                data.name
            )}[img]${
                AssetsUrlMapping.logsuit[data.suit]
            }[/img]${sgs.getTranslation(
                `string:number${data.number}`
            )}】[/color]`;
            if (subcards) {
                value += `(来源：${subcards
                    .map((v) => this.cardParseString(v))
                    .join('')})`;
            }
            return value;
        }
        return '';
    }

    /** 播放动画 */
    public playGlobalAni(ani: string, data?: any) {
        if (ani === 'aozhan_bg') {
            this.owner.aozhan.visible = !!data.show;
            return;
        }
        if (ani === 'bancountry') {
            this.ani.banCountry(data.result ?? 'qun');
            this.players.forEach((v) => {
                if (v.owner instanceof UISeat) {
                    const node = v.owner as any;
                    if (node[`s_${data.result}`]) {
                        node[`s_${data.result}`].grayed = true;
                    }
                    if (node[`b_${data.result}`]) {
                        node[`b_${data.result}`].grayed = true;
                    }
                }
            });
            return;
        }
        if (ani === 'awake' || ani === 'limit') {
            this.ani.jxxd(ani, data);
        }
        const config = GlobalAni[ani];
        if (!config) {
            this.ani.skills(ani, data);
            return;
        }
        if (config.type === 'spine') {
            Laya.loader.load(config.url, Laya.Loader.SPINE).then(() => {
                const sprite = Laya.Pool.getItemByClass('spine', Laya.Sprite);
                const node = config.node ?? [0, 0, 0.5, 0.5, 1, 1];
                sprite.size(100, 100);
                sprite.anchor(node[2], node[3]);
                sprite.scale(node[4], node[5]);
                sprite.pos(node[0], node[1]);
                this.owner.addChild?.(sprite);
                const spine =
                    sprite.getComponent(Laya.Spine2DRenderNode) ||
                    sprite.addComponent(Laya.Spine2DRenderNode);
                spine.source = config.url;
                spine.skinName = config.skinName ?? 'default';
                spine.animationName = config.animName ?? 'play';
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
                const node = config.node ?? [0, 0, 0.5, 0.5, 1, 1];
                sk.size(100, 100);
                sk.anchor(node[2], node[3]);
                sk.scale(node[4], node[5]);
                sk.pos(node[0], node[1]);
                this.owner.addChild?.(sk);
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
                const node = config.node ?? [0, 0, 0.5, 0.5, 1, 1];
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
                this.owner.addChild?.(sprite);
                return sprite;
            });
        }
    }

    //propertys
    /** 轮数 */
    public set circleCount(value: number) {
        this.game.circleCount = value;
        this.owner.circle.text = value.toString();
        this.owner.game_info.setVar('circle', this.game.circleCount);
    }
    public get circleCount() {
        return this.game.circleCount;
    }

    public set shuffleCount(value: number) {
        this.game.shuffleCount = value;
        this.owner.game_info.setVar('shuffle', this.game.shuffleCount);
    }
    public get shuffleCount() {
        return this.game.shuffleCount;
    }

    /** 清空处理区 */
    public set clearUiProcessArea(value: number) {
        this.game.clearUiProcessArea = value;
        this.card.removeProcessCards(this.card.process_cards.slice());
    }
    public get clearUiProcessArea() {
        return this.game.clearUiProcessArea;
    }

    /** 刷新座次 */
    public set updateSeat(value: number) {
        this.game.updateSeat = value;
        this.players.forEach((v) => {
            v.bind(v.player, this);
        });
    }
    public get updateSeat() {
        return this.game.updateSeat;
    }

    protected danmu_y = 185;

    onChat(chat: ChatMessage, message: string) {
        if (this.pingbis[chat.username]) {
            return;
        }
        const player = this.players
            .values()
            .find((v) => v.player && v.player.username === chat.username);
        this.chats.push(chat);
        if (player) {
            player.onChat(message);
        } else {
            const txt = Laya.Pool.getItemByClass('danmu', Laya.GTextField);
            txt.fitContent = Laya.TextFitContent.Both;
            txt.fontSize = 35;
            txt.html = true;
            txt.ubb = true;
            txt.color = '#ffffff';
            txt.stroke = 4;
            txt.wordWrap = false;
            txt.visible = false;
            txt.x = 1920;
            txt.y = this.danmu_y;
            this.danmu_y += 50;
            if (this.danmu_y > 385) this.danmu_y = 185;
            this.owner.addChild(txt);
            txt.text = `${chat.username}：${message}`;
            this.owner.frameOnce(10, this, () => {
                txt.visible = true;
                Laya.Tween.create(txt)
                    .duration(5000)
                    .to('x', -txt.width)
                    .then((v) => {
                        Laya.Pool.recover('danmu', txt);
                        txt.removeSelf();
                    });
            });
        }
    }

    public onThrow(data: string) {
        const _data = JSON.parse(data.slice(7));
        const from = this.players.get(_data.from);
        const to = this.players.get(_data.to);
        const type = _data.type;
        if (!from || !to) return;
        const sourcePos = from.isSelf
            ? { x: 1777, y: 961 }
            : { x: from.owner.x, y: from.owner.y };
        const targetPos = to.isSelf
            ? { x: 1777, y: 961 }
            : { x: to.owner.x, y: to.owner.y };
        if (sourcePos.x === targetPos.x && sourcePos.y === targetPos.y) return;
        const sprite = Laya.Pool.getItemByClass('daoju', Laya.GImage);
        Laya.Tween.killAll(sprite);
        if (type === 'flower') {
            sprite.loadImage(`resources/room/texture/daoju/flower0.png`);
        } else {
            sprite.loadImage(`resources/room/texture/daoju/egg0.png`);
        }
        sprite.pos(sourcePos.x, sourcePos.y);
        this.owner.cards.addChild(sprite);
        Laya.Tween.create(sprite)
            .duration(500)
            .go('x', sourcePos.x, targetPos.x)
            .go('y', sourcePos.y, targetPos.y)
            .delay(300)
            .then(() => {
                to.playFaceAni(type);
                if (S.ui.settings.eggaudio) {
                    if (type === 'flower') {
                        S.ui.playAudio(
                            `resources/room/texture/daoju/flower1.mp3`
                        );
                    } else {
                        S.ui.playAudio(`resources/room/texture/daoju/egg1.mp3`);
                    }
                }
                sprite.removeSelf();
                Laya.Pool.recover('daoju', sprite);
            });
    }

    protected onTuoguan() {
        // this.playGlobalAni('caomao_skill');
        // return;
        if (!this.spectate) {
            const toState = !this.selfComp.tuoguan;
            this.room.send('game_tuoguan', { toState });
            this.selfComp.tuoguan = toState;
            this.owner.tuoguan.title = toState ? '取消' : '托管';
            if (toState) {
                const req = this.message._requests.find(
                    (v) => v.player === this.self
                );
                if (req) {
                    req.timeout = true;
                    this.response(req);
                }
            }
        }
    }

    protected onTouxiang() {
        if (this.checkTouxiang()) {
            this.room.send('game_surrender', {});
        } else {
            S.ui.toast('不满足投降条件');
        }
    }

    public checkTouxiang() {
        if (this.self.death) {
            return false;
        }
        if (this.game.players.find((v) => v.isNoneKingdom())) {
            return false;
        }
        if (this.game.aliveCount === 2) {
            return true;
        }
        const kingdoms = this.game.getKingdoms();
        const bigs = kingdoms.map((v) => this.game.getPlayerCountByKingdom(v));
        const big = Math.max(...bigs);
        if (
            big > this.game.aliveCount / 2 &&
            this.game.getPlayerCountByKingdom(this.self.kingdom) !== big
        ) {
            return true;
        }
        return false;
    }

    public showPlayerInfo(player: GamePlayer) {
        this.owner.playerinfo.visible = true;
        this.owner.player_title.text = player.username;
        this.currentPlayerInfo = player;
        if (this.self && this.self === player) {
            this.owner.player_head.visible = this.self.hasHead();
            this.owner.player_deputy.visible = this.self.hasDeputy();
            if (this.owner.player_head.visible) {
                this.owner.player_head.setGeneral(this.self.head);
            }
            if (this.owner.player_deputy.visible) {
                this.owner.player_deputy.setGeneral(this.self.deputy);
            }
        } else if (player) {
            this.owner.player_head.visible =
                player.hasHead() && player.headOpen;
            this.owner.player_deputy.visible =
                player.hasDeputy && player.deputyOpen;
            if (this.owner.player_head.visible) {
                this.owner.player_head.setGeneral(player.head);
            }
            if (this.owner.player_deputy.visible) {
                this.owner.player_deputy.setGeneral(player.deputy);
            }
        }
        this.owner.player_head.item.onLongClick(() => {
            this.card.showGeneralInfo([this.owner.player_head.general]);
        });
        this.owner.player_deputy.item.onLongClick(() => {
            this.card.showGeneralInfo([this.owner.player_deputy.general]);
        });
        //武将技能
        if (this.playerInfoType === 0) {
            this.owner.general_selected.visible = true;
            this.owner.equip_selected.visible = false;
            const skills = this.game.skills.filter(
                (v) =>
                    v.player === player &&
                    !v.data.attached_equip &&
                    (v.isOpen() || player === this.self)
            );
            this.owner.info_list.children.forEach((v) => v.destroy());
            this.owner.info_list.removeChildren();
            skills.forEach((v) => {
                if (v.options.source === 'mark.huashen') return;
                let name = v.name;
                const ui = UIInfoItem.create();
                const skill_name = sgs.getTranslation(name);
                ui.skill.title.text = skill_name;
                ui.skill_t.text = sgs.getTranslation(`@desc:${name}`);
                const reg = new RegExp(
                    `${Object.keys(sgs.concept[sgs.lang]).join('|')}`,
                    'g'
                );
                ui.skill_t.text = ui.skill_t.text.replaceAll(reg, (match) => {
                    return `<a href="${match}"><b>${match}</b></a>`;
                });
                ui.skill_t.on(Laya.Event.LINK, (e: any) => {
                    this.card.showInfo(`${e}\n${sgs.getConcept(e)}`);
                });
                this.owner.info_list.addChild(ui);
            });
        }
        //装备技能
        if (this.playerInfoType === 1) {
            this.owner.general_selected.visible = false;
            this.owner.equip_selected.visible = true;
            const skills = this.game.skills.filter(
                (v) => v.player === player && v.data.attached_equip
            );
            this.owner.info_list.children.forEach((v) => v.destroy());
            this.owner.info_list.removeChildren();
            skills.forEach((v) => {
                let name = v.name;
                const ui = UIInfoItem.create();
                const skill_name = sgs.getTranslation(name);
                ui.skill.title.text = skill_name;
                ui.skill_t.text = sgs.getTranslation(`@desc:${name}`);
                const reg = new RegExp(
                    `${Object.keys(sgs.concept[sgs.lang]).join('|')}`,
                    'g'
                );
                ui.skill_t.text = ui.skill_t.text.replaceAll(reg, (match) => {
                    return `<a href="${match}"><b>${match}</b></a>`;
                });
                ui.skill_t.on(Laya.Event.LINK, (e: any) => {
                    this.card.showInfo(`${e}\n${sgs.getConcept(e)}`);
                });
                this.owner.info_list.addChild(ui);
            });
        }
    }
}
