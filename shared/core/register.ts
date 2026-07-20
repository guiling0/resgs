/**
 * 核心注册——将全部枚举和 Builder 类一次性挂载到 sgs 全局对象。
 * 扩展通过 sgs.TimingName.DamageStart 访问运行时值，无需 import 核心模块。
 */

import { TimingName, EventType, DamageType } from './event/EventTypes';
import { PriorityType, SkillTag, StateEffectType } from './skill/SkillTypes';
import { SkillBuilder } from './skill/builder/SkillBuilder';
import { EffectBuilder } from './skill/builder/EffectBuilder';
import {
    CardAttr,
    CardSuit,
    CardNumber,
    CardColor,
    CardType,
    CardSubType,
    EquipSubType,
    AreaType,
} from './card/CardTypes';
import { Phase } from './player/PlayerTypes';
import { SelectorType, PlayPhaseResult } from './select/SelectTypes';
import { Gender } from './general/GeneralType';

/**
 * 将核心枚举和 Builder 一次性挂载到目标对象。
 * 幂等——重复调用不重复赋值（Object.assign 天然覆盖幂等）。
 */
export function registerCore(target: Record<string, any>): void {
    Object.assign(target, {
        // 事件
        TimingName,
        EventType,
        DamageType,
        // 技能
        PriorityType,
        SkillTag,
        StateEffectType,
        // 卡牌
        CardAttr,
        CardSuit,
        CardNumber,
        CardColor,
        CardType,
        CardSubType,
        EquipSubType,
        AreaType,
        // 玩家
        Phase,
        // 选择
        SelectorType,
        PlayPhaseResult,
        // 武将
        Gender,
        // Builder 类
        SkillBuilder,
        EffectBuilder,
    });
}
