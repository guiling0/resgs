export type SceneEnterCallback = (
    scene: Laya.Sprite,
    entryData?: any,
) => void | Promise<void>;
export type SceneExitCallback = (scene: Laya.Sprite) => void | Promise<void>;

export interface SceneConfig {
    prefabUrl: string;
    onEnter?: SceneEnterCallback;
    onExit?: SceneExitCallback;
}

interface SceneRecord {
    config: SceneConfig;
    prefab: Laya.Prefab;
    instance: Laya.Sprite | null;
}

export class SceneManager {
    private static _root: Laya.Sprite;
    private static _configs: Map<string, SceneConfig> = new Map();
    private static _records: Map<string, SceneRecord> = new Map();
    private static _currentName: string | null = null;

    static init(root: Laya.Sprite): void {
        this._root = root;
    }

    static register(name: string, config: SceneConfig): void {
        this._configs.set(name, config);
    }

    static registerAll(map: Record<string, SceneConfig>): void {
        for (const [name, config] of Object.entries(map)) {
            this.register(name, config);
        }
    }

    static get current(): string | null {
        return this._currentName;
    }

    static get currentScene(): Laya.Sprite | null {
        if (!this._currentName) return null;
        return this._records.get(this._currentName)?.instance ?? null;
    }

    static async preload(names: string[]): Promise<void> {
        const tasks = names.map(async (name) => {
            if (this._records.has(name)) return;
            const config = this._configs.get(name);
            if (!config)
                throw new Error(
                    `[SceneManager] scene "${name}" not registered`,
                );
            const prefab = await Laya.loader.load(config.prefabUrl);
            if (!prefab)
                throw new Error(
                    `[SceneManager] failed to load prefab: ${config.prefabUrl}`,
                );
            this._records.set(name, { config, prefab, instance: null });
        });
        await Promise.all(tasks);
    }

    static async enter(name: string, entryData?: any): Promise<Laya.Sprite> {
        if (this._currentName === name) {
            return this._records.get(name)!.instance!;
        }

        if (!this._records.has(name)) {
            await this.preload([name]);
        }

        const record = this._records.get(name)!;

        if (this._currentName !== null) {
            await this._exitCurrent();
        }

        if (!record.instance) {
            record.instance = record.prefab.create() as Laya.Sprite;
        }

        this._root.addChild(record.instance);
        this._currentName = name;

        if (record.config.onEnter) {
            await record.config.onEnter(record.instance, entryData);
        }

        if ((record.instance as any).onEntry) {
            await (record.instance as any).onEntry(entryData);
        }

        return record.instance;
    }

    static async exit(): Promise<void> {
        if (this._currentName === null) return;
        await this._exitCurrent();
    }

    private static async _exitCurrent(): Promise<void> {
        const record = this._records.get(this._currentName!);
        if (!record) return;

        if (record.config.onExit && record.instance) {
            await record.config.onExit(record.instance);
        }

        if ((record.instance as any).onExit) {
            await (record.instance as any).onExit();
        }

        if (record.instance && record.instance.parent) {
            record.instance.removeSelf();
        }

        this._currentName = null;
    }

    static destroy(name: string): void {
        const record = this._records.get(name);
        if (!record) return;

        if (record.instance) {
            if (this._currentName === name) {
                this._currentName = null;
            }
            record.instance.destroy();
            record.instance = null;
        }

        this._records.delete(name);
    }

    static destroyAll(): void {
        for (const [name] of this._records) {
            this.destroy(name);
        }
        this._configs.clear();
        this._currentName = null;
    }
}
