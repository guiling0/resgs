/** 卡牌动画分支（含该分支专属配音） */
export interface CardAnimation {
    /** 分支名（约定如 fire-sha/thunder-sha） */
    name: string;
    /** 动画完整 url */
    url: string;
    /** 男声配音（完整 url，缺省走默认配音） */
    audioMale?: string;
    /** 女声配音 */
    audioFemale?: string;
}

/** 游戏牌资源（未配置字段走默认路径模板） */
export interface CardAssets {
    /** 牌图（完整 url，默认 image/cards/{name}.png） */
    image?: string;
    /** 动画多分支（配音随动画分支配置） */
    animations?: CardAnimation[];
}

/** 配音条目（武将皮肤下配置，数组顺序即语音序号） */
export interface AudioData {
    /** 语音完整 url（默认 generals/{武将真名}/{皮肤}/{技能真名}{序号}.mp3，序号=数组下标；death 键为 generals/{武将真名}/{皮肤}/death.mp3） */
    url?: string;
    /** 语音文字（写入翻译表） */
    text?: string;
}

/** 技能翻译（GeneralConfig.skills 下按技能全名配置，只写入翻译表） */
export interface SkillTranslation {
    /** 技能名 */
    lang_name?: string;
    /** 标准描述 */
    lang_desc?: string;
    /** 规则集描述 */
    lang_desc2?: string;
}

/** 武将皮肤（default 为原画） */
export interface GeneralSkin {
    /** 皮肤名 */
    name: string;
    /** 插画（默认 generals/{武将真名}/{skin}/image.png） */
    image?: string;
    /** 特殊插画-他人视角（缺省回退 image） */
    imageDual?: string;
    /** 特殊插画-自己视角（缺省回退 imageDual） */
    imageDualSelf?: string;
    /** 皮肤配音（键固定 death 为阵亡语音，其余键为技能真名；值按顺序为多条语音） */
    audios?: Record<string, AudioData[]>;
}

/** 武将信息（按武将全名入 generalInfoMap，全字段注入翻译表） */
export interface GeneralInfo {
    /** 编号 */
    id?: string;
    /** 版本 */
    version?: string;
    /** 称号 */
    title?: string;
    /** 前缀（如"界"） */
    prefix?: string;
    /** 设计师 */
    designer?: string;
    /** 代码提供 */
    script?: string;
}

/** 武将资源配置（注册武将时一并提供：信息/技能翻译/皮肤） */
export interface GeneralConfig {
    /** 武将全名（generalInfoMap 键与 info 翻译键使用，如 standard.caocao；缺省取注册键真名） */
    name?: string;
    /** 武将信息（按武将全名入 generalInfoMap，全字段注入翻译表） */
    info?: GeneralInfo;
    /** 技能翻译（键为技能全名，只写入翻译表） */
    skills?: Record<string, SkillTranslation>;
    /** 皮肤列表（按武将真名入 generalSkinMap，重复注册 push 且皮肤名去重） */
    skins: GeneralSkin[];
}
