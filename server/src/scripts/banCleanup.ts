import { BanService } from '../db/services/BanService';

export async function setupBanCleanup(
    banService: BanService,
    interval: number = 3600000
) {
    async function cleanup() {
        try {
            const count = await banService.cleanupExpiredBans();
            if (count > 0) {
                console.log(`Cleaned up ${count} expired IP bans`);
            }
        } catch (error) {
            console.error('Failed to cleanup expired bans:', error);
        } finally {
            setTimeout(cleanup, interval);
        }
    }

    // 启动清理任务
    cleanup();
}
