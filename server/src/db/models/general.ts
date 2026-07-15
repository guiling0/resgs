import { ObjectId } from 'mongodb';

export interface GeneralStat {
    _id: ObjectId;
    generalId: string;
    mode: string;

    total: number;
    wins: number;
    losses: number;
    winRate: number;

    banCount: number;
    pickCount: number;

    extraStats: Record<string, number>;

    updateAt: Date;
}
