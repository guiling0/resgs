export interface RoomListItem {
    roomId: string;
    roomName: string;
    mode: string;
    players: number;
    maxPlayers: number;
    owner: string;
    hasPassword: boolean;
    state: 'waiting' | 'playing';
}
