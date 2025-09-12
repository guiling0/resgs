import { RoomState } from '../models/RoomStata';
import { UIGameRoom } from '../ui/UIGameRoom';

export class AloneServerRoom {
    public roomId: string = 'alone_server';
    public sessionId: string = 'alone';
    public state: RoomState = new RoomState();

    public ui: UIGameRoom;

    constructor() {
        this.state = new RoomState();
    }

    public send(type: string | number, message: any) {
        if (!this.state.game) return;
        switch (type) {
            case 'response':
                this.state.game.response(message);
                break;
            case 'getMessage':
                const msg = this.state.game.messages.find(
                    (v) => v.msgId === message.id
                );
                if (msg) {
                    this.ui.event('game_message', [msg]);
                }
                break;
        }
    }
}
