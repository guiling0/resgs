import { GeneralUIBase } from './GeneralUI.generated';
import { ObjectPool } from '../../utils/ObjectPool';
import { ResManager } from '../../ResManager';
import { SettingsStore } from '../../data/SettingsStore';
import {
    KINGDOM_IMAGE,
    GENERAL_BORDER_IMAGE,
    GENERAL_HP_IMAGE,
    GENERAL_HP_HOLLOW,
    GENERAL_BACK_IMAGE,
    ZHULIAN_ICON,
    ZHULIAN_ZI,
} from '../../data/urlmap';

const { regClass } = Laya;

// ===== 体力槽数据 =====

interface HpSlot {
    type: 'full' | 'half' | 'empty';
    kingdom: string;
    isWars: boolean;
}

// ===== 视图数据接口 =====

export interface GeneralViewData {
    name: string;
    kingdom: string;
    kingdom2: string;
    hp: number;
    hpmax: number;
    shield: number;
    lord: boolean;
    isWars: boolean;
    /** 翻译用 trueName，默认取 name */
    trueName?: string;
}

// ===== 对象池 =====

const GENERAL_POOL = new ObjectPool<GeneralUI>(
    'GeneralUI',
    () => new GeneralUI(),
    (g) => g.reset(),
);

// ===== GeneralUI =====

@regClass()
export class GeneralUI extends GeneralUIBase {
    // ===== 数据 =====

    private _data: GeneralViewData | null = null;
    private _put = false;
    private _marksData: Array<{ key: string; value: unknown }> = [];
    private _hpSlots: HpSlot[] = [];
    private _hasZhulian = false;
    private _zhulianSelected: 'none' | 'self' | 'related' = 'none';

    // ===== 静态工厂 =====

    static create(data?: GeneralViewData): GeneralUI {
        const g = GENERAL_POOL.acquire();
        if (data) {
            g.updateView(data);
        }
        return g;
    }

    static recover(g: GeneralUI): void {
        GENERAL_POOL.release(g);
    }

    static preload(count: number): void {
        GENERAL_POOL.preload(count);
    }

    // ===== 对象池 =====

    reset(): void {
        this._data = null;
        this._put = false;
        this._marksData = [];
        this._hpSlots = [];
        this._hasZhulian = false;
        this._zhulianSelected = 'none';

        ResManager.clearSkin(this.img);
        ResManager.clearSkin(this.border);
        ResManager.clearSkin(this.kingdom);
        ResManager.clearSkin(this.kingdom2);
        ResManager.clearSkin(this.back);
        ResManager.clearSkin(this.zhulian);
        ResManager.clearSkin(this.zhulian_selected0);
        ResManager.clearSkin(this.zhulian_selected1);
        ResManager.clearSkin(this.pkg_icon);

        this.general_name.text = '';
        this.pkgname.text = '';
        this.pkgname.visible = false;
        this.shield.visible = false;
        this.shield_label.text = '';
        this.hp_label.visible = false;
        this.hps.numItems = 0;
        this.zhulian.visible = false;
        this.zhulian_zi.visible = false;
        this.zhulian_selected0.visible = false;
        this.zhulian_selected1.visible = false;
        this.kingdom.visible = true;
        this.kingdom2.visible = false;
        this.back.visible = false;
        this.isSelected.visible = false;
        this.label.visible = false;

        this.visible = true;
    }

    // ===== 视图更新 =====

    updateView(data: GeneralViewData): void {
        this._data = data;

        // ===== 1. 插画 =====
        // TODO: 武将资源映射系统重构后实现
        // ResManager.bindSkin(this.img, ...);

        // ===== 2. 版本 =====
        // TODO: 武将资源映射系统重构后实现
        this.pkgname.visible = false;

        // ===== 3. 边框 =====
        this._bindBorder(data.lord);

        // ===== 4. 势力 =====
        this._bindKingdom(data.kingdom, data.kingdom2, data.lord);

        // ===== 5. 武将名 =====
        const tname = data.trueName ?? data.name;
        // this.general_name.text = sgs.getTranslation(tname);

        // ===== 6. 护甲 =====
        this._bindShield(data.shield);

        // ===== 7. 体力 =====
        this._bindHp(
            data.hp,
            data.hpmax,
            data.kingdom,
            data.isWars,
            data.shield,
        );

        // ===== 8. 扩展包图标 =====
        // TODO: 武将资源映射系统重构后实现
        this.pkg_icon.visible = false;

        // ===== 9. 珠联璧合 =====
        this._bindZhulian();

        // ===== 10. 牌背 =====
        this._bindBack();
    }

    // ===== 状态 =====

    set put(value: boolean) {
        this._put = value;
        this.back.visible = value;
    }

    get put(): boolean {
        return this._put;
    }

    set selected(value: boolean) {
        this.isSelected.visible = value;
    }

    get selected(): boolean {
        return this.isSelected.visible;
    }

    setLabel(text: string): void {
        this.label.text = text;
        this.label.visible = !!text;
    }

    get generalData(): Readonly<GeneralViewData> | null {
        return this._data;
    }

    // ===== 珠联璧合 =====

    /** 设置珠联璧合状态 */
    setZhulian(
        hasRelation: boolean,
        selected: 'none' | 'self' | 'related' = 'none',
    ): void {
        this._hasZhulian = hasRelation;
        this._zhulianSelected = selected;
        this._bindZhulian();
    }

    // ===== 标记列表 =====

