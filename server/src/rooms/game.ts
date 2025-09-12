import { AuthContext, Client, Room, ServerError, updateLobby } from 'colyseus';
import { ReconnectToken } from '../models/ReconnectToken';
import { ArraySchema, Schema } from '@colyseus/schema';
import {
    PlayerState,
    RoomOptionState,
    RoomState,
    SpectateState,
} from '../models/RoomStata';
import { RoomJoinData, RoomMetedata, RoomOption } from '../core/types';
import { generateRoomId } from '../utils/GenerateRoomId';
import { ServerCode } from '../core/enums';
import { GameRoom as _GameRoom } from '../core/room/room';
import { Message } from '../core/message/message';
import { GamePlayer } from '../core/player/player';
import { ChatMessage } from '../core/room/room.types';
import { UserManager } from '../UserManager';
import { UserService } from '../db/services/UserService';
import { GeneralStatsService } from '../db/services/GeneralStateServices';
import { ReputationService } from '../db/services/ReputationService';

export class GameRoom extends Room<RoomState, RoomMetedata> {
    private userService = new UserService();
    private generalService = new GeneralStatsService();
    private reputationService = new ReputationService();
    private reconnectTokens: ReconnectToken[] = [];
    private surrenders: { [key: string]: boolean } = {};
    private jubaos: { [key: string]: string[] } = {};
    private pingbis: { [key: string]: string[] } = {};

    private timeout: NodeJS.Timeout;

    private robotid = 0;

    private chatMessages: any[] = [];

    async onCreate(options: RoomJoinData) {
        this.roomId = generateRoomId();
        this.state = new RoomState();
        await this.setMetadata({
            options: options.options,
            playerCount: 0,
            spectaterCount: 0,
            state: 'wait',
        });
        updateLobby(this);
        await this.updateOptions(options.options);
        this.autoDispose = true;
        this.patchRate = 50;

        this.onMessage('ready', this.handleReady.bind(this));
        this.onMessage('start', this.handleStart.bind(this));
        this.onMessage('getMessage', this.getMessage.bind(this));
        this.onMessage('response', (client, message) => {
            if (this.state.game) {
                this.state.game.response(message);
            }
        });
        this.onMessage('tick', this.handleTick.bind(this));
        this.onMessage('chat', this.chat.bind(this));
        this.onMessage('prechoose', this.prechoose.bind(this));
        this.onMessage('addai', this.addai.bind(this));
        this.onMessage('game_surrender', this.surrender.bind(this));
        this.onMessage('game_tuoguan', this.tuoguan.bind(this));
        this.onMessage('skill_preshow', this.preshow.bind(this));
        this.onMessage('skip_wuxie', this.skip_wuxie.bind(this));
        this.onMessage('jubao', this.jubao.bind(this));
        this.onMessage('pingbi', this.pingbi.bind(this));
        // console.log(`[RoomCreated] RoomId=${this.roomId}`);
    }

