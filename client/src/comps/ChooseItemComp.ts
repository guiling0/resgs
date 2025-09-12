const { regClass, property } = Laya;

@regClass()
export class ChooseItemComp extends Laya.Script {
    owner: Laya.Sprite;

    @property(Laya.GWidget)
    public clickNode: Laya.GWidget;
    @property([Laya.GWidget])
    public selectedImage: Laya.GWidget[];
    @property(Laya.GWidget)
    public canClickMask: Laya.GWidget;
    @property(Boolean)
    public isButton: boolean;

    onAwake(): void {
        if (!this.clickNode) this.clickNode = this.owner as Laya.GWidget;
    }

    protected _selected: boolean = false;
    public get selected() {
        return this._selected;
    }

    protected _canClick: boolean = true;
    public get canClick() {
        return this._canClick;
    }

    public clickFunc: Function;
    protected longClickFunc: Function;
    /** 是否触发了长按 */
    protected isApeHold: boolean = false;

    public setSelected(value: boolean, show: boolean = true) {
        this._selected = value;
        if (this.selectedImage) {
            this.selectedImage.forEach((v) => (v.visible = value && show));
        }
    }

    public setCanClick(value: boolean) {
        this._canClick = value;
        if (this.canClickMask) {
            this.canClickMask.visible = !value;
        }
        if (this.isButton) {
            this.clickNode.mouseEnabled = value;
            this.clickNode.grayed = !value;
        }
    }

    public onClick(func: Function) {
        if (!!func && !!this.clickFunc) return;
        this.clickNode.offAll(Laya.Event.CLICK);
        this.clickFunc = undefined;
        if (func) {
            this.clickFunc = func;
            this.clickNode.on(Laya.Event.CLICK, () => {
                if (!this.isApeHold && this.canClick) {
                    func();
                }
            });
        }
    }

    public onLongClick(func: Function) {
        this.clickNode.offAll(Laya.Event.MOUSE_DOWN);
        if (this.onLongClick) {
            this.longClickFunc = func;
            this.clickNode.on(Laya.Event.MOUSE_DOWN, this, this.onApePress);
        }
    }

    private onApePress(e: Laya.Event = null): void {
        this.isApeHold = false;
        // 鼠标按下后，HOLD_TRIGGER_TIME毫秒后hold
        Laya.timer.once(500, this, this.onHold);
        this.owner.on(Laya.Event.MOUSE_UP, this, this.onApeRelease);
    }

    private onHold(e: any = null): void {
        this.isApeHold = true;
        if (this.longClickFunc) this.longClickFunc();
    }

    private onApeRelease(e: any = null): void {
        if (!this.isApeHold) {
            Laya.timer.clear(this, this.onHold);
        }
        this.owner.off(Laya.Event.MOUSE_UP, this, this.onApeRelease);
    }
}