    setMarks(marks: Array<{ key: string; value: unknown }>): void {
        if (!marks.length) {
            this._marksData = [];
            this.marks.numItems = 0;
            this.marks.visible = false;
            return;
        }
        this._marksData = marks;
        this.marks.visible = true;
        this.marks.itemRenderer = (index: number, item: Laya.GWidget) => {
            const markText = item.getChildByName('markText') as Laya.GTextField;
            if (markText) {
                markText.text = String(
                    this._marksData[index]?.key ?? `mark_${index}`,
                );
            }
        };
        this.marks.numItems = marks.length;
    }

    // ===== 内部绑定 =====

    private _bindBorder(lord: boolean): void {
        ResManager.bindSkin(this.border, GENERAL_BORDER_IMAGE(lord));
    }

    private _bindKingdom(
        kingdom: string,
        kingdom2: string,
        lord: boolean,
    ): void {
        this.kingdom.visible = true;
        ResManager.bindSkin(this.kingdom, KINGDOM_IMAGE(kingdom, lord));

        if (kingdom2 && kingdom2 !== kingdom) {
            this.kingdom2.visible = true;
            ResManager.bindSkin(this.kingdom2, KINGDOM_IMAGE(kingdom2, false));
        } else {
            this.kingdom2.visible = false;
        }
    }

    private _bindShield(shield: number): void {
        if (shield <= 0) {
            this.shield.visible = false;
            return;
        }
        this.shield.visible = true;
        this.shield_label.text = String(shield);
    }

    // ===== 体力渲染 =====

    private _bindHp(
        hp: number,
        hpmax: number,
        kingdom: string,
        isWars: boolean,
        shield: number,
    ): void {
        const maxSlots = isWars || shield > 0 ? 3 : 4;

        // 紧凑模式：体力槽数量超限 → 只显示 1 个槽 + 文本
        if (hpmax > maxSlots) {
            const compactSlot: HpSlot = { type: 'full', kingdom, isWars };
            this._hpSlots = [compactSlot];
            this.hps.visible = true;
            this.hps.itemRenderer = (_index: number, item: Laya.GWidget) => {
                ResManager.bindSkin(
                    item as Laya.GImage,
                    hpSlotUrl(compactSlot),
                );
            };
            this.hps.numItems = 1;
            this.hp_label.text = `${hp}/${hpmax}`;
            this.hp_label.visible = true;
            return;
        }

        this.hp_label.visible = false;

        // 构建体力槽
        const slots: HpSlot[] = [];
        const fullCount = Math.floor(hp);
        const hasHalf = hp % 1 !== 0;

        for (let i = 0; i < hpmax; i++) {
            if (i < fullCount) {
                slots.push({ type: 'full', kingdom, isWars });
            } else if (hasHalf && i === fullCount) {
                slots.push({ type: 'half', kingdom, isWars });
            } else {
                slots.push({ type: 'empty', kingdom, isWars });
            }
        }

        this._hpSlots = slots;
        this.hps.visible = true;
        this.hps.itemRenderer = (index: number, item: Laya.GWidget) => {
            const img = item as Laya.GImage;
            const slot = this._hpSlots[index];
            if (!slot) return;
            const url = hpSlotUrl(slot);
            ResManager.bindSkin(img, url);
        };
        this.hps.numItems = slots.length;
    }

    // ===== 珠联璧合绑定 =====

    private _bindZhulian(): void {
        if (!this._data) return;

        // 全部隐藏
        this.zhulian.visible = false;
        this.zhulian_zi.visible = false;
        this.zhulian_selected0.visible = false;
        this.zhulian_selected1.visible = false;

        if (!this._hasZhulian) return;

        const k = this._data.kingdom;

        if (this._zhulianSelected === 'self') {
            // 自己悬停/选中 → selected0
            this.zhulian.visible = false;
            this.zhulian_selected0.visible = true;
            ResManager.bindSkin(this.zhulian_selected0, ZHULIAN_ICON(k));
        } else if (this._zhulianSelected === 'related') {
            // 关联武将悬停 → selected1
            this.zhulian_selected1.visible = true;
            ResManager.bindSkin(this.zhulian_selected1, ZHULIAN_ICON(k));
        } else {
            // 只显示珠联璧合标记（无选中状态）
            this.zhulian.visible = true;
            this.zhulian_zi.visible = true;
            ResManager.bindSkin(this.zhulian, ZHULIAN_ICON(k));
            ResManager.bindSkin(this.zhulian_zi, ZHULIAN_ZI(k));
        }
    }

    private _bindBack(): void {
        const pref = SettingsStore.getPreference();
        const suffix =
            pref.generalBack !== 'default' ? `-${pref.generalBack}` : '';
        ResManager.bindSkin(this.back, GENERAL_BACK_IMAGE(suffix));
        this.back.visible = false;
    }

    // ===== 生命周期 =====

    onDestroy(): void {
        this.reset();
    }
}

// ===== 体力素材 URL =====

function hpSlotUrl(slot: HpSlot): string {
    if (slot.type === 'empty') {
        return GENERAL_HP_HOLLOW;
    }
    if (slot.type === 'half') {
        return GENERAL_HP_IMAGE(slot.kingdom, 2);
    }
    return GENERAL_HP_IMAGE(slot.kingdom, slot.isWars ? 1 : 0);
}

// ===== 后续功能标注 =====
// TODO 1: 选将时手牌收缩 → 将所有手牌 Tween 到边缘 x+1 重叠，选完恢复
// TODO 2: 手牌排列 + 悬停撑开 → 总宽度限制，hover 立即展开显示 140px 完整卡牌
// TODO 3: 悬浮信息 → 延时弹窗展示武将详情（技能/血量等）
// TODO 4: 选中UI → 非手牌区选将时显示 isSelected
// TODO 5: 选将时珠联璧合 → 筛选备选将，有珠联关系的显示 zhulian/selected0/selected1
// TODO 6: 武将资源映射重构 → img/pkgnick/pkg_icon 统一走新资源系统
