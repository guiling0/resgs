import { getDB } from '..';
import { AdminLog } from '../models/admin';

export class AdminLogService {
    static col() {
        return getDB().collection<AdminLog>('admin_logs');
    }

    /**
     * 记录管理员操作日志
     * @param action 操作类型
     * @param target 操作目标
     * @param reason 操作原因
     * @param operatorId 操作人ID
     * @param duration 持续时间（可选）
     */
    static async log({
        action,
        target,
        reason,
        operatorId,
        duration = null,
    }: {
        action: string;
        target: string;
        reason: string;
        operatorId: string;
        duration?: number | null;
    }) {
        await this.col().insertOne({
            action,
            target,
            reason,
            operatorId,
            duration,
            createAt: new Date(),
        });
    }

    /**
     * 获取管理员操作日志
     * @param operatorId 操作人ID
     * @param limit 返回的日志数量
     * @returns 管理员操作日志数组
     */
    static async getByOperator(operatorId: string, limit = 50) {
        return this.col()
            .find({ operatorId })
            .sort({ createAt: -1 })
            .limit(limit)
            .toArray();
    }

    /**
     * 获取管理员操作日志
     * @param target 操作目标
     * @param limit 返回的日志数量
     * @returns 管理员操作日志数组
     */
    static async getByTarget(target: string, limit = 20) {
        return this.col()
            .find({ target })
            .sort({ createAt: -1 })
            .limit(limit)
            .toArray();
    }

    /**
     * 获取最近的日志
     * @param limit 返回的日志数量
     * @returns 最近的日志数组
     */
    static async getRecent(limit = 50) {
        return this.col()
            .find({})
            .sort({ createAt: -1 })
            .limit(limit)
            .toArray();
    }
}
