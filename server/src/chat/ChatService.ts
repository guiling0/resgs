import { GameRoom } from 'src/rooms/GameRoom';
import { CustomLobbyRoom } from 'src/rooms/LobbyRoom';
import { ChatMessage, ChatSource } from '@shared/core/message';

let chatMessageIdCounter = 0;
let _lobby: CustomLobbyRoom | undefined;
const _rooms = new Map<string, GameRoom>();

export function registerRoom(roomId: string, room: GameRoom) {
    _rooms.set(roomId, room);
}

export function unregisterRoom(roomId: string) {
    _rooms.delete(roomId);
}

export function getRoom(roomId: string) {
    return _rooms.get(roomId);
}

export function registrLobby(lobby: CustomLobbyRoom) {
    _lobby = lobby;
}

export function unregisterLobby() {
    _lobby = undefined;
}

export function getLobby() {
    return _lobby;
}

export function generateChatMessage(
    source: ChatSource,
    sender: string,
    message: string,
    roomId?: string,
): ChatMessage {
    return {
        chatId: chatMessageIdCounter++,
        source,
        roomId,
        sender,
        message,
        time: Date.now(),
    };
}

export function broadcastChatMessageToAll(message: ChatMessage) {
    if (_lobby) {
        _lobby.broadcast('chat', message);
    }
    for (const room of _rooms.values()) {
        room.broadcast('chat', message);
    }
}
