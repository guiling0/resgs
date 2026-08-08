import type { Room } from '../entity/Room';
import type { TurnEvent } from '../logic/event/TurnEvent';

/** 游戏模式数据（纯类型，注册到 sgs.modes） */
export interface GameModeData {
    /** 模式名 */
    name: string;
    /** 最大玩家数 */
    maxPlayer: number;
    /** 是否为团队模式 */
    isTeamMode: boolean;
    /** 额外设置项——键→设置 key，值→选项列表（空数组表示 checkbox），客户端据此构建 UI */
    settings: Record<string, string[]>;
    /** 非通用规则技能 */
    rules: string;
    /** 游戏开始前回调（必须提供） */
    beforeStart?: (room: Room) => Promise<void>;
    /**
     * 主流程逻辑（决定回合交替顺序）。默认流程：一号位开始，回合结束后下家接手，重新轮到一号位时轮数 +1。
     * 主流程只负责额定回合如何确定，无需考虑额外回合。
     */
    mainProcess?: (room: Room, turn: TurnEvent, last?: TurnEvent) => Promise<void>;
}
