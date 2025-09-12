import { GameCard } from '../../card/card';
import { VirtualCardData } from '../../card/card.types';
import { ContextJsonData, GameRequestJsonData } from '../../choose/choose.json';
import { ChooseData, GameRequest } from '../../choose/choose.types';
import { General } from '../../general/general';
import { GamePlayer } from '../../player/player';
import { TriggerEffect } from '../../skill/effect';
import { TriggerEffectContext } from '../../skill/skill.types';
import { GameRoom } from '../room';

export class RoomJsonMixin {
    public toJson_Context(
        this: GameRoom,
        data: TriggerEffectContext
    ): ContextJsonData {
        const json: ContextJsonData = {};
        json.effect = data.effect?.id;
        json.from = data.from?.playerId;
        json.maxTimes = data.maxTimes;
        json.cards = this.getCardIds(data.cards);
        json.targets = this.getPlayerIds(data.targets);
        json.options = data.options;
        json.json = true;
        for (const key in data) {
            if (
                key !== 'from' &&
                key !== 'maxTimes' &&
                key !== 'cards' &&
                key !== 'targets' &&
                key !== 'options' &&
                key !== 'cost' &&
                key !== 'req_result' &&
                key !== 'req' &&
                key !== 'effect'
            ) {
                json[key] = data[key];
            }
        }
        return json;
    }

    public toData_Context(
        this: GameRoom,
        json: ContextJsonData
    ): TriggerEffectContext {
        const data: TriggerEffectContext = {};
        data.effect = this.getEffect(json.effect) as TriggerEffect;
        data.from = this.getPlayer(json.from);
        data.maxTimes = json.maxTimes;
        data.cards = this.getCards(json.cards);
        data.targets = this.getPlayers(json.targets);
        data.options = json.options;
        for (const key in json) {
            if (
                key !== 'from' &&
                key !== 'maxTimes' &&
                key !== 'cards' &&
                key !== 'targets' &&
                key !== 'options' &&
                key !== 'cost' &&
                key !== 'req_result' &&
                key !== 'req' &&
                key !== 'effect'
            ) {
                data[key] = json[key];
            }
        }
        data.json = false;
        return data;
    }

    public toJson_SelectorResult(
        this: GameRoom,
        selectors: { [key: string]: ChooseData }
    ): {
        [key: string]: { type: string; result: any[]; windowResult: string[] };
    } {
        const data: ReturnType<typeof this.toJson_SelectorResult> = {};
        Object.keys(selectors).forEach((key) => {
            const value = selectors[key];
            if (value === undefined) return;
            if (!value.result) value.result = [];
            data[key] = { type: value.type } as any;
            data[key].windowResult = value.windowResult ?? [];
            switch (value.type) {
                case 'card':
                    data[key].result = this.getCardIds(value.result);
                    break;
                case 'player':
                    data[key].result = this.getPlayerIds(value.result);
                    break;
                case 'general':
                    data[key].result = this.getGeneralIds(value.result);
                    break;
                case 'option':
                case 'vcard':
                case 'command':
                    data[key].result = value.result.slice();
                    break;
            }
        });
        return data;
    }

    public toData_SelectorResult(
        this: GameRoom,
        results: {
            [key: string]: {
                type: string;
                result: any[];
                windowResult: string[];
            };
        }
    ): {
        [key: string]: { type: string; result: any[] } & {
            windowResult: string[];
        };
    } {
        const data: ReturnType<typeof this.toData_SelectorResult> = {};
        Object.keys(results).forEach((key) => {
            const value = results[key];
            if (value === undefined) return;
            data[key] = { type: value.type } as any;
            data[key].windowResult = value.windowResult ?? [];
            switch (value.type) {
                case 'card':
                    data[key].result = this.getCards(value.result);
                    break;
                case 'player':
                    data[key].result = this.getPlayers(value.result);
                    break;
                case 'general':
                    data[key].result = this.getGenerals(value.result);
                    break;
                case 'option':
                case 'vcard':
                case 'command':
                    data[key].result = value.result.slice();
                    break;
            }
        });
        return data;
    }
}
