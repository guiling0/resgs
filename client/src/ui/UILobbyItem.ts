const { regClass } = Laya;
import { RoomAvailable } from 'colyseus.js';
import { UILobbyItemBase } from './UILobbyItem.generated';
import { RoomMetedata } from '../core/types';
import { S } from '../singleton';
import { ScenesEnum } from '../enums';

const state = {
    wait: '等待中',
    game: '游戏中',
    end: '结算中',
};

@regClass()
export class UILobbyItem extends UILobbyItemBase {
    protected room: RoomAvailable<RoomMetedata>;

    protected hasPassWord: boolean = false;
    protected showType: number = 0;

    public set(room: RoomAvailable<RoomMetedata>) {
        this.btn_joinroom.off(Laya.Event.CLICK, this, this.onJoinClick);
        this.btn_standroom.off(Laya.Event.CLICK, this, this.onStandClick);
        this.btn_options.off(Laya.Event.CLICK, this, this.onInfoClick);
        this.visible = true;
        this.room = room;
        const metedata = room.metadata;
        if (!metedata) {
            this.visible = false;
            return;
        }
        if (!metedata.options) {
            this.visible = false;
            return;
        }
        this.roomname.text = `[${room.roomId}]${metedata.options.name}`;
        if (metedata.options.password) {
            this.roomname.text +=
                '[img]resources/lobby/texture/hall_room_yaoshi.png[/img]';
            this.hasPassWord = true;
        } else {
            this.hasPassWord = false;
        }
        if (metedata.options.settings?.prohibitChat) {
            this.roomname.text +=
                '[img]resources/lobby/texture/hall_room_jinyan_mark.png[/img] ';
        }
        this.playercount.text = `${metedata.playerCount}/${metedata.options.playerCountMax}(${metedata.spectaterCount})`;
        this.roomstate.text = state[metedata.state];
        this.btn_joinroom.on(Laya.Event.CLICK, this, this.onJoinClick);
        this.btn_standroom.on(Laya.Event.CLICK, this, this.onStandClick);
        this.btn_options.on(Laya.Event.CLICK, this, this.onInfoClick);
        this.btn_confirm.on(Laya.Event.CLICK, this, this.onConfirmClick);
    }

    onInfoClick() {
        console.log(this.room);
    }

    onJoinClick() {
        if (this.hasPassWord) {
            this.showType = 1;
            this.inputpassword.visible = true;
        } else {
            S.client
                .joinRoom(this.room.roomId, {
                    username: S.client.username,
                    create: false,
                    spectate: false,
                    token: S.client.token,
                })
                .then((room) => {
                    if (room) {
                        S.ui.openScene(ScenesEnum.Room, [room]);
                        S.ui.closeScene(ScenesEnum.Lobby);
                    }
                });
        }
    }

    async onStandClick() {
        if (this.hasPassWord) {
            this.showType = 2;
            this.inputpassword.visible = true;
        } else {
            S.client
                .joinRoom(this.room.roomId, {
                    username: S.client.username,
                    create: false,
                    spectate: true,
                    token: S.client.token,
                })
                .then((room) => {
                    if (room) {
                        S.ui.openScene(ScenesEnum.Room, [room]);
                        S.ui.closeScene(ScenesEnum.Lobby);
                    }
                });
        }
    }

    async onConfirmClick() {
        if (this.showType === 1) {
            S.client
                .joinRoom(this.room.roomId, {
                    username: S.client.username,
                    create: false,
                    password: this.inputpassword.text,
                    spectate: false,
                    token: S.client.token,
                })
                .then((room) => {
                    if (room) {
                        S.ui.openScene(ScenesEnum.Room, [room]);
                        S.ui.closeScene(ScenesEnum.Lobby);
                    }
                });
        } else if (this.showType === 2) {
            S.client
                .joinRoom(this.room.roomId, {
                    username: S.client.username,
                    create: false,
                    password: this.inputpassword.text,
                    spectate: true,
                    token: S.client.token,
                })
                .then((room) => {
                    if (room) {
                        S.ui.openScene(ScenesEnum.Room, [room]);
                        S.ui.closeScene(ScenesEnum.Lobby);
                    }
                });
        }
        this.showType = 0;
        this.inputpassword.visible = false;
    }
}
