import { ResManager } from '../ResManager';
import { AniPreview } from './AniPreview';

declare global {
    interface Window {
        DevPreview: typeof DevPreview;
    }
}

/**
 * 开发预览管理器。
 * 支持 URL `?preview=<name>` 跳过 Load→Entry 流程直接预览模块，
 * 也支持控制台 `DevPreview.show(url)` 手动调起预览。
 */
export class DevPreview {
    private static _previewRoot: Laya.Sprite | null = null;
    private static _currentPreview: Laya.Node | null = null;
    private static _modules: Map<string, string> = new Map();
    private static _previewMode = false;
    private static _loadId = 0;

    // ===== 初始化 =====

    /** 在 Main.onStart 首行调用。命中 ?preview= 参数则进入预览模式。 */
    static init(): void {
        const params = new URLSearchParams(window.location.search);
        const previewName = params.get('preview');

        if (previewName) {
            this._previewMode = true;
            // 异步执行预览加载，不阻塞 Main.onStart 返回
            this._startPreviewMode(previewName);
        }

        // 挂载到 window 供控制台调用
        window.DevPreview = DevPreview;
        // 挂载子工具
        AniPreview.init();
    }

    /** 是否处于预览模式（跳过正常启动流程） */
    static get isPreviewMode(): boolean {
        return this._previewMode;
    }

    // ===== 模块注册 =====

    /** 注册可预览模块（供后续工单调用） */
    static register(name: string, prefabUrl: string): void {
        this._modules.set(name, prefabUrl);
    }

    // ===== 预览操作 =====

    /** 清空 stage 并加载指定预制体/场景居中显示 */
    static async show(url: string): Promise<void> {
        this._ensureRoot();

        // 取消之前正在进行的加载
        const loadId = ++this._loadId;
        this._clearPreview();

        try {
            const node = await ResManager.loadAndCreate<Laya.Sprite>(url);
            // ===== 如果期间有新的 show 调用，丢弃旧结果 =====
            if (loadId !== this._loadId) {
                node.destroy();
                return;
            }
            this._previewRoot!.addChild(node);
            // 延迟一帧等布局计算完成后再居中
            Laya.timer.frameOnce(1, this, () => {
                if (loadId === this._loadId) {
                    this._centerNode(node);
                }
            });
            this._currentPreview = node;
            console.log(`[DevPreview] loaded: ${url}`);
        } catch (e) {
            if (loadId === this._loadId) {
                console.error(`[DevPreview] failed to load: ${url}`, e);
            }
        }
    }

    /** 移除当前预览 */
    static hide(): void {
        this._clearPreview();
    }

    /** 打印所有注册的可预览模块名称 */
    static list(): void {
        if (this._modules.size === 0) {
            console.log('[DevPreview] 暂无注册模块');
            return;
        }
        console.log('[DevPreview] 可预览模块:');
        for (const [name, url] of this._modules) {
            console.log(`  ${name} → ${url}`);
        }
    }

    // ===== 内部 =====

    private static async _startPreviewMode(name: string): Promise<void> {
        // 等待 Laya 引擎就绪
        await this._waitForStage();

        // 初始化 sgs
        // await sgs.init('client');

        // 查找注册模块或直接作为 URL 使用
        const url = this._modules.get(name) ?? name;
        console.log(`[DevPreview] preview mode: ${name} → ${url}`);
        await this.show(url);
    }

    /** 确保预览根容器存在 */
    private static _ensureRoot(): void {
        if (!this._previewRoot) {
            this._previewRoot = new Laya.Sprite();
            this._previewRoot.name = 'DevPreviewRoot';
            this._previewRoot.zOrder = 99999;
            Laya.stage.addChild(this._previewRoot);
        }
    }

    /** 清空当前预览节点 */
    private static _clearPreview(): void {
        if (this._currentPreview) {
            this._currentPreview.destroy();
            this._currentPreview = null;
        }
    }

    /** 居中节点（调用前须确保节点已在显示列表且布局完成） */
    private static _centerNode(node: Laya.Sprite): void {
        const bounds = node.getBounds();
        if (!bounds) return;
        node.x = (Laya.stage.width - bounds.width) / 2 - bounds.x;
        node.y = (Laya.stage.height - bounds.height) / 2 - bounds.y;
    }

    /** 等待 Laya.stage 就绪 */
    private static _waitForStage(): Promise<void> {
        return new Promise((resolve) => {
            if (Laya.stage && Laya.stage.width > 0) {
                resolve();
                return;
            }
            Laya.stage.once(Laya.Event.RESIZE, () => resolve());
        });
    }
}
