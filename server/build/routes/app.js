"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppRouter = createAppRouter;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
function createAppRouter(userService, userManager) {
    const router = express_1.default.Router();
    router.use((0, auth_1.authenticateUser)(userManager));
    /**
     * 修改头像
     * POST /app/update-avatar
     * {
     *   "avatar": "avatar_url",
     * }
     */
    router.post('/update-avatar', async (req, res) => {
        try {
            const { avatar } = req.body;
            const username = decodeURIComponent(req.headers['x-user-name'].toString());
            await userService.updateAvatar(username, avatar);
            if (userManager.onlinePlayers[username]) {
                userManager.onlinePlayers[username].userdata.profile.avatar =
                    avatar;
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    return router;
}