    async onAuth(client: Client, options: RoomJoinData, context: AuthContext) {
        const { username, token, needData } = options;
        const user = UserManager.inst.onlinePlayers[username];
        if (!user) {
            throw new ServerError(ServerCode.AuthError);
        }
        if (user.token !== token) {
            throw new ServerError(ServerCode.AuthError);
        }
        if (user.rooms[this.roomId] && user.rooms[this.roomId].reconnectToken) {
            const rtoken = this.reconnectTokens.find(
                (v) =>
                    v.token === user.rooms[this.roomId].reconnectToken &&
                    v.username === user.userdata.username
            );
            if (rtoken) {
                return true;
            }
            return false;
        }
        const roomoptions = this.metadata.options;
        if (!roomoptions) return options.create;
        //测试房禁止没有测试资格的人进入
        if (roomoptions.settings.test && !user.userdata.privileges.betaTester) {
            throw new ServerError(ServerCode.NotTester);
        }
        //密码错误(管理员可进)
        if (
            roomoptions.password &&
            options.password !== roomoptions.password &&
            !user.userdata.privileges.admin
        ) {
            throw new ServerError(ServerCode.PasswordError);
        }
        //禁止旁观(管理员可进)
        if (
            options.spectate &&
            roomoptions.settings.prohibitSpectate &&
            !user.userdata.privileges.admin
        ) {
            throw new ServerError(ServerCode.ProhibitStand);
        }
        const player = this.state.players
            .values()
            .find((v) => v.username === username);
        const spectate = this.state.spectates
            .values()
            .find((v) => v.username === username);
        //已经在房间里
        if (player || spectate) {
            throw new ServerError(ServerCode.AlreadyJoined);
        }
        //旁观直接进
        if (options.spectate) {
            return true;
        }
        //禁止游戏状态
        if (user.userdata.status.isGameBanned) {
            if (
                !user.userdata.status.gameBanExpires ||
                user.userdata.status.gameBanExpires > new Date()
            ) {
                throw new ServerError(ServerCode.AccountIsBanGame);
            } else {
                await this.userService.unBanGame(username);
            }
        }
        //非等待
        if (this.metadata.state !== 'wait') {
            throw new ServerError(ServerCode.RoomIsStarted);
        }
        //玩家人数达到上限
        if (this.state.players.size >= roomoptions.playerCountMax) {
            throw new ServerError(ServerCode.PlayerCountMax);
        }
        return true;
    }

    async onJoin(client: Client, options?: RoomJoinData): Promise<any> {
        const { username, token, spectate, needData } = options;
        const user = UserManager.inst.onlinePlayers[username];
        const roomoptions = this.state.options;
        const reconnectToken =
            user.rooms[this.roomId] && user.rooms[this.roomId].reconnectToken;

        const rtoken = this.reconnectTokens.find(
            (v) =>
                v.token === reconnectToken &&
                v.username === user.userdata.username
        );
        if (reconnectToken) {
            if (this.state.game) {
                const player = this.state.game.getPlayer(rtoken.playerId);
                if (player) {
                    player.removeMark('__offline');
                    player.removeMark('__offline__escape');
                    if (needData) {
                        this.sendReconnectData(client, player.playerId);
                    }
                }
            }
            lodash.remove(this.reconnectTokens, rtoken);
            if (user.rooms[this.roomId]) {
                user.rooms[this.roomId].reconnectToken = null;
            }
        }

        if (!user.rooms[this.roomId]) {
            UserManager.inst.joinRoom(username, this, client);
        }
        const datamode = this.metadata.options.settings.datamode;

        if (spectate) {
            const spectater = new SpectateState();
            spectater.token = token;
            spectater.client = client;
            spectater.playerId = client.sessionId;
            spectater.key = spectater.playerId;
            spectater.username = user.userdata.username;
            spectater.avatar = user.userdata.profile.avatar;
            const data = user.userdata.statsByMode?.[datamode] ?? {
                matches: 0,
                wins: 0,
                escapes: 0,
            };
            if (data) {
                spectater.total = data.matches;
                spectater.win = data.wins;
                spectater.escape = data.escapes;
            }
            spectater.spectateBy = this.state.players
                .values()
                .find((v) => !!v)?.playerId;
            this.state.spectates.set(spectater.key, spectater);
            // console.log(
            //     `[SpectaterJoined] RoomId=${this.roomId} SessionId=${client.sessionId} User=${user.username}`
            // );
            this.sendReconnectData(client, spectater.spectateBy, true);
            await this.setMetadata({
                spectaterCount: this.state.spectates.size,
            });
            updateLobby(this);
            return;
        }

        const player = new PlayerState();
        player.token = token;
        player.client = client;
        player.playerId = rtoken?.playerId ?? client.sessionId;
        player.key = player.playerId;
        player.username = user.userdata.username;
        player.avatar = user.userdata.profile.avatar;
        const data = user.userdata.statsByMode?.[datamode] ?? {
            matches: 0,
            wins: 0,
            escapes: 0,
        };
        if (data) {
            player.total = data.matches;
            player.win = data.wins;
            player.escape = data.escapes;
        }
        if (options.create) {
            player.ready = true;
            player.isOwner = true;
        }
        this.state.players.set(player.key, player);
        await this.setMetadata({
            playerCount: this.state.players.size,
        });
        // console.log(
        //     `[PlayerJoined] RoomId=${this.roomId} SessionId=${client.sessionId} User=${user.username}`
        // );
        updateLobby(this);
    }

