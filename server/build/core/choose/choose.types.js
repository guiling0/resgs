"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayPhaseResule = void 0;
/** 出牌询问执行的操作 */
var PlayPhaseResule;
(function (PlayPhaseResule) {
    PlayPhaseResule[PlayPhaseResule["None"] = 0] = "None";
    /** 使用牌 */
    PlayPhaseResule[PlayPhaseResule["UseCard"] = 1] = "UseCard";
    /** 使用技能 */
    PlayPhaseResule[PlayPhaseResule["UseSkill"] = 2] = "UseSkill";
    /** 重铸牌 */
    PlayPhaseResule[PlayPhaseResule["Recast"] = 3] = "Recast";
    /** 明置武将牌 */
    PlayPhaseResule[PlayPhaseResule["OpenHead"] = 4] = "OpenHead";
    PlayPhaseResule[PlayPhaseResule["OpenDeputy"] = 5] = "OpenDeputy";
    /** 结束 */
    PlayPhaseResule[PlayPhaseResule["End"] = 6] = "End";
})(PlayPhaseResule || (exports.PlayPhaseResule = PlayPhaseResule = {}));
