"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = authenticateAdmin;
exports.authenticateUser = authenticateUser;
function authenticateAdmin(userService) {
    return async (req, res, next) => {
        const userId = decodeURIComponent(req.headers['x-user-name'].toString());
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            if (!userService.checkAdmin(userId)) {
                return res
                    .status(403)
                    .json({ error: 'Admin privileges required' });
            }
            next();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
function authenticateUser(userManager) {
    return async (req, res, next) => {
        const userId = decodeURIComponent(req.headers['x-user-name'].toString());
        const token = decodeURIComponent(req.headers['x-user-token'].toString());
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            if (userManager.onlinePlayers[userId] &&
                userManager.onlinePlayers[userId].token === token) {
                next();
            }
            else {
                return res.status(403).json({ error: 'User Token required' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
