"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lirang = exports.mingshi = exports.kongrong = void 0;
exports.kongrong = sgs.General({
    name: 'wars.kongrong',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.mingshi = sgs.Skill({
    name: 'wars.kongrong.mingshi',
});
exports.mingshi.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to === player &&
            data.from &&
            data.from.hasNoneOpen());
    },
    async cost(room, data, context) {
        data.number--;
        return true;
    },
}));
exports.lirang = sgs.Skill({
    name: 'wars.kongrong.lirang',
});
exports.lirang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.filter((v) => v.reason === 6 /* MoveCardReason.DisCard */ &&
                player.isOnwerCardArea(v.fromArea)).length > 0);
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const from = context.from;
                const cards = context.cards;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: [1, -1],
                            selectable: cards,
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `礼让：请分配牌，点击取消不分配`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = {};
        cards.none = [];
        data.move_datas.forEach((v) => {
            if (from.isOnwerCardArea(v.fromArea) &&
                v.reason === 6 /* MoveCardReason.DisCard */) {
                cards.none.push(...v.cards);
            }
        });
        context.cards = cards.none;
        while (cards.none.length > 0) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const rcards = room.getResultCards(req);
            const player = room.getResultPlayers(req).at(0);
            if (!player || !rcards.length)
                break;
            if (!cards[player.playerId]) {
                cards[player.playerId] = rcards;
            }
            else {
                cards[player.playerId].push(...rcards);
            }
            rcards.forEach((v) => lodash.remove(cards.none, (c) => c === v));
            if (cards.none.length === 0)
                break;
        }
        const gives = [];
        Object.keys(cards).forEach((key) => {
            if (key === 'none')
                return;
            const to = room.getPlayer(key);
            if (!to)
                return;
            gives.push(room.createEventData(sgs.DataType.GiveCardsData, {
                from: from,
                to,
                cards: cards[key],
                source: data,
                reason: this.name,
            }));
        });
        return await room.moveCards({
            move_datas: gives.map((v) => {
                return {
                    cards: v.cards,
                    toArea: v.to.handArea,
                    reason: 7 /* MoveCardReason.Give */,
                    _data: v,
                };
            }),
            getMoveLabel: (data) => {
                return data._data?.getMoveLabel(data);
            },
            log: (data) => {
                return data._data?.getLog(data);
            },
            source: data,
            reason: this.name,
        });
    },
}));
exports.kongrong.addSkill(exports.mingshi);
exports.kongrong.addSkill(exports.lirang);
