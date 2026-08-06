import type { VirtualCardData } from './CardTypes';

/** 富文本（纯文本或带值模板，渲染由客户端解析） */
export type RichString =
    | string
    | { text: string; values: Record<string, RichStringValue> };

/** 富文本模板值 */
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