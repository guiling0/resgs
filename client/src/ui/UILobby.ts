const { regClass } = Laya;
import { Room, RoomAvailable } from 'colyseus.js';
import { S } from '../singleton';
import { UILobbyBase } from './UILobby.generated';
import { UILobbyItem } from './UILobbyItem';
import { RoomMetedata, RoomOption } from '../core/types';
import { ScenesEnum } from '../enums';
import { RoomOptions, ServerConfig } from '../config';

@regClass()
export class UILobby extends UILobbyBase {
    protected room: Room;
    protected reConnectTimes = 0;

    protected rooms: RoomAvailable<RoomMetedata>[] = [];

    onAwake(): void {
        this.list.itemRenderer = this.refreshListItem.bind(this);
        Laya.stage.on('refreshRoomList', this, this.refreshList);

        this.mode.selectedIndex = 0;

        this.btn_create.on(Laya.Event.CLICK, this, this.onCreateClick);
        this.btn_general.on(Laya.Event.CLICK, this, this.onGeneralClick);
        this.btn_card.on(Laya.Event.CLICK, this, this.onCardClick);
        this.btn_option.on(Laya.Event.CLICK, this, this.onOptionClick);
        this.btn_exit.on(Laya.Event.CLICK, this, this.onExitClick);
        this.btn_user.on(Laya.Event.CLICK, this, this.onUserClick);
        this.btn_video.on(Laya.Event.CLICK, this, this.onVideoClick);
        this.btn_create_confirm.on(
            Laya.Event.CLICK,
            this,
            this.onCreateConfirmClick
        );
        this.btn_create_cancle.on(
            Laya.Event.CLICK,
            this,
            this.onCreateCancleClick
        );

        Laya.stage.on('refreshPlayerCount', () => {
            this.onlinecount.setVar(
                'playerCount',
                S.client.lobbyRoom.state.playerCount
            );
        });

        Laya.stage.on('onReconnectToken', this, this.reconnectGame);

        if (S.client.lobbyRoom) {
            Laya.stage.event('refreshPlayerCount');
        }

        this.input_serch.on(Laya.Event.KEY_DOWN, this, (e: any) => {
            if (e['keyCode'] === 13) {
                this.refreshList();
            }
        });
    }

    reconnectGame() {
        Laya.stage.off('onReconnectToken', this, this.reconnectGame);
        if (S.client.reconnectToken) {
            S.ui.openModelLoad();
            S.ui.toast('正在断线重连');
            Laya.timer.once(1000, this, () => {
                S.ui.closeModelLoad();
                S.client
                    .joinRoom(S.client.reconnectToken, {
                        username: S.client.username,
                        create: false,
                        spectate: false,
                        token: S.client.token,
                        needData: true,
                    })
                    .then((room) => {
                        S.client.reconnectToken = undefined;
                        S.ui.closeModelLoad();
                        if (room) {
                            S.ui.toast('重连成功，游戏愉快');
                            S.ui.openScene(ScenesEnum.Room, [room]);
                            S.ui.closeScene(ScenesEnum.Lobby);
                        }
                    });
            });
        }
    }

    protected refreshList() {
        //查看只等待
        if (this.onlywait.selected) {
            this.rooms = S.client.allRooms.filter(
                (v) =>
                    v.metadata.state === 'wait' &&
                    !v.metadata.options.settings.xl_test
            );
            this.list.numItems = this.rooms.length;
            return;
        }
        //搜索房间
        if (this.input_serch.text) {
            this.rooms = S.client.allRooms.filter(
                (v) => v.roomId === this.input_serch.text
            );
            this.list.numItems = this.rooms.length;
            return;
        }
        this.rooms = S.client.allRooms.filter(
            (v) => !v.metadata.options.settings.xl_test
        );
        this.list.numItems = this.rooms.length;
    }

    protected refreshListItem(index: number, item: UILobbyItem) {
        item.set(this.rooms[index]);
    }

    onCreateClick() {
        this.list.visible = false;
        this.createnode.visible = true;
    }

    onCreateConfirmClick() {
        const options = lodash.cloneDeep(RoomOptions[this.mode.value]);
        if (!options) {
            S.ui.toast('该模式暂未开放');
            return;
        }
        //password
        if (this.Input_Password.text) {
            options.password = this.Input_Password.text;
        }
        //最大玩家数量
        options.playerCountMax = Number(this.maxplayer.text);
        //name
        if (this.Input_Account.text) {
            options.name += this.Input_Account.text;
        }
        if (options.mode === 'doudizhu') {
            options.playerCountMax = 3;
        }
        S.client
            .createRoom(options)
            .then((room) => {
                if (room) {
                    S.ui.openScene(ScenesEnum.Room, [room]);
                    S.ui.closeScene(ScenesEnum.Lobby);
                }
            })
            .finally(() => {
                this.onCreateCancleClick();
            });
    }

    onCreateCancleClick() {
        this.list.visible = true;
        this.createnode.visible = false;
    }

    onGeneralClick() {
        S.ui.openScene(ScenesEnum.AboutGeneral);
    }

    onCardClick() {
        S.ui.openScene(ScenesEnum.AboutCard);
    }

    onOptionClick() {
        S.ui.openScene(ScenesEnum.About);
    }

    onExitClick() {}

    onUserClick() {}

    onVideoClick() {
        S.ui.openScene(ScenesEnum.Video);
    }

    onDestroy(): void {
        if (this.room) {
            this.reConnectTimes = 0;
            this.room.leave(true);
        }
    }
}
