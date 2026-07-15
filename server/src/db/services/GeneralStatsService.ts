import { getDB } from '..';
import { GeneralStat } from '../models/general';

export class GeneralStatsService {
    static col() {
        return getDB().collection<GeneralStat>('general_stats');
    }

    /**
     * 更新武将统计
     * @param generalId 武将 ID
     * @param mode 模式
     * @param won 胜负结果（0 平 1 胜 2 负）
     * @param extraStats 额外统计项（可选）
     */
    static async updateStats({
        generalId,
        mode,
        won,
        extraStats,
    }: {
        generalId: string;
        mode: string;
        won: number; // 0 平 1 胜 2 负
        extraStats?: Record<string, number>;
    }) {
        const incData: Record<string, number> = { total: 1 };
        if (won === 1) {
            incData.wins = 1;
        } else if (won === 2) {
            incData.losses = 1;
        }

        if (extraStats) {
            Object.assign(incData, extraStats);
        }

        await this.col().updateOne(
            { generalId, mode },
            { $inc: incData, $set: { updateAt: new Date() } },
            { upsert: true },
        );

        // 更新胜率
        await this.col().updateOne({ generalId, mode }, [
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
     * 批量更新武将统计
     * @param statsArray 武将统计数组
     */
    static async batchUpdate(
        statsArray: Array<{
            generalId: string;
            mode: string;
            won: number;
            extraStats?: Record<string, number>;
        }>,
    ) {
        const bulkOps = statsArray.map((s) => {
            const incData: Record<string, number> = { total: 1 };
            if (s.won === 1) incData.wins = 1;
            else if (s.won === 2) incData.losses = 1;
            if (s.extraStats) Object.assign(incData, s.extraStats);

            return {
                updateOne: {
                    filter: { generalId: s.generalId, mode: s.mode },
                    update: { $inc: incData, $set: { updateAt: new Date() } },
                    upsert: true,
                },
            };
        });

        return this.col().bulkWrite(bulkOps);
    }

    /**
     * 增加武将统计次数
     * @param generalId 武将 ID
     * @param mode 模式
     * @param type 增加类型（ban 拜将 pick pick 拜将）
     */
    static async incrementBanPick(
        generalId: string,
        mode: string,
        type: 'ban' | 'pick',
    ) {
        const field = type === 'ban' ? 'banCount' : 'pickCount';
        return this.col().updateOne(
            { generalId, mode },
            { $inc: { [field]: 1 }, $set: { updateAt: new Date() } },
            { upsert: true },
        );
    }

    /**
     * 某模式下武将胜率排行
     * @param mode 模式
     * @param minGames 最小游戏次数
     * @param limit 限制数量
     */
    static async getModeRanking(mode: string, minGames = 100, limit = 50) {
        return this.col()
            .find({ mode, total: { $gte: minGames } })
            .sort({ winRate: -1, total: -1 })
            .limit(limit)
            .toArray();
    }

    /**
     * 某武将全模式汇总
     * @param generalId 武将 ID
     */
    static async getGeneralTotal(generalId: string) {
        return this.col()
            .aggregate([
                { $match: { generalId } },
                {
                    $group: {
                        _id: null,
                        totalGames: { $sum: '$total' },
                        wins: { $sum: '$wins' },
                        losses: { $sum: '$losses' },
                        banCount: { $sum: '$banCount' },
                        pickCount: { $sum: '$pickCount' },
                    },
                },
            ])
            .toArray();
    }

    /**
     * 某武将某模式统计
     * @param generalId 武将 ID
     * @param mode 模式
     */
    static async getGeneralModeStats(generalId: string, mode: string) {
        return this.col().findOne({ generalId, mode });
    }
}
