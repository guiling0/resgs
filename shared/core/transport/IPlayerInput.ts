import type { ChooseSession } from '../types/ChooseTypes';

/**
 * 玩家输入接口（传输层，入站方向）。
 * 服务端经此接口向客户端发送选择请求；响应经 ChooseManager.respond() 回传（网络层收到客户端消息后调用）。
 */
export interface IPlayerInput {
    /**
     * 向客户端发送选择请求。
     * @returns Promise<void> 表示消息已发送（不等待玩家响应）
     */
    requestChoice(playerId: string, session: ChooseSession): Promise<void>;
}