    async onLeave(client: Client, consented?: boolean): Promise<any> {
        let username: string;
        let reconnectToken: string;
        const spectater = this.state.spectates
            .values()
            .find((v) => v.client === client);
        if (spectater) {
            username = spectater.username;
            this.state.spectates.delete(spectater.key);
        } else {
            const player = this.state.players
                .values()
                .find((v) => v.client === client);
            if (player) {
                username = player.username;
                this.state.players.delete(player.key);
                if (this.state.game) {
                    const game_player = this.state.game.players.find(
                        (v) => v.playerId === player.playerId
                    );
                    if (consented) {
                        if (game_player) {
                            if (game_player.alive) {
                                game_player.setMark('__escape', true, {
                                    visible: true,
                                });
                                // 给玩家增加一个逃跑(游戏结束后增加)
                                //扣除玩家10点信誉分
                                await this.reputationService.deductReputationScore(
                                    game_player.username,
                                    10
                                );
                            } else {
                                game_player.setMark('__leave', true, {
                                    visible: true,
                                });
                            }
                            this.state.game.broadcast({ type: 'None' });
                        }
                    } else {
                        const token = this.generateReconnectToken(
                            player.playerId,
                            player.username
                        );
                        reconnectToken = token.token;
                        this.reconnectTokens.push(token);
                        if (game_player) {
                            game_player.setMark('__offline', true, {
                                visible: true,
                            });
                            if (game_player.alive) {
                                game_player.setMark('__offline__escape', true);
                            }
                            this.state.game.broadcast({ type: 'None' });
                        }
                    }
                }

                if (player.isOwner) {
                    const newOnwer = this.state.players
                        .values()
                        .find((v) => !!v);
                    if (newOnwer) {
                        newOnwer.isOwner = true;
                        newOnwer.ready = true;
                    }
                }
            }
        }
        if (username) {
            Object.keys(this.jubaos).forEach((key) => {
                const value = this.jubaos[key];
                lodash.remove(value, (v) => v == username);
            });
            Object.keys(this.pingbis).forEach((key) => {
                const value = this.pingbis[key];
                lodash.remove(value, (v) => v == username);
            });
        }
        UserManager.inst.leaveRoom(username, this.roomId, reconnectToken);
        if (this.state.players.size === 0) {
            this.disconnect();
            return;
        }
        await this.setMetadata({
            playerCount: this.state.players.size,
            spectaterCount: this.state.spectates.size,
        });
        updateLobby(this);
        // console.log(
        //     `[PlayerLeaved] RoomId=${this.roomId} SessionId=${client.sessionId}`
        // );
    }

    private generateReconnectToken(
        playerId: string,
        username: string
    ): ReconnectToken {
        const token = {
            token: Math.random().toString(36).substring(2, 15),
            roomId: this.roomId,
            playerId,
            username,
            createdAt: Date.now(),
            expiresAt: null,
        };
        return token;
    }

    private async chat(client: Client, message: string) {
        let msg: ChatMessage;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (player) {
            //禁止发言
            const user = UserManager.inst.onlinePlayers[player.username];
            if (user.userdata.status.isMuted) {
                if (
                    !user.userdata.status.muteExpires ||
                    user.userdata.status.muteExpires > new Date()
                ) {
                    return;
                } else {
                    this.userService.unBanMuted(player.username);
                }
            }
            msg = {
                username: player.username,
                message,
                spectate: false,
            } as any;
        }
        const spectater = this.state.spectates
            .values()
            .find((v) => v.client === client);
        if (spectater) {
            //禁止发言
            const user = UserManager.inst.onlinePlayers[spectater.username];
            if (user.userdata.status.isMuted) {
                if (
                    !user.userdata.status.muteExpires ||
                    user.userdata.status.muteExpires > new Date()
                ) {
                    return;
                } else {
                    this.userService.unBanMuted(spectater.username);
                }
            }
            msg = {
                username: spectater.username,
                message,
                spectate: true,
            } as any;
        }
        msg.date = Date.now();
        this.chatMessages.push(msg);

        if (msg) this.broadcast('chat', msg);
    }

