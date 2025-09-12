import { res } from '../enums';

export class ResourcesManager {
    private static instance: ResourcesManager;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ResourcesManager();
        }
        return this.instance;
    }

    private constructor() {}

    initLoad(onProgress: (progress: number) => void, onComplete: () => void) {
        const urls = [
            // ...res.fonts,
            ...res.pres,
            ...res.prefabs,
            ...res.scenes,
            // ...res.images,
            // ...res.spines,
            // ...res.sks,
            // ...res.animations,
        ];
        Laya.loader.load(urls, null, onProgress).then(() => {
            onComplete();
        });
    }
}
