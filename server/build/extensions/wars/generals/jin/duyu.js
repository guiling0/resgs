"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pozhu = exports.sanchen = exports.duyu = void 0;
const rules_1 = require("../../rules");
exports.duyu = sgs.General({
    name: 'wars.duyu',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.sanchen = sgs.Skill({
    name: 'wars.duyu.sanchen',
});
exports.sanchen.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player) &&
            !player.hasNoneOpen());
    },
    context(room, player, data) {
        return {
            maxTimes: -1,
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
                            filter(item, selected) {
                                return !item.hasMark('mark.sanchen');
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `发动技能三陈：选择一名角色令其摸三张牌再弃置三张牌`,
                        thinkPrompt: `三陈`,
                    },
                };
            },
            choose: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createDropCards(target, {
                            step: 1,
                            count: 3,
                            selectable: target.getSelfCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `三陈：你需要弃置三张牌`,
                        thinkPrompt: `三陈`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets: [player], } = context;
        player.setMark('mark.sanchen', true);
        return await room.drawCards({
            player,
            count: 3,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [player], } = context;
        const req = await room.doRequest({
            player,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = room.getResultCards(req);
        const drop = await room.dropCards({
            player,
            cards,
            source: data,
            reason: this.name,
        });
        if (drop) {
            const cards = drop.getCards((v) => true);
            const types = {};
            let same = false;
            cards.forEach((v) => {
                if (types[v.type]) {
                    same = true;
                    return false;
                }
                else {
                    types[v.type] = true;
                }
            });
            if (same && this.skill) {
                await room.close({
                    player: from,
                    generals: [this.skill.sourceGeneral],
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                if (this.isOwner(data.player)) {
                    room.players.forEach((v) => v.removeMark('mark.sanchen'));
                }
            },
        },
    ],
}));
exports.pozhu = sgs.Skill({
    name: 'wars.duyu.pozhu',
});
exports.pozhu.addEffect(sgs.copy(rules_1.reduce_yinyangyu, {
    tag: [2 /* SkillTag.Head */, 9 /* SkillTag.Secret */],
}));
exports.pozhu.addEffect(sgs.TriggerEffect({
    tag: [2 /* SkillTag.Head */],
    auto_log: 1,
    forced: 'cost',
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            choose_card: () => {
                const from = context.from;
                const sha = room.createVirtualCardByNone('sha', undefined, false);
                sha.custom.method = 1;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return true;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    sha.addSubCard(item);
                                if (type === 'remove')
                                    sha.delSubCard(item);
                                sha.set({ attr: [] });
                                this._use_or_play_vcard = sha;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '破竹：你可以将一张牌当【杀】使用',
                    },
                };
            },
            choose_show: () => {
                const target = context.targets.at(0);
                return {
                    selectors: {
                        cards: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selecte_type: 'rows',
                            selectable: target.getHandCards(),
                            data_rows: target.getCardsToArea('h'),
                            windowOptions: {
                                title: '破竹',
                                timebar: room.responseTime,
                                prompt: '破竹：请选择一张牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        prompt: '',
                        thinkPrompt: `破竹`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.preUseCard({
            from,
            can_use_cards: [{ name: 'sha' }],
            cardSelector: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
            source: data,
            reason: this.name,
            transform: this,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        let use = context.cost;
        do {
            if (!use || use.targets.length !== 1)
                break;
            if (use && use.targets.length === 1) {
                const target = use.targets.at(0);
                if (!target.hasHandCards())
                    break;
                context.targets = use.targets;
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_show'),
                        context,
                    },
                });
                const cards = room.getResultCards(req);
                const show = await room.showCards({
                    player: target,
                    cards,
                    source: data,
                    reason: this.name,
                });
                const card = cards.at(0);
                if (!show || !card)
                    break;
                const usecard = use.card;
                use = undefined;
                if (room.differentAsSuit(card, usecard)) {
                    use = (await room.preUseCard({
                        from,
                        can_use_cards: [{ name: 'sha' }],
                        cardSelector: {
                            selectorId: this.getSelectorName('choose_card'),
                            context,
                        },
                        source: data,
                        reason: this.name,
                        transform: this,
                        reqOptions: {
                            canCancle: true,
                        },
                    }));
                }
            }
        } while (true);
    },
}));
exports.duyu.addSkill(exports.sanchen);
exports.duyu.addSkill(exports.pozhu);
sgs.loadTranslation({
    ['@wars.pozhu']: '是否发动技能破竹：可以将一张牌当【杀】使用',
});
