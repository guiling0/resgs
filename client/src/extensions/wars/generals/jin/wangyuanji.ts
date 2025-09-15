import { GameCard } from '../../../../core/card/card';
import { VirtualCardData } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';

export const wangyuanji = sgs.General({
    name: 'wars.wangyuanji',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const yanxi = sgs.Skill({
    name: 'wars.wangyuanji.yanxi',
});

yanxi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return this.isOwner(player) && data.isOwner(player);
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: [1, 3],
                                filter(item, selected) {
                                    return (
                                        room.isOtherKingdom(from, item) &&
                                        item.hasHandCards()
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `宴戏：你可以选择至多三名与你势力不同的角色，选择他们的各一张牌`,
                            thinkPrompt: `宴戏`,
                        },
                    };
                },
                choose_card: () => {
                    const target = room.getPlayer(context.current);
                    return {
                        selectors: {
                            cards: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: target.getAreaCards(),
                                data_rows: target.getCardsToArea('h'),
                                windowOptions: {
                                    title: '宴戏',
                                    timebar: room.responseTime,
                                    prompt: '宴戏：请选择一张牌',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: '',
                            thinkPrompt: `宴戏`,
                        },
                    };
                },
                declare_card: () => {
                    const vcards: VirtualCardData[] = [];
                    vcards.push(context.card_data);
                    room.cardNames.forEach((v) => {
                        vcards.push(...room.createVData({ name: v }, false));
                    });
                    return {
                        selectors: {
                            card: room.createChooseVCard({
                                step: 1,
                                count: 1,
                                selectable: vcards,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '宴戏',
                                    timebar: room.responseTime,
                                    prompt: '宴戏：请声明一个牌名（第一张为你被选择的牌）',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: `宴戏`,
                        },
                    };
                },
                choose_result: () => {
                    const targets = context.targets;
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return targets.includes(item);
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `宴戏：请选择一名角色展示他被你选中的牌并获得`,
                            thinkPrompt: `宴戏`,
                        },
                    };
                },
            };
        },
        async effect(room, data, context) {
            const { from, targets } = context;
            const _cards = new Map<GamePlayer, GameCard>();
            const _declare = new Map<GamePlayer, string>();
            const length = targets.length;
            //选择牌
            for (let i = 0; i < length; i++) {
                const player = targets[i];
                context.current = player.playerId;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_card'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                _cards.set(player, cards.at(0));
            }
            delete context.current;
            //声明牌
            for (let i = 0; i < length; i++) {
                const player = targets[i];
                const card = _cards.get(player);
                if (!card) continue;
                context.card_data = card.formatVdata();
                const req = await room.doRequest({
                    player,
                    get_selectors: {
                        selectorId: this.getSelectorName('declare_card'),
                        context,
                    },
                });
                const result = room
                    .getResult(req, 'card')
                    .result.at(0) as VirtualCardData;
                const name = result && result.name ? result.name : 'sha';
                _declare.set(player, name);
                room.broadcast({
                    type: 'MsgGameChat',
                    player: player.playerId,
                    text: `(宴戏)${sgs.getTranslation(name)}`,
                    log: {
                        text: `yanxi.log`,
                        values: [
                            { type: 'player', value: player.playerId },
                            { type: 'string', value: name },
                        ],
                    },
                });
            }
            delete context.card_data;
            context.targets = context.targets.filter((v) => _declare.has(v));
            //选择牌获得
            const req_to = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_result'),
                    context,
                },
            });
            const player = room.getResultPlayers(req_to).at(0);
            if (player) {
                const card = _cards.get(player);
                await room.showCards({
                    player,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
                await room.obtainCards({
                    player: from,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
                const name = _declare.get(player);
                if (card.name !== name) {
                    await room.obtainCards({
                        player: from,
                        cards: [..._cards.values()],
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const shiren = sgs.Skill({
    name: 'wars.wangyuanji.shiren',
});
shiren.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.to &&
                player !== data.to &&
                data.to.isNoneKingdom() &&
                !this.getData(this.name)
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const targets = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 2,
                                selectable: from.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `识人：你可以交给${targets.gameName}两张牌，然后摸两张牌`,
                            thinkPrompt: '识人',
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
                cards,
            } = context;
            return await room.giveCards({
                from,
                to,
                cards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            this.setData(this.name, true);
            await room.drawCards({
                player: from,
                count: 2,
                source: data,
                reason: this.name,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.TurnEnded,
                priority: 'after',
                async on_exec(room, data) {
                    this.removeData(this.name);
                },
            },
        ],
    })
);

wangyuanji.addSkill(yanxi);
wangyuanji.addSkill(shiren);

sgs.loadTranslation({
    ['yanxi.log']: '[b][color=#008000]{0}[/color][/b] 宴戏声明了：{1}',
});
