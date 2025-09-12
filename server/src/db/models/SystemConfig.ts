import { ObjectId } from 'mongodb';

export interface SystemConfig {
    _id?: ObjectId;
    name: string;
    ipBlacklist: {
        ip: string;
        reason: string;
        bannedAt: Date;
        expiresAt?: Date; // 可选过期时间
    }[];

    updateAt: Date;
}
