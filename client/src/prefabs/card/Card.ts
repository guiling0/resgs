import { CardBase } from './Card.generated';
import { ObjectPool } from '../../utils/ObjectPool';
import { ResManager } from '../../ResManager';
import { SettingsStore } from '../../data/SettingsStore';

const { regClass } = Laya;

// // ===== 枚举 → 字符串映射 =====

// const SUIT_STRING: Record<number, string> = {
//     [CardSuit.Spade]: 'spade',
//     [CardSuit.Heart]: 'heart',
//     [CardSuit.Club]: 'club',
//     [CardSuit.Diamond]: 'diamond',
// };

// const COLOR_STRING: Record<number, 'black' | 'red'> = {
//     [CardColor.Red]: 'red',
//     [CardColor.Black]: 'black',
// };

// /** 无点数的牌号 */
// const NO_NUMBER: ReadonlySet<CardNumber> = new Set([
//     CardNumber.None,
//     CardNumber.JOKER_BLACK,
//     CardNumber.JOKER_RED,
// ]);

// ===== 视图数据最小接口 =====

// export interface CardViewData {
//     name: string;
//     suit: CardSuit;
//     color?: CardColor;
//     number: CardNumber;
// }

// ===== 对象池 =====

// const CARD_POOL = new ObjectPool<Card>(
//     'Card',
//     () => new Card(),
//     (c) => c.reset(),
// );

// ===== Card =====

