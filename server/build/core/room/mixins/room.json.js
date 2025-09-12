"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomJsonMixin = void 0;
class RoomJsonMixin {
    toJson_Context(data) {
        const json = {};
        json.effect = data.effect?.id;
        json.from = data.from?.playerId;
        json.maxTimes = data.maxTimes;
        json.cards = this.getCardIds(data.cards);
        json.targets = this.getPlayerIds(data.targets);
        json.options = data.options;
        json.json = true;
        for (const key in data) {
            if (key !== 'from' &&
                key !== 'maxTimes' &&
                key !== 'cards' &&
                key !== 'targets' &&
                key !== 'options' &&
                key !== 'cost' &&
                key !== 'req_result' &&
                key !== 'req' &&
                key !== 'effect') {
                json[key] = data[key];
            }
        }
        return json;
    }
    toData_Context(json) {
        const data = {};
        data.effect = this.getEffect(json.effect);
        data.from = this.getPlayer(json.from);
        data.maxTimes = json.maxTimes;
        data.cards = this.getCards(json.cards);
        data.targets = this.getPlayers(json.targets);
        data.options = json.options;
        for (const key in json) {
            if (key !== 'from' &&
                key !== 'maxTimes' &&
                key !== 'cards' &&
                key !== 'targets' &&
                key !== 'options' &&
                key !== 'cost' &&
                key !== 'req_result' &&
                key !== 'req' &&
                key !== 'effect') {
                data[key] = json[key];
            }
        }
        data.json = false;
        return data;
    }
    toJson_SelectorResult(selectors) {
        const data = {};
        Object.keys(selectors).forEach((key) => {
            const value = selectors[key];
            if (value === undefined)
                return;
            if (!value.result)
                value.result = [];
            data[key] = { type: value.type };
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
    toData_SelectorResult(results) {
        const data = {};
        Object.keys(results).forEach((key) => {
            const value = results[key];
            if (value === undefined)
                return;
            data[key] = { type: value.type };
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
exports.RoomJsonMixin = RoomJsonMixin;
