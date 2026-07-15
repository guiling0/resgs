import { SceneManager } from './SceneManager';
import { sgs } from './core/sgs';

const { regClass } = Laya;

@regClass()
export class Main extends Laya.Script {
    async onStart() {
        Laya.stage.bgColor = 'transparent';
        this._setupBodyBg();

        //加载核心代码
        sgs.init('client');

        SceneManager.init(this.owner as Laya.Sprite);
        this._registerScenes();

        await SceneManager.preload(['load']);
        SceneManager.enter('load');
    }

    private _setupBodyBg(): void {
        const body = document.body;
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.backgroundImage = 'url("resources/background/frameBg.jpg")';
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
    }

    private _registerScenes(): void {
        SceneManager.registerAll({
            load: {
                prefabUrl: 'resources/scenes/Load.lh',
                onEnter: async (scene) => {
                    console.log('[Main] load entered');
                },
                onExit: async (scene) => {
                    console.log('[Main] load exited');
                },
            },
        });
    }
}
