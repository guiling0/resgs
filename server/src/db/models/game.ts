import { ObjectId } from 'mongodb';

/** 对局记录 */
export interface GameRecord {
    _id: ObjectId;
    gameId: string;
    mode: string;
    roomId: string;
    players: {
        userId: ObjectId;
        playerId: string;
        username: string;
        generals: string[];
        won: number; // 0 平 1 胜 2 负
        escaped: boolean;
        role: string;
        mvpScore: number;
    }[];
    startTime: Date;
    endTime: Date;
    duration: number; // 单位：毫秒
    replayPath: string;
    logFile: string;
    createdAt: Date;
}