    private prechoose(client: Client, message: any) {
        const { token, generals } = message;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (player) {
            player.prechooses = generals;
        }
    }

    private addai(client: Client, message: any) {
        if (this.metadata.state !== 'wait') return;
        if (this.state.players.size < this.state.options.playerCountMax) {
            const player = new PlayerState();
            player.token = `robot${this.robotid++}`;
            player.playerId = player.token;
            player.username = player.token;
            player.avatar = 'http://res.resgs.com/generals/shibingn/image.png';
            player.total = 0;
            player.win = 0;
            player.escape = 0;
            player.ready = true;
            player.isOwner = false;
            this.state.players.set(player.playerId, player);
            this.setMetadata({
                playerCount: this.state.players.size,
            }).then(() => {
                updateLobby(this);
            });
            // console.log(
            //     `[PlayerJoined] RoomId=${this.roomId} SessionId=${client.sessionId} User=${user.username}`
            // );
        }
    }

    private surrender(client: Client, message: any) {
        if (this.metadata.state !== 'game') return;
        const _player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (!_player) return;
        const playerId = _player.playerId;
        if (this.surrenders[playerId]) return;
        if (this.state.game) {
            const room = this.state.game;
            const player = room.getPlayer(playerId);
            if (player) {
                if (player.death) return;
                if (room.players.find((v) => v.isNoneKingdom())) return;
                if (room.aliveCount === 2) {
                    this.surrenders[playerId] = true;
                    const win = room.playerAlives.find((v) => v !== player);
                    room.gameOver(
                        room.players.filter((v) => room.sameAsKingdom(win, v)),
                        'surrender'
                    );
                } else {
                    const kingdoms = room.getKingdoms();
                    const bigs = kingdoms.map((v) =>
                        room.getPlayerCountByKingdom(v)
                    );
                    const big = Math.max(...bigs);
                    if (
                        big > room.aliveCount / 2 &&
                        room.getPlayerCountByKingdom(player.kingdom) !== big
                    ) {
                        this.surrenders[playerId] = true;
                    }
                    if (
                        Object.keys(this.surrenders).length >=
                        room.aliveCount - big
                    ) {
                        room.gameOver(
                            room.players.filter(
                                (v) =>
                                    room.getPlayerCountByKingdom(v.kingdom) ===
                                    big
                            ),
                            'surrender'
                        );
                    }
                }
                const count = Object.keys(this.surrenders).length;
                this.broadcast('surrender_result', {
                    count,
                });
                if (count === 1) {
                    setTimeout(() => {
                        this.surrenders = {};
                        this.broadcast('surrender_result', {
                            timeout: true,
                        });
                    }, 15000);
                }
            }
        }
    }

    private async jubao(client: Client, message: any) {
        const { username } = message;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        const spectater = this.state.spectates
            .values()
            .find((v) => v.client === client);
        if (player || spectater) {
            if (!this.jubaos[username]) {
                this.jubaos[username] = [];
            }
            const owner = player?.username ?? spectater.username;
            if (owner && owner !== username) {
                this.jubaos[username].push(owner);
                const count = this.jubaos[username].length;
                const max = this.clients.length / 2 + 1;
                if (count >= max) {
                    this.broadcast('jubao_response', { username });
                    this.jubaos[username].length = 0;
                    await this.reputationService.deductReputationScore(
                        username,
                        3
                    );
                }
            }
        }
    }

    private async pingbi(client: Client, message: any) {
        const { username } = message;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        const spectater = this.state.spectates
            .values()
            .find((v) => v.client === client);
        if (player || spectater) {
            if (!this.pingbis[username]) {
                this.pingbis[username] = [];
            }
            const owner = player?.username ?? spectater.username;
            if (owner && owner !== username) {
                this.pingbis[username].push(owner);
                const count = this.pingbis[username].length;
                const max = this.clients.length / 2 + 1;
                if (count >= max) {
                    this.broadcast('pingbi_response', { username });
                    this.pingbis[username].length = 0;
                    await this.reputationService.deductReputationScore(
                        username,
                        6
                    );
                }
            }
        }
    }

