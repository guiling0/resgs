import { PlayerState } from '../../models/RoomStata';
import { S } from '../../singleton';
import { UITablePlayer } from '../../ui/UITablePlayer';
import { RoomTableComp } from '../room/RoomTableComp';

const { regClass, property } = Laya;

@regClass()
export class TablePlayerComp extends Laya.Script {
    declare owner: UITablePlayer;
    public room: RoomTableComp;

    public state: PlayerState;

    onAwake(): void {
        this.unBindState();

        this.owner.on(Laya.Event.CLICK, () => {
            this.owner.btn_tick.visible = !this.owner.btn_tick.visible;
        });
        this.owner.btn_tick.on(Laya.Event.CLICK, () => {
            this.owner.btn_tick.visible = false;
            if (this.state) {
                const self = this.room.owner.selfId;
                const selfui = this.room.players.find(
                    (v) => v.state && v.state.playerId === self
                );
                if (!selfui.state.isOwner) {
                    return S.ui.toast('只有房主能踢人');
                }
                if (this.room.owner.selfId === this.state.playerId) {
                    return S.ui.toast('不能踢出自己');
                }
                this.room.owner.room.send('tick', {
                    player: this.state.playerId,
                });
            }
        });
    }

    bindState(state: PlayerState, room: RoomTableComp) {
        this.room = room;
        this.owner.infotxt.visible = true;

        const proxy = new Proxy(state, {
            get(target, p, receiver) {
                return Reflect.get(target, p, receiver);
            },
            set: (target, p, newValue, receiver) => {
                const ret = Reflect.set(target, p, newValue, receiver);
                if (Reflect.has(this, `render_${p.toString()}`)) {
                    (this as any)[`render_${p.toString()}`]();
                }
                return ret;
            },
        });
        room.$(state).bindTo(proxy);
        this.state = proxy;
    }

    unBindState() {
        this.owner.avatar.loadImage(undefined);
        this.owner.infotxt.visible = false;
        this.owner.playername.text = ``;
        this.owner.state.loadImage(undefined);
    }

    render_username() {
        this.owner.playername.text = this.state.username;
        this.owner.playername.color =
            this.room.owner.selfId === this.state.playerId
                ? '#ff0000'
                : '#ffffff';
    }

    render_avatar() {
        const url = this.state.avatar;
        if (url !== this.owner.avatar.url) this.owner.avatar.loadImage(url);
    }

    render_total() {
        this._renderInfo();
    }

    render_win() {
        this._renderInfo();
    }

    render_escape() {
        this._renderInfo();
    }

    render_isOwner() {
        this._renderState();
    }

    render_ready() {
        this._renderState();
    }

    _renderInfo() {
        const total = this.state?.total ?? 0,
            win = this.state?.win ?? 0,
            escape = this.state?.escape ?? 0;
        this.owner.infotxt.setVar('total', total);
        this.owner.infotxt.setVar(
            'win',
            win === 0 ? 0 : ((win / total) * 100).toFixed(2)
        );
        this.owner.infotxt.setVar('escape', escape);
    }

    _renderState() {
        if (this.state.isOwner) {
            this.owner.state.loadImage(
                `resources/room/texture/table/owner.png`
            );
            if (this.room.owner.selfId === this.state.playerId)
                this.room.changeButtonSkin('start');
        } else if (this.state.ready) {
            this.owner.state.loadImage(
                `resources/room/texture/table/ready.png`
            );
            if (this.room.owner.selfId === this.state.playerId)
                this.room.changeButtonSkin('cancle');
        } else {
            this.owner.state.loadImage(undefined);
            if (this.room.owner.selfId === this.state.playerId)
                this.room.changeButtonSkin('ready');
        }
    }

    onChat(message: string) {
        this.owner.paopao.clearTimer(this, this.onChatTimerEnd);
        this.owner.paopao.visible = true;
        this.owner.paopao.chatLabel.text = message;
        this.owner.paopao.timerOnce(3500, this, this.onChatTimerEnd);
    }

    onChatTimerEnd() {
        this.owner.paopao.visible = false;
    }
}
