"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chonge = exports.xuantao_delay = exports.xuantao = exports.deshao = exports.yanghu = void 0;
const rules_1 = require("../../rules");
exports.yanghu = sgs.General({
    name: 'xl.yanghu',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.deshao = sgs.Skill({
    name: 'xl.yanghu.deshao',
});
exports.deshao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "BeOffset" /* EventTriggers.BeOffset */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.card && data.card.hasSubCards()) {
            if (data.from === player && data.current) {
                return (data.current.offset &&
                    data.current.offset.from !== player);
            }
            if (data.from !== player && data.current) {
                return (data.current.offset &&
                    data.current.offset.from === player);
            }
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.removeCard({
            player: from,
            cards: data.card.subcards,
            puttype: 1 /* CardPut.Up */,
            source: data,
            reason: this.name,
            skill: this,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const yinyangyu = room.skills.find((v) => v.player === from && v.name === 'wars.mark.yinyangyu');
        if (!yinyangyu) {
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yinyangyu',
                player: from.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yinyangyu', from, {
                source: this.name,
                showui: 'mark',
            });
        }
    },
}));
exports.xuantao = sgs.Skill({
    name: 'xl.yanghu.xuantao',
});
exports.xuantao.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            room.differentAsKingdom(player, data.executor)) {
            return room.reserveArea.cards.some((v) => {
                if (v.isDamageCard()) {
                    const vcard = room.createVirtualCardByOne(v, false);
                    vcard.clearSubCard();
                    return player.canUseCard(vcard, [data.executor], this.name, {
                        excluesCardDistanceLimit: true,
                        excluesCardTimesLimit: true,
                    });
                }
                return false;
            });
        }
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        const self = this;
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `宣讨：你可以弃置一张牌，然后弃置后备区里的一张牌，视为对${target.gameName}使用`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose: () => {
                const from = context.from;
                const target = context.targets.at(0);
                const cards = room.getReserveUpCards();
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: room.reserveArea.cards,
                            data_rows: room.getReserveRowDatas(),
                            filter(item, selected) {
                                if (!cards.includes(item))
                                    return false;
                                if (item.isDamageCard()) {
                                    const vcard = room.createVirtualCardByOne(item, false);
                                    vcard.clearSubCard();
                                    return from.canUseCard(vcard, [target], self.name, {
                                        excluesCardDistanceLimit: true,
                                        excluesCardTimesLimit: true,
                                    });
                                }
                                return false;
                            },
                            windowOptions: {
                                title: '后备区',
                                timebar: room.responseTime,
                                prompt: `宣讨：请弃置一张伤害牌，视为对${target.gameName}使用`,
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
        const { from, cards } = context;
        return await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const card = room.getResultCards(req).at(0);
        if (card) {
            await room.dropCards({
                player: from,
                cards: [card],
                source: data,
                reason: this.name,
            });
            const vcard = room.createVirtualCardByOne(card);
            vcard.clearSubCard();
            const effect = await room.addEffect('xuantao.delay', from);
            effect.setData('skill', this);
            await room.usecard({
                from,
                card: vcard,
                targets,
                source: data,
                reason: this.name,
                skill: this,
            });
        }
    },
    lifecycle: [
        {
            trigger: "CircleStarted" /* EventTriggers.CircleStarted */,
            async on_exec(room, data) {
                this.setInvalids(this.name, false);
            },
        },
    ],
}));
exports.xuantao.addEffect(sgs.copy(rules_1.eyes_reserve));
exports.xuantao_delay = sgs.TriggerEffect({
    name: 'xuantao.delay',
    audio: [],
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.source.is(sgs.DataType.UseCardEvent) &&
            data.source.skill === this.getData('skill') &&
            data.from &&
            data.from.alive);
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
        const skill = this.getData('skill');
        skill.setInvalids(skill.name, true);
        await this.removeSelf();
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.chonge = sgs.Skill({
    name: 'xl.yanghu.chonge',
});
exports.chonge.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [7 /* SkillTag.Array_Quene */],
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (room.getQueue(this.player).includes(player) &&
            data.current.target === player &&
            data.card &&
            data.card.suit !== 0 /* CardSuit.None */ &&
            (data.card.name === 'sha' || data.card.name === 'juedou'));
    },
    context(room, player, data) {
        return {
            suit: data.card.suit,
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const skill = this;
                const suit = context.suit;
                const s_suit = sgs.getTranslation(`suit${suit}`);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return (item.suit === suit &&
                                    from.canPlayCard(room.createVirtualCardByOne(item, false), skill.name));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `冲轭：你可以打出一张${s_suit}牌抵消`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        if (cards.at(0)) {
            const play = room.createVirtualCardByOne(cards.at(0));
            return await room.playcard({
                from,
                card: play,
                source: data,
                reason: this.name,
                notMoveHandle: true,
                skill: this,
            });
        }
    },
    async effect(room, data, context) {
        const play = context.cost;
        data.current.offset = play;
    },
}));
exports.chonge.addEffect(sgs.copy(sgs.common_rules.get('arraycall_queue')));
exports.yanghu.addSkill(exports.deshao);
exports.yanghu.addSkill(exports.xuantao);
exports.yanghu.addSkill(exports.chonge);
