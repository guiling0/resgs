"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomState = exports.RoomOptionState = exports.SpectateState = exports.PlayerState = void 0;
const schema_1 = require("@colyseus/schema");
class PlayerState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        /** 游戏场次 */
        this.total = 0;
        /** 胜利场次 */
        this.win = 0;
        /** 逃跑次数 */
        this.escape = 0;
        /** 是否为房主 */
        this.isOwner = false;
        /** 是否准备 */
        this.ready = false;
    }
    get _ready() {
        return this.ready;
    }
}
exports.PlayerState = PlayerState;
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "playerId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)('string')
], PlayerState.prototype, "avatar", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "total", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "win", void 0);
__decorate([
    (0, schema_1.type)('number')
], PlayerState.prototype, "escape", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "isOwner", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], PlayerState.prototype, "ready", void 0);
class SpectateState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        /** 游戏场次 */
        this.total = 0;
        /** 胜利场次 */
        this.win = 0;
        /** 逃跑次数 */
        this.escape = 0;
    }
}
exports.SpectateState = SpectateState;
__decorate([
    (0, schema_1.type)('string')
], SpectateState.prototype, "playerId", void 0);
__decorate([
    (0, schema_1.type)('string')
], SpectateState.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)('string')
], SpectateState.prototype, "avatar", void 0);
__decorate([
    (0, schema_1.type)('number')
], SpectateState.prototype, "total", void 0);
__decorate([
    (0, schema_1.type)('number')
], SpectateState.prototype, "win", void 0);
__decorate([
    (0, schema_1.type)('number')
], SpectateState.prototype, "escape", void 0);
__decorate([
    (0, schema_1.type)('string')
], SpectateState.prototype, "spectateBy", void 0);
class RoomOptionState extends schema_1.Schema {
}
exports.RoomOptionState = RoomOptionState;
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "password", void 0);
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "mode", void 0);
__decorate([
    (0, schema_1.type)('number')
], RoomOptionState.prototype, "playerCountMax", void 0);
__decorate([
    (0, schema_1.type)('number')
], RoomOptionState.prototype, "responseTime", void 0);
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "extensions", void 0);
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "generals", void 0);
__decorate([
    (0, schema_1.type)('number')
], RoomOptionState.prototype, "chooseGeneralCount", void 0);
__decorate([
    (0, schema_1.type)('number')
], RoomOptionState.prototype, "luckyCardCount", void 0);
__decorate([
    (0, schema_1.type)('string')
], RoomOptionState.prototype, "settings", void 0);
class RoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.spectates = new schema_1.MapSchema();
    }
}
exports.RoomState = RoomState;
__decorate([
    (0, schema_1.type)({ map: PlayerState })
], RoomState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)({ map: SpectateState })
], RoomState.prototype, "spectates", void 0);
__decorate([
    (0, schema_1.type)(RoomOptionState)
], RoomState.prototype, "options", void 0);
