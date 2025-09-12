import { getDatabase } from '..';
import { UserManager } from '../../UserManager';
import { DbUser } from '../models/User';
import { UserService } from './UserService';

export class ReputationService {
    private readonly collection = getDatabase().collection<DbUser>('users');
    private readonly userService = new UserService();

    //初始化信誉分
    private async ensureReputationInitialized(username: string): Promise<void> {
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');
        if (user.profile.reputationScore === undefined) {
            await this.collection.updateOne(
                { username },
                {
                    $set: {
                        'profile.reputationScore': 100,
                    },
                }
            );
        }
    }

    //获取信誉分
    public async getReputationScore(username: string): Promise<number> {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        return user?.profile.reputationScore ?? 100;
    }

    //扣除信誉分
    public async deductReputationScore(
        username: string,
        score: number
    ): Promise<number> {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');
        const currentScore = user.profile?.reputationScore ?? 100;
        let newScore = Math.max(0, currentScore - score);

        await this.collection.updateOne(
            { username },
            { $set: { 'profile.reputationScore': newScore } }
        );

        const penaltiesApplied = await this.applyPenaltiesIfNeeded(
            username,
            newScore
        );

        return newScore;
    }

    //恢复信誉分
    public async restoreReputationScore(
        username: string,
        score: number
    ): Promise<number> {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        if (!user) throw new Error('User not found');
        const currentScore = user.profile?.reputationScore ?? 100;
        let newScore = Math.max(110, currentScore - score);
        await this.collection.updateOne(
            { username },
            { $set: { 'profile.reputationScore': newScore } }
        );
        return newScore;
    }

    private async applyPenaltiesIfNeeded(
        username: string,
        newScore: number
    ): Promise<boolean> {
        let penaltiesApplied = false;

        if (newScore < 40) {
            await this.userService.banUser(
                username,
                '信誉分低于40',
                24 * 60 * 60 * 1000
            );
        } else if (newScore < 60) {
            await this.userService.banGame(
                username,
                '信誉分低于60',
                24 * 60 * 60 * 1000
            );
        } else if (newScore < 70) {
            await this.userService.banGame(
                username,
                '信誉分低于70',
                12 * 60 * 60 * 1000
            );
        } else if (newScore < 80) {
            await this.userService.banGame(
                username,
                '信誉分低于70',
                20 * 60 * 1000
            );
        }

        return true;
    }
}
