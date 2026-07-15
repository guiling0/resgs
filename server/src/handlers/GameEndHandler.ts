import { ILogger } from '@shared/core/ILogger';

export interface GameEndPlayer {
    userId: string;
    playerId: string;
    username: string;
    generals: string[];
    won: number;
    role: string;
}

export interface GameEndData {
    gameId: string;
    mode: string;
    roomId: string;
    players: GameEndPlayer[];
    startTime: Date;
    endTime: Date;
    replayData?: any;
    funEvents?: Map<string, Array<{ field: string; amount?: number }>>;
    maxValueEvents?: Map<string, Array<{ field: string; value: number }>>;
}

/**
 * 处理游戏结束
 * @param data 游戏结束数据
 * @param log 日志记录器
 */
export async function handleGameEnd(data: GameEndData, log?: ILogger) {}
