/**
 * 本地持久化管理。
 * 基于 Laya.LocalStorage 存储账号密码与用户设置。
 */

// ===== 枚举 =====

/** UI 风格 */
export enum UIStyle {
    /** 经典（三国杀OL / 太阳神三国杀偏向），PC端，资源无后缀 */
    Classic = 'classic',
    /** 手杀（三国杀移动版偏向），移动端，资源后缀 .m */
    Mobile = 'mobile',
    /** 十周年，PC端，资源后缀 .t */
    Anniversary = 'anniversary',
    /** 竖版，手机竖屏，资源后缀 .v */
    Vertical = 'vertical',
}

/** UI 风格对应的资源后缀 */
export const UI_STYLE_SUFFIX: Record<UIStyle, string> = {
    [UIStyle.Classic]: '',
    [UIStyle.Mobile]: '.m',
    [UIStyle.Anniversary]: '.t',
    [UIStyle.Vertical]: '.v',
};

// ===== 类型定义 =====

export interface BackgroundSettings {
    /** 大厅背景：预设名或完整 URL */
    lobby: string;
    /** 战场背景：预设名或完整 URL */
    battlefield: string;
}

export interface VolumeSettings {
    /** 总音量（乘区，0-100） */
    master: number;
    /** 背景音量（0-100） */
    bg: number;
    /** 卡牌音量（0-100） */
    card: number;
    /** 配音音量（0-100） */
    voice: number;
    /** 特效音量（0-100） */
    effect: number;
    /** 礼物音量（0-100） */
    gift: number;
}

export interface PreferenceSettings {
    /** 游戏牌背 */
    cardBack: string;
    /** 武将卡背 */
    generalBack: string;
    /** UI 喜好 */
    uiStyle: UIStyle;
}

export interface GameSettings {
    /** 自动选择唯一目标 */
    autoSelectUniqueTarget: boolean;
    /** 启动拖拽 */
    enableDrag: boolean;
}

export interface AccountInfo {
    username: string;
    password: string;
}

// ===== 默认值 =====

const DEFAULT_BACKGROUND: BackgroundSettings = {
    lobby: 'hallBg',
    battlefield: 'gameBg',
};

const DEFAULT_VOLUME: VolumeSettings = {
    master: 100,
    bg: 100,
    card: 100,
    voice: 100,
    effect: 100,
    gift: 100,
};

const DEFAULT_PREFERENCE: PreferenceSettings = {
    cardBack: 'default',
    generalBack: 'default',
    uiStyle: UIStyle.Classic,
};

const DEFAULT_GAME: GameSettings = {
    autoSelectUniqueTarget: false,
    enableDrag: false,
};

// ===== 存储键 =====

const KEY_ACCOUNT = 'sgs_account';
const KEY_BACKGROUND = 'sgs_bg';
const KEY_VOLUME = 'sgs_volume';
const KEY_PREFERENCE = 'sgs_pref';
const KEY_GAME = 'sgs_game';

// ===== SettingsStore =====

export class SettingsStore {
    // ===== 账号 =====

    static getAccount(): AccountInfo | null {
        return Laya.LocalStorage.getJSON(KEY_ACCOUNT);
    }

    static saveAccount(info: AccountInfo): void {
        Laya.LocalStorage.setJSON(KEY_ACCOUNT, info);
    }

    static clearAccount(): void {
        Laya.LocalStorage.setJSON(KEY_ACCOUNT, null);
    }

    // ===== 背景 =====

    static getBackground(): BackgroundSettings {
        return { ...DEFAULT_BACKGROUND, ...Laya.LocalStorage.getJSON(KEY_BACKGROUND) };
    }

    static saveBackground(value: BackgroundSettings): void {
        Laya.LocalStorage.setJSON(KEY_BACKGROUND, value);
    }

    // ===== 音量 =====

    static getVolume(): VolumeSettings {
        return { ...DEFAULT_VOLUME, ...Laya.LocalStorage.getJSON(KEY_VOLUME) };
    }

    static saveVolume(value: VolumeSettings): void {
        Laya.LocalStorage.setJSON(KEY_VOLUME, value);
    }

    // ===== 喜好 =====

    static getPreference(): PreferenceSettings {
        return { ...DEFAULT_PREFERENCE, ...Laya.LocalStorage.getJSON(KEY_PREFERENCE) };
    }

    static savePreference(value: PreferenceSettings): void {
        Laya.LocalStorage.setJSON(KEY_PREFERENCE, value);
    }

    // ===== 游戏设置 =====

    static getGame(): GameSettings {
        return { ...DEFAULT_GAME, ...Laya.LocalStorage.getJSON(KEY_GAME) };
    }

    static saveGame(value: GameSettings): void {
        Laya.LocalStorage.setJSON(KEY_GAME, value);
    }
}
