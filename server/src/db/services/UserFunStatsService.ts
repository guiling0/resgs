import { ObjectId } from 'mongodb';
import { getDB } from '..';
import { UserFunStat } from '../models/user';

export class UserFunStatsService {
    static col() {
        return getDB().collection<UserFunStat>('user_fun_stats');
    }

    /**
     * 增加用户功能统计
     * @param userId 用户 ID
     * @param field 功能字段
     * @param amount 增加数量
     */
    static async increment(userId: string, field: string, amount = 1) {
        await this.col().updateOne(
            { userId: new ObjectId(userId) },
            {
                $inc: { [field]: amount },
                $set: { updatedAt: new Date() },
            },
            { upsert: true },
        );
    }

    /**
     * 批量增加用户功能统计
     * @param userIds 用户 ID 列表
     * @param field 功能字段
     * @param amount 增加数量
     */
    static async batchIncrement(
        userIds: string,
        increments: Array<{ field: string; amount?: number }>,
    ) {
        const incData: Record<string, number> = {};
        for (const item of increments) {
            incData[item.field] =
                (incData[item.field] || 0) + (item.amount || 1);
        }

        return this.col().updateOne(
            { userId: new ObjectId(userIds) },
            {
                $inc: incData,
                $set: { updatedAt: new Date() },
            },
            { upsert: true },
        );
    }

    /**
     * 更新用户功能统计最大值
     * @param userId 用户 ID
     * @param field 功能字段
     * @param value 最大值
     */
    static async updateMaxValue(userId: string, field: string, value: number) {
        const doc = await this.col().findOne({ userId: new ObjectId(userId) });
        const current = (doc?.[field as keyof UserFunStat] as number) || 0;

        if (value > current) {
            return this.col().updateOne(
                { userId: new ObjectId(userId) },
                { $set: { [field]: value, updatedAt: new Date() } },
                { upsert: true },
            );
        }
    }

    /**
     * 更新用户功能统计胜利次数
     * @param userId 用户 ID
     * @param won 是否胜利
     */
    static async updateWinStreak(userId: string, won: number) {
        const doc = await this.col().findOne({ userId: new ObjectId(userId) });

        if (!doc) {
            const isWin = won === 1 ? 1 : 0;
            return this.col().insertOne({
                userId,
                lebuUsed: 0,
                lebuUsedJudgeCount: 0,
                lebuUsedJudgeNotHeart: 0,
                bingliangUsed: 0,
                bingliangUsedJudgeCount: 0,
                bingliangUsedJudgeNotClub: 0,
                lebuTargetJudgeCount: 0,
                lebuTargetJudgeHeart: 0,
                bingliangTargetJudgeCount: 0,
                bingliangTargetJudgeClub: 0,
                baguaJudgeCount: 0,
                baguaJudgeRed: 0,
                shandianJudgeCount: 0,
                shandianHitCount: 0,
                shandianKillCount: 0,
                flowersReceived: 0,
                eggsReceived: 0,
                likesReceived: 0,
                mostDamageInOneTurn: 0,
                mostCardsInHand: 0,
                longestWinStreak: isWin,
                currentWinStreak: isWin,
                mostKillsInOneTurn: 0,
                diedBeforeFirstTurn: 0,
                maxSingleDamage: 0,
                updatedAt: new Date(),
            } as any);
        }

        const newCurrent = won === 1 ? (doc.currentWinStreak || 0) + 1 : 0;
        const newLongest = Math.max(newCurrent, doc.longestWinStreak || 0);

        return this.col().updateOne(
            { userId: new ObjectId(userId) },
            {
                $set: {
                    currentWinStreak: newCurrent,
                    longestWinStreak: newLongest,
                    updatedAt: new Date(),
                },
            },
        );
    }

    /**
     * 获取用户功能统计
     * @param userId 用户 ID
     * @returns 用户功能统计
     */
    static async getUserStats(userId: string): Promise<UserFunStat | null> {
        return this.col().findOne({ userId: new ObjectId(userId) });
    }
}