@regClass()
export class Card extends CardBase {
    // // ===== 数据 =====
    // private _data: CardViewData | null = null;
    // private _put = false;
    // private _marksData: Array<{ key: string; value: unknown }> = [];
    // // ===== 静态工厂 =====
    // static create(data?: CardViewData): Card {
    //     const card = CARD_POOL.acquire();
    //     if (data) {
    //         card.updateView(data);
    //     }
    //     return card;
    // }
    // static recover(card: Card): void {
    //     CARD_POOL.release(card);
    // }
    // static preload(count: number): void {
    //     CARD_POOL.preload(count);
    // }
    // // ===== 对象池 =====
    // /** 回收入池前重置所有状态 */
    // reset(): void {
    //     this._data = null;
    //     this._put = false;
    //     this._marksData = [];
    //     // 清空皮肤
    //     ResManager.clearSkin(this.img);
    //     ResManager.clearSkin(this.suit);
    //     ResManager.clearSkin(this.num);
    //     ResManager.clearSkin(this.color);
    //     ResManager.clearSkin(this.back);
    //     // 隐藏动态节点（数据驱动元素默认隐藏，updateView 再打开）
    //     this.cardName.visible = false;
    //     this.viewas.visible = false;
    //     this.isSelected.visible = false;
    //     this.label.visible = false;
    //     this.suit.visible = false;
    //     this.num.visible = false;
    //     this.color.visible = false;
    //     this.marks.numItems = 0;
    //     this.visible = true;
    // }
    // // ===== 视图更新 =====
    // /**
    //  * 根据牌数据更新显示。
    //  * 接受 GameCardData / GameCard / VirtualCard / VirtualCardData。
    //  */
    // updateView(data: CardViewData): void {
    //     this._data = data;
    //     // ===== 1. 牌面插图 =====
    //     this._bindFace(data.name);
    //     // ===== 2. 花色 =====
    //     this._bindSuit(data.suit, this.suit);
    //     // ===== 3. 颜色条 =====
    //     this._bindColor(data.suit, data.color);
    //     // ===== 4. 点数 =====
    //     this._bindNumber(data.color, data.suit, data.number, this.num);
    //     // ===== 5. 卡牌名 =====
    //     this.cardName.text = sgs.getTranslation(data.name);
    //     // 默认隐藏，当手牌过多时由 SeatComp 控制显示
    //     this.cardName.visible = false;
    //     // ===== 6. 牌背 =====
    //     this._bindBack();
    // }
    // // ===== 状态 =====
    // /** 扣置/翻开 */
    // set put(value: boolean) {
    //     this._put = value;
    //     this.back.visible = value;
    // }
    // get put(): boolean {
    //     return this._put;
    // }
    // /** 选中高亮 */
    // set selected(value: boolean) {
    //     this.isSelected.visible = value;
    // }
    // get selected(): boolean {
    //     return this.isSelected.visible;
    // }
    // /** 设置提示文本 */
    // setLabel(text: string): void {
    //     this.label.text = text;
    //     this.label.visible = !!text;
    // }
    // get cardData(): Readonly<CardViewData> | null {
    //     return this._data;
    // }
    // // ===== 视为牌 (viewas) =====
    // /**
    //  * 设置"被视为"牌数据。
    //  * 传入 null/undefined 隐藏。
    //  */
    // setViewAs(data: CardViewData | null): void {
    //     if (!data) {
    //         this.viewas.visible = false;
    //         return;
    //     }
    //     this.viewas.visible = true;
    //     this.viewas_name.text = sgs.getTranslation(data.name);
    //     this._bindSuit(data.suit, this.viewas_suit);
    //     this._bindNumber(
    //         data.color ?? getColorBySuit(data.suit),
    //         data.suit,
    //         data.number,
    //         this.viewas_number,
    //     );
    // }
    // // ===== 标记列表 =====
    // /**
    //  * 设置标记数据。
    //  * TODO: 后续实现完整标记渲染（图标 + 文本）
    //  */
    // setMarks(marks: Array<{ key: string; value: unknown }>): void {
    //     if (!marks.length) {
    //         this._marksData = [];
    //         this.marks.numItems = 0;
    //         this.marks.visible = false;
    //         return;
    //     }
    //     this._marksData = marks;
    //     this.marks.visible = true;
    //     this.marks.itemRenderer = (index: number, item: Laya.GWidget) => {
    //         const markText = item.getChildByName('markText') as Laya.GTextField;
    //         if (markText) {
    //             markText.text = String(
    //                 this._marksData[index]?.key ?? `mark_${index}`,
    //             );
    //         }
    //     };
    //     this.marks.numItems = marks.length;
    // }
    // // ===== 内部绑定方法 =====
    // /** 绑定牌面插图 */
    // private _bindFace(name: string): void {
    //     const cd = sgs.carddatas.get(name);
    //     const image = cd?.image ?? name;
    //     ResManager.bindSkin(this.img, CARD_FACE_IMAGE(image));
    // }
    // /** 绑定花色到指定 GImage */
    // private _bindSuit(suit: CardSuit, img: Laya.GImage): void {
    //     const suitStr = SUIT_STRING[suit];
    //     if (suitStr) {
    //         img.visible = true;
    //         ResManager.bindSkin(img, CARD_SUIT_IMAGE(suitStr));
    //     } else {
    //         img.visible = false;
    //     }
    // }
    // /** 绑定颜色条 */
    // private _bindColor(suit: CardSuit, color: CardColor | undefined): void {
    //     // 无花色时不显示颜色条（基本牌/锦囊无色牌）
    //     if (suit === CardSuit.None) {
    //         this.color.visible = false;
    //         return;
    //     }
    //     const c = color ?? getColorBySuit(suit);
    //     const colorStr = COLOR_STRING[c];
    //     if (colorStr) {
    //         this.color.visible = true;
    //         ResManager.bindSkin(this.color, CARD_COLOR_IMAGE(colorStr));
    //     } else {
    //         this.color.visible = false;
    //     }
    // }
    // /** 绑定点数到指定 GImage */
    // private _bindNumber(
    //     color: CardColor | undefined,
    //     suit: CardSuit,
    //     number: CardNumber,
    //     img: Laya.GImage,
    // ): void {
    //     if (NO_NUMBER.has(number)) {
    //         img.visible = false;
    //         return;
    //     }
    //     const c = color ?? getColorBySuit(suit);
    //     const colorStr = COLOR_STRING[c] ?? 'black';
    //     img.visible = true;
    //     ResManager.bindSkin(img, CARD_NUMBER_IMAGE(colorStr, number));
    // }
    // /** 绑定牌背 */
    // private _bindBack(): void {
    //     // TODO: 优先读取当前房间游戏模式牌背，其次喜好牌背
    //     const pref = SettingsStore.getPreference();
    //     const suffix = pref.cardBack !== 'default' ? `-${pref.cardBack}` : '';
    //     ResManager.bindSkin(this.back, CARD_BACK_IMAGE(suffix));
    //     // 初始状态: 正面（非扣置）
    //     this.back.visible = false;
    // }
    // // ===== 生命周期 =====
    // onDestroy(): void {
    //     this.reset();
    // }
}

// ===== 后续功能标注 =====
// TODO 1: 选牌突出 — 点击手牌 y-20，在 ChooseHandler 中控制
// TODO 2: 拖动交互 — 选牌/打出/弃置/重排，由 DragController 实现
// TODO 3: 手牌排列 — 总宽度限制 + 悬停撑开，由 HandAreaComp 实现
// TODO 4: 悬浮信息 — 延时弹窗展示牌详情，由 CardTooltip 实现
// TODO 5: 选中UI — 非手牌区选牌时显示 isSelected，由 ChooseHandler 控制
// TODO 6: cardName — 手牌过多时显示，由 HandAreaComp 控制
