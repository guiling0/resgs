const { regClass } = Laya;
import { getStateCallbacks, Room } from 'colyseus.js';
import { UIRoomBase } from './UIRoom.generated';
import { S } from '../singleton';
import { GameState } from '../core/enums';
import { RoomGameComp } from '../comps/room/RoomGameComp';
import { RoomTableComp } from '../comps/room/RoomTableComp';
import { RoomState } from '../models/RoomStata';

@regClass()
export class UIRoom extends UIRoomBase {
    public openParams: any[];

    public room: Room<RoomState>;
    public $: ReturnType<typeof getStateCallbacks<RoomState>>;

    public video_data: any;

    public get selfId() {
        return this.room.sessionId;
    }

    public get state() {
        return this.room.state;
    }

    onAwake(): void {
        const room = this.openParams.at(0);
        this.bindRoom(room);
        if (this.openParams.length > 1) {
            this.video_data = this.openParams.at(1);
        }
        this.addComponent(RoomTableComp);
    }

    bindRoom(room: any) {
        if (!room) {
            S.ui.toast('没有找到房间数据');
            return;
        }
        room.ui = this;
        this.room = room;
        this.$ = getStateCallbacks(this.room);
    }
}
