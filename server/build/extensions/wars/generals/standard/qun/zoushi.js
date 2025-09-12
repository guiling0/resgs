"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qingcheng = exports.huoshui = exports.zoushi = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.zoushi = sgs.General({
    name: 'wars.zoushi',
    kingdom: 'qun',
    hp: 1.5,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.huoshui = sgs.Skill({
    name: 'wars.zoushi.huoshui',
});
exports.huoshui.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Prohibit_Open](player, generals, reason) {
        return this.player.inturn && player !== this.player;
    },
}));
exports.qingcheng = sgs.Skill({
    name: 'wars.zoushi.qingcheng',
});
exports.qingcheng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.color === 2 /* CardColor.Black */;
                            },
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return item !== from && !item.hasNoneOpen();
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `倾城：你可以弃置一张黑色牌并选择一名其他角色，暗置他的一张武将牌`,
                    },
                };
            },
            choose: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '倾城',
                                timebar: room.responseTime,
                                prompt: '倾城：请选择一张武将牌暗置',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '倾城',
                    },
                };
            },
            choose_player: () => {
                const from = context.from;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return (item !== from &&
                                    !targets.includes(item) &&
                                    !item.hasNoneOpen());
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '倾城，你可以选择另一名角色暗置他的一张武将牌',
                        thinkPrompt: '倾城',
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
        const { from, targets, cards } = context;
        let card = cards.at(0);
        let target = targets.at(0);
        while (target) {
            const generals = target.getCanCloseGenerals();
            let tar_general;
            if (generals.length > 1) {
                context.generals = room.getGeneralIds(generals);
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                tar_general = req.result.results.general.result.at(0);
            }
            else if (generals.length > 0) {
                tar_general = generals[0];
            }
            if (tar_general) {
                await room.close({
                    player: target,
                    generals: [tar_general],
                    source: data,
                    reason: this.name,
                });
            }
            if (card && card.type === 3 /* CardType.Equip */) {
                const preq = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_player'),
                        context,
                    },
                });
                target = room.getResultPlayers(preq).at(0);
            }
            else {
                target = undefined;
            }
            card = undefined;
        }
    },
}));
exports.zoushi.addSkill(exports.huoshui);
exports.zoushi.addSkill(exports.qingcheng);
