import express from 'express';
import { authenticateUser } from '../middleware/auth';
import { UserManager } from '../UserManager';
import { UserService } from '../db/services/UserService';
export function createAppRouter(
    userService: UserService,
    userManager: UserManager
) {
    const router = express.Router();

    router.use(authenticateUser(userManager));

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
            const username = decodeURIComponent(
                req.headers['x-user-name'].toString()
            );

            await userService.updateAvatar(username, avatar);

            if (userManager.onlinePlayers[username]) {
                userManager.onlinePlayers[username].userdata.profile.avatar =
                    avatar;
            }

            res.status(204).end();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    return router;
}
