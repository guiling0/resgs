/** 武将ID */
export type GeneralId = string;
/** 武将势力 可以用,分割多个势力 */
export type GeneralKingdom = string;
/** 武将体力 其中数组代表[初始体力值,初始体力上限,初始护盾] */
export type GeneralHp = number | [number, number] | [number, number, number];

export interface GeneralData {
    /** 武将名 */
    name: string;
    /** 势力 */
    kingdom: GeneralKingdom;
    /** 血量 */
    hp: GeneralHp;
    /** 性别 */
    gender: Gender;
    /** 技能 */
    skills: string[];
    /** 是否为主公/君主 */
    lord: boolean;
    /** 是否启用 */
    enable: boolean;
    /** 在武将一览中隐藏 */
    hidden: boolean;
    /** 是否为国战武将 */
    isWars: boolean;
    /** 珠联璧合表 */
    rs?: string[];
}

export interface GeneralAssetsData {
    info: {
        /** 编号 */
        id?: string;
        /** 版本 */
        version?: string;
        /** 称号 */
        title?: string;
        /** 前缀 如“界” */
        prefix?: string;
        /** 设计师 */
        designer?: string;
        /** 代码提供 */
        script?: string;
    };

    /** 所有皮肤  其中default字段为原画，如果不添加则会在初始化后添加默认原画配置*/
    skins: {
        /** 皮肤名 */
        name: string;
        /** 画师 */
        painter?: string;
        /** 配音 */
        cv?: string;
        /** 台词编写 */
        cv_designer?: string;
        /** 是否启用双头武将特殊插画 */
        isDualImage?: boolean;
        /** 是否为动态皮肤 */
        dynamic?: boolean;
        /** 根目录地址 所有资源都会在该目录下寻找
         * 对于插画，以下资源如果字符串中包含“/”，则会忽略baseUrl，改为在generals下寻找
         * 对于语音，技能语音不在这里设置，但皮肤专属配音依赖于baseUrl，
         * 该武将牌上的技能会按照其设置的每一个语音文件名（如果字符串中包含“/”，则文件名为最后一个/之后的内容）
         * 在baseUrl下寻找同名文件作为其的皮肤代替配音
         */
        baseUrl: string;
        /** 插画文件名 */
        image?: string;
        /** 双头插画文件名（其他视角） */
        image_dual?: string;
        /** 双头插画文件名（自己视角） */
        image_dual2?: string;
        /** 用于其他人的主视角中显示可发动的你的技能的头像 */
        avatar?: string;
        /** 所有语音 其中death字段为阵亡语音
         * */
        audios: { [key: string]: { url: string; translation: string } };
    }[];
}

/** 性别 */
export const enum Gender {
    /** 无性别 */
    None = 0,
    /** 男 */
    Male = 1,
    /** 女 */
    Female = 2,
    /** 双性 */
    Doublesex = 9,
}
