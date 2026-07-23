import { ObjectId } from 'mongodb';

/** 武将统计 */
export interface GeneralStat {
    _id: ObjectId;
    generalId: string;
    mode: string;

    total: number;
    wins: number;
    losses: number;
    winRate: number;

    extraStats: Record<string, number>;

    updateAt: Date;
}
