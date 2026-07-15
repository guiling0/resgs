import { GameCardData } from '../card/CardTypes.js';

export interface CardPackData {
    name: string;
    cards: GameCardData[];
}

export interface GeneralPackData {
    name: string;
    subpacks: {
        name: string;
        json: string[];
        icon: string;
        generals: string[];
    }[];
}
