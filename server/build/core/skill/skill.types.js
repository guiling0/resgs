"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateEffectType = exports.EffectType = void 0;
var EffectType;
(function (EffectType) {
    EffectType[EffectType["None"] = 0] = "None";
    /** 触发技 */
    EffectType[EffectType["Trigger"] = 1] = "Trigger";
    /** 状态技 */
    EffectType[EffectType["State"] = 2] = "State";
})(EffectType || (exports.EffectType = EffectType = {}));
var StateEffectType;
(function (StateEffectType) {
    StateEffectType[StateEffectType["Distance_Correct"] = 1] = "Distance_Correct";
    StateEffectType[StateEffectType["Distance_Fixed"] = 2] = "Distance_Fixed";
    StateEffectType[StateEffectType["NotCalcSeat"] = 3] = "NotCalcSeat";
    StateEffectType[StateEffectType["NotCalcDistance"] = 4] = "NotCalcDistance";
    StateEffectType[StateEffectType["MaxHand_Initial"] = 5] = "MaxHand_Initial";
    StateEffectType[StateEffectType["MaxHand_Correct"] = 6] = "MaxHand_Correct";
    StateEffectType[StateEffectType["MaxHand_Fixed"] = 7] = "MaxHand_Fixed";
    StateEffectType[StateEffectType["MaxHand_Exclude"] = 8] = "MaxHand_Exclude";
    StateEffectType[StateEffectType["Prohibit_Open"] = 9] = "Prohibit_Open";
    StateEffectType[StateEffectType["Prohibit_Close"] = 10] = "Prohibit_Close";
    StateEffectType[StateEffectType["Prohibit_DropCards"] = 11] = "Prohibit_DropCards";
    StateEffectType[StateEffectType["Prohibit_RecoverHp"] = 12] = "Prohibit_RecoverHp";
    StateEffectType[StateEffectType["Prohibit_UseCard"] = 13] = "Prohibit_UseCard";
    StateEffectType[StateEffectType["Prohibit_PlayCard"] = 14] = "Prohibit_PlayCard";
    StateEffectType[StateEffectType["Prohibit_Pindian"] = 15] = "Prohibit_Pindian";
    StateEffectType[StateEffectType["Range_Initial"] = 16] = "Range_Initial";
    StateEffectType[StateEffectType["Range_Correct"] = 17] = "Range_Correct";
    StateEffectType[StateEffectType["Range_Fixed"] = 18] = "Range_Fixed";
    /** 视为在攻击范围内 */
    StateEffectType[StateEffectType["Range_Within"] = 19] = "Range_Within";
    /** 视为不在攻击范围内 */
    StateEffectType[StateEffectType["Range_Without"] = 20] = "Range_Without";
    /** 卡牌基本信息视为其他信息 */
    StateEffectType[StateEffectType["Regard_CardData"] = 21] = "Regard_CardData";
    /** 视为唯一大势力 */
    StateEffectType[StateEffectType["Regard_OnlyBig"] = 22] = "Regard_OnlyBig";
    /** 无次数限制 */
    StateEffectType[StateEffectType["TargetMod_PassTimeCheck"] = 23] = "TargetMod_PassTimeCheck";
    /** 不计入次数的限制 */
    StateEffectType[StateEffectType["TargetMod_PassCountingTime"] = 24] = "TargetMod_PassCountingTime";
    /** 修改次数限制 */
    StateEffectType[StateEffectType["TargetMod_CorrectTime"] = 25] = "TargetMod_CorrectTime";
    /** 无距离限制 */
    StateEffectType[StateEffectType["TargetMod_PassDistanceCheck"] = 26] = "TargetMod_PassDistanceCheck";
    /** 修改卡牌选择限制 */
    StateEffectType[StateEffectType["TargetMod_CardLimit"] = 27] = "TargetMod_CardLimit";
    /** 技能失效 */
    StateEffectType[StateEffectType["Skill_Invalidity"] = 28] = "Skill_Invalidity";
    /** 如手牌般使用 */
    StateEffectType[StateEffectType["LikeHandToUse"] = 29] = "LikeHandToUse";
    /** 如手牌般打出 */
    StateEffectType[StateEffectType["LikeHandToPlay"] = 30] = "LikeHandToPlay";
    /** 忽略主副将标签的条件 */
    StateEffectType[StateEffectType["IgnoreHeadAndDeputy"] = 31] = "IgnoreHeadAndDeputy";
    /** 卡牌永远可见 */
    StateEffectType[StateEffectType["FieldCardEyes"] = 32] = "FieldCardEyes";
    /** 视为满足阵法条件 */
    StateEffectType[StateEffectType["Regard_ArrayCondition"] = 33] = "Regard_ArrayCondition";
    /** 拼点结果视为 */
    StateEffectType[StateEffectType["Regard_PindianResult"] = 34] = "Regard_PindianResult";
    /** 视为某势力 */
    StateEffectType[StateEffectType["Regard_Kingdom"] = 35] = "Regard_Kingdom";
})(StateEffectType || (exports.StateEffectType = StateEffectType = {}));
