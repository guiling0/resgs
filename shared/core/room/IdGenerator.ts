let _serverRoomIdCounter = 1000;
let _localRoomIdCounter = -1;

export function generateRoomId() {
    return (_serverRoomIdCounter++).toString();
}

export function generateLocalRoomId() {
    return (_localRoomIdCounter--).toString();
}

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomChars(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return result;
}

export function generateGameId(): string {
    return Date.now().toString(36) + '-' + randomChars(4);
}
