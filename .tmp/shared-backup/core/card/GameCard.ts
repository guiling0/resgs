import { MapSchema } from '@colyseus/schema';
import { MarkHost, MarkMethods } from '../mark/MarkTypes';
import { Room } from '../room/Room';
import { CardState } from '../schema/CardState';
import {
    AreaId,
    CardAttr,
    CardColor,
    CardNumber,
    CardSuit,
    GameCardData,
    GameCardId,
    getCardSubType,
    getCardType,
    getColorBySuit,
    VirtualCardData,
} from './CardTypes';
import { VirtualCard } from './VirtualCard';
import { MarkState } from '../schema/MarkState';
import { RichString } from '../RichText';
import { CardMethods, ICard } from './CardMethods';

export class GameCard implements MarkHost, ICard {
    readonly id: GameCardId;
    readonly room: Room;
    readonly _jsonData: GameCardData;
    readonly state: CardState;
    readonly data: Record<string, any> = {};
    readonly marksMap: MapSchema<MarkState>;
    readonly _markKeyMap = new Map<string, Set<string>>();

    readonly sourceData: {
        id: GameCardId;
        name: string;
        suit: CardSuit;
        color: CardColor;
        number: CardNumber;
        attr: CardAttr[];
    };

    public vcard?: VirtualCard;

    constructor(data: GameCardData, room: Room, state: CardState) {
        this.id = data.id;
        this.room = room;
        this._jsonData = data;
        this.state = state;
        this.state.id = data.id;
        this.marksMap = state.markStates;
        this.sourceData = {
            id: data.id,
            name: data.name,
            suit: data.suit,
            color: data.color ?? getColorBySuit(data.suit),
            number: data.number,
            attr: [...data.attr],
        };
    }

    setMark = MarkMethods.setMark;
    getMark = MarkMethods.getMark;
    removeMark = MarkMethods.removeMark;
    hasMark = MarkMethods.hasMark;
    countMark = MarkMethods.countMark;
    pushMark = MarkMethods.pushMark;
    unpushMark = MarkMethods.unpushMark;
    clearMark = MarkMethods.clearMark;

    get name() {
        return this.sourceData.name;
    }

    get suit() {
        return this.sourceData.suit;
    }

    get color() {
        return this.sourceData.color;
    }

    get number() {
        return this.sourceData.number;
    }

    get attr() {
        return this.sourceData.attr;
    }

    get type() {
        return getCardType(this.name);
    }

    get subtype() {
        return getCardSubType(this.name);
    }

    get derived() {
        return this._jsonData.derived;
    }

    get area(): AreaId {
        return this.state.area;
    }

    get put() {
        return this.state.put;
    }

    setArea(area: AreaId) {
        this.state.area = area;
    }

    turnTo(put: boolean) {
        this.state.put = put;
    }

    setLabel(label: RichString, area?: string) {
        if (area && area !== this.area) {
            return;
        }
        this.data.label = label;
    }

    hasAttr = CardMethods.hasAttr;
    isCommonSha = CardMethods.isCommonSha;
    isDamageCard = CardMethods.isDamageCard;
    isRecoverCard = CardMethods.isRecoverCard;
    isBasic = CardMethods.isBasic;
    isScroll = CardMethods.isScroll;
    isEquip = CardMethods.isEquip;
    isDelayedScroll = CardMethods.isDelayedScroll;
    isInstantScroll = CardMethods.isInstantScroll;
    isWeapon = CardMethods.isWeapon;
    isArmor = CardMethods.isArmor;
    isDefensiveMount = CardMethods.isDefensiveMount;
    isOffensiveMount = CardMethods.isOffensiveMount;
    isSpecialMount = CardMethods.isSpecialMount;
    isTreasure = CardMethods.isTreasure;
    isMount = CardMethods.isMount;

    formatVirtualCardData(source: boolean = false): VirtualCardData {
        return {
            name: source ? this.sourceData.name : this.name,
            suit: source ? this.sourceData.suit : this.suit,
            color: source ? this.sourceData.color : this.color,
            number: source ? this.sourceData.number : this.number,
            attr: source ? this.sourceData.attr : this.attr,
            subcards: [this.id],
            data: {},
        };
    }
}
