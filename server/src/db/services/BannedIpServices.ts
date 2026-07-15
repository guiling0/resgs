import { getDB } from '..';
import { BannedIp } from '../models/admin';

export class BannedIpServices {
    static col() {
        return getDB().collection<BannedIp>('banned_ips');
    }

    /**
     * 禁用IP
     * @param ip IP地址
     * @param reason 禁用原因
     * @param operatorId 禁用人ID
     * @param durationMinutes 禁用时长（分钟）
     * @returns 禁用IP结果
     */
    static async banIp({
        ip,
        reason,
        operatorId,
        durationMinutes,
    }: {
        ip: string;
        reason: string;
        operatorId: string;
        durationMinutes?: number | null;
    }) {
        const until = durationMinutes
            ? new Date(Date.now() + durationMinutes * 60 * 1000)
            : null;

        return this.col().updateOne(
            {
                ip,
            },
            {
                $set: {
                    ip,
                    reason,
                    operatorId,
                    until,
                    createdAt: new Date(),
                },
            },
            {
                upsert: true,
            },
        );
    }

    /**
     * 解禁IP
     * @param ip IP地址
     * @returns 解禁IP结果
     */
    static async unbanIp(ip: string) {
        return this.col().deleteOne({
            ip,
        });
    }

    /**
     * 检查IP是否被禁用
     * @param ip IP地址
     * @returns 是否被禁用
     */
    static async isBanned(ip: string) {
        const record = await this.col().findOne({ ip });
        if (!record) return false;
        if (record.until && record.until <= new Date()) {
            // 自动过期，顺便清理
            await this.col().deleteOne({ ip });
            return false;
        }
        return true;
    }

    static async getAllBannedIps() {
        return this.col().find().toArray();
    }
}
