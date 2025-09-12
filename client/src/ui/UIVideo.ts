const { regClass } = Laya;
import Pako from 'pako';
import { ScenesEnum } from '../enums';
import { AloneServerRoom } from '../server/server_table';
import { S } from '../singleton';
import { UIVideoBase } from './UIVideo.generated';
import { UIVideoItem } from './UIVideoItem';

@regClass()
export class UIVideo extends UIVideoBase {
    private videos: any[];

    protected listener: any;

    onAwake(): void {
        this.list.itemRenderer = this.refreshListItem.bind(this);
        S.replay.getAllReplayMeta().then((replays) => {
            this.videos = replays;
            this.list.numItems = this.videos.length;
        });

        this.back.on(Laya.Event.CLICK, () => {
            S.ui.closeScene(ScenesEnum.Video);
        });

        this.btn_clear.on(Laya.Event.CLICK, () => {
            S.replay.clearAllReplays().then((v) => {
                S.ui.toast('清空录像成功');
                this.videos = [];
                this.list.numItems = 0;
            });
        });

        this.btn_load.on(Laya.Event.CLICK, () => {
            Laya.Browser.document.getElementById('jsonFile').click();
        });

        this.listener = this.onSelect.bind(this);

        document
            .getElementById('jsonFile')
            .addEventListener('change', this.listener);
    }

    onDestroy(): void {
        document
            .getElementById('jsonFile')
            .removeEventListener('change', this.listener);
    }

    protected refreshListItem(index: number, item: UIVideoItem) {
        item.set(this.videos[index]);
    }

    onSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const compressedData = new Uint8Array(
                        e.target.result as any
                    );
                    // 解压数据
                    const decompressed = Pako.ungzip(compressedData);
                    // 转换为字符串
                    const jsonString = new TextDecoder().decode(decompressed);
                    // 解析JSON
                    const replay_data = JSON.parse(jsonString);
                    //播放
                    const server = new AloneServerRoom();
                    server.sessionId = replay_data.self;
                    server.roomId = replay_data.messages.at(0).message.roomId;
                    S.ui.openScene(ScenesEnum.Room, [server, replay_data]);
                } catch (error: any) {
                    console.log(error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }
}
