const { regClass } = Laya;
import Pako from 'pako';
import { ScenesEnum } from '../enums';
import { AloneServerRoom } from '../server/server_table';
import { S } from '../singleton';
import { UIVideoItemBase } from './UIVideoItem.generated';

@regClass()
export class UIVideoItem extends UIVideoItemBase {
    protected video_data: any;

    public set(data: any) {
        this.video_data = data;
        this.roomname.text = data.name ?? '无名录像';
        this.btn_watch.offAll(Laya.Event.CLICK);
        this.btn_watch.on(Laya.Event.CLICK, this, this.onWatchClick);
        this.btn_save.offAll(Laya.Event.CLICK);
        this.btn_save.on(Laya.Event.CLICK, this, this.onSaveClick);
    }

    onWatchClick() {
        S.ui.openModelLoad();
        S.replay.getRelayById(this.video_data.id).then((data) => {
            S.ui.closeModelLoad();
            const replay_data = JSON.parse(Pako.ungzip(data, { to: 'string' }));
            const server = new AloneServerRoom();
            server.sessionId = replay_data.self;
            server.roomId = replay_data.messages.at(0).message.roomId;
            S.ui.openScene(ScenesEnum.Room, [server, replay_data]);
        });
    }

    async onSaveClick() {
        S.ui.openModelLoad();
        S.replay.getRelayById(this.video_data.id).then((data) => {
            S.ui.closeModelLoad();
            (console as any).save(data, `${this.video_data.name}.resgs`);
        });
    }
}
