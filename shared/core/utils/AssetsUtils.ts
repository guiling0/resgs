/** 卡牌配音性别 */
export type CardGender = 'male' | 'female';

/** 牌图默认路径 */
export function defaultCardImage(name: string): string {
    return `image/cards/${name}.png`;
}

/** 卡牌默认配音路径（无动画分支专属配音时使用） */
export function defaultCardAudio(name: string, gender: CardGender): string {
    return `audio/card/${gender}/${name}.mp3`;
}

/** 武将插画默认路径 */
export function defaultGeneralImage(name: string, skin: string): string {
    return `generals/${name}/${skin}/image.png`;
}

/** 武将特殊插画-他人视角默认路径 */
export function defaultGeneralImageDual(name: string, skin: string): string {
    return `generals/${name}/${skin}/image_dual.png`;
}

/** 武将特殊插画-自己视角默认路径 */
export function defaultGeneralImageDualSelf(name: string, skin: string): string {
    return `generals/${name}/${skin}/image_dual_self.png`;
}

/** 武将阵亡语音默认路径 */
export function defaultGeneralDeath(name: string, skin: string): string {
    return `generals/${name}/${skin}/death.mp3`;
}

/** 技能语音默认路径（{武将真名}/{皮肤}/{技能名}{序号}） */
export function defaultSkillAudio(general: string, skin: string, skill: string, order: number): string {
    return `generals/${general}/${skin}/${skill}${order}.mp3`;
}
