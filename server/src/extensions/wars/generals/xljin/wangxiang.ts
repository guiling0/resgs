import { AreaType } from '../../../../core/area/area.type';
import { GameCard } from '../../../../core/card/card';
import {
    CardPut,
    CardSubType,
    CardSuit,
    CardType,
} from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { LoseHpEvent } from '../../../../core/event/types/event.damage';
import { MoveCardEvent } from '../../../../core/event/types/event.move';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { UseCardEvent } from '../../../../core/event/types/event.use';
import { Gender } from '../../../../core/general/general.type';
import { GamePlayer } from '../../../../core/player/player';
import { eyes_reserve } from '../../rules';

export const xl_wangxiang = sgs.General({
    name: 'xl.wangxiang',
    kingdom: 'jin',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const xiaosheng = sgs.Skill({
    name: 'xl.wangxiang.xiaosheng',
});

xiaosheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        trigger: EventTriggers.StateChanged,
        can_trigger(room, player, data: OpenEvent) {
            if (
                this.isOwner(player) &&
                data.is(sgs.DataType.OpenEvent) &&
                this.skill &&
                this.skill.sourceGeneral &&
                data.generals.includes(this.skill.sourceGeneral)
            ) {
                const open = room.getHistorys(
                    sgs.DataType.OpenEvent,
                    (v) =>
                        v !== data &&
                        v.generals.includes(this.skill.sourceGeneral)
                );
                return open.length < 1;
            }
        },
        async cost(room, data, context) {
            const { from } = context;
            const shuangli = room.treasuryArea.cards.find(
                (v) => v.name === 'shuangli'
            );
            const qunque = room.treasuryArea.cards.find(
                (v) => v.name === 'qunque'
            );
            return await room.removeCard({
                player: from,
                cards: [shuangli, qunque],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (!room.cards.find((v) => v.name === 'shuangli')) {
                        await room.createGameCard(
                            {
                                id: '00_shuangli',
                                name: 'shuangli',
                                suit: CardSuit.Diamond,
                                number: 11,
                                attr: [],
                                derived: false,
                                package: 'WarsExtraCards',
                            },
                            room.treasuryArea,
                            true
                        );
                    }
                    if (!room.cards.find((v) => v.name === 'qunque')) {
                        await room.createGameCard(
                            {
                                id: '00_qunque',
                                name: 'qunque',
                                suit: CardSuit.Club,
                                number: 12,
                                attr: [],
                                derived: false,
                                package: 'WarsExtraCards',
                            },
                            room.treasuryArea,
                            true
                        );
                    }
                },
            },
        ],
    })
);

xiaosheng.addEffect(
    sgs.TriggerEffect({
        name: 'xl.wangxiang.xiaosheng.shuangli',
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player)) {
                const _data = data.filter(
                    (d, c) =>
                        c.name === 'shuangli' &&
                        d.toArea.type === AreaType.Equip &&
                        d.toArea.player &&
                        room.differentAsKingdom(player, d.toArea.player)
                );
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `是否发动[b]孝圣[/b]，移除【双鲤】`,
                    });
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const shuangli = data.getCard(
                (d, c) =>
                    c.name === 'shuangli' &&
                    d.toArea.type === AreaType.Equip &&
                    d.toArea.player &&
                    room.differentAsKingdom(from, d.toArea.player)
            );
            if (shuangli) {
                return await room.removeCard({
                    player: from,
                    cards: [shuangli],
                    puttype: CardPut.Down,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            }
        },
    })
);

xiaosheng.addEffect(
    sgs.TriggerEffect({
        name: 'xl.wangxiang.xiaosheng.qunque',
        auto_log: 1,
        trigger: EventTriggers.MoveCardAfter2,
        can_trigger(room, player, data: MoveCardEvent) {
            if (this.isOwner(player)) {
                const _data = data.filter(
                    (d, c) =>
                        c.name === 'qunque' &&
                        d.toArea.type === AreaType.Equip &&
                        d.toArea.player &&
                        room.differentAsKingdom(player, d.toArea.player)
                );
            }
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `是否发动[b]孝圣[/b]，移除【群雀】`,
                    });
                },
            };
        },
        async cost(room, data: MoveCardEvent, context) {
            const { from } = context;
            const shuangli = data.getCard(
                (d, c) =>
                    c.name === 'qunque' &&
                    d.toArea.type === AreaType.Equip &&
                    d.toArea.player &&
                    room.differentAsKingdom(from, d.toArea.player)
            );
            if (shuangli) {
                return await room.removeCard({
                    player: from,
                    cards: [shuangli],
                    puttype: CardPut.Down,
                    source: data,
                    reason: this.name,
                    skill: this,
                });
            }
        },
    })
);

xiaosheng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.LoseHp,
        can_trigger(room, player, data: LoseHpEvent) {
            return this.isOwner(player) && data.player === player;
        },
        context(room, player, data: LoseHpEvent) {
            return {
                maxTimes: data.number,
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `孝圣：你可以交给一名角色后备区里的一张牌`,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selecte_type: 'rows',
                                selectable: room.reserveArea.cards,
                                data_rows: room.getReserveRowDatas(),
                                windowOptions: {
                                    title: '后备区',
                                    timebar: room.responseTime,
                                    prompt: `孝圣：请选择一张牌交给${target.gameName}`,
                                    buttons: ['confirm'],
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            prompt: ``,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [to],
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const card = room.getResultCards(req).at(0);
            if (card) {
                const give = await room.giveCards({
                    from,
                    to,
                    cards: [card],
                    source: data,
                    reason: this.name,
                });
                if (card.type === CardType.Equip) {
                    return card;
                }
                return give;
            }
        },
        // async effect(room, data, context) {
        //     const {
        //         from,
        //         targets: [to],
        //     } = context;
        //     const card = context.cost as GameCard;
        //     if (from !== to && card && to && card.area === to.handArea) {
        //         await room.preUseCard({
        //             from: to,
        //             card: room.createVirtualCardByOne(card),
        //             source: data,
        //             reason: this.name,
        //         });
        //     }
        // },
    })
);

xiaosheng.addEffect(sgs.copy(eyes_reserve));

export const qingda = sgs.Skill({
    name: 'xl.wangxiang.qingda',
});

qingda.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.BecomeTarget,
        getSelectors(room, context) {
            return {
                choose: () => {
                    return {
                        selectors: {
                            card: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `清达：请选择一名角色，该牌对他的势力无效`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: UseCardEvent) {
            if (
                this.isOwner(player) &&
                (data.card.name === 'sha' ||
                    data.card.subtype === CardSubType.InstantScroll) &&
                data.current.target &&
                data.current.target === player
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
                return uses.length < 1;
            }
        },
        async cost(room, data: UseCardEvent, context) {
            const { from } = context;
            return await room.losehp({
                player: from,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data: UseCardEvent, context) {
            const { from } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const player = room.getResultPlayers(req).at(0);
            if (player) {
                const players: GamePlayer[] = [];
                data.targetList.forEach((v) => {
                    if (room.sameAsKingdom(v.target, player)) {
                        players.push(v.target);
                        v.invalid = true;
                    }
                });
                room.directLine(from, players);
            }
        },
    })
);

xl_wangxiang.addSkill(xiaosheng);
xl_wangxiang.addSkill(qingda);

sgs.loadTranslation({
    ['@method:xl.wangxiang.xiaosheng.shuangli']: '移除双鲤',
    ['@method:xl.wangxiang.xiaosheng.qunque']: '移除群雀',
});
