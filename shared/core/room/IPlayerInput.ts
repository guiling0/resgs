import type { SelectSession, SelectResult } from '../select/SelectTypes';

/**
 * 玩家输入接口。
 * 服务端通过此接口向客户端发送选择请求。
 * 响应通过 ChooseManager.respond() 回传（网络层收到客户端消息后调用）。
 */
export interface IPlayerInput {
    /**
     * 向客户端发送选择请求。
     * @returns Promise<void> 表示消息已发送（不等待玩家响应）
     */
    requestChoice(playerId: string, session: SelectSession): Promise<void>;
}
