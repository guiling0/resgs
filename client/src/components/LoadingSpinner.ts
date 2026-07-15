const { regClass, property } = Laya;

@regClass()
export class LoadingSpinner extends Laya.Script {

    @property({ type: Number, caption: "圆圈数量" })
    public circleCount: number = 10;

    @property({ type: Number, caption: "圆圈半径" })
    public circleRadius: number = 8;

    @property({ type: Number, caption: "环半径" })
    public ringRadius: number = 36;

    @property({ type: String, caption: "圆圈颜色" })
    public circleColor: string = "#ffffff";

    @property({ type: Number, caption: "动画周期(ms)" })
    public duration: number = 1200;

    private _circles: Laya.Sprite[] = [];
    private _elapsed: number = 0;
    private _built: boolean = false;

    onEnable(): void {
        if (!this._built) {
            this.buildCircles();
            this._built = true;
        }
        this._elapsed = 0;
    }

    onDisable(): void {
        this._elapsed = 0;
    }

    private buildCircles(): void {
        const owner = this.owner as Laya.Sprite;
        for (let i = 0; i < this.circleCount; i++) {
            const angle = (i / this.circleCount) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * this.ringRadius;
            const y = Math.sin(angle) * this.ringRadius;

            const circle = new Laya.Sprite();
            circle.graphics.drawCircle(0, 0, this.circleRadius, this.circleColor);
            circle.pos(owner.width / 2 + x, owner.height / 2 + y);
            owner.addChild(circle);
            this._circles.push(circle);
        }
    }

    onUpdate(): void {
        this._elapsed += Laya.timer.delta;
        const phase = (this._elapsed % this.duration) / this.duration;

        for (let i = 0; i < this._circles.length; i++) {
            const offset = i / this._circles.length;
            const t = (phase + offset) % 1;
            const ease = (1 - t) * (1 - t);

            const scale = 0.3 + 0.7 * ease;
            const alpha = 0.15 + 0.85 * ease;

            const c = this._circles[i];
            c.scale(scale, scale);
            c.alpha = alpha;
        }
    }
}
