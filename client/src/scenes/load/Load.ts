import { PREFAB_URLS, RES_URLS, SCENE_URLS } from '../../data/res_list';
import { ResManager } from '../../ResManager';
import { SceneManager } from '../../SceneManager';
import { LoadBase } from './Load.generated';

const { regClass } = Laya;

const LoadBg: string[] = [
    'resources/background/loading/1.png',
    'resources/background/loading/3.png',
    'resources/background/loading/4.png',
    'resources/background/loading/5.png',
    'resources/background/loading/7.png',
    'resources/background/loading/8.png',
    'resources/background/loading/9.png',
    'resources/background/loading/11.png',
    'resources/background/loading/12.png',
    'resources/background/loading/13.png',
    'resources/background/loading/14.png',
    'resources/background/loading/15.png',
    'resources/background/loading/16.png',
    'resources/background/loading/17.png',
    'resources/background/loading/66.png',
    'resources/background/loading/67.png',
    'resources/background/loading/68.png',
];

@regClass()
export class Load extends LoadBase {
    onAwake(): void {
        this.pb.value = 0;
        this.pb.max = RES_URLS.length;
        this.txt
            .setVar('text', '正在准备加载')
            .setVar('value', '')
            .setVar('max', '');

        ResManager.bindSkin(this.img, LoadBg[1], () => {
            this.startPreload();
        });
    }

    private async startPreload(): Promise<void> {
        // ===== 基础资源 =====
        this.txt.setVar('text', '基础资源').setVar('max', RES_URLS.length);
        let loaded = 0;
        for (const url of RES_URLS) {
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[Load] load failed:', url, e);
            }
            loaded++;
            this.pb.value = loaded;
            this.txt.setVar('value', loaded);
        }

        // ===== UI 预制资源 =====
        this.txt.setVar('text', 'UI资源').setVar('max', PREFAB_URLS.length);
        loaded = 0;
        for (const url of PREFAB_URLS) {
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[Load] load failed:', url, e);
            }
            loaded++;
            this.pb.value = loaded;
            this.txt.setVar('value', loaded);
        }

        // ===== 场景资源 =====
        this.txt.setVar('text', '场景资源').setVar('max', 1);
        loaded = 0;
        for (const url of SCENE_URLS) {
            try {
                await Laya.loader.load(url);
            } catch (e) {
                console.warn('[Load] load failed:', url, e);
            }
            loaded++;
            this.pb.value = loaded;
            this.txt.setVar('value', loaded);
        }

        this.onLoadComplete();
    }

    private onLoadComplete(): void {
        console.log('[Load] preload complete, total:', RES_URLS.length);
        this.pb.max = this.pb.value = 1;
        this.txt.text = '加载完成';
        this.timerOnce(1800, this, () => {
            SceneManager.enter('entry');
        });
    }

    onDestroy(): void {
        ResManager.clearSkin(this.img);
    }
}
