import { VirtualCardData } from './card/CardTypes';

export type RichString =
    | string
    | { text: string; values: Record<string, RichStringValue> };

export type RichStringValue =
    | { player: string }
    | { players: string[] }
    | { card: string }
    | { cards: string[] }
    | { number: number }
    | { text: RichString }
    | { texts: RichString[] }
    | { cardData: string }
    | { cardDatas: string[] }
    | { vcard: VirtualCardData }
    | { vcards: VirtualCardData[] }
    | { area: string };
