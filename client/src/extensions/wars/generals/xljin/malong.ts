import { GameCard } from '../../../../core/card/card';
import { CardPut, CardSuit } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { OpenEvent } from '../../../../core/event/types/event.state';
import { Gender } from '../../../../core/general/general.type';
import { Phase } from '../../../../core/player/player.types';
import { MoveCardReason } from '../../../../core/room/room.types';
import {
    PriorityType,
    StateEffectType,
} from '../../../../core/skill/skill.types';
import { eyes_reserve } from '../../rules';

export const malong = sgs.General({
    name: 'xl.malong',
    kingdom: 'jin',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const woqi = sgs.Skill({
    name: 'xl.malong.woqi',
});

woqi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        audio: ['xl/xl.malong/woqi1'],
        trigger: EventTriggers.Opened,
        can_trigger(room, player, data: OpenEvent) {
            if (
                this.isOwner(player) &&
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
            const cishizhen = room.treasuryArea.cards.find(
                (v) => v.name === 'cishizhen'
            );
            const xijia = room.treasuryArea.cards.find(
                (v) => v.name === 'xijia'
            );
            const pianxiangche = room.treasuryArea.cards.find(
                (v) => v.name === 'pianxiangche'
            );
            const bazhenzongshu = room.treasuryArea.cards.find(
                (v) => v.name === 'bazhenzongshu'
            );
            return await room.removeCard({
                player: from,
                cards: [cishizhen, xijia, pianxiangche, bazhenzongshu],
                puttype: CardPut.Down,
                source: data,
                reason: this.name,
                skill: this,
            });
        },
        async effect(room, data, context) {
            const { from } = context;
            const card = room.reserveArea.cards.find(
                (v) => v.name === 'bazhenzongshu'
            );
            if (card) {
                await room.preUseCard({
                    from,
                    card: room.createVirtualCardByOne(card),
                    source: data,
                    reason: this.name,
                });
                room.broadcast({
                    type: 'None',
                    audio: 'generals/xl/xl.malong/woqi5.mp3',
                });
            }
        },
        lifecycle: [
            {
                trigger: EventTriggers.onObtain,
                async on_exec(room, data) {
                    if (!room.cards.find((v) => v.name === 'cishizhen')) {
                        await room.createGameCard(
                            {
                                id: '00_cishizhen',
                                name: 'cishizhen',
                                suit: CardSuit.Spade,
                                number: 10,
                                attr: [],
                                derived: false,
                                package: 'WarsExtraCards',
                            },
                            room.treasuryArea,
                            true
                        );
                    }
                    if (!room.cards.find((v) => v.name === 'xijia')) {
                        await room.createGameCard(
                            {
                                id: '00_xijia',
                                name: 'xijia',
                                suit: CardSuit.Heart,
                                number: 7,
                                attr: [],
                                derived: false,
                                package: 'WarsExtraCards',
                            },
                            room.treasuryArea,
                            true
                        );
                    }
                    if (!room.cards.find((v) => v.name === 'pianxiangche')) {
                        await room.createGameCard(
                            {
                                id: '00_pianxiangche',
                                name: 'pianxiangche',
                                suit: CardSuit.Club,
                                number: 2,
                                attr: [],
                                derived: false,
                                package: 'WarsExtraCards',
                            },
                            room.treasuryArea,
                            true
                        );
                    }
                    if (!room.cards.find((v) => v.name === 'bazhenzongshu')) {
                        await room.createGameCard(
                            {
                                id: '00_bazhenzongshu',
                                name: 'bazhenzongshu',
                                suit: CardSuit.Diamond,
                                number: 8,
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

woqi.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        audio: [],
        priorityType: PriorityType.General,
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data) {
            return (
                this.isOwner(player) &&
                data.is(sgs.DataType.PhaseEvent) &&
                data.phase === Phase.Ready &&
                data.executor === player
            );
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const allcards: GameCard[] = [];
                    allcards.push(...room.reserveArea.cards);
                    room.players.forEach((v) => {
                        allcards.push(...v.getEquipCards());
                    });
                    allcards.push(...from.getHandCards());
                    const equips = allcards.filter(
                        (v) =>
                            v.name === 'cishizhen' ||
                            v.name === 'xijia' ||
                            v.name === 'pianxiangche' ||
                            v.name === 'bazhenzongshu'
                    );
                    return {
                        selectors: {
                            card: room.createChooseCard({
                                step: 1,
                                count: 1,
                                selectable: equips,
                            }),
                            player: room.createChoosePlayer({
                                step: 2,
                                count: 1,
                                filter(item, selected) {
                                    const card =
                                        this.selectors.card.result.at(0);
                                    if (!card) return false;
                                    return !item
                                        .getEquipCards()
                                        .find((v) => v === card);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `握奇：你可以将一张专属装备置入一名与你势力相同的角色的装备区（替换原装备）`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                cards: [equip],
                targets: [target],
            } = context;
            if (!equip || !target) return false;
            if (equip.name === 'cishizhen') {
                room.broadcast({
                    type: 'None',
                    audio: 'generals/xl/xl.malong/woqi2.mp3',
                });
            }
            if (equip.name === 'xijia') {
                room.broadcast({
                    type: 'None',
                    audio: 'generals/xl/xl.malong/woqi3.mp3',
                });
            }
            if (equip.name === 'pianxiangche') {
                room.broadcast({
                    type: 'None',
                    audio: 'generals/xl/xl.malong/woqi4.mp3',
                });
            }
            if (equip.name === 'bazhenzongshu') {
                room.broadcast({
                    type: 'None',
                    audio: 'generals/xl/xl.malong/woqi5.mp3',
                });
            }
            const old_equip = target.getEquip(equip.subtype as any);
            if (old_equip) {
                return await this.room.moveCards({
                    source: data,
                    reason: this.name,
                    move_datas: [
                        {
                            cards: [old_equip],
                            toArea: this.room.discardArea,
                            reason: MoveCardReason.PutTo,
                        },
                        {
                            cards: [equip],
                            toArea: target.equipArea,
                            reason: MoveCardReason.PutTo,
                        },
                    ],
                    getMoveLabel: (data) => {
                        if (data.reason === MoveCardReason.PutTo) {
                            return {
                                text: '#Move_PutTo',
                                values: [
                                    {
                                        type: 'player',
                                        value: from.playerId,
                                    },
                                    {
                                        type: 'area',
                                        value: data.toArea.areaId,
                                    },
                                ],
                            };
                        }
                    },
                });
            } else {
                return await this.room.moveCards({
                    source: data,
                    reason: this.name,
                    move_datas: [
                        {
                            cards: [equip],
                            toArea: target.equipArea,
                            reason: MoveCardReason.PutTo,
                        },
                    ],
                    getMoveLabel: (data) => {
                        if (data.reason === MoveCardReason.PutTo) {
                            return {
                                text: '#Move_PutTo',
                                values: [
                                    {
                                        type: 'player',
                                        value: from.playerId,
                                    },
                                    {
                                        type: 'area',
                                        value: data.toArea.areaId,
                                    },
                                ],
                            };
                        }
                    },
                });
            }
        },
    })
);

woqi.addEffect(sgs.copy(eyes_reserve));

export const zhendian = sgs.Skill({
    name: 'xl.malong.zhendian',
});

zhendian.addEffect(
    sgs.StateEffect({
        [StateEffectType.Regard_ArrayCondition](from, to, type) {
            if (
                type === 'quene' &&
                this.player &&
                this.player.inturn &&
                this.room.sameAsKingdom(this.player, from) &&
                this.room.sameAsKingdom(from, to)
            ) {
                return true;
            }
        },
    })
);

malong.addSkill(woqi);
malong.addSkill(zhendian);
