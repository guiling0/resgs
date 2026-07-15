import { getDB } from '..';
import { GameRecord, PlayerRecord } from '../models/game';

export class GameRecordService {
    static col() {
        return getDB().collection<GameRecord>('game_records');
    }

    static async create({
        gameId,
        mode,
        roomId,
        players,
        startTime,
        endTime,
        replayData,
    }: {
        gameId: string;
        mode: string;
        roomId: string;
        players: PlayerRecord[];
        startTime: Date;
        endTime: Date;
        replayData?: any;
    }) {
        const doc: GameRecord = {
            gameId,
            mode,
            roomId,
            players,
            startTime,
            endTime,
            duration: Math.floor(
                (endTime.getTime() - startTime.getTime()) / 1000,
            ),
            replayData,
            createdAt: new Date(),
        };
        await this.col().insertOne(doc);
    }

    static async getByGameId(gameId: string) {
        return this.col().findOne({ gameId });
    }

    static async getByRoomId(roomId: string) {
        return this.col().find({ roomId }).toArray();
    }

    static async getUserRecentGames(userId: string, limit = 10) {
        return this.col()
            .find({ 'players.userId': userId })
            .sort({ endTime: -1 })
            .limit(limit)
            .project({ replayData: 0 })
            .toArray();
    }

    static async getModeRecentGames(mode: string, limit = 50) {
        return this.col()
            .find({ mode })
            .sort({ endTime: -1 })
            .limit(limit)
            .project({ replayData: 0 })
            .toArray();
    }
}
