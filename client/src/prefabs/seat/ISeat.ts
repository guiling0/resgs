import { Player } from '@shared/core/player/Player';

/**
 * 座位组件的公共接口。
 * Seat / SeatMo / SelfSeat 均实现此接口。
 */
export interface ISeat {
    /** 绑定玩家数据并刷新全局显示 */
    onBind(player: Player): void;

    /** 解绑并清空所有子组件 */
    onUnbind(): void;

    /** 刷新所有帧状态 (翻面/叠置/阶段/濒死/酒/离线…) */
    updateFrames(player: Player): void;

    /** 刷新势力显示 */
    updateCamp(player: Player): void;

    /** 刷新体力条 */
    updateHp(player: Player): void;

    /** 刷新回合状态 */
    updateTurnState(player: Player): void;

    /** 刷新手牌数 */
    updateHandCount(player: Player): void;

    /** 刷新装备区 */
    updateEquips(player: Player): void;
}
