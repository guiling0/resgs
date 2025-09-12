"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminRouter = createAdminRouter;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const UserManager_1 = require("../UserManager");
function createAdminRouter(userService, banService, userManager) {
    const router = express_1.default.Router();
    router.use((0, auth_1.authenticateAdmin)(userService));
    /**
     * 封禁IP
     * POST /admin/ban-ip
     * {
     *   "ip": "192.168.1.1",
     *   "reason": "封禁原因",
     *   "times": 1*24*60*60*1000
     * }
     */
    router.post('/ban-ip', async (req, res) => {
        try {
            const { ip, reason, times } = req.body;
            await banService.banIp(ip, reason, times);
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 解封IP
     * DELETE /admin/unban-ip/:ip
     */
    router.delete('/unban-ip/:ip', async (req, res) => {
        try {
            await banService.unbanIp(req.params.ip);
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 封禁用户
     * POST /admin/ban-user
     * {
     *   "username": "username",
     *   "reason": "封禁原因",
     *   "times": 1*24*60*60*1000,
     *   "banIp": true
     * }
     */
    router.post('/ban-user', async (req, res) => {
        try {
            const { username, reason, times, banIp } = req.body;
            await userService.banUser(username, reason, times, banIp);
            const user = UserManager_1.UserManager.inst.onlinePlayers[username];
            if (user) {
                if (user.lobbyClient) {
                    user.lobbyClient.leave(3005);
                }
                Object.keys(user.rooms).forEach((v) => {
                    const room = user.rooms[v];
                    room.client.leave(3005);
                });
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 解封用户
     * POST /admin/unban-user
     * {
     *   "username": "username",
     * }
     */
    router.post('/unban-user', async (req, res) => {
        try {
            const { username } = req.body;
            await userService.unBanUser(username);
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 禁止用户游戏
     * POST /admin/ban-game
     * {
     *   "username": "username",
     *   "reason": "封禁原因",
     *   "times": 1*24*60*60*1000,
     *   "banIp": true
     * }
     */
    router.post('/ban-game', async (req, res) => {
        try {
            const { username, reason, times } = req.body;
            await userService.banGame(username, reason, times);
            const user = UserManager_1.UserManager.inst.onlinePlayers[username];
            if (user) {
                user.userdata.status.isGameBanned = true;
                user.userdata.status.gameBanReason = reason;
                const expiresAt = times
                    ? new Date(Date.now() + times)
                    : undefined;
                user.userdata.status.gameBanExpires = expiresAt;
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 解封用户参与游戏
     * POST /admin/unban-game
     * {
     *   "username": "username",
     * }
     */
    router.post('/unban-game', async (req, res) => {
        try {
            const { username } = req.body;
            await userService.unBanGame(username);
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 禁止用户发言
     * POST /admin/ban-muted
     * {
     *   "username": "username",
     *   "reason": "封禁原因",
     *   "times": 1*24*60*60*1000,
     *   "banIp": true
     * }
     */
    router.post('/ban-muted', async (req, res) => {
        try {
            const { username, reason, times } = req.body;
            await userService.banMuted(username, reason, times);
            const user = UserManager_1.UserManager.inst.onlinePlayers[username];
            if (user) {
                user.userdata.status.isMuted = true;
                user.userdata.status.muteReason = reason;
                const expiresAt = times
                    ? new Date(Date.now() + times)
                    : undefined;
                user.userdata.status.muteExpires = expiresAt;
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 解除用户禁言
     * POST /admin/unban-muted
     * {
     *   "username": "username",
     * }
     */
    router.post('/unban-muted', async (req, res) => {
        try {
            const { username } = req.body;
            await userService.unBanMuted(username);
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    /**
     * 获取IP黑名单
     * GET /admin/ip-blacklist
     */
    router.get('/ip-blacklist', async (req, res) => {
        try {
            const blacklist = await banService.getIpBlackList();
            res.json(blacklist);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    /**
     * 公告广播
     * POST /admin/broadcast
     * {
     *   "message": "广播内容",
     * }
     */
    router.post('/broadcast', async (req, res) => {
        try {
            const { message } = req.body;
            userManager.broadcast(message);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    return router;
}
