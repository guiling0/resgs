"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shenpin = exports.zhimie = exports.weiguan = void 0;
exports.weiguan = sgs.General({
    name: 'xl.weiguan',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhimie = sgs.Skill({
    name: 'xl.weiguan.zhimie',
});
exports.zhimie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            data.from === player &&
            data.targetCount === 1 &&
            data.card &&
            data.card.subtype === 21 /* CardSubType.InstantScroll */) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(player, 4 /* Phase.Play */))
                return false;
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    context(room, player, data) {
        return {
            targets: [...data.targets],
            card: data.card.vdata,
        };
    },
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                const card = context.card;
                const vcard = room.createVirtualCardByData(card, true, false);
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: [1, 3],
                            filter(item, selected) {
                                return (item.chained &&
                                    !targets.includes(item) &&
                                    from.canUseCard(vcard, [item], skill.name, {
                                        excluesCardTimesLimit: true,
                                        excluesCardDistanceLimit: true,
                                    }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `智灭：你可以令至多三名横置的角色也成为此牌的目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets } = context;
        return await data.becomTarget(targets);
    },
}));
exports.shenpin = sgs.Skill({
    name: 'xl.weiguan.shenpin',
});
exports.shenpin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "BeOffset" /* EventTriggers.BeOffset */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            data.card.color === 2 /* CardColor.Black */ &&
            data.current.offset &&
            data.current.offset.from !== player);
    },
    context(room, player, data) {
        return {
            targets: [data.current.offset.from],
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        return await room.chain({
            player: target,
            to_state: true,
            source: data,
            reason: this.name,
        });
    },
}));
exports.shenpin.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.current.target === player &&
            data.card &&
            data.card.color === 2 /* CardColor.Black */);
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
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
                        prompt: '神品：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
            choose_card: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 2,
                            selectable: target.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: '神品：请弃置两张牌',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [target], } = context;
        const handles = ['shenpin.cancle'];
        if (target.chained) {
            if (target.hasCanDropCards('he', target, 2, this.name)) {
                handles.push('shenpin.drop');
            }
            else {
                handles.push('!shenpin.drop');
            }
        }
        else {
            handles.push('shenpin.chain');
        }
        context.handles = handles;
        const req = await room.doRequest({
            player: target,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context: {
                    handles,
                },
            },
        });
        const result = room.getResult(req, 'option').result;
        if (result.includes('shenpin.cancle')) {
            return await data.cancleCurrent();
        }
        if (result.includes('shenpin.chain')) {
            return await room.chain({
                player: target,
                to_state: true,
                source: data,
                reason: this.name,
            });
        }
        if (result.includes('shenpin.drop')) {
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_card'),
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
}));
exports.weiguan.addSkill(exports.zhimie);
exports.weiguan.addSkill(exports.shenpin);
sgs.loadTranslation({
    ['shenpin.cancle']: '取消目标',
    ['shenpin.chain']: '横置',
    ['shenpin.drop']: '弃置两张牌',
});
