import { AreaType } from '../../../../core/area/area.type';
import { GameCard } from '../../../../core/card/card';
import { CardPut, CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import {
    GiveCardsData,
    MoveCardEvent,
    MoveData,
} from '../../../../core/event/types/event.move';
import { Gender } from '../../../../core/general/general.type';
import { MoveCardReason } from '../../../../core/room/room.types';
import { PriorityType } from '../../../../core/skill/skill.types';

export const zhangze = sgs.General({
    name: 'xl.zhangze',
    kingdom: 'qun',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const xisui = sgs.Skill({
    name: 'xl.zhangze.xisui',
});

xisui.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamage3,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                player === data.to &&
                (!this.getData('prevent') || !this.getData('drop'))
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.from],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: [1, -1],
                                selectable: from.getHandCards(),
                                filter(item, selected) {
                                    return item.put === CardPut.Down;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `息绥，你可以将任意张手牌翻转至正面朝上`,
                            thinkPrompt: `息绥`,
                        },
                    };
                },
                choose: () => {
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: context.handles,
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: `息绥，请选择一项`,
                            thinkPrompt: `息绥`,
                        },
                    };
                },
                choose_card: () => {
                    const self = context.effect;
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
                                    return item !== self.player;
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `息绥：请分配牌，点击取消结束分配`,
                            thinkPrompt: `息绥`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const { from, cards } = context;
            cards.forEach((v) => {
                v.turnTo(CardPut.Up);
            });
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            cards.forEach((v) => {
                v.setLabel(this.name);
            });
            return true;
        },
        async effect(room, data: DamageEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (!target) return;
            const handles = ['xisui.prevent', 'xisui.drop'];
            if (this.getData('prevent')) {
                handles[0] = '!' + handles[0];
            }
            if (this.getData('drop')) {
                handles[1] = '!' + handles[1];
            }
            context.handles = handles;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            const upcards = from
                .getHandCards()
                .filter((v) => v.put === CardPut.Up);
            if (result.includes('xisui.prevent')) {
                this.setData('prevent', true);
                await data.prevent();
                const cards: { [key: string]: GameCard[] } = {};
                cards.none = upcards;
                context.cards = cards.none;
                while (cards.none.length > 0) {
                    const req = await room.doRequest({
                        player: target,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose_card'),
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
                await room.moveCards({
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
            }
            if (result.includes('xisui.drop')) {
                this.setData('drop', true);
                await room.showCards({
                    player: target,
                    cards: target.getHandCards(),
                    source: data,
                    reason: this.name,
                });
                await room.delay(1);
                const drops = target
                    .getHandCards()
                    .filter((card) =>
                        upcards.find((v) => v.suit === card.suit)
                    );
                await room.dropCards({
                    player: target,
                    cards: drops,
                    source: data,
                    reason: this.name,
                });
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.CircleStarted,
                async on_exec(room, data) {
                    this.removeData('prevent');
                    this.removeData('drop');
                },
            },
        ],
    })
);

export const qingke = sgs.Skill({
    name: 'xl.zhangze.qingke',
});

qingke.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter1,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                this.isOwner(player) &&
                data.has_filter(
                    (d, c) =>
                        (d.fromArea === player.equipArea ||
                            d.fromArea === player.handArea) &&
                        d.toArea.player &&
                        d.toArea.player !== player
                )
            );
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const cards = data.getCards(
                (d, c) =>
                    (d.fromArea === from.equipArea ||
                        d.fromArea === from.handArea) &&
                    d.toArea.player &&
                    d.toArea.player !== from
            );
            cards.forEach((v) => v.turnTo(CardPut.Up));
            await room.showCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            cards.forEach((v) => {
                v.setLabel(this.name);
            });
            return true;
        },
    })
);

qingke.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            return (
                data.has_lose(player, 'h') &&
                player.getHandCards().filter((v) => v.put === CardPut.Up)
                    .length === 0 &&
                data.data.qingke[player.playerId]
            );
        },
        context(room, player, data) {
            return {
                from: this.player,
                targets: [player],
            };
        },
        getSelectors(room, context) {
            return {
                choose_cost: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            option: room.createChooseOptions({
                                step: 1,
                                count: 1,
                                selectable: ['qingke.drop', 'qingke.draw'],
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: `清克：你可以选择一项令${target.gameName}执行`,
                            thinkPrompt: `清克`,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            cards: room.createDropCards(target, {
                                step: 1,
                                count: 1,
                                selectable: target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: '清克：请弃置一张牌',
                            thinkPrompt: `清克`,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_cost'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result as string[];
            if (result.includes('qingke.draw')) {
                return await room.drawCards({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
            if (result.includes('qingke.drop')) {
                const req = await room.doRequest({
                    player: target,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                return await room.dropCards({
                    player: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.MoveCardBefore2,
                priority: 'before',
                async on_exec(room, data) {
                    //移动牌前检测
                    if (data.is(sgs.DataType.MoveCardEvent)) {
                        data.data.qingke = {};
                        data.move_datas.forEach((v) => {
                            if (
                                v.fromArea.type === AreaType.Hand &&
                                v.cards.find((c) => c.put === CardPut.Up)
                            ) {
                                data.data.qingke[v.fromArea.player.playerId] =
                                    true;
                            }
                        });
                    }
                },
            },
        ],
    })
);

zhangze.addSkill(xisui);
zhangze.addSkill(qingke);

sgs.loadTranslation({
    ['xisui.prevent']: '防止伤害并分配牌',
    ['xisui.drop']: '展示并弃置手牌',
    ['qingke.drop']: '弃置一张牌',
    ['qingke.draw']: '摸一张牌',
});
