"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanService = void 0;
const __1 = require("..");
class BanService {
    constructor() {
        this.collection = (0, __1.getDatabase)().collection('system_config');
    }
    /**
     * 封IP
     * @param ip 封禁的ip地址
     * @param reason 封禁原因
     * @param times 封禁时长(毫秒)
     */
    async banIp(ip, reason, times) {
        const expiresAt = times ? new Date(Date.now() + times) : undefined;
        await this.collection.updateOne({ name: 'global' }, {
            $push: {
                ipBlacklist: {
                    ip,
                    reason,
                    bannedAt: new Date(),
                    expiresAt,
                },
            },
            $set: { updateAt: new Date() },
        }, { upsert: true });
    }
    /**
     * 解封IP
     * @param ip
     */
    async unbanIp(ip) {
        await this.collection.updateOne({ name: 'global' }, {
            $pull: { ipBlacklist: { ip } },
            $set: { updateAt: new Date() },
        });
    }
    /**
     * 检查IP是否被封禁
     * @param ip
     */
    async isIpBanned(ip) {
        const config = await this.collection.findOne({
            name: 'global',
        });
        if (!config)
            return { isBanned: false };
        const now = new Date();
        const banEntry = config.ipBlacklist.find((entry) => entry.ip === ip && (!entry.expiresAt || entry.expiresAt > now));
        return banEntry
            ? { isBanned: true, reason: banEntry.reason }
            : { isBanned: false };
    }
    /** 获取当前IP黑名单 */
    async getIpBlackList() {
        const config = await this.collection.findOne({
            name: 'global',
        });
        return config?.ipBlacklist || [];
    }
    /** 定期清理过期封禁 */
    async cleanupExpiredBans() {
        const result = await this.collection.updateOne({ name: 'global' }, {
            $pull: {
                ipBlacklist: {
                    expiresAt: { $lt: new Date() },
                },
            },
        });
        return result.modifiedCount;
    }
}
exports.BanService = BanService;
