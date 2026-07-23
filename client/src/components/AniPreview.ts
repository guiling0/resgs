/**
 * 动画效果预览。
 * 不依赖任何资源加载，全部用 graphics 绘制几何图形演示。
 * 挂载到 DevPreview.AniPreview，控制台可调起。
 */

// ===== 工具：Tween Promise 包装 =====

function tweenTo(
    target: Laya.Node,
    props: Record<string, number>,
    duration: number,
    ease?: (typeof Laya.Ease)[keyof typeof Laya.Ease],
): Promise<void> {
    return new Promise((resolve) => {
        Laya.Tween.to(
            target,
            props,
            duration,
            ease,
            Laya.Handler.create(null, resolve),
        );
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

// ===== 测试元素工厂 =====

const CARD_W = 120;
const CARD_H = 168;
const HAND_SCALE = 0.35;

function makeCard(
    x: number,
    y: number,
    color: string,
    label: string,
): Laya.Sprite {
    const sp = new Laya.Sprite();
    sp.x = x;
    sp.y = y;
    sp.pivotX = CARD_W / 2;
    sp.pivotY = CARD_H / 2;
    drawCardFace(sp, color, label);
    return sp;
}

function drawCardFace(sp: Laya.Sprite, color: string, label: string): void {
    sp.graphics.clear();
    sp.graphics.drawRect(0, 0, CARD_W, CARD_H, color);
    sp.graphics.drawRect(3, 3, CARD_W - 6, CARD_H - 6, 'rgba(255,255,255,0.2)');
    // 文字
    const tf = new Laya.GTextField();
    tf.text = label;
    tf.fontSize = 20;
    tf.color = '#ffffff';
    tf.bold = true;
    tf.width = CARD_W;
    tf.align = 'center';
    tf.valign = 'middle';
    tf.y = 55;
    sp.addChild(tf);
}

function makeSeat(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
): Laya.Sprite {
    const sp = new Laya.Sprite();
    sp.x = x;
    sp.y = y;
    sp.graphics.drawRect(0, 0, w, h, 'rgba(255,255,255,0.15)');
    sp.graphics.drawRect(0, 0, w, h, null, 'rgba(255,255,255,0.3)', 2);
    const tf = new Laya.GTextField();
    tf.text = label;
    tf.fontSize = 14;
    tf.color = '#aaaaaa';
    tf.width = w;
    tf.align = 'center';
    tf.valign = 'middle';
    tf.height = h;
    sp.addChild(tf);
    return sp;
}

// ===== 场景常量 =====

const CX = 960; // 屏幕中心 X
const CY = 540; // 屏幕中心 Y

// ===== AniPreview =====

export class AniPreview {
    private static _root: Laya.Sprite | null = null;

    static init(): void {
        (window as any).DevPreview.AniPreview = AniPreview;
    }

    private static _ensureRoot(): Laya.Sprite {
        if (!this._root) {
            this._root = new Laya.Sprite();
            this._root.name = 'AniPreviewRoot';
            Laya.stage.addChild(this._root);
            this._root.zOrder = 99998;
        }
        return this._root;
    }

    static hide(): void {
        if (this._root) {
            this._root.destroy(true);
            this._root = null;
        }
    }

    // ===== 1. 摸牌—飞到其他玩家 =====

    /** 摸牌：场外→中央（小→大）→ 飞到目标玩家框内（大→手牌大小）→ 渐隐消失 */
    static async testDrawToOther(): Promise<void> {
        const root = this._ensureRoot();
        root.removeChildren();

        // 模拟场景：玩家框
        const seat = makeSeat(1300, 250, 200, 200, '对手座位');
        root.addChild(seat);

        const card = makeCard(-CARD_W, CY, '#e74c3c', '杀');
        card.scaleX = 0.4;
        card.scaleY = 0.4;
        root.addChild(card);

        // ① 飞到中央 → 从小变大
        await tweenTo(
            card,
            {
                x: CX,
                y: CY,
                scaleX: 1.5,
                scaleY: 1.5,
            },
            450,
            Laya.Ease.quadInOut,
        );

        await sleep(500);

        // ② 飞到目标座位 → 缩为手牌大小 → 渐隐
        await Promise.all([
            tweenTo(
                card,
                {
                    x: 1400,
                    y: 350,
                    scaleX: HAND_SCALE,
                    scaleY: HAND_SCALE,
                },
                500,
                Laya.Ease.quadInOut,
            ),
            tweenTo(card, { alpha: 0 }, 400),
        ]);

        card.destroy();
        console.log('[Ani] drawToOther done');
    }

    // ===== 2. 摸牌—飞到自己手牌区 =====

    /** 摸牌：场外→中央（小→大）→ 飞到自己手牌区并保留 */
    static async testDrawToSelf(): Promise<void> {
        const root = this._ensureRoot();
        root.removeChildren();

        // 模拟：自己手牌区（底部）
        const selfHand = makeSeat(300, 850, 1300, 180, '自己手牌区');
        root.addChild(selfHand);

        const card = makeCard(-CARD_W, CY, '#2ecc71', '桃');
        card.scaleX = 0.4;
        card.scaleY = 0.4;
        root.addChild(card);

        // ① 飞到中央 → 从小变大
        await tweenTo(
            card,
            {
                x: CX,
                y: CY,
                scaleX: 1.5,
                scaleY: 1.5,
            },
            450,
            Laya.Ease.quadInOut,
        );

        await sleep(500);

        // ② 飞到目标位置 → 缩为手牌大小（保留）
        await tweenTo(
            card,
            {
                x: 500,
                y: 920,
                scaleX: HAND_SCALE,
                scaleY: HAND_SCALE,
            },
            500,
            Laya.Ease.quadInOut,
        );

        console.log('[Ani] drawToSelf done (card retained)');
    }

    // ===== 3. 弃牌堆 =====

    /** 弃牌：卡牌从屏幕中央→飞出屏幕外（大→小） */
    static async testDiscard(): Promise<void> {
        const root = this._ensureRoot();
        root.removeChildren();

        const card = makeCard(CX, CY, '#95a5a6', '过河拆桥');
        card.scaleX = 1.5;
        card.scaleY = 1.5;
        root.addChild(card);

        await tweenTo(
            card,
            {
                x: 2100,
                y: CY,
                scaleX: 0.2,
                scaleY: 0.2,
                alpha: 0,
            },
            500,
            Laya.Ease.quadIn,
        );

        card.destroy();
        console.log('[Ani] discard done');
    }

    // ===== 4. 判定 =====

    /** 判定：场外→中央（大→正常大小）→ 翻牌（背→正） */
    static async testJudge(): Promise<void> {
        const root = this._ensureRoot();
        root.removeChildren();

        // 背面（暗色）
        const card = makeCard(CX, -CARD_H, '#2c3e50', '?');
        card.scaleX = 1.8;
        card.scaleY = 1.8;
        root.addChild(card);

        // ① 飞到中央 → 缩为正常大小
        await tweenTo(
            card,
            {
                x: CX,
                y: CY,
                scaleX: 1,
                scaleY: 1,
            },
            400,
            Laya.Ease.quadOut,
        );

        await sleep(300);

        // ② 翻牌：scaleX → 0
        await tweenTo(card, { scaleX: 0 }, 180, Laya.Ease.quadIn);

        // ③ 切换牌面
        card.removeChildren();
        drawCardFace(card, '#f39c12', '闪');

        // ④ 展开
        await tweenTo(card, { scaleX: 1 }, 180, Laya.Ease.quadOut);

        await sleep(800);
        card.destroy();
        console.log('[Ani] judge done');
    }

    // ===== 5. 玩家受伤 =====

    /** 受伤：玩家框红色闪烁（非震动） */
    static async testDamage(): Promise<void> {
        const root = this._ensureRoot();
        root.removeChildren();

        // 模拟玩家框
        const seat = makeSeat(860, 300, 200, 200, '玩家座位');
        root.addChild(seat);

        // 红色闪烁层
        const flash = new Laya.Sprite();
        flash.x = 860;
        flash.y = 300;
        flash.alpha = 0;
        flash.graphics.drawRect(0, 0, 200, 200, '#ff0000');
        root.addChild(flash);

        // 闪烁三次
        for (let i = 0; i < 3; i++) {
            await tweenTo(flash, { alpha: 0.55 }, 120);
            await tweenTo(flash, { alpha: 0 }, 120);
        }

        flash.destroy();
        console.log('[Ani] damage done');
    }

    // ===== 6. 拖拽手牌 =====

    /** 拖拽：手牌变大 + 跟随轨迹 3D 倾斜 */
    static testDragStart(): Laya.Sprite {
        const root = this._ensureRoot();
        root.removeChildren();

        root.addChild(
            makeSeat(300, 850, 1300, 180, '手牌区 — 拖拽卡牌体验 3D 倾斜效果'),
        );

        const card = makeCard(500, 920, '#f1c40f', '闪');
        card.scaleX = HAND_SCALE;
        card.scaleY = HAND_SCALE;
        root.addChild(card);

        let dragging = false;
        let prevX = card.x;
        let prevY = card.y;
        let offsetX = 0;
        let offsetY = 0;

        // 鼠标按下
        root.on(Laya.Event.MOUSE_DOWN, card, (e: Laya.Event) => {
            const local = card.globalToLocal(
                new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY),
            );
            if (
                local.x >= 0 &&
                local.x <= CARD_W &&
                local.y >= 0 &&
                local.y <= CARD_H
            ) {
                dragging = true;
                offsetX = card.x - Laya.stage.mouseX;
                offsetY = card.y - Laya.stage.mouseY;
                prevX = card.x;
                prevY = card.y;
            }
        });

        // 鼠标移动
        Laya.stage.on(Laya.Event.MOUSE_MOVE, card, () => {
            if (!dragging || card.destroyed) return;
            card.x = Laya.stage.mouseX + offsetX;
            card.y = Laya.stage.mouseY + offsetY;
        });

        // 鼠标松开
        Laya.stage.on(Laya.Event.MOUSE_UP, card, () => {
            dragging = false;
        });

        // 每帧平滑动画
        Laya.timer.frameLoop(1, card, () => {
            if (card.destroyed) return;
            if (dragging) {
                card.scaleX += (1.2 - card.scaleX) * 0.25;
                card.scaleY += (1.2 - card.scaleY) * 0.25;
                const dx = card.x - prevX;
                const dy = card.y - prevY;
                card.skewX += (dy * 0.04 - card.skewX) * 0.3;
                card.skewY += (-dx * 0.04 - card.skewY) * 0.3;
            } else {
                card.scaleX += (HAND_SCALE - card.scaleX) * 0.2;
                card.scaleY += (HAND_SCALE - card.scaleY) * 0.2;
                card.skewX *= 0.85;
                card.skewY *= 0.85;
            }
            prevX = card.x;
            prevY = card.y;
        });

        console.log('[Ani] drag enabled — 拖拽手牌查看 3D 倾斜效果');
        return card;
    }

    // ===== 连续演示 =====

    static async testAll(): Promise<void> {
        console.log('[Ani] === 摸牌→对手 ===');
        await this.testDrawToOther();
        await sleep(300);

        console.log('[Ani] === 摸牌→自己 ===');
        await this.testDrawToSelf();
        await sleep(800);

        console.log('[Ani] === 弃牌 ===');
        await this.testDiscard();
        await sleep(300);

        console.log('[Ani] === 判定 ===');
        await this.testJudge();
        await sleep(300);

        console.log('[Ani] === 受伤 ===');
        await this.testDamage();

        console.log('[Ani] === 拖拽 (手动) ===');
        this.testDragStart();
        console.log('[Ani] 演示完成。点击 ✕ 关闭');
    }
}
