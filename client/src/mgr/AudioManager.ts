import { SettingsStore, VolumeSettings } from '../data/SettingsStore';

/** 音量分类（不含 master） */
type VolumeCategory = keyof Omit<VolumeSettings, 'master'>;

/** 默认音量（init 前兜底） */
const DEFAULT_VOLUME: VolumeSettings = {
    master: 100,
    bg: 100,
    card: 100,
    voice: 100,
    effect: 100,
    gift: 100,
};

/**
 * 音频管理器。
 * 所有音频统一走 `playSound`（不使用 `playMusic`，避免 iOS 系统播放器显示）。
 * 每类音频有独立音量，最终音量 = 分类音量% × 总音量%。
 */
export class AudioManager {
    private static _volume: VolumeSettings = DEFAULT_VOLUME;

    // ===== 初始化 =====

    /** 从 SettingsStore 加载音量配置 */
    static init(): void {
        this._volume = SettingsStore.getVolume();
    }

    /** 重新加载音量配置（设置面板修改后调用） */
    static refreshVolume(): void {
        this._volume = SettingsStore.getVolume();
    }

    // ===== 播放 =====

    /** 播放背景音效（场景氛围音等） */
    static playBG(url: string, loops: number = 1, complete?: () => void): Laya.SoundChannel {
        return this._playCategory('bg', url, loops, complete);
    }

    /** 播放卡牌音效 */
    static playCard(url: string, complete?: () => void): Laya.SoundChannel {
        return this._playCategory('card', url, 1, complete);
    }

    /** 播放配音（武将语音等） */
    static playVoice(url: string, complete?: () => void): Laya.SoundChannel {
        return this._playCategory('voice', url, 1, complete);
    }

    /** 播放特效音效 */
    static playEffect(url: string, complete?: () => void): Laya.SoundChannel {
        return this._playCategory('effect', url, 1, complete);
    }

    /** 播放礼物音效 */
    static playGift(url: string, complete?: () => void): Laya.SoundChannel {
        return this._playCategory('gift', url, 1, complete);
    }

    // ===== 音量查询 =====

    static get volume(): Readonly<VolumeSettings> {
        return this._volume;
    }

    /** 获取某类音频的有效音量（0-1） */
    static effectiveVolume(category: VolumeCategory): number {
        return (this._volume[category] / 100) * (this._volume.master / 100);
    }

    // ===== 内部 =====

    /** 按分类播放并设置音量 */
    private static _playCategory(
        category: VolumeCategory,
        url: string,
        loops: number = 1,
        complete?: () => void,
    ): Laya.SoundChannel {
        const channel = Laya.SoundManager.playSound(url, loops, complete);
        if (channel) {
            channel.volume = this.effectiveVolume(category);
        }
        return channel;
    }
}
