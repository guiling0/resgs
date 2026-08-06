/** 玩家阶段 */
export enum Phase {
    None = 0,
    /** 准备阶段 */
    Ready,
    /** 判定阶段 */
    Judge,
    /** 摸牌阶段 */
    Draw,
    /** 出牌阶段 */
    Play,
    /** 弃牌阶段 */
    Drop,
    /** 结束阶段 */
    End,

    // 斗地主等特殊模式专用（避免与基础阶段冲突）
    /** 叫地主 */
    JiaoDiZhu = 100,
    /** 确认分数 */
    ConfirmScore = 101,
    /** 不叫分 */
    NotScore = 102,
}
