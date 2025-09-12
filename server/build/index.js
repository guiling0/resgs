"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const sgs_1 = require("./core/sgs");
const extensions_config_1 = __importDefault(require("./core/extensions.config"));
const body_parser_1 = __importDefault(require("body-parser"));
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const game_1 = require("./rooms/game");
const monitor_1 = require("@colyseus/monitor");
const playground_1 = require("@colyseus/playground");
const lobby_1 = require("./rooms/lobby");
const auth_1 = require("./routes/auth");
const UserService_1 = require("./db/services/UserService");
const BanService_1 = require("./db/services/BanService");
const UserManager_1 = require("./UserManager");
const admin_1 = require("./routes/admin");
const banCleanup_1 = require("./scripts/banCleanup");
const app_1 = require("./routes/app");
const db_1 = require("./db");
const userCleanup_1 = require("./scripts/userCleanup");
sgs_1.sgs.init('server', (name) => {
    require(`./extensions/${name}/index`);
});
for (const pkg of extensions_config_1.default) {
    const name = pkg.split('@')[0];
    sgs_1.sgs.loadPackage(name);
    sgs_1.sgs.extensions.push(pkg);
}
(0, db_1.connectToDatabase)()
    .catch((err) => {
    console.error('Database connection failed', err);
    process.exit(1);
})
    .then(() => {
    start();
});
async function start() {
    const userService = new UserService_1.UserService();
    const banService = new BanService_1.BanService();
    const userManager = UserManager_1.UserManager.inst;
    const app = (0, express_1.default)();
    const port = 12699;
    const allowedOrigin = [
        'http://192.168.1.3:18090',
        'http://192.168.1.3:8000',
        'http://resgs.com/',
        'http://resgs.com/game/',
        'http://resgs.com',
        'http://resgs.com/game',
    ];
    app.use((0, cors_1.default)({
        origin: allowedOrigin,
        methods: [
            'GET',
            'HEAD',
            'PUT',
            'PATCH',
            'POST',
            'DELETE',
            'OPTIONS',
        ], // 必须包含 OPTIONS
        allowedHeaders: ['Content-Type', 'x-user-name', 'x-user-token'], // 允许的请求头
        credentials: true,
    }));
    app.use(body_parser_1.default.json());
    app.use('/auth', (0, auth_1.createAuthRouter)(userService, userManager));
    app.use('/admin', (0, admin_1.createAdminRouter)(userService, banService, userManager));
    app.use('/app', (0, app_1.createAppRouter)(userService, userManager));
    const gameServer = new colyseus_1.Server({
        transport: new ws_transport_1.WebSocketTransport({
            server: (0, http_1.createServer)(app),
        }),
    });
    gameServer.define('lobby', lobby_1.CustomLobbyRoom);
    gameServer.define('game', game_1.GameRoom).enableRealtimeListing();
    app.use('/rooms', (0, monitor_1.monitor)());
    app.use('/playground', (0, playground_1.playground)());
    gameServer.listen(port);
    console.log(`Server is listening on port ${port}`);
    gameServer.onShutdown(() => {
        console.log(`Server is Closed`);
    });
    //定时任务
    await (0, banCleanup_1.setupBanCleanup)(banService);
    await (0, userCleanup_1.setupUserCleanup)(userManager);
}
