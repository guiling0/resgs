"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xibing_delay2 = exports.xibing_delay1 = exports.xibing = exports.wanggui = exports.huaxin = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.huaxin = sgs.General({
    name: 'wars.huaxin',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.wanggui = sgs.Skill({
    name: 'wars.huaxin.wanggui',
});
exports.wanggui.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: ["InflictDamaged" /* EventTriggers.InflictDamaged */, "CauseDamaged" /* EventTriggers.CauseDamaged */],
    can_trigger(room, player, data) {
        if (this.isOwner(player) && this.isOpen()) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            if (uses.length > 0)
                return false;
            if (data.trigger === "InflictDamaged" /* EventTriggers.InflictDamaged */) {
                return data.to === player;
            }
            if (data.trigger === "CauseDamaged" /* EventTriggers.CauseDamaged */) {
                return data.from === player;
            }
        }
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const generals = from.getCloseGenerls();
                if (generals.length !== 0) {
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return room.differentAsKingdom(from, item);
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `望归：你可以选择一名与你势力不同的角色，对他造成1点伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                }
                else {
                    return room.createCac({
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `望归：你可以令所有与你势力相同的角色各摸一张牌`,
                        thinkPrompt: this.name,
                    });
                }
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets } = context;
        if (targets.length === 0) {
            const tos = room.getPlayerByFilter((v) => room.sameAsKingdom(from, v));
            room.sortResponse(tos);
            room.directLine(from, tos);
            for (const player of tos) {
                await room.drawCards({
                    player,
                    source: data,
                    reason: this.name,
                });
            }
        }
        else {
            const to = targets.at(0);
            await room.damage({
                from,
                to,
                source: data,
                reason: this.name,
            });
        }
        return true;
    },
}));
exports.xibing = sgs.Skill({
    name: 'wars.huaxin.xibing',
});
exports.xibing.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.from &&
            data.from !== player &&
            data.targetCount === 1 &&
            data.card &&
            data.card.color === 2 /* CardColor.Black */ &&
            (data.card.name === 'sha' ||
                data.card.subtype === 21 /* CardSubType.InstantScroll */)) {
            const phase = room.getCurrentPhase();
            if (!phase.isOwner(data.from, 4 /* Phase.Play */))
                return false;
            const use = room.getLastOneHistory(sgs.DataType.UseCardEvent, (v) => v !== data &&
                v.from === data.from &&
                v.card.color === 2 /* CardColor.Black */ &&
                (v.card.name === 'sha' ||
                    v.card.subtype === 21 /* CardSubType.InstantScroll */), phase);
            if (use)
                return false;
            const use2 = room.getLastOneHistory(sgs.DataType.UseCardToCardEvent, (v) => v.from === data.from &&
                v.card.subtype === 21 /* CardSubType.InstantScroll */ &&
                v.card.color === 2 /* CardColor.Black */, phase);
            return !use2;
        }
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        const from = context.from;
        const target = context.targets.at(0);
        return {
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
                                title: '息兵',
                                timebar: room.responseTime,
                                prompt: '息兵：请选择一张武将牌暗置',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const hand = target.getHandCards().length;
        if (hand < target.hp && hand < 5) {
            const draw = await room.drawCards({
                player: target,
                count: Math.min(target.hp, 5) - hand,
                source: data,
                reason: this.name,
            });
            if (draw) {
                const effect1 = await room.addEffect('xibing.delay1', target);
                effect1.setData('data', room.currentTurn);
            }
        }
        if (!from.hasNoneOpen() && !target.hasNoneOpen()) {
            await room.chooseYesOrNo(from, {
                prompt: '@xibing',
                thinkPrompt: this.name,
            }, async () => {
                const close_generals = [];
                const genearls1 = from.getCanCloseGenerals();
                let tar_genearl1;
                if (genearls1.length > 1) {
                    context.generals = room.getGeneralIds(genearls1);
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    tar_genearl1 = room
                        .getResult(req, 'general')
                        .result.at(0);
                }
                else if (genearls1.length > 0) {
                    tar_genearl1 = genearls1.at(0);
                }
                if (tar_genearl1) {
                    await room.close({
                        player: from,
                        generals: [tar_genearl1],
                        source: data,
                        reason: this.name,
                    });
                    close_generals.push(tar_genearl1);
                }
                const genearls2 = target.getCanCloseGenerals();
                let tar_genearl2;
                if (genearls2.length > 1) {
                    context.generals = room.getGeneralIds(genearls2);
                    const req = await room.doRequest({
                        player: from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    tar_genearl2 = room
                        .getResult(req, 'general')
                        .result.at(0);
                }
                else if (genearls2.length > 0) {
                    tar_genearl2 = genearls2.at(0);
                }
                if (tar_genearl2) {
                    await room.close({
                        player: target,
                        generals: [tar_genearl2],
                        source: data,
                        reason: this.name,
                    });
                    close_generals.push(tar_genearl2);
                }
                const effect2 = await room.addEffect('xibing.delay2', from);
                effect2.setData('generals', close_generals);
                effect2.setData('data', room.currentTurn);
            });
        }
    },
}));
exports.xibing_delay1 = sgs.StateEffect({
    name: 'xibing.delay1',
    mark: ['mark.xibing'],
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return (this.isOwner(from) &&
            card.subcards.length &&
            card.subcards.every((v) => v.area === from.handArea));
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.xibing_delay2 = sgs.StateEffect({
    name: 'xibing.delay2',
    [skill_types_1.StateEffectType.Prohibit_Open](player, generals, reason) {
        const gs = this.getData('generals') ?? [];
        return !!generals.find((v) => gs.includes(v));
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.huaxin.addSkill(exports.wanggui);
exports.huaxin.addSkill(exports.xibing);
sgs.loadTranslation({
    ['mark.xibing']: '息兵',
    ['@xibing']: '息兵：是否暗置你与其的各一张武将牌',
});
