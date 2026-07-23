import { ObjectPool } from '../utils/ObjectPool';

const TOAST_GAP = 8;
const TOAST_W = 300;
const TOAST_H = 36;
const TOAST_STAY = 2000;
const TOAST_FADE = 400;
const TOAST_SHIFT = 200;
const TOAST_FADE_OFFSET = 30;

interface ActiveToast {
    txt: Laya.GTextField;
    targetY: number;
}

export class ToastUI {
    private static _root: Laya.Sprite | null = null;
    private static _pool: ObjectPool<Laya.GTextField>;
    private static _actives: ActiveToast[] = [];

    static init(): void {
        if (this._root) return;

        this._root = new Laya.Sprite();
        this._root.name = 'ToastUI';
        this._root.zOrder = 99999;
        this._root.mouseEnabled = false;
        this._root.mouseThrough = true;
        Laya.stage.addChild(this._root);

        this._pool = new ObjectPool<Laya.GTextField>(
            'toast_text',
            () => this._createItem(),
            (item) => this._resetItem(item),
        );

        Laya.stage.on(Laya.Event.RESIZE, this, this._onResize);
    }

    private static _createItem(): Laya.GTextField {
        const txt = new Laya.GTextField();
        txt.size(TOAST_W, TOAST_H);
        txt.fontSize = 40;
        txt.color = '#ffffff';
        txt.align = 'center';
        txt.valign = 'middle';
        txt.alpha = 0;
        txt.visible = false;
        return txt;
    }

    private static _resetItem(item: Laya.GTextField): void {
        Laya.Tween.killAll(item);
        item.alpha = 0;
        item.visible = false;
    }

    /** 显示一条提示。新提示从底部出现，将已有提示向上推。同内容去重：刷新计时并复位。 */
    static show(message: string): void {
        if (!this._root) this.init();

        const slotH = TOAST_H + TOAST_GAP;
        const anchorY = Laya.stage.height * 0.45;

        const dup = this._actives.find((a) => a.txt.text === message);
        if (dup) {
            Laya.Tween.killAll(dup.txt);
            dup.txt.y = dup.targetY;
            dup.txt.alpha = 1;
            this._scheduleFade(dup.txt, dup.targetY);
            return;
        }

        const txt = this._pool.acquire();
        txt.text = message;
        txt.x = (Laya.stage.width - TOAST_W) / 2;
        txt.visible = true;
        txt.alpha = 0;

        for (const active of this._actives) {
            Laya.Tween.killAll(active.txt);
            active.targetY -= slotH;
            active.txt.y = active.targetY;
            this._scheduleFade(active.txt, active.targetY);
        }

        const newTargetY = anchorY;
        txt.y = newTargetY + slotH;
        this._root!.addChild(txt);

        Laya.Tween.create(txt)
            .to('y', newTargetY)
            .to('alpha', 1)
            .duration(TOAST_SHIFT);
        this._scheduleFade(txt, newTargetY);

        this._actives.push({ txt, targetY: newTargetY });
    }

    private static _scheduleFade(txt: Laya.GTextField, fromY: number): void {
        Laya.Tween.create(txt)
            .to('y', fromY - TOAST_FADE_OFFSET)
            .to('alpha', 0)
            .duration(TOAST_FADE)
            .delay(TOAST_STAY)
            .then(() => this._recycle(txt));
    }

    private static _recycle(txt: Laya.GTextField): void {
        const index = this._actives.findIndex((a) => a.txt === txt);
        if (index === -1) return;

        this._actives.splice(index, 1);
        txt.removeSelf();
        this._pool.release(txt);

        const slotH = TOAST_H + TOAST_GAP;
        for (let i = index; i < this._actives.length; i++) {
            Laya.Tween.killAll(this._actives[i].txt);
            this._actives[i].targetY += slotH;
            this._actives[i].txt.y = this._actives[i].targetY;
            this._scheduleFade(this._actives[i].txt, this._actives[i].targetY);
        }
    }

    private static _onResize(): void {
        const cx = Laya.stage.width / 2;
        for (const active of this._actives) {
            active.txt.x = cx - TOAST_W / 2;
        }
    }

    static clear(): void {
        for (const active of this._actives) {
            Laya.Tween.killAll(active.txt);
            active.txt.removeSelf();
            this._pool.release(active.txt);
        }
        this._actives.length = 0;
    }
}
