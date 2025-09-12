"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express_1 = __importDefault(require("express"));
function createAuthRouter(userService, userManager) {
    const router = express_1.default.Router();
    /**
     * 登录或注册
     * POST /auth/login
     * {
     *   "username": "player1",
     *   "password": "securePassword123"
     * }
     */
    router.post('/login', async (req, res) => {
        try {
            const { username, password, client_version } = req.body;
            const ip = req.ip;
            if (client_version !== '1.0.92') {
                throw new Error('Client Version Invalid');
            }
            const user = await userService.registerOrLogin(username, password, ip);
            if (!user) {
                throw new Error('Invalid');
            }
            const token = userManager.login(user);
            res.status(200).json({
                token,
                user: {
                    username: user.username,
                    profile: {
                        avatar: user.profile.avatar,
                        title: user.profile.title,
                    },
                    privileges: {
                        admin: user.privileges.admin,
                        tester: user.privileges.betaTester,
                    },
                },
            });
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    });
    return router;
}
