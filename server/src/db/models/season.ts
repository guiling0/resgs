import { ObjectId } from 'mongodb';

/** 赛季分数 */
export interface SeasonStat {
    _id: ObjectId;
    userId: ObjectId;
    seasonId: string;
    mode: string;

    score: number;
    total: number;
    wins: number;
    losses: number;
    winRate: number;

    extraStats: Record<string, number>;
    updateAt: Date;
}

/** 赛季快照 */
export interface SeasonSnapshot {
    _id: ObjectId;
    seasonId: string;
    rankings: {
        mode: string;
        top100: {
            userId: ObjectId;
            username: string;
            score: number;
            rank: number;
        }[];
    }[];

    totalPlayers: number;
    totalGames: number;
}
