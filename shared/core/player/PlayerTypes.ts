export enum Phase {
    None = 0,
    Ready,
    Judge,
    Draw,
    Play,
    Drop,
    End,

    // 斗地主等特殊模式专用（避免与基础阶段冲突）
    JiaoDiZhu = 100,
    ConfirmScore = 101,
    NotScore = 102,
}
