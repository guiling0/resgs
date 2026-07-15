import { SceneManager } from "./SceneManager";
import { ResManager } from "./ResManager";

const RES = {
    BG_FRAME: "resources/background/frameBg.jpg",
    BG_HALL: "resources/background/hallBg.png",
    BG_GAME: "resources/background/gameBg.jpg",
    BTN_CONFIRM_NORMAL: "resources/buttons/confirm_normal.png",
    BTN_CANCEL_NORMAL: "resources/buttons/cancle_normal.png",
    BTN_END_NORMAL: "resources/buttons/end_normal.png",
    CARD_PREFAB: "resources/prefabs/Card.lh",
    CARD_SHA: "resources/card/sha.png",
    CARD_NONE: "resources/card/none.png",
    CARD_SUIT_SPADE: "resources/card/suit/spade.png",
    CARD_SUIT_HEART: "resources/card/suit/heart.png",
    MUSIC_LIUBEI: "resources/music/liubei.mp3",
    MUSIC_WEI: "resources/music/wei.mp3",
    DAOJU_EGG_ATLAS: "resources/daoju/egg.atlas",
    TABLE_START_BG: "resources/table/start_bg.png",
    TABLE_READY_NORMAL: "resources/table/ready_btn_normal.png",
    TABLE_GAME_START_NORMAL: "resources/table/game_start_btn_normal.png",
    LOBBY_ROOM_BG: "resources/lobby/hall_roomlist_bg.png",
    WINDOW_BG: "resources/window/windowbg.png",
    GENERAL_BORDER: "resources/general/general_border.png",
    GENERAL_BACK: "resources/general/general-back.png",
    FONT_SIMHEI: "resources/font/SIMHEI.ttf",
} as const;

const { regClass } = Laya;

@regClass()
export class GameEntry extends Laya.Script {

    private _suitImg: Laya.Image;
    private _faceImg: Laya.Image;

    async onStart() {
        Laya.stage.bgColor = "transparent";
        this._setupBodyBg();

        SceneManager.init(this.owner as Laya.Sprite);
        this._registerScenes();

        await this._preloadCriticalAssets();

        await SceneManager.enter("lobby");

        await this._demoResManagerSkinUsage();
    }

    private _setupBodyBg(): void {
        const body = document.body;
        body.style.margin = "0";
        body.style.padding = "0";
        body.style.backgroundImage = `url("${RES.BG_FRAME}")`;
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        body.style.backgroundRepeat = "no-repeat";
    }

    private _registerScenes(): void {
        SceneManager.registerAll({
            lobby: {
                prefabUrl: "resources/prefabs/Card.lh",
                onEnter: async (scene) => {
                    console.log("[GameEntry] lobby entered");
                },
                onExit: async (scene) => {
                    console.log("[GameEntry] lobby exited");
                    ResManager.releaseBatch([
                        RES.BG_HALL,
                        RES.LOBBY_ROOM_BG,
                    ]);
                },
            },
            game: {
                prefabUrl: "resources/prefabs/Card.lh",
                onEnter: async (scene) => {
                    console.log("[GameEntry] game entered");
                    await ResManager.load(RES.BG_GAME);
                },
                onExit: async (scene) => {
                    console.log("[GameEntry] game exited");
                    ResManager.release(RES.BG_GAME);
                },
            },
        });
    }

    private async _preloadCriticalAssets(): Promise<void> {
        await ResManager.loadBatch([
            RES.BG_HALL,
            RES.LOBBY_ROOM_BG,
            RES.TABLE_START_BG,
        ]);

        const prefab = await ResManager.load<Laya.Prefab>(RES.CARD_PREFAB);
        console.log("[GameEntry] Card prefab loaded:", !!prefab);

        const cardNode = await ResManager.loadAndCreate(RES.CARD_PREFAB);
        cardNode.pos(100, 100);
        (this.owner as Laya.Sprite).addChild(cardNode);

        await SceneManager.preload(["lobby", "game"]);
    }

