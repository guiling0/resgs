import { ScenesEnum, EntityTypeEnum } from './enums';
import { S } from './singleton';
import { ObjectPoolItem } from './types';
import { UIMain } from './ui/UIMain';
import { UIToast } from './ui/UIToast';

const { regClass, property } = Laya;

@regClass()
export class Main extends Laya.Script {
    declare owner: UIMain;

    public settings = {
        bgmVolume: 1,
        audioVolume: 1,
        eggaudio: true,
    };

    onAwake(): void {
        S.init();
        S.ui = this;

        this.owner.windows.mouseThrough = false;
        this.owner.model.mouseThrough = false;

        const settings = Laya.LocalStorage.getJSON('settings');
        if (!settings) {
            Laya.LocalStorage.setJSON('settings', this.settings);
        } else {
            this.settings = settings;
        }

        this.settings = JSON.parse(Laya.LocalStorage.getItem('settings'));

        Laya.stage.frameRate = Laya.Stage.FRAME_MOUSE;

        Laya.loader.load(ScenesEnum.Load).then(() => {
            this.openScene(ScenesEnum.Load);
        });

        this.owner.prompt_cancle.on(Laya.Event.CLICK, this, () => {
            this.owner.prompt.visible = false;
            this.owner.windows.visible = false;
        });
    }

    /** toasts */
    public toasts: number = 0;

    public itemid = 1;

    public getObjectFromPool(type: EntityTypeEnum, create?: () => any) {
        const node = Laya.Pool.getItemByCreateFun(type, create);
        if (node) {
            if (!node.itemid) {
                node.itemid = this.itemid++;
            }
            this.owner.pool.addChild(node);
            node.onGet?.call(node);
        }
        return node;
    }

    public retObjectFromPool(type: EntityTypeEnum, obj: any) {
        if (!obj) return;
        obj?.onRet?.call(obj);
        obj?.removeSelf?.call(obj);
        Laya.Pool.recover(type, obj);
    }

    protected scenes: Map<string, Laya.GWidget> = new Map();

    openScene(scene: string, params: any[] = []) {
        if (this.scenes.get(scene)) {
            const page = this.scenes.get(scene);
            this.owner.layers.addChild(page);
            page.visible = true;
        } else {
            const page = Laya.loader.getRes(scene).create() as Laya.GWidget;
            (page as any).openParams = params;
            this.scenes.set(scene, page);
            this.owner.layers.addChild(page);
        }
        for (const [key, value] of this.scenes) {
            if (key !== scene) {
                this.owner.pool.addChild(value);
            }
        }
    }

    closeScene(scene: string) {
        if (this.scenes.get(scene)) {
            this.scenes.get(scene).removeSelf();
            this.scenes.delete(scene);
        }
        if (this.owner.layers.children.length === 0) {
            this.openScene(ScenesEnum.Lobby);
        }
    }

    // openRoom(roomId: string, playerId: string) {
    //     const name = `${roomId}:${playerId}`;
    //     if (this.scenes.get(name)) {
    //         this.owner.scenes.addChild(this.scenes.get(name));
    //     } else {
    //         const room = Laya.loader.getRes('resources/room/room.lh');
    //         room.name
    //     }
    // }

    openModelLoad() {
        this.owner.loading.visible = true;
    }

    closeModelLoad() {
        this.owner.loading.visible = false;
    }

    toast(text: string) {
        const node = this.getObjectFromPool(EntityTypeEnum.Toast, () => {
            return Laya.loader
                .getRes(`resources/baseui/toast/toast.lh`)
                .create();
        }) as UIToast;
        node.setToast(text);
        this.owner.tips.addChild(node);
    }

    prompt(text: string, confirm: Function) {
        this.owner.windows.visible = true;
        this.owner.prompt.visible = true;
        this.owner.prompt_title.text = text;
        this.owner.prompt_confirm.offAll(Laya.Event.CLICK);
        this.owner.prompt_confirm.on(Laya.Event.CLICK, this, () => {
            confirm();
            this.owner.windows.visible = false;
            this.owner.prompt.visible = false;
        });
    }

    public audios: string[] = [];

    playAudio(url: string, complete?: Laya.Handler) {
        Laya.SoundManager.setSoundVolume(this.settings.audioVolume, url);
        Laya.SoundManager.playSound(url, 1, complete);
    }

    public currentBgm: string;

    playBgm(url: string, loop: number = 0, complete?: Laya.Handler) {
        if (this.currentBgm) {
            Laya.SoundManager.stopSound(this.currentBgm);
            this.currentBgm = undefined;
        }
        if (url) {
            this.currentBgm = url;
            Laya.SoundManager.setSoundVolume(this.settings.bgmVolume, url);
            Laya.SoundManager.playSound(url, loop, complete);
        }
    }
}
