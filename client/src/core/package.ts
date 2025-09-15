import { GameCardData } from './card/card.types';
import { GeneralData } from './general/general.type';

export class Package {
    constructor(public readonly name: string) {}

    /** 所有游戏牌 */
    public readonly cards: GameCardData[] = [];
    /** 所有武将牌 */
    public readonly generals: GeneralData[] = [];

    /** 增加游戏牌 */
    addGameCards(cards: GameCardData[]) {
        cards.forEach((v) => {
            v.package = this.name;
            this.cards.push(v);
        });
    }

    /** 增加武将牌 */
    addGenerals(generals: GeneralData[]) {
        generals.forEach((v) => {
            if (!v) return;
            v.package.push(this.name);
            this.generals.push(v);
        });
    }
}
