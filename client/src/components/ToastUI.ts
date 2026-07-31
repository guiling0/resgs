/**
 * Toast 提示组件（原生 DOM）。
 * 底部弹出，同内容去重，限流，停留后淡出。
 */

const MAX_TOAST = 5;
const TOAST_STAY = 2000;
const TOAST_FADE = 400;

interface ActiveToast {
    el: HTMLElement;
    timer: number;
}

export class ToastUI {
    private static _layer: HTMLElement | null = null;
    private static _actives: ActiveToast[] = [];

    static init(): void {
        if (this._layer) return;
        this._layer = document.getElementById('toast-layer')!;
    }

    /** 显示一条提示。同内容去重：刷新计时。 */
    static show(message: string): void {
        if (!this._layer) this.init();

        // ===== 同内容去重 =====
        const dup = this._actives.find(
            (a) => a.el.textContent === message,
        );
        if (dup) {
            clearTimeout(dup.timer);
            dup.el.style.animation = 'none';
            void dup.el.offsetHeight; // reflow
            dup.el.style.animation =
                'toastIn .3s ease-out, toastOut .4s 2s ease-in forwards';
            dup.timer = window.setTimeout(
                () => this._remove(dup.el),
                TOAST_STAY + TOAST_FADE + 100,
            );
            return;
        }

        // ===== 限流 =====
        while (this._actives.length >= MAX_TOAST) {
            const oldest = this._actives.shift()!;
            clearTimeout(oldest.timer);
            oldest.el.remove();
        }

        // ===== 创建新 Toast =====
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = message;
        this._layer.appendChild(el);

        const timer = window.setTimeout(
            () => this._remove(el),
            TOAST_STAY + TOAST_FADE + 100,
        );
        this._actives.push({ el, timer });
    }

    private static _remove(el: HTMLElement): void {
        const index = this._actives.findIndex((a) => a.el === el);
        if (index !== -1) {
            clearTimeout(this._actives[index].timer);
            this._actives.splice(index, 1);
        }
        el.remove();
    }

    static clear(): void {
        for (const active of this._actives) {
            clearTimeout(active.timer);
            active.el.remove();
        }
        this._actives.length = 0;
    }
}
