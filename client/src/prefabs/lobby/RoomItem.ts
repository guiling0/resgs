const { regClass } = Laya;
import { RoomListItem } from 'src/types';
import { RoomItemBase } from './RoomItem.generated';
import { RoomAvailable } from '@colyseus/sdk';
import { ToastUI } from 'src/components/ToastUI';
import { apiClient } from 'src/api/ApiClient';
import { RoomState } from '@shared/core/schema';
import { SceneManager } from 'src/SceneManager';
import { LoadingUI } from 'src/components/LoadingUI';

const state = {
    waiting: '等待中',
    playing: '游戏中',
};

@regClass()
export class RoomItem extends RoomItemBase {
    private _room: RoomAvailable<RoomListItem>;

    onAwake(): void {
        this.join.on(Laya.Event.CLICK, this, this._onJoin);
        this.watch.on(Laya.Event.CLICK, this, this._onWatch);
        this.info.on(Laya.Event.CLICK, this, this._onInfo);
    }

    onDestroy(): void {
        this.join.off(Laya.Event.CLICK, this, this._onJoin);
        this.watch.off(Laya.Event.CLICK, this, this._onWatch);
        this.info.off(Laya.Event.CLICK, this, this._onInfo);
    }

    set(room: RoomAvailable<RoomListItem>) {
        this._room = room;
        const metadata = room.metadata;
        if (!metadata) {
            this.visible = false;
            return;
        }
        this.visible = true;
        this.roomid.text = `[${metadata.roomId}]`;
        //TODO 从sgs中获取翻译
        // this.modename.text = `${sgs.getTranslation('@mode:' + metadata.mode)}`;
        this.modename.text = metadata.mode;
        this.roomname.text = metadata.roomName;
        if (metadata.hasPassword) {
            this.roomname.text +=
                '[img]resources/lobby/hall_room_yaoshi.png[/img]';
        }
        //TODO 括号中显示旁观玩家数量
        this.playercount.text = `${metadata.players}/${metadata.maxPlayers}(0)`;
        this.roomstate.text = state[metadata.state];
        if (metadata.state === 'waiting') {
            this.roomstate.color = '#00ff00';
        }
        if (metadata.state === 'playing') {
            this.roomstate.color = '#ff0000';
        }
    }

    private async _onJoin() {
        if (!this._room) return;
        const metadata = this._room.metadata;
        if (!metadata) {
            return;
        }
        if (metadata.hasPassword) {
            //TODO 通过密码加入房间
            ToastUI.show('房间有密码，需要输入密码');
            return;
        }
        LoadingUI.show();
        try {
            const room = await apiClient.join(metadata.roomId, RoomState);
            SceneManager.enter('table', { room });
        } catch (err) {
            console.error('[Lobby] 加入房间失败', err);
            ToastUI.show('加入房间失败');
        } finally {
            LoadingUI.hide();
        }
    }

    private async _onWatch() {
        //TODO 成为旁观玩家加入房间
        ToastUI.show('暂未完成');
    }

    private async _onInfo() {
        console.log(`[RoomItem] info`, this._room);
    }
}
