export interface PlayerRecord {
    userId: string | null;
    playerId: string;
    username: string;
    generals: string[];
    won: number; // 0 平 1 胜 2 负
    role: string;
}

export interface GameRecord {
    gameId: string;
    mode: string;
    roomId: string;
    players: PlayerRecord[];
    startTime: Date;
    endTime: Date;
    duration: number; // 单位：毫秒
    replayData: any;
    createdAt: Date;
}
