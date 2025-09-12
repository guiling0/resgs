"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhendian = exports.woqi = exports.malong = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const rules_1 = require("../../rules");
exports.malong = sgs.General({
    name: 'xl.malong',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.woqi = sgs.Skill({
    name: 'xl.malong.woqi',
});
exports.woqi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: ['xl/xl.malong/woqi1'],
    trigger: "Opened" /* EventTriggers.Opened */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            this.skill &&
            this.skill.sourceGeneral &&
            data.generals.includes(this.skill.sourceGeneral)) {
            const open = room.getHistorys(sgs.DataType.OpenEvent, (v) => v !== data &&
                v.generals.includes(this.skill.sourceGeneral));
            return open.length < 1;
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        const cishizhen = room.treasuryArea.cards.find((v) => v.name === 'cishizhen');
        const xijia = room.treasuryArea.cards.find((v) => v.name === 'xijia');
        const pianxiangche = room.treasuryArea.cards.find((v) => v.name === 'pianxiangche');
        const bazhenzongshu = room.treasuryArea.cards.find((v) => v.name === 'bazhenzongshu');
        return await room.removeCard({
            player: from,
            cards: [cishizhen, xijia, pianxiangche, bazhenzongshu],
            puttype: 2 /* CardPut.Down */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const card = room.reserveArea.cards.find((v) => v.name === 'bazhenzongshu');
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
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                if (!room.cards.find((v) => v.name === 'cishizhen')) {
                    await room.createGameCard({
                        id: '00_cishizhen',
                        name: 'cishizhen',
                        suit: 1 /* CardSuit.Spade */,
                        number: 10,
                        attr: [],
                        derived: false,
                        package: 'WarsExtraCards',
                    }, room.treasuryArea, true);
                }
                if (!room.cards.find((v) => v.name === 'xijia')) {
                    await room.createGameCard({
                        id: '00_xijia',
                        name: 'xijia',
                        suit: 2 /* CardSuit.Heart */,
                        number: 7,
                        attr: [],
                        derived: false,
                        package: 'WarsExtraCards',
                    }, room.treasuryArea, true);
                }
                if (!room.cards.find((v) => v.name === 'pianxiangche')) {
                    await room.createGameCard({
                        id: '00_pianxiangche',
                        name: 'pianxiangche',
                        suit: 3 /* CardSuit.Club */,
                        number: 2,
                        attr: [],
                        derived: false,
                        package: 'WarsExtraCards',
                    }, room.treasuryArea, true);
                }
                if (!room.cards.find((v) => v.name === 'bazhenzongshu')) {
                    await room.createGameCard({
                        id: '00_bazhenzongshu',
                        name: 'bazhenzongshu',
                        suit: 4 /* CardSuit.Diamond */,
                        number: 8,
                        attr: [],
                        derived: false,
                        package: 'WarsExtraCards',
                    }, room.treasuryArea, true);
                }
            },
        },
    ],
}));
exports.woqi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    audio: [],
    priorityType: 1 /* PriorityType.General */,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.PhaseEvent) &&
            data.phase === 1 /* Phase.Ready */ &&
            data.executor === player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const allcards = [];
                allcards.push(...room.reserveArea.cards);
                room.players.forEach((v) => {
                    allcards.push(...v.getEquipCards());
                });
                allcards.push(...from.getHandCards());
                const equips = allcards.filter((v) => v.name === 'cishizhen' ||
                    v.name === 'xijia' ||
                    v.name === 'pianxiangche' ||
                    v.name === 'bazhenzongshu');
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
                                const card = this.selectors.card.result.at(0);
                                if (!card)
                                    return false;
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
        const { from, cards: [equip], targets: [target], } = context;
        if (!equip || !target)
            return false;
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
        const old_equip = target.getEquip(equip.subtype);
        if (old_equip) {
            return await this.room.moveCards({
                source: data,
                reason: this.name,
                move_datas: [
                    {
                        cards: [old_equip],
                        toArea: this.room.discardArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                    },
                    {
                        cards: [equip],
                        toArea: target.equipArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                    },
                ],
                getMoveLabel: (data) => {
                    if (data.reason === 1 /* MoveCardReason.PutTo */) {
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
        else {
            return await this.room.moveCards({
                source: data,
                reason: this.name,
                move_datas: [
                    {
                        cards: [equip],
                        toArea: target.equipArea,
                        reason: 1 /* MoveCardReason.PutTo */,
                    },
                ],
                getMoveLabel: (data) => {
                    if (data.reason === 1 /* MoveCardReason.PutTo */) {
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
}));
exports.woqi.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.zhendian = sgs.Skill({
    name: 'xl.malong.zhendian',
});
exports.zhendian.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Regard_ArrayCondition](from, to, type) {
        if (type === 'quene' &&
            this.player &&
            this.player.inturn &&
            this.room.sameAsKingdom(this.player, from) &&
            this.room.sameAsKingdom(from, to)) {
            return true;
        }
    },
}));
exports.malong.addSkill(exports.woqi);
exports.malong.addSkill(exports.zhendian);
