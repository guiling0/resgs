import { ObjectId } from 'mongodb';

export interface AdminLog {
    _id?: ObjectId;
    action: string; // 'ban_ip' | 'ban_user' | 'mute_user' | ...
    target: string; // 目标 IP 或 userId
    reason: string;
    operatorId: string; // 谁操作的 userId或system
    duration: number | null; // 封禁时长（分钟），null 为永久
    createAt: Date;
}

export interface BannedIp {
    _id: ObjectId;
    ip: string;
    reason: string;
    operatorId: string;
    until: Date | null;
    createdAt: Date;
}
