const { regClass } = Laya;
import { Room, Callbacks } from '@colyseus/sdk';
import { TableBase } from './Table.generated';
import { RoomState } from '@shared/core/schema';
import { ChatMessage, ChatSource } from '@shared/core/message';
import { ToastUI } from 'src/components/ToastUI';
import { SceneManager } from 'src/SceneManager';
import { TABLE_SEAT_POSITIONS } from 'src/config';
import { ResManager } from 'src/ResManager';
import { TableSeat } from 'src/prefabs/table/TableSeat';

@regClass()
export class Table extends TableBase {
    private _room: Room<RoomState>;

    private _isOwner: boolean = false;
    private _selfId: string = '';

    private _seats: TableSeat[] = [];

    onAwake(): void {
        // ===== 按钮 =====
        this.btn_ready?.on(Laya.Event.CLICK, this, this._onReady);
        this.btn_start?.on(Laya.Event.CLICK, this, this._onStartGame);
        this.btn_unready?.on(Laya.Event.CLICK, this, this._onReady);
        this.btn_exit?.on(Laya.Event.CLICK, this, this._onLeave);
    }

    async onEntry(entryData?: { room: Room<RoomState> }) {
        this._cleanupRoom();

        this._room = entryData?.room;

        if (!this._room) {
            ToastUI.show('房间不存在');
            SceneManager.enter('lobby');
            return;
        }

        this.timerOnce(100, this, async () => {
            this._selfId = this._room.sessionId;

            const playerCountMax = this._room.state.options.playerCountMax;
            const mode = this._room.state.options.mode;
            const seatPositions =
                TABLE_SEAT_POSITIONS[mode] ?? TABLE_SEAT_POSITIONS['default'];

            for (let i = 0; i < playerCountMax; i++) {
                const seat = (await ResManager.loadAndCreate(
                    'resources/prefabs/table_seat.lh',
                )) as TableSeat;
                this.players.addChild(seat);
                seat.pos(seatPositions[i].x, seatPositions[i].y);
                seat.scale(seatPositions[i].scale, seatPositions[i].scale);
                this._seats.push(seat);
            }

            // ===== 状态监听 =====

            const callbacks = Callbacks.get(this._room);
            this._room.onStateChange(() => {
                console.log('Table state changed:', this._room.state.table);
                //房主
                this._isOwner = this._room.state.table.ownerId === this._selfId;
                //房间信息
                this._refreshRoomInfo();
                //座位
                this._refreshSeatInfo();
                //Button
                this._refreshButtons();
            });

            callbacks.onAdd(this._room.state.table, 'seats', () => {
                this._refreshSeatInfo();
            });

            // ===== 消息 =====
            this._room.onMessage('kicked', (msg: { reson: string }) => {
                ToastUI.show(msg.reson);
            });

            this._room.onMessage('toast', (msg: { message: string }) => {
                ToastUI.show(msg.message);
            });

            this._room.onMessage('game_start', () => {
                ToastUI.show('游戏开始！');
                // SceneManager.enter('game', { room: this._room });
            });

            // ===== 聊天面板 =====
            this.chat_panle.bind(
                'room',
                (source, message) => {
                    this._send(source, message);
                },
                this._room.roomId,
            );

            this._room.onMessage('chat', (msg: ChatMessage) => {
                this.chat_panle.append(msg);
            });

            // ===== 首次刷新 ======
            this._refreshRoomInfo();
            this._refreshSeatInfo();
            this._refreshButtons();
        });
    }

    async onExit() {
        this._cleanupRoom();
    }

    private _cleanupRoom() {
        if (this._room) {
            this.chat_panle.cleanupRoom(this._room.roomId);
        }
        this._room = null;
    }

    private _send(source: ChatSource, message: string) {
        this._room?.send('chat', {
            source,
            message,
        });
    }

    private _refreshRoomInfo() {
        this.roomname.setVar('roomId', this._room.roomId);
        this.roomname.setVar('roomName', this._room.state.roomName);
        //TODO 其他信息
    }

    private _refreshSeatInfo() {
        const seats = this._room.state.table.seats;

        for (let i = 0; i < this._seats.length; i++) {
            const seat = this._seats[i];
            const seatState = seats.values().find((v) => v.seat === i + 1);
            seat.set(
                seatState,
                seatState?.sessionId === this._selfId,
                seatState?.sessionId === this._room.state.table.ownerId,
            );
        }
    }

    private _refreshButtons() {
        this.btn_start.visible = this._isOwner;
        const self = this._room.state.table.seats.get(this._selfId);
        this.btn_ready.visible = !this._isOwner && !self?.ready;
        this.btn_unready.visible = self?.ready;
    }

    private _onReady(): void {
        this._room.send('ready', {});
    }

    private _onStartGame(): void {
        this._room.send('start', {});
    }

    private async _onLeave(): Promise<void> {
        await this._room?.leave(true);
        SceneManager.enter('lobby');
    }
}
