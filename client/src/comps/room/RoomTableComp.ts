import { testPlayers } from '../../config';
import { Message } from '../../core/message/message';
import { ChatMessage, RoomReconnectData } from '../../core/room/room.types';
import { ScenesEnum } from '../../enums';
import { S } from '../../singleton';
import { UIRoom } from '../../ui/UIRoom';
import { UITablePlayer } from '../../ui/UITablePlayer';
import { TablePlayerComp } from '../player/TablePlayerComp';
import { RoomGameComp } from './RoomGameComp';

const { regClass, property } = Laya;

@regClass()
export class RoomTableComp extends Laya.Script {
    declare owner: UIRoom;

    public get room() {
        return this.owner.room;
    }
    public get state() {
        return this.owner.state;
    }
    public get $() {
        return this.owner.$;
    }
    public listens: (() => void)[] = [];

    public game: RoomGameComp;
    /** 帧数 */
    public _frame = 0;
    /** 游戏消息 */
    public _message = new Map<
        number,
        { message: Message; frame: number; isExcept: boolean }
    >();

    public players: TablePlayerComp[] = [];

    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // 1秒初始重连延迟

    private surrender_time = 0;

    public _players: string[] = [];
    public _spectates: string[] = [];

    public currentUserName: string;

    onAwake(): void {
        this.owner.getController('state').selectedPage = 'wait';
        this.owner.stands.itemRenderer = this.refreshListItem.bind(this);
        if (this.owner.video_data) {
            if (this.owner.video_data.reconnect) {
                this.on_reconnect_data(this.owner.video_data.reconnect);
            } else {
                this.on_confirm_start();
            }
            this.on_video_message(this.owner.video_data.messages);
        } else if (this.owner.selfId === 'alone') {
            //alone server
            this.state.game.broadCastMethod = (msgs: Message[]) => {
                this.on_game_message(msgs);
            };
            this.on_confirm_start();
            this.state.game.initStart(testPlayers.slice(0, 3));
            this.state.game.startGame([]);
        } else {
            this.bindRoom();
        }

        this.owner.btn_start.on(Laya.Event.CLICK, this, this.onStartClick);
        this.owner.btn_ready.on(Laya.Event.CLICK, this, this.onReadyClick);
        this.owner.btn_cancle.on(Laya.Event.CLICK, this, this.onReadyClick);
        this.owner.btn_exit.on(Laya.Event.CLICK, this, this.onLeaveClick);

        this.owner.chat.on('send', this, this.sendChat);

        this.owner.roomname.text = `[${this.room.roomId}]`;

        this.owner.game_sets_close.on(
            Laya.Event.CLICK,
            this,
            this.onSettingShow
        );

        this.owner.bgm_slider.on(Laya.Event.CHANGED, this, () => {
            const value = this.owner.bgm_slider.value / 100;
            S.ui.settings.bgmVolume = value;
            Laya.SoundManager.setSoundVolume(value, S.ui.currentBgm);
            Laya.LocalStorage.setJSON('settings', S.ui.settings);
        });

        this.owner.audio_slider.on(Laya.Event.CHANGED, this, () => {
            const value = this.owner.audio_slider.value / 100;
            S.ui.settings.audioVolume = value;
            Laya.LocalStorage.setJSON('settings', S.ui.settings);
        });

        this.owner.eggaudio.on(Laya.Event.CHANGED, this, () => {
            const value = this.owner.eggaudio.selected;
            S.ui.settings.eggaudio = !value;
            Laya.LocalStorage.setJSON('settings', S.ui.settings);
            console.log(value);
        });

        this.owner.leave.on(Laya.Event.CLICK, this, this.onLeaveClick);

        this.owner.popupadmin_fenghao.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                S.client.ban(this.currentUserName, {
                    type: 'ban',
                    reason: '',
                    times: 1 * 60 * 60 * 1000,
                });
            }
        });
        this.owner.popupadmin_jinyan.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                S.client.ban(this.currentUserName, {
                    type: 'muted',
                    reason: '',
                    times: 1 * 60 * 60 * 1000,
                });
            }
        });
    }

    bindRoom() {
        this.listens.length = 0;
        this.listens.push(
            this.$(this.state).players.onAdd((item, index) => {
                const ui =
                    this.players.find(
                        (v) => v.state?.playerId === item.playerId
                    ) ?? this.players.find((v) => v.state === undefined);
                if (ui) {
                    ui.bindState(item, this);
                }
                if (!this._players.includes(item.username)) {
                    this._players.push(item.username);
                    this.owner.stands.numItems =
                        this._players.length + this._spectates.length;
                    if (this.game) {
                        this.game.owner.stands.numItems =
                            this._players.length + this._spectates.length;
                    }
                }
            })
        );
        this.listens.push(
            this.$(this.state).players.onRemove((item, index) => {
                const ui = this.players.find(
                    (v) => v.state?.playerId === item.playerId
                );
                if (ui) {
                    ui.unBindState();
                    ui.state = undefined;
                }
                if (this._players.includes(item.username)) {
                    lodash.remove(this._players, (v) => v === item.username);
                    this.owner.stands.numItems =
                        this._players.length + this._spectates.length;
                    if (this.game) {
                        this.game.owner.stands.numItems =
                            this._players.length + this._spectates.length;
                    }
                }
            })
        );
        this.listens.push(
            this.$(this.state).spectates.onAdd((item, index) => {
                if (!this._spectates.includes(item.username)) {
                    this._spectates.push(item.username);
                    this.owner.stands.numItems =
                        this._players.length + this._spectates.length;
                    if (this.game) {
                        this.game.owner.stands.numItems =
                            this._players.length + this._spectates.length;
                    }
                }
            })
        );
        this.listens.push(
            this.$(this.state).spectates.onRemove((item, index) => {
                if (this._spectates.includes(item.username)) {
                    lodash.remove(this._spectates, (v) => v === item.username);
                    this.owner.stands.numItems =
                        this._players.length + this._spectates.length;
                    if (this.game) {
                        this.game.owner.stands.numItems =
                            this._players.length + this._spectates.length;
                    }
                }
            })
        );
        this.listens.push(
            this.$(this.state).listen('options', (value) => {
                console.log(value);
                this.owner.roomname.text = `[${this.room.roomId}]${value.name}`;
                this.players = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                    .map((v, i) => {
                        const node = (this.owner as any)[
                            `table_player_${v}`
                        ] as UITablePlayer;
                        if (i >= value.playerCountMax) {
                            node.img.loadImage(
                                'resources/room/texture/table/hall_seat_bg_closed.png'
                            );
                            return undefined;
                        } else {
                            node.img.loadImage(
                                'resources/room/texture/table/hall_seat_bg.png'
                            );
                            return node.getComponent(TablePlayerComp);
                        }
                    })
                    .filter((v) => v);
            })
        );

        this.owner.room.onMessage('*', (type, message) => {
            const func = (this as any)[`on_${type}`];
            if (func && typeof func === 'function') {
                func.call(this, message);
            }
        });

        this.owner.room.onLeave(this.onLeave.bind(this));
    }

    protected refreshListItem(index: number, item: Laya.GTextField) {
        let username: string;
        if (index >= this._players.length) {
            username = this._spectates[index - this._players.length];
            item.text = `(旁观)${username}`;
        } else {
            username = this._players[index];
            item.text = username;
        }
        item.offAll(Laya.Event.CLICK);
        item.on(Laya.Event.CLICK, this, () => {
            if (S.client.isAdmin) {
                Laya.GRoot.inst.showPopup(this.owner.popup_admin);
                this.currentUserName = username;
            }
        });
    }

    onUpdate(): void {
        this._frame++;
    }

    changeButtonSkin(type: 'start' | 'ready' | 'cancle') {
        [
            this.owner.btn_start,
            this.owner.btn_cancle,
            this.owner.btn_ready,
        ].forEach((v) => {
            v.visible = v.name.includes(type);
        });
    }

    onStartClick() {
        this.owner.room.send('start', { token: S.client.token });
    }

    onReadyClick() {
        this.owner.room.send('ready', { token: S.client.token });
    }

    onLeaveClick() {
        if (this.owner.video_data) {
            S.ui.openScene(ScenesEnum.Lobby);
            S.ui.closeScene(ScenesEnum.Room);
        } else {
            this.owner.room.leave(true);
            S.ui.openScene(ScenesEnum.Lobby);
            S.ui.closeScene(ScenesEnum.Room);
        }
    }

    onDestroy(): void {
        this.listens.forEach((v) => v());
        this.listens.length = 0;
        this.owner.btn_start.off(Laya.Event.CLICK, this, this.onStartClick);
        this.owner.btn_ready.off(Laya.Event.CLICK, this, this.onReadyClick);
        this.owner.btn_cancle.off(Laya.Event.CLICK, this, this.onReadyClick);
        this.owner.btn_exit.off(Laya.Event.CLICK, this, this.onLeaveClick);
    }

    on_confirm_start() {
        this._frame = 0;
        this._message = new Map();
        this.owner.game.removeChildren();
        const game = (
            Laya.loader.getRes(
                'resources/room/room_game.lh'
            ) as Laya.HierarchyResource
        ).create();
        this.owner.game.addChild(game);
        const comp = game.getComponent(RoomGameComp);
        comp.init(this.owner.room, this);
        this.owner.getController('state').selectedPage = 'game';
        this.game = comp;
        this.owner.popupadmin_jubao.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                this.game.jubao(this.currentUserName);
            }
        });
        this.owner.popupadmin_pingbi.on(Laya.Event.CLICK, () => {
            if (this.currentUserName) {
                this.game.pingbi(this.currentUserName);
            }
        });
        //chat
        this.owner.chat.clearRelations();
        this.owner.chat.pos(360, 504);
        this.owner.chat.addRelation(this.owner, Laya.RelationType.Left_Left);
        this.owner.chat.addRelation(this.owner, Laya.RelationType.Top_Top);
        this.owner.chat.visible = false;
    }

    on_jubao_response(message: { username: string }) {
        S.ui.toast(`${message.username}被多名玩家举报，已接受处罚`);
    }

    on_pingbi_response(message: { username: string }) {
        S.ui.toast(`${message.username}被多名玩家屏蔽，已接受处罚`);
    }

    backThis() {
        this.owner.game.removeChildren();
        this.game = undefined;
        this.owner.getController('state').selectedPage = 'wait';
        this.owner.chat.clearRelations();
        this.owner.chat.pos(13, 931);
        this.owner.chat.addRelation(this.owner, Laya.RelationType.Left_Left);
        this.owner.chat.addRelation(
            this.owner,
            Laya.RelationType.Bottom_Bottom
        );
        this.owner.chat.visible = true;
        this.owner.popupadmin_jubao.offAll(Laya.Event.CLICK);
        this.owner.popupadmin_pingbi.offAll(Laya.Event.CLICK);
    }

    on_video_message(
        messages: { message: Message; frame: number; isExcept: boolean }[]
    ) {
        messages.forEach((v) => {
            const msg = v.message;
            if (
                msg.roomId === this.owner.room.roomId &&
                !Reflect.has(this._message, v.frame)
            ) {
                this._message.set(v.frame, {
                    message: msg,
                    frame: v.frame,
                    isExcept: v.isExcept,
                });
            }
        });
        if (this.game && this._message.size > 0 && !this.game._reconnecting)
            this.game._pause = false;
    }

    on_game_message(message: Message[]) {
        message.forEach((v) => {
            if (
                v.roomId === this.owner.room.roomId &&
                !Reflect.has(this._message, v.msgId)
            ) {
                this._message.set(v.msgId, {
                    message: v,
                    frame: 0,
                    isExcept: false,
                });
            }
        });
        if (this.game && this._message.size > 0 && !this.game._reconnecting)
            this.game._pause = false;
    }

    on_reconnect_data(data: {
        msgId: number;
        data: RoomReconnectData;
        spectate: boolean;
    }) {
        this.on_confirm_start();
        this.game._msgId = data.msgId - 1;
        this.game._reconnecting = data.data;
        this.game.spectate = data.spectate;
    }

    on_owner_timeout() {
        S.ui.toast('房主长时间未开始游戏，将在5秒后踢出房主');
    }

    on_surrender_result(data: { count?: number; timeout?: boolean }) {
        if (this.game) {
            if (this.game.checkTouxiang()) {
                if (data.count) {
                    this.game.owner.touxiang_item.visible = true;
                    this.game.owner.touxiang_result.setVar('count', data.count);
                    if (data.count === 1) {
                        this.surrender_time = 15;
                        this.owner.timerLoop(1000, this, this.onSurrenderTime);
                    }
                }
            }
            if (data.timeout) {
                this.game.owner.touxiang_item.visible = false;
            }
        }
    }

    protected onSurrenderTime() {
        this.surrender_time--;
        this.game?.owner.touxiang_result.setVar('time', this.surrender_time);
        if (this.surrender_time === -1 && this.game) {
            this.game.owner.touxiang_item.visible = false;
            this.owner.clearTimer(this, this.onSurrenderTime);
        }
    }

    on_chat(chat: ChatMessage) {
        if (chat.message.includes('@throw')) {
            if (this.game) {
                this.game.onThrow(chat.message);
            }
            return;
        }
        const text = this.owner.chat.onChat(chat.username, chat);
        if (text === '') return;
        if (this.game) {
            this.game.onChat(chat, text);
        } else {
            const player = this.players.find(
                (v) => v.state && v.state.username === chat.username
            );
            if (player) player.onChat(text);
        }
    }

    sendChat(message: string) {
        if (message.includes('@broadcast:')) {
            const gstring = message.split(':')[1];
            if (gstring) {
                S.client.broadcast(gstring);
            }
            return;
        }
        if (message.includes('@prechoose:')) {
            const gstring = message.split(':')[1];
            if (gstring) {
                const generals = gstring.split(',');
                this.owner.room.send('prechoose', {
                    generals,
                    token: S.client.token,
                });
            }
            return;
        }
        if (message === '@robot:add') {
            const gstring = message.split(':')[1];
            this.owner.room.send('addai', {});
            return;
        }
        this.owner.room.send('chat', message);
    }

    onLeave(code: number, reason?: string) {
        if (code === 3001) {
            S.ui.toast(`你被踢出了房间（${reason}）`);
            S.ui.openScene(ScenesEnum.Lobby);
            S.ui.closeScene(ScenesEnum.Room);
        }
        if (code === 3005) {
            S.ui.toast(`你的账号被封禁了（${reason}）`);
            S.ui.openScene(ScenesEnum.Entry);
            S.ui.closeScene(ScenesEnum.Room);
            return;
        }
        if (this.game) {
            this.game._selfId = this.game.selfId;
            this.game._pause = true;
            Laya.stage.on('onReconnectToken', this, this.attempReconnect);
        } else {
            S.ui.openScene(ScenesEnum.Lobby);
            S.ui.closeScene(ScenesEnum.Room);
        }
    }

    private attempReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            S.ui.toast('网络异常，请刷新重试');
            return;
        }
        S.ui.openModelLoad();
        if (this.reconnectAttempts === 0) {
            Laya.stage.off('onReconnectToken', this, this.attempReconnect);
        }
        this.reconnectAttempts++;
        const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        setTimeout(async () => {
            try {
                if (S.client.lobbyRoom && S.client.reconnectToken) {
                    const room = await S.client.joinRoom(
                        this.owner.room.roomId,
                        {
                            username: S.client.username,
                            create: false,
                            spectate: false,
                            token: S.client.token,
                            needData: false,
                        }
                    );
                    if (room) {
                        S.client.reconnectToken = undefined;
                        this.reconnectAttempts = 0;
                        this.owner.bindRoom(room);
                        this.bindRoom();
                        if (this.game) {
                            this.game.room = this.owner.room;
                            // 重置消息处理状态
                            this.game._pause = false;
                            // 确保从下一条未处理的消息开始
                            if (this.game._messaged.length > 0) {
                                this.game._msgId =
                                    this.game._messaged.at(-1).message.msgId;
                                this.game.getMessage(this.game._msgId + 1);
                            } else {
                                this.game.getMessage(0); // 如果没有历史消息，从第一条开始
                            }
                        }
                    } else {
                        this.attempReconnect();
                    }
                } else {
                    this.attempReconnect();
                }
            } catch {}
        }, delay);
    }

    onSettingShow() {
        this.owner.game_settings.visible = !this.owner.game_settings.visible;
        this.owner.bgm_slider.value = S.ui.settings.bgmVolume * 100;
        this.owner.audio_slider.value = S.ui.settings.audioVolume * 100;
        this.owner.eggaudio.selected = !S.ui.settings.eggaudio;
    }
}