    /**
     * 演示 ResManager.bindSkin / clearSkin 与直接赋值 image.skin 的区别
     */
    private async _demoResManagerSkinUsage(): Promise<void> {
        const owner = this.owner as Laya.Sprite;

        this._suitImg = new Laya.Image();
        this._suitImg.pos(100, 400);
        this._suitImg.size(60, 60);
        owner.addChild(this._suitImg);

        this._faceImg = new Laya.Image();
        this._faceImg.pos(200, 400);
        this._faceImg.size(80, 120);
        owner.addChild(this._faceImg);

        // ============================================================
        // 方式一：直接赋值 image.skin（不经过 ResManager）
        // ============================================================
        // LayaAir 内部会自动加载并缓存纹理，但 ResManager 完全不知情
        // 引用计数为 0，无法通过 ResManager 追踪或释放
        this._suitImg.skin = RES.CARD_SUIT_SPADE;
        console.log("[Demo] 直接赋值 image.skin =", RES.CARD_SUIT_SPADE);
        console.log("[Demo] ResManager.isLoaded =", ResManager.isLoaded(RES.CARD_SUIT_SPADE), " ← false，ResManager 不知道这个资源被加载了");
        console.log("[Demo] ResManager.getRefs =", ResManager.getRefs(RES.CARD_SUIT_SPADE), " ← 0，没有引用计数");
        // 此时即使写 this._suitImg.skin = null，ResManager 也不会释放任何东西
        // 因为它从未记录过这个资源

        // ============================================================
        // 方式二：通过 ResManager.bindSkin 赋值（推荐）
        // ============================================================
        // bindSkin 会先通过 ResManager.load 加载（引用计数+1），再赋给 skin
        await ResManager.bindSkin(this._faceImg, RES.CARD_SHA);
        console.log("[Demo] ResManager.bindSkin =", RES.CARD_SHA);
        console.log("[Demo] ResManager.isLoaded =", ResManager.isLoaded(RES.CARD_SHA), " ← true，ResManager 追踪到了");
        console.log("[Demo] ResManager.getRefs =", ResManager.getRefs(RES.CARD_SHA), " ← 1，引用计数正确");

        // 同一张图再绑定一次，引用计数+1
        const anotherImg = new Laya.Image();
        anotherImg.pos(300, 400);
        anotherImg.size(80, 120);
        owner.addChild(anotherImg);
        await ResManager.bindSkin(anotherImg, RES.CARD_SHA);
        console.log("[Demo] 同一资源再次 bindSkin，ResManager.getRefs =", ResManager.getRefs(RES.CARD_SHA), " ← 2，引用计数递增");

        // ============================================================
        // 清除 skin：clearSkin vs 直接赋 null
        // ============================================================

        // 直接赋 null —— 不会触发 ResManager 释放
        anotherImg.skin = null;
        console.log("[Demo] 直接 anotherImg.skin = null，ResManager.getRefs =", ResManager.getRefs(RES.CARD_SHA), " ← 仍然是 2，引用计数未减少！");

        // 用 clearSkin —— 正确释放引用
        ResManager.clearSkin(anotherImg);
        console.log("[Demo] ResManager.clearSkin(anotherImg)，ResManager.getRefs =", ResManager.getRefs(RES.CARD_SHA), " ← 1，引用计数正确减少");

        // ============================================================
        // 当所有引用都释放后，资源从缓存中移除
        // ============================================================
        ResManager.clearSkin(this._faceImg);
        console.log("[Demo] ResManager.clearSkin(faceImg)，ResManager.getRefs =", ResManager.getRefs(RES.CARD_SHA), " ← 0，资源已从缓存移除");
        console.log("[Demo] ResManager.isLoaded =", ResManager.isLoaded(RES.CARD_SHA), " ← false，缓存已清空");

        // ============================================================
        // 总结：
        // - image.skin = url    → ResManager 不感知，无法追踪/释放
        // - ResManager.bindSkin → 加载+赋值，引用计数+1
        // - image.skin = null   → ResManager 不感知，引用计数不变
        // - ResManager.clearSkin→ 清除skin+引用计数-1，归零则释放缓存
        // ============================================================
    }
}
