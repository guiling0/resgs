import { Main } from './Main';
import { ResourcesManager } from './mgr/Resources';
import { sgs } from './core/sgs';
import extensions from './core/extensions.config';
import { Client } from './mgr/Client';
import { ServerConfig } from './config';
import { Replay } from './mgr/Replay';

export abstract class S {
    public static init() {
        this.res = ResourcesManager.getInstance();
        this.client = Client.getInstance();
        this.replay = Replay.getInstance();
        // const side = Laya.LayaEnv.isPreview ? 'preview' : 'client';
        const side: string = 'preview';
        sgs.init(side, (name) => {
            this.loadScript(`./extensions/${name}.js`, () => {
                sgs.extensions.push(name);
            });
        });

        sgs.loadTranslation({
            ['wars.hezong']: '合纵',
        });

        if (side !== 'preview') {
            for (const pkg of extensions) {
                sgs.loadPackage(pkg);
            }
        }

        let config = `./configs/config.${
            Laya.LayaEnv.isPreview ? 'development' : 'production'
        }.json`;

        Laya.loader.load(config, Laya.Loader.JSON).then((res) => {
            const data = res.data;
            ServerConfig.host = data.serverHost;
            ServerConfig.port = data.serverPort;
            ServerConfig.res_url = data.gameAssetsUrl;
        });

        this.replay.init();
    }

    public static loadScript(url: string, func: any) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = func;
        document.body.appendChild(script);
    }

    public static ui: Main;
    public static res: ResourcesManager;
    public static client: Client;
    public static replay: Replay;
}
