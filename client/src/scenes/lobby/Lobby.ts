const { regClass } = Laya;
import { Room, RoomAvailable } from '@colyseus/sdk';
import { LobbyBase } from './Lobby.generated';
import { LoadingUI } from 'src/components/LoadingUI';
import { apiClient } from 'src/api/ApiClient';
import { RoomItem } from 'src/prefabs/lobby/RoomItem';
import { RoomListItem } from 'src/types';
import { ToastUI } from 'src/components/ToastUI';
import { SceneManager } from 'src/SceneManager';
import { ChatMessage, ChatSource } from '@shared/core/message';

@regClass()
export class Lobby extends LobbyBase {
    private _lobbyRoom?: Room;
    private _roomList: RoomAvailable<RoomListItem>[] = [];

    async onAwake(): Promise<void> {
        // ===== 房间列表 =====
        this.list.itemRenderer = this._renderRoomList.bind(this);
        // ===== 聊天面板 =====
        this.chat_panle.bind('lobby', (source, message) => {
            this._send(source, message);
        });
        // ===== 加入大厅 =====
        LoadingUI.show();
        try {
            this._lobbyRoom = await apiClient.joinLobby();

            this._lobbyRoom.onMessage(
                'rooms',
                (rooms: RoomAvailable<RoomListItem>[]) => {
                    this._roomList = rooms;
                    this.list.numItems = this._roomList.length;
                },
            );

            this._lobbyRoom.onMessage(
                '+',
                ([roomId, room]: [string, RoomAvailable<RoomListItem>]) => {
                    const index = this._roomList.findIndex(
                        (room) => room.roomId === roomId,
                    );
                    if (index !== -1) {
                        this._roomList[index] = room;
                    } else {
                        this._roomList.push(room);
                    }
                    this.list.numItems = this._roomList.length;
                },
            );

            this._lobbyRoom.onMessage('-', (roomId: string) => {
                const index = this._roomList.findIndex(
                    (room) => room.roomId === roomId,
                );
                if (index !== -1) {
                    this._roomList.splice(index, 1);
                }
                this.list.numItems = this._roomList.length;
            });

            this._lobbyRoom.onMessage('chat', (msg: ChatMessage) => {
                this.chat_panle.append(msg);
            });
        } catch (err) {
            console.error('[Lobby] 连接大厅失败', err);
            ToastUI.show('连接大厅失败');
        } finally {
            LoadingUI.hide();
        }
        // ===== 按钮 =====
        this.btn_create.on(Laya.Event.CLICK, this, this._onCreate);
        this.btn_loginout.on(Laya.Event.CLICK, this, this._onLogout);
    }

    onDestroy(): void {
        this._lobbyRoom?.leave();
        this._lobbyRoom = undefined;
    }

    /** 刷新房间列表 */
    private _renderRoomList(index: number, obj: RoomItem): void {
        obj.set(this._roomList[index]);
    }

    /** 创建房间 */
    private async _onCreate() {
        //TODO 建房选项弹窗
        LoadingUI.show();
        try {
            const room = await apiClient.create('game', {
                name: '测试',
                mode: 'role',
                playerCountMax: 4,
                cards: [],
                generals: [],
                settings: {},
            });
            SceneManager.enter('table', { room });
        } catch (err) {
            console.error('[Lobby] 创建房间失败', err);
            ToastUI.show('创建房间失败');
        } finally {
            LoadingUI.hide();
        }
    }

    /** 筛选 */
    private _onFilter(mode: string): void {
        if (this._lobbyRoom) {
            //TODO 更多筛选逻辑
            this._lobbyRoom.send('filter', {
                mode: mode === 'all' ? undefined : mode,
            });
        }
    }

    private _send(source: ChatSource, message: string) {
        this._lobbyRoom?.send('chat', {
            message,
        });
    }

    /** 退出登录 */
    private _onLogout(): void {
        this._lobbyRoom?.leave();
        apiClient.logout();
        SceneManager.enter('entry');
    }
}
