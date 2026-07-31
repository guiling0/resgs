/**
 * 加载遮罩组件（原生 DOM）。
 * 半透明遮罩 + spinner 旋转动画。
 */
export class LoadingUI {
    private static _el: HTMLElement | null = null;
    private static _showing: boolean = false;

    private static _getEl(): HTMLElement {
        if (!this._el) {
            this._el = document.getElementById('loading-overlay')!;
        }
        return this._el;
    }

    static show(): void {
        if (this._showing) return;
        this._showing = true;
        this._getEl().classList.add('show');
    }

    static hide(): void {
        if (!this._showing) return;
        this._showing = false;
        this._getEl().classList.remove('show');
    }

    static get isShowing(): boolean {
        return this._showing;
    }
}
