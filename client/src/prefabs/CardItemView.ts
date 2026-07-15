const { regClass } = Laya;

const SUIT_IMG: Record<number, string> = {
    1: "resources/card/suit/spade.png",
    2: "resources/card/suit/heart.png",
    3: "resources/card/suit/club.png",
    4: "resources/card/suit/diamond.png",
};

const COLOR_IMG: Record<number, string> = {
    1: "resources/card/suit/red.png",
    2: "resources/card/suit/black.png",
};

const COLOR_HEX: Record<number, string> = {
    1: "#cc0000",
    2: "#000000",
};

function numImg(n: number, color: number): string {
    if (n <= 0 || n > 13) return "";
    return `resources/card/number/${color === 1 ? "red" : "black"}/${n}.png`;
}

export interface ICardData {
    name: string;
    suit: number;
    color: number;
    number: number;
    put?: number;
    faceImage?: string;
}

@regClass()
export class CardItemView extends Laya.Script {
    private _faceImg: Laya.Image;
    private _suitTl: Laya.Image;
    private _numTl: Laya.Image;
    private _suitBr: Laya.Image;
    private _numBr: Laya.Image;
    private _cardName: Laya.Text;
    private _colorBar: Laya.Sprite;
    private _backImg: Laya.Image;

    onAwake(): void {
        const o = this.owner as Laya.Sprite;
        this._faceImg = o.getChildByName("faceImg") as Laya.Image;
        this._suitTl = o.getChildByName("suitTl") as Laya.Image;
        this._numTl = o.getChildByName("numTl") as Laya.Image;
        this._suitBr = o.getChildByName("suitBr") as Laya.Image;
        this._numBr = o.getChildByName("numBr") as Laya.Image;
        this._cardName = o.getChildByName("cardName") as Laya.Text;
        this._colorBar = o.getChildByName("colorBar") as Laya.Sprite;
        this._backImg = o.getChildByName("backImg") as Laya.Image;
    }

    updateView(data: ICardData): void {
        const hasSuit = data.suit !== 0;

        if (hasSuit) {
            this._suitTl.skin = SUIT_IMG[data.suit] ?? "";
            this._suitBr.skin = SUIT_IMG[data.suit] ?? "";
            this._colorBar.visible = false;
        } else {
            this._suitTl.skin = COLOR_IMG[data.color] ?? "";
            this._suitBr.skin = "";
            this._colorBar.visible = true;
            const css = this._colorBar.getComponent(Laya.CSSStyle);
            if (css) css.style = `background-color: ${COLOR_HEX[data.color] ?? "#000"};`;
        }

        const ns = numImg(data.number, data.color);
        this._numTl.skin = ns;
        this._numBr.skin = ns;

        this._faceImg.skin = data.faceImage ?? `resources/card/${data.name}.png`;
        this._cardName.text = data.name ?? "";
        this._backImg.visible = data.put === 2;
    }

    reset(): void {
        this._suitTl.skin = "";
        this._numTl.skin = "";
        this._suitBr.skin = "";
        this._numBr.skin = "";
        this._cardName.text = "";
        this._colorBar.visible = false;
        this._backImg.visible = false;
        this._faceImg.skin = "resources/card/none.png";
        (this.owner as Laya.Sprite).visible = false;
    }
}
