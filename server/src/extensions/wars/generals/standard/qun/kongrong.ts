import { GameCard } from '../../../../../core/card/card';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import {
    GiveCardsData,
    MoveCardEvent,
    MoveData,
} from '../../../../../core/event/types/event.move';
import { Gender } from '../../../../../core/general/general.type';
import { MoveCardReason } from '../../../../../core/room/room.types';
import { SkillTag } from '../../../../../core/skill/skill.types';

export const kongrong = sgs.General({
    name: 'wars.kongrong',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const mingshi = sgs.Skill({
    name: 'wars.kongrong.mingshi',
});

mingshi.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        trigger: EventTriggers.InflictDamage2,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to === player &&
                data.from &&
                data.from.hasNoneOpen()
            );
        },
        async cost(room, data: DamageEvent, context) {
            data.number--;
            return true;
        },
    })
);

export const lirang = sgs.Skill({
    name: 'wars.kongrong.lirang',
});

lirang.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.filter(
                    (v) =>
                        v.reason === MoveCardReason.DisCard &&
                        player.isOnwerCardArea(v.fromArea)
                ).length > 0
            );
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
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards: { [key: string]: GameCard[] } = {};
            cards.none = [];
            data.move_datas.forEach((v) => {
                if (
                    from.isOnwerCardArea(v.fromArea) &&
                    v.reason === MoveCardReason.DisCard
                ) {
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
                if (!player || !rcards.length) break;
                if (!cards[player.playerId]) {
                    cards[player.playerId] = rcards;
                } else {
                    cards[player.playerId].push(...rcards);
                }
                rcards.forEach((v) =>
                    lodash.remove(cards.none, (c) => c === v)
                );
                if (cards.none.length === 0) break;
            }

            const gives: GiveCardsData[] = [];
            Object.keys(cards).forEach((key) => {
                if (key === 'none') return;
                const to = room.getPlayer(key);
                if (!to) return;
                gives.push(
                    room.createEventData(sgs.DataType.GiveCardsData, {
                        from: from,
                        to,
                        cards: cards[key],
                        source: data,
                        reason: this.name,
                    })
                );
            });
            return await room.moveCards({
                move_datas: gives.map((v) => {
                    return {
                        cards: v.cards,
                        toArea: v.to.handArea,
                        reason: MoveCardReason.Give,
                        _data: v,
                    };
                }),
                getMoveLabel: (data: MoveData) => {
                    return data._data?.getMoveLabel(data);
                },
                log: (data: MoveData) => {
                    return data._data?.getLog(data);
                },
                source: data,
                reason: this.name,
            });
        },
    })
);

kongrong.addSkill(mingshi);
kongrong.addSkill(lirang);
