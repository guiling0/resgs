"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomId = generateRoomId;
let roomid = 0;
function generateRoomId(isPrivate = false) {
    let id = 1000 + roomid++;
    return (isPrivate ? (id *= -1) : id).toString();
}
