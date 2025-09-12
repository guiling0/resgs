"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const __1 = require("..");
const UserService_1 = require("./UserService");
class ReputationService {
    constructor() {
        this.collection = (0, __1.getDatabase)().collection('users');
        this.userService = new UserService_1.UserService();
    }
    //初始化信誉分
    async ensureReputationInitialized(username) {
        const user = await this.collection.findOne({ username });
        if (!user)
            throw new Error('User not found');
        if (user.profile.reputationScore === undefined) {
            await this.collection.updateOne({ username }, {
                $set: {
                    'profile.reputationScore': 100,
                },
            });
        }
    }
    //获取信誉分
    async getReputationScore(username) {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        return user?.profile.reputationScore ?? 100;
    }
    //扣除信誉分
    async deductReputationScore(username, score) {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        if (!user)
            throw new Error('User not found');
        const currentScore = user.profile?.reputationScore ?? 100;
        let newScore = Math.max(0, currentScore - score);
        await this.collection.updateOne({ username }, { $set: { 'profile.reputationScore': newScore } });
        const penaltiesApplied = await this.applyPenaltiesIfNeeded(username, newScore);
        return newScore;
    }
    //恢复信誉分
    async restoreReputationScore(username, score) {
        await this.ensureReputationInitialized(username);
        const user = await this.collection.findOne({ username });
        if (!user)
            throw new Error('User not found');
        const currentScore = user.profile?.reputationScore ?? 100;
        let newScore = Math.max(110, currentScore - score);
        await this.collection.updateOne({ username }, { $set: { 'profile.reputationScore': newScore } });
        return newScore;
    }
    async applyPenaltiesIfNeeded(username, newScore) {
        let penaltiesApplied = false;
        if (newScore < 40) {
            await this.userService.banUser(username, '信誉分低于40', 24 * 60 * 60 * 1000);
        }
        else if (newScore < 60) {
            await this.userService.banGame(username, '信誉分低于60', 24 * 60 * 60 * 1000);
        }
        else if (newScore < 70) {
            await this.userService.banGame(username, '信誉分低于70', 12 * 60 * 60 * 1000);
        }
        else if (newScore < 80) {
            await this.userService.banGame(username, '信誉分低于70', 20 * 60 * 1000);
        }
        return true;
    }
}
exports.ReputationService = ReputationService;
