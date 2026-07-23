export class ResManager {
    private static _refs: Map<string, number> = new Map();

    // ===== 加载 =====

    /** 加载资源，自动去重。缓存委托给 Laya.loader */
    static async load<T = any>(url: string): Promise<T> {
        const refs = this._refs.get(url) ?? 0;
        if (refs > 0) {
            this._refs.set(url, refs + 1);
            return Laya.loader.getRes(url) as T;
        }
        const data = await Laya.loader.load(url);
        if (!data) throw new Error(`[ResManager] load failed: ${url}`);
        this._refs.set(url, 1);
        return data as T;
    }

    /**
     * 批量加载。部分失败不影响已成功的加载。
     * 返回 { ok: Map<url, data>, fail: Map<url, error> }
     */
    static async loadBatch(urls: string[]): Promise<{
        ok: Map<string, any>;
        fail: Map<string, Error>;
    }> {
        const ok = new Map<string, any>();
        const fail = new Map<string, Error>();

        const results = await Promise.allSettled(
            urls.map((url) => this.load(url)),
        );

        for (let i = 0; i < urls.length; i++) {
            const r = results[i];
            if (r.status === 'fulfilled') {
                ok.set(urls[i], r.value);
            } else {
                fail.set(urls[i], r.reason instanceof Error ? r.reason : new Error(String(r.reason)));
            }
        }

        return { ok, fail };
    }

    /** 加载预制体并创建实例 */
    static async loadAndCreate<T extends Laya.Node = Laya.Sprite>(
        prefabUrl: string,
    ): Promise<T> {
        const prefab = await this.load<Laya.Prefab>(prefabUrl);
        return prefab.create() as T;
    }

    // ===== GImage 皮肤（UI2） =====

    /**
     * 通过 ResManager 加载资源后赋值给 GImage.src，带引用计数。
     * 禁止直接写 image.src = url —— 会绕过 ResManager 无法追踪。
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

    /** 清除 GImage.src 并释放引用计数 */
    static clearSkin(image: Laya.GImage): void {
        if (image.src) {
            this.release(image.src);
            image.src = null;
        }
    }

    // ===== 查询 =====

    static isLoaded(url: string): boolean {
        return (this._refs.get(url) ?? 0) > 0;
    }

    static getRefs(url: string): number {
        return this._refs.get(url) ?? 0;
    }

    static get refCount(): number {
        return this._refs.size;
    }

    // ===== 释放 =====

    /** 释放一次引用。归零时仅删除计数，不销毁纹理 */
    static release(url: string): void {
        const refs = this._refs.get(url);
        if (refs === undefined) return;
        if (refs <= 1) {
            this._refs.delete(url);
        } else {
            this._refs.set(url, refs - 1);
        }
    }

    static releaseBatch(urls: string[]): void {
        for (const url of urls) this.release(url);
    }

    /** 强制释放：归零计数 + 销毁 Laya 纹理 */
    static forceRelease(url: string): void {
        this._refs.delete(url);
        Laya.loader.clearRes(url);
    }

    /** 释放全部引用 + 清空 Laya 缓存 */
    static releaseAll(): void {
        for (const url of this._refs.keys()) {
            Laya.loader.clearRes(url);
        }
        this._refs.clear();
    }
}
