export class LoadingUI {
    private static _root: Laya.Sprite;
    private static _mask: Laya.Sprite;
    private static _spinner: Laya.Sprite;
    private static _prefab: Laya.Prefab;
    private static _showing: boolean = false;

    static async show(): Promise<void> {
        if (this._showing) return;
        this._showing = true;

        if (!this._root) {
            this._root = Laya.stage.addChild(new Laya.Sprite()) as Laya.Sprite;
            this._root.zOrder = 99999;
            this._root.name = 'LoadingUI';

            this._mask = new Laya.Sprite();
            this._mask.graphics.drawRect(0, 0, 1, 1, 'rgba(0,0,0,0.4)');
            this._mask.width = Laya.stage.width;
            this._mask.height = Laya.stage.height;
            this._mask.on(Laya.Event.RESIZE, this, this._onResize);
            this._root.addChild(this._mask);

            if (!this._prefab) {
                this._prefab = await Laya.loader.load(
                    'resources/prefabs/LoadingSpinner.lh',
                );
            }
            this._spinner = this._prefab.create() as Laya.Sprite;
            this._spinner.x = (Laya.stage.width - this._spinner.width) / 2;
            this._spinner.y = (Laya.stage.height - this._spinner.height) / 2;
            this._root.addChild(this._spinner);
        }

        this._root.active = true;
        this._root.visible = true;
    }

    static hide(): void {
        if (!this._showing) return;
        this._showing = false;
        if (this._root) {
            this._root.active = false;
            this._root.visible = false;
        }
    }

    static get isShowing(): boolean {
        return this._showing;
    }

    private static _onResize(): void {
        if (this._mask) {
            this._mask.width = Laya.stage.width;
            this._mask.height = Laya.stage.height;
        }
        if (this._spinner) {
            this._spinner.x = (Laya.stage.width - this._spinner.width) / 2;
            this._spinner.y = (Laya.stage.height - this._spinner.height) / 2;
        }
    }
}
