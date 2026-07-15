import {
    GameCardId,
    SourceData,
    VirtualCardData,
    VirtualSourceData,
} from '../card/CardTypes';
import { GameCard } from '../card/GameCard';
import { VirtualCard } from '../card/VirtualCard';
import { General } from '../general/General';
import { RoomState } from '../schema/RoomState';
import { IPlayerInput } from './IPlayerInput';

export class GameLogic {
    public state: RoomState;
    private input: IPlayerInput;

    private cards: Map<GameCardId, GameCard> = new Map();
    private generals: Map<string, General> = new Map();
    private virtualCards: VirtualCard[] = [];

    constructor(state: RoomState, input: IPlayerInput) {
        this.state = state;
        this.input = input;
    }

    /** 获取卡牌 */
    getGeneral(id: string): General | undefined {
        return this.generals.get(id);
    }

    /** 获取所有卡牌 */
    getGenerals(ids: string[]): General[] {
        return ids
            .map((id) => this.getGeneral(id))
            .filter(Boolean) as General[];
    }

    clearVirtuals() {
        for (const vc of this.virtualCards.values()) {
            vc.clearSubCards();
            vc.destroyed = true;
        }
        this.virtualCards.length = 0;
    }
}
