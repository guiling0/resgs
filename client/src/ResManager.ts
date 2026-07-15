interface CacheEntry {
    data: any;
    refs: number;
}

export class ResManager {
    private static _cache: Map<string, CacheEntry> = new Map();

    static async load<T = any>(url: string): Promise<T> {
        const entry = this._cache.get(url);
        if (entry) {
            entry.refs++;
            return entry.data as T;
        }
        const data = await Laya.loader.load(url);
        if (!data) throw new Error(`[ResManager] load failed: ${url}`);
        this._cache.set(url, { data, refs: 1 });
        return data as T;
    }

    static async loadBatch(urls: string[]): Promise<Map<string, any>> {
        const result = new Map<string, any>();
        const tasks = urls.map(async (url) => {
            const data = await this.load(url);
            result.set(url, data);
        });
        await Promise.all(tasks);
        return result;
    }

    static async loadAndCreate<T extends Laya.Node = Laya.Sprite>(
        prefabUrl: string,
    ): Promise<T> {
        const prefab = await this.load<Laya.Prefab>(prefabUrl);
        return prefab.create() as T;
    }

    /**
     * 通过 ResManager 加载资源后赋值给 Image.skin，带引用计数
     * 直接写 image.skin = url 不会经过 ResManager，无法追踪和释放
     */
    static async bindSkin(
        image: Laya.GImage,
        url: string,
        onComplete?: () => void,
    ): Promise<void> {
        if (image.src === url) return;
        if (image.src) {
            this.release(image.src);
        }
        await this.load(url);
        image.src = url;
        onComplete?.();
    }

    /**
     * 清除 Image.skin 并释放引用计数
     * 直接写 image.skin = null 不会触发 ResManager 的引用释放
     */
    static clearSkin(image: Laya.GImage): void {
        if (image.src) {
            this.release(image.src);
            image.src = null;
        }
    }

    static get<T = any>(url: string): T | null {
        return (this._cache.get(url)?.data as T) ?? null;
    }

    static isLoaded(url: string): boolean {
        return this._cache.has(url);
    }

    static getRefs(url: string): number {
        return this._cache.get(url)?.refs ?? 0;
    }

    static release(url: string): void {
        const entry = this._cache.get(url);
        if (!entry) return;
        entry.refs--;
        if (entry.refs <= 0) {
            this._cache.delete(url);
        }
    }

    static releaseBatch(urls: string[]): void {
        for (const url of urls) this.release(url);
    }

    static forceRelease(url: string): void {
        this._cache.delete(url);
    }

    static releaseAll(): void {
        this._cache.clear();
    }

    static get refCount(): number {
        return this._cache.size;
    }
}
