import { DevPreview } from './components/DevPreview';
import { SceneConfig, SceneManager } from './SceneManager';

const { regClass } = Laya;

const SCENE_CONFIGS: Record<string, SceneConfig> = {
    load: {
        prefabUrl: 'resources/scenes/Load.lh',
        onEnter: async (scene) => {
            console.log('[Main] load entered');
        },
        onExit: async (scene) => {
            console.log('[Main] load exited');
        },
    },
    entry: {
        prefabUrl: 'resources/scenes/Entry.lh',
        onEnter: async (scene) => {
            console.log('[Main] entry entered');
        },
        onExit: async (scene) => {
            console.log('[Main] entry exited');
            const el = document.getElementById('page-entry');
            if (el) el.innerHTML = '';
        },
    },
    lobby: {
        prefabUrl: 'resources/scenes/Lobby.lh',
        onEnter: async (scene) => {
            console.log('[Main] lobby entered');
        },
        onExit: async (scene) => {
            console.log('[Main] lobby exited');
        },
    },
    table: {
        prefabUrl: 'resources/scenes/Table.lh',
        onEnter: async (scene) => {
            console.log('[Main] table entered');
        },
        onExit: async (scene) => {
            console.log('[Main] table exited');
        },
    },
};

@regClass()
export class Main extends Laya.Script {
    async onStart() {
        // ===== 预览模式检测 =====
        DevPreview.init();
        if (DevPreview.isPreviewMode) return;

        Laya.stage.bgColor = 'transparent';
        this._setupBodyBg();

        // ===== 加载核心代码 =====
        // sgs.init('client');

        SceneManager.init(this.owner as Laya.Sprite);
        SceneManager.registerAll(SCENE_CONFIGS);
        SceneManager.enter('load');
    }

    private _setupBodyBg(): void {
        const body = document.body;
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.position = 'fixed';
        body.style.inset = '0';
        body.style.backgroundImage = 'url("resources/background/frameBg.jpg")';
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
    }
}
