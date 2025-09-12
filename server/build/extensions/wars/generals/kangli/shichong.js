"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cefa = exports.haoshe = exports.shichong = void 0;
const rules_1 = require("../../rules");
exports.shichong = sgs.General({
    name: 'xl.shichong',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.haoshe = sgs.Skill({
    name: 'xl.shichong.haoshe',
});
exports.haoshe.addEffect(sgs.StateEffect({
    regard_skill(room, player, data) {
        if (this.isOwner(player)) {
            const cards = room
                .getReserveUpCards()
                .filter((v) => v.type === 3 /* CardType.Equip */);
            const max = Math.max(...cards.map((v) => v.number));
            return cards.filter((v) => v.number === max).map((v) => v.name);
        }
    },
    lifecycle: [
        {
            trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
            priority: 'after',
            async on_exec(room, data) {
                const skills = this.regardSkills.get(this.player)?.slice();
                if (!skills)
                    return;
                const cards = room
                    .getReserveUpCards()
                    .filter((v) => v.type === 3 /* CardType.Equip */);
                const max = Math.max(...cards.map((v) => v.number));
                for (const skill of skills) {
                    const card = cards.find((v) => v.name === skill.name);
                    if (!card || card.number !== max) {
                        lodash.remove(this.regardSkills.get(this.player), skill);
                        await skill.removeSelf();
                    }
                }
            },
        },
    ],
}));
exports.haoshe.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.card &&
            data.card.type === 3 /* CardType.Equip */ &&
            room
                .getReserveUpCards()
                .find((v) => v.subtype === data.card.subtype));
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: target.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `豪奢：你需要移除一张牌，或点击取消装备牌对你无效`,
                        thinkPrompt: '豪奢',
                    },
                };
            },
            choose2: () => {
                const from = context.from;
                const cards = room.getReserveUpCards();
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: room.reserveArea.cards,
                            data_rows: room.getReserveRowDatas(),
                            filter(item, selected) {
                                console.log(item.subtype === context.subtype);
                                return (cards.includes(item) &&
                                    item.subtype === context.subtype);
                            },
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `豪奢：请弃置一张相同副类别的装备牌`,
                                buttons: ['confirm'],
                            },
                        }, false),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: ``,
                        thinkPrompt: '豪奢',
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        if (cards.length) {
            await room.removeCard({
                player: target,
                cards,
                puttype: 1 /* CardPut.Up */,
                source: data,
                reason: this.name,
                skill: this,
            });
        }
        else {
            data.removeTarget(data.from);
            context.subtype = data.card.subtype;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose2'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.haoshe.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.cefa = sgs.Skill({
    name: 'xl.shichong.cefa',
});
exports.cefa.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.isOwner(player)) {
            const damages = room.getHistorys(sgs.DataType.DamageEvent, (v) => v.from === player, room.currentTurn);
            return damages.length > 0;
        }
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item.hasCardsInArea(true);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `策伐，你可以移存一名角色区域里的一张牌`,
                        thinkPrompt: '策伐',
                    },
                };
            },
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getAreaCards(),
                            data_rows: target.getCardsToArea('hej'),
                            windowOptions: {
                                title: '策伐',
                                timebar: room.responseTime,
                                prompt: `策伐：请选择一张牌`,
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '策伐',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        return await room.removeCard({
            player: from,
            cards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
}));
exports.cefa.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.shichong.addSkill(exports.haoshe);
exports.shichong.addSkill(exports.cefa);
