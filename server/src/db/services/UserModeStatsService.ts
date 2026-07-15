import { ObjectId } from 'mongodb';
import { getDB } from '..';
import { UserModeStat } from '../models/user';

export class UserModeStatsService {
    static col() {
        return getDB().collection<UserModeStat>('user_mode_stats');
    }

    /**
     * 更新用户模式统计
     * @param userId 用户 ID
     * @param mode 模式
     * @param won 胜负结果（0 平 1 胜 2 负）
     * @param extraStats 额外统计项（可选）
     */
    static async updateStats({
        userId,
        mode,
        won,
        extraStats,
    }: {
        userId: string;
        mode: string;
        won: number; // 0 平 1 胜 2 负
        extraStats?: Record<string, number>;
    }) {
        const incData: Record<string, number> = { total: 1 };
        if (won === 0) {
            // 平局：不增加 wins/losses，仅增加 total
        } else if (won === 1) {
            incData.wins = 1;
        } else {
            incData.losses = 1;
        }

        if (extraStats) {
            Object.assign(incData, extraStats);
        }

        await this.col().updateOne(
            { userId: new ObjectId(userId), mode },
            { $inc: incData, $set: { updateAt: new Date() } },
            { upsert: true },
        );

        //更新胜率
        await this.col().updateOne({ userId: new ObjectId(userId), mode }, [
            {
                $set: {
                    winRate: {
                        $cond: [
                            { $gt: ['$total', 0] },
                            { $round: [{ $divide: ['$wins', '$total'] }, 2] },
                            0,
                        ],
                    },
                },
            },
        ]);
    }

    /**
     * 获取用户所有模式统计
     * @param userId 用户 ID
     * @returns 用户所有模式统计数组
     */
    static async getUserAllStats(userId: string) {
        return this.col()
            .find({ userId: new ObjectId(userId) })
            .toArray();
    }

    /**
     * 获取用户模式统计
     * @param userId 用户 ID
     * @param mode 模式
     * @returns 用户模式统计
     */
    static async getUserModeStats(userId: string, mode: string) {
        return this.col().findOne({ userId: new ObjectId(userId), mode });
    }

    /**
     * 获取模式排行榜
     * @param mode 模式
     * @param limit 限制数量（默认 100）
     * @returns 模式排行榜数组
     */
    static async getModeLeaderboard(mode: string, limit = 100) {
        return this.col()
            .find({ mode, total: { $gte: 10 } })
            .sort({ winRate: -1, wins: -1 })
            .limit(limit)
            .toArray();
    }
}
