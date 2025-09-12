"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUserCleanup = setupUserCleanup;
async function setupUserCleanup(userManager, interval = 3600000) {
    async function cleanup() {
        try {
            Object.keys(userManager.onlinePlayers)
                .slice()
                .forEach((v) => {
                const user = userManager.onlinePlayers[v];
                if (user &&
                    !user.lobbyClient &&
                    Object.keys(user.rooms).length === 0) {
                    delete userManager.onlinePlayers[v];
                }
            });
        }
        catch (error) {
            console.error('Failed to cleanup expired bans:', error);
        }
        finally {
            setTimeout(cleanup, interval);
        }
    }
    // 启动清理任务
    cleanup();
}
