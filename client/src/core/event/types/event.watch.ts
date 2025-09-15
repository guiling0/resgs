import { GameCard } from '../../card/card';
import { General } from '../../general/general';
import { GamePlayer } from '../../player/player';
import { EventData } from '../data';

/** 观看一名角色的手牌 */
export class WatchHandData extends EventData {
    watcher: GamePlayer;
    player: GamePlayer;

    public check(): boolean {
        if (!this.watcher || this.watcher.death) return false;
        if (!this.player) return false;
        return this.player.hasHandCards();
    }

    static temp(watcher: GamePlayer, cards: GameCard[]) {
        cards.forEach((v) => {
            v.setVisible(`watch_${watcher.playerId}`);
        });
        watcher.room.sendLog({
            text: '#WatchHand_Temp',
            values: [
                { type: 'player', value: watcher.playerId },
                {
                    type: '[carddata]',
                    value: watcher.room.getCardIds(cards),
                },
            ],
        });
    }

    static temp_end(watcher: GamePlayer, cards: GameCard[]) {
        cards.forEach((v) => {
            v.setVisible(`@reduce:watch_${watcher.playerId}`);
        });
    }
}

/** 观看武将牌 */
export class WatchGeneralData extends EventData {
    watcher: GamePlayer;
    player?: GamePlayer;
    generals: General[];
    /** 是否观看主将 */
    is_watch_head: boolean = false;
    /** 是否观看副将 */
    is_watch_deputy: boolean = false;
    /** 是否仅观看暗置的武将牌 */
    onlyConcealed?: boolean = true;

    public check(): boolean {
        if (!this.watcher || this.watcher.death) return false;
        this.generals = this.generals
            .filter((v) => {
                const head = this.room.players.find((g) => g._head === v.id);
                if (head && !head.headOpen && head.hasHead()) {
                    this.player = head;
                    this.is_watch_head = true;
                    return true;
                }
                const deputy = this.room.players.find(
                    (g) => g._deputy === v.id
                );
                if (deputy && !deputy.deputyOpen && deputy.hasDeputy()) {
                    this.player = deputy;
                    this.is_watch_deputy = true;
                    return true;
                }
            })
            .filter((v) => v);
        return this.generals.length > 0;
    }
}
