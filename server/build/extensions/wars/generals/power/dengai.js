"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ziliang = exports.jixi = exports.tuntian = exports.dengai = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const rules_1 = require("../../rules");
exports.dengai = sgs.General({
    name: 'wars.dengai',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.tuntian = sgs.Skill({
    name: 'wars.dengai.tuntian',
});
exports.tuntian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !player.inturn &&
            data.has_lose(player, 'he'));
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                return room.createCac({
                    canCancle: true,
                    showMainButtons: true,
                    prompt: `屯田：是否将判定牌置于武将牌上`,
                    thinkPrompt: `屯田`,
                });
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.suit !== 2 /* CardSuit.Heart */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const judge = context.cost;
        const card = judge.card;
        if (judge.success && card?.area === room.discardArea) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context: {},
                },
            });
            if (req.result.cancle)
                return;
            await room.puto({
                player: from,
                cards: [card],
                toArea: from.upArea,
                source: data,
                puttype: 1 /* CardPut.Up */,
                reason: this.name,
            });
            card.setMark('mark.tian', true);
            from.setMark('mark.tian', true, {
                visible: true,
                source: this.name,
                type: 'cards',
                areaId: from.upArea.areaId,
            });
        }
    },
}));
exports.tuntian.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Correct](from, to) {
        if (this.isOwner(from)) {
            return from.getUpOrSideCards('mark.tian').length * -1;
        }
    },
}));
exports.jixi = sgs.Skill({
    name: 'wars.dengai.jixi',
});
exports.jixi.addEffect(sgs.copy(rules_1.reduce_yinyangyu, {
    tag: [2 /* SkillTag.Head */, 9 /* SkillTag.Secret */],
}));
exports.jixi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const shun = room.createVirtualCardByNone('shunshouqianyang', undefined, false);
                shun.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getUpOrSideCards('mark.tian'),
                            filter(item, selected) {
                                return true;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    shun.addSubCard(item);
                                if (type === 'remove')
                                    shun.delSubCard(item);
                                shun.set();
                                this._use_or_play_vcard = shun;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '急袭，你可以将一张“田”当【顺手牵羊】使用',
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.NeedUseCardData) &&
            data.from === player &&
            data.has('shunshouqianyang'));
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        from.refreshMark = 'mark.tian';
        return true;
    },
}));
exports.ziliang = sgs.Skill({
    name: 'wars.dengai.ziliang',
    visible(room) {
        return this.sourceGeneral === this.player.deputy;
    },
});
exports.ziliang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    tag: [3 /* SkillTag.Deputy */],
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.to &&
            data.to.alive &&
            room.sameAsKingdom(player, data.to) &&
            player.hasUpOrSideCards('mark.tian'));
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getUpOrSideCards('mark.tian'),
                            filter(item, selected) {
                                return true;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: {
                            text: `资粮：你可以将一张“田”交给[b]{0}[/b]`,
                            values: [
                                { type: 'player', value: target.playerId },
                            ],
                        },
                    },
                };
            },
        };
    },
    context(room, player, data) {
        return {
            targets: [data.to],
        };
    },
    async cost(room, data, context) {
        const { from, cards, targets: [to], } = context;
        return await room.giveCards({
            from,
            to,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, cards } = context;
        from.refreshMark = 'mark.tian';
    },
}));
exports.dengai.addSkill(exports.tuntian);
exports.dengai.addSkill(exports.jixi);
exports.dengai.addSkill(exports.ziliang);
sgs.loadTranslation({
    ['mark.tian']: '田',
});