    private tuoguan(client: Client, message: any) {
        if (this.metadata.state !== 'game') return;
        const _player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (!_player) return;
        const playerId = _player.playerId;
        if (this.state.game) {
            const room = this.state.game;
            const player = room.getPlayer(playerId);
            if (player) {
                if (message.toState) {
                    player.setMark('__trustship', true, { visible: true });
                } else {
                    player.removeMark('__trustship');
                }
                this.state.game.broadcast({ type: 'None' });
            }
        }
    }

    private preshow(client: Client, message: any) {
        if (this.metadata.state !== 'game') return;
        const _player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (!_player) return;
        if (!this.state.game) return;
        const skill = this.state.game.skills.find(
            (v) => v.id === message.skillId
        );
        if (skill) {
            skill.preshow = message.value;
        }
    }

    private skip_wuxie(client: Client, message: any) {
        if (this.metadata.state !== 'game') return;
        const _player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (!_player) return;
        const playerId = _player.playerId;
        if (this.state.game) {
            const room = this.state.game;
            const player = room.getPlayer(playerId);
            if (player) {
                player.skipWuxie = true;
            }
        }
    }

    private handleReady(client: Client, message: any) {
        if (this.metadata.state === 'game') return;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (player && !player.isOwner) {
            player.ready = !player.ready;
            // console.log(
            //     `[PlayerReady] RoomId=${this.roomId} SessionId=${client.sessionId} State=${player.ready}`
            // );
            if (
                [...this.state.players.values()].every((v) =>
                    v.isOwner ? true : v.ready
                )
            ) {
                this.timeout = setTimeout(() => {
                    this.broadcast('owner_timeout', {});
                    this.timeout = setTimeout(() => {
                        if (!this.state.game) {
                            const c = this.state.players
                                .values()
                                .find((v) => v.isOwner);
                            if (c) c.client.leave(3001, 'timeout');
                        }
                        if (this.timeout) clearTimeout(this.timeout);
                    }, 10000);
                }, 5000);
            } else {
                if (this.timeout) clearTimeout(this.timeout);
            }
        }
    }

    private handleStart(client: Client, message: any) {
        if (this.metadata.state !== 'wait') return;
        const player = this.state.players
            .values()
            .find((v) => v.client === client);
        if (player && player.isOwner) {
            const p = [...this.state.players.values()].filter(
                (v) => !v.isOwner
            );
            if (p.length && p.every((v) => v.ready)) {
                if (this.timeout) clearTimeout(this.timeout);
                this.state.spectates.forEach((v) => {
                    v.spectateBy = this.state.players
                        .values()
                        .find((v) => !!v)?.playerId;
                });
                this.setMetadata({
                    state: 'game',
                }).then(() => {
                    updateLobby(this);
                    this.jubaos = {};
                    this.pingbis = {};
                    this.state.game = new _GameRoom(
                        this.roomId,
                        this.metadata.options,
                        this.broadcastMethod.bind(this),
                        this.handleGameOver.bind(this)
                    );
                    this.broadcast('confirm_start', {});
                    setTimeout(() => {
                        this.state.game.initStart([
                            ...this.state.players.values(),
                        ]);
                        this.state.game.startGame([
                            ...this.state.spectates.values(),
                        ]);
                    }, 1000);
                    // console.log(
                    //     `[PlayerStarted] RoomId=${this.roomId} SessionId=${client.sessionId} `
                    // );
                });
            }
        }
    }

    public handleTick(client: Client, message: any) {
        if (this.metadata.state !== 'wait') return;
        const handler = this.state.players
            .values()
            .find((v) => v.client === client);
        if (handler && handler.isOwner) {
            const player = this.state.players
                .values()
                .find((v) => v.playerId === message.player);
            if (player && player !== handler) {
                if (player.playerId.includes('robot')) {
                    this.state.players.delete(player.playerId);
                } else {
                    player.client.leave(3001, 'owner handle');
                }
            }
        }
    }

    private broadcastMethod(message: Message[]) {
        //排除已离线的玩家
        const except = [];
        this.state.game.players.forEach((v) => {
            if (v.hasMark('__offline')) {
                except.push(
                    this.state.players
                        .values()
                        .find((c) => c.playerId === v.playerId)
                );
            }
        });
        this.broadcast('game_message', message, { except });
    }

    private async handleGameOver(wins: GamePlayer[], reason: string) {
        const game = this.state.game;
        if (reason !== 'disponse') {
            //记录玩家数据
            const datamode = this.metadata.options.settings.datamode;
            this.userService.recordGameResult({
                mode: datamode,
                players: game.players.map((v) => {
                    //房间本地更新数据
                    const isWin = wins.includes(v);
                    const escaped =
                        v.hasMark('__escape') || v.hasMark('__offline__escape');
                    const state = this.state.players
                        .values()
                        .find((s) => s.playerId === v.playerId);
                    if (state) {
                        state.total++;
                        state.win += isWin ? 1 : 0;
                        state.escape += escaped ? 1 : 0;
                    }

                    //内存数据更新
                    const user = UserManager.inst.onlinePlayers[v.username];
                    if (user && user.userdata) {
                        const userdata = user.userdata.statsByMode?.[
                            datamode
                        ] ?? {
                            matches: 0,
                            wins: 0,
                            escapes: 0,
                        };
                        userdata.matches++;
                        userdata.wins += isWin ? 1 : 0;
                        userdata.escapes += escaped ? 1 : 0;
                        if (!user.userdata.statsByMode) {
                            user.userdata.statsByMode = {};
                        }
                        user.userdata.statsByMode[datamode] = userdata;
                    }
                    return {
                        username: v.username,
                        kingdom: v.kingdom,
                        isWinner: wins.includes(v),
                        escaped:
                            v.hasMark('__escape') ||
                            (v.alive && v.hasMark('__offline')),
                    };
                }),
            });
            this.generalService.processGameResult({
                mode: datamode,
                generals: Object.values(game.generalsRecords),
            });
            for (const player of this.state.game.players) {
                if (player.hasMark('__offline__escape')) {
                    //扣除玩家10点信誉分
                    await this.reputationService.deductReputationScore(
                        player.username,
                        10
                    );
                } else if (!player.hasMark('__escape')) {
                    //恢复玩家2点信誉分
                    await this.reputationService.restoreReputationScore(
                        player.username,
                        1
                    );
                }
            }
        }
        this.state.game = undefined;
        this.state.players.forEach((v) => {
            if (!v.playerId.includes('robot')) {
                v.playerId = v.client.sessionId;
                v.prechooses = undefined;
                if (v.isOwner) v.ready = true;
                else v.ready = false;
            } else {
                v.ready = true;
            }
        });
        this.setMetadata({ state: 'wait' }).then(() => updateLobby(this));
    }

    /** 获取丢失的包 */
    private getMessage(client: Client, message: { id: number }) {
        if (!this.state.game) return;
        const msg = this.state.game.messages.find(
            (v) => v.msgId === message.id
        );
        if (msg) {
            client.send('game_message', [msg]);
        }
    }

    public sendReconnectData(
        client: Client,
        selfId: string,
        spectate: boolean = false
    ) {
        if (this.state.game) {
            client.send('reconnect_data', {
                msgId: this.state.game.messages.at(-1).msgId,
                data: this.state.game.getReconnectData(selfId),
                spectate,
            });
        }
    }

    public async updateOptions(option: RoomOption) {
        const options = new RoomOptionState();
        options.name = option.name;
        options.password = option.password;
        options.mode = option.mode;
        options.playerCountMax = option.playerCountMax;
        options.responseTime = option.responseTime;
        options.chooseGeneralCount = option.chooseGeneralCount;
        options.luckyCardCount = option.luckyCardCount;
        options.extensions = JSON.stringify(option.extensions);
        options.generals = JSON.stringify(option.generals);
        options.settings = JSON.stringify(option.settings);

        this.state.options = options;
        await this.setMetadata({
            options: option,
        });
        updateLobby(this);
    }

    async onDispose() {
        await this.state.game?.gameOver([], 'disponse');
    }
}
