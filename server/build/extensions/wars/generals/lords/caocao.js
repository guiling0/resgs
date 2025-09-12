"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lord_jieyue = exports.lord_duanliang = exports.lord_xiaoguo = exports.lord_qiaobian = exports.lord_tuxi = exports.elitegeneralflag = exports.zongyu = exports.huibian = exports.jianan = exports.lord_caocao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const yujin_1 = require("../power/yujin");
const xuhuang_1 = require("../standard/wei/xuhuang");
const yuejin_1 = require("../standard/wei/yuejin");
const zhanghe_1 = require("../standard/wei/zhanghe");
const zhangliao_1 = require("../standard/wei/zhangliao");
exports.lord_caocao = sgs.General({
    name: 'wars.lord_caocao',
    kingdom: 'wei',
    hp: 2,
    gender: 1 /* Gender.Male */,
    lord: true,
    enable: false,
    isWars: true,
});
exports.jianan = sgs.Skill({
    name: 'wars.lord_caocao.jianan',
});
exports.jianan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */, 6 /* SkillTag.Lord */],
    priorityType: 0 /* PriorityType.None */,
    trigger: "StateChangeEnd" /* EventTriggers.StateChangeEnd */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.OpenEvent) &&
            data.generals.includes(this.skill?.sourceGeneral));
    },
    async effect(room, data, context) {
        room.broadcast({
            type: 'MsgChangeBgmAndBg',
            bg_url: 'resources/background/wei.png',
            bgm_url: 'resources/background/wei.mp3',
            bgm_loop: false,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                const skill = await room.addSkill('wars.lord_caocao.elitegeneralflag', this.player, {
                    source: `effect:${this.id}`,
                    showui: 'other',
                });
                this.setData('wuzi', skill);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                await this.getData('wuzi').removeSelf();
            },
        },
    ],
}));
exports.huibian = sgs.Skill({
    name: 'wars.lord_caocao.huibian',
});
exports.huibian.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    auto_sort: false,
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
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 2,
                            filter(item, selected) {
                                if (!room.sameAsKingdom(from, item))
                                    return false;
                                if (selected.length === 0) {
                                    return item.losshp > 0;
                                }
                                else {
                                    return true;
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `挥鞭：你可以选择两名与你势力相同的角色（前者回复体力，后者受到伤害摸牌）`,
                        thinkPrompt: `挥鞭`,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets } = context;
        if (targets.length >= 2) {
            return await room.damage({
                from,
                to: targets.at(1),
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const { from, targets } = context;
        await room.drawCards({
            player: targets.at(1),
            count: 2,
            source: data,
            reason: this.name,
        });
        await room.recoverhp({
            player: targets.at(0),
            source: data,
            reason: this.name,
        });
    },
}));
exports.zongyu = sgs.Skill({
    name: 'wars.lord_caocao.zongyu',
});
exports.zongyu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && player.getHorses().length > 0) {
            return data.has_filter((v, c) => c.name === 'liulongcanjia' &&
                v.toArea.type === 92 /* AreaType.Equip */ &&
                v.toArea !== player.equipArea);
        }
    },
    context(room, player, data) {
        const liulong = data.getCard((v, c) => c.name === 'liulongcanjia' &&
            v.toArea.type === 92 /* AreaType.Equip */ &&
            v.toArea !== player.equipArea);
        return {
            targets: [liulong.area?.player],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        if (target) {
            return await room.swapCards({
                player: from,
                cards1: from.getHorses(),
                toArea1: target.equipArea,
                cards2: target.getHorses(),
                toArea2: from.equipArea,
                source: data,
                reason: this.name,
            });
        }
    },
}));
exports.zongyu.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "CardBeUse" /* EventTriggers.CardBeUse */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            player === data.from &&
            data.card &&
            data.card.isHorse()) {
            if (room.discardArea.cards.find((v) => v.name === 'liulongcanjia')) {
                return true;
            }
            if (room.playerAlives.find((v) => v
                .getEquipCards()
                .find((c) => c.name === 'liulongcanjia'))) {
                return true;
            }
        }
    },
    async cost(room, data, context) {
        const { from } = context;
        let liulong = room.discardArea.cards.find((v) => v.name === 'liulongcanjia');
        if (!liulong) {
            room.playerAlives.find((v) => v.getEquipCards().find((c) => {
                if (c.name === 'liulongcanjia') {
                    liulong = c;
                    return true;
                }
            }));
        }
        if (liulong) {
            return await room.puto({
                player: from,
                cards: [liulong],
                toArea: from.equipArea,
                movetype: 1 /* CardPut.Up */,
                puttype: 1 /* CardPut.Up */,
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.puto({
            player: from,
            cards: data.card?.subcards,
            toArea: room.discardArea,
            source: data,
            reason: this.name,
        });
    },
}));
exports.elitegeneralflag = sgs.Skill({
    name: 'wars.lord_caocao.elitegeneralflag',
});
exports.elitegeneralflag.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: [
        'lord_caocao/elitegeneralflag1',
        'lord_caocao/elitegeneralflag2',
    ],
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (room.sameAsKingdom(this.player, player) && data.isOwner(player));
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
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `五子良将纛：你可以弃置一张牌并暗置一张武将牌获得技能`,
                        thinkPrompt: `五子良将纛`,
                    },
                };
            },
            choose_general: () => {
                const generals = room.getGenerals(context.generals);
                return {
                    selectors: {
                        general: room.createChooseGeneral({
                            step: 1,
                            count: 1,
                            selectable: generals,
                            selecte_type: 'win',
                            windowOptions: {
                                title: '五子良将纛',
                                timebar: room.responseTime,
                                prompt: '五子良将纛：请选择你要暗置的武将牌',
                            },
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: false,
                        thinkPrompt: '五子良将纛',
                    },
                };
            },
            choose_skill: () => {
                const options = [
                    'wars.lord_caocao.tuxi',
                    'wars.lord_caocao.qiaobian',
                    'wars.lord_caocao.xiaoguo',
                    'wars.lord_caocao.duanliang',
                    'wars.lord_caocao.jieyue',
                ];
                options.forEach((v, i) => {
                    if (room.skills.find((s) => s.isOpen() &&
                        s.trueName === v.split('.').at(-1))) {
                        options[i] = '!' + options[i];
                    }
                });
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: options,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: '五子良将纛：请选择一个技能获得',
                        thinkPrompt: `五子良将纛`,
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
        const { from } = context;
        let tar_general = from.getCloseGenerls().at(0);
        if (!tar_general) {
            const generals = from.getCanCloseGenerals();
            if (generals.length > 1) {
                context.generals = room.getGeneralIds(generals);
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose_general'),
                        context,
                    },
                });
                tar_general = req.result.results.general.result.at(0);
                await room.close({
                    player: from,
                    generals: [tar_general],
                    source: data,
                    reason: this.name,
                });
            }
            else if (generals.length > 0) {
                tar_general = generals[0];
                await room.close({
                    player: from,
                    generals: [tar_general],
                    source: data,
                    reason: this.name,
                });
            }
        }
        if (tar_general) {
            const gs = this.skill?.getData(`${this.name}.generals`) ??
                [];
            gs.push(tar_general);
            this.skill?.setData(`${this.name}.generals`, gs);
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose_skill'),
                    context,
                },
            });
            const skill_name = room
                .getResult(req, 'option')
                .result.at(0);
            const skill = await room.addSkill(skill_name, from, {
                source: this.name,
                showui: 'default',
            });
            if (skill) {
                const skills = this.getData(`${this.name}.skills`) ?? [];
                skills.push(skill);
                this.setData(`${this.name}.skills`, skills);
            }
        }
    },
    lifecycle: [
        {
            trigger: "TurnStart" /* EventTriggers.TurnStart */,
            priority: 'before',
            async on_exec(room, data) {
                if (data.player === this.player) {
                    this.skill?.removeData(`${this.name}.generals`);
                    const skills = this.getData(`${this.name}.skills`) ?? [];
                    for (const skill of skills) {
                        await skill.removeSelf();
                    }
                    this.removeData(`${this.name}.skill`);
                }
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            priority: 'after',
            async on_exec(room, data) {
                this.skill?.removeData(`${this.name}.generals`);
                const skills = this.getData(`${this.name}.skills`) ?? [];
                for (const skill of skills) {
                    await skill.removeSelf();
                }
                this.removeData(`${this.name}.skill`);
            },
        },
    ],
}));
exports.elitegeneralflag.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Prohibit_Open](player, generals, reason) {
        const gs = this.skill?.getData(`${this.name}.generals`) ?? [];
        return !!generals.find((v) => gs.includes(v));
    },
}));
exports.lord_tuxi = sgs.Skill(sgs.copy(zhangliao_1.tuxi, {
    name: 'wars.lord_caocao.tuxi',
}));
exports.lord_qiaobian = sgs.Skill(sgs.copy(zhanghe_1.qiaobian, {
    name: 'wars.lord_caocao.qiaobian',
}));
exports.lord_xiaoguo = sgs.Skill(sgs.copy(yuejin_1.xiaoguo, {
    name: 'wars.lord_caocao.xiaoguo',
}));
exports.lord_duanliang = sgs.Skill(sgs.copy(xuhuang_1.duanliang, {
    name: 'wars.lord_caocao.duanliang',
}));
exports.lord_jieyue = sgs.Skill(sgs.copy(yujin_1.jieyue, {
    name: 'wars.lord_caocao.jieyue',
}));
exports.lord_caocao.addSkill(exports.jianan);
exports.lord_caocao.addSkill('#wars.lord_caocao.elitegeneralflag');
exports.lord_caocao.addSkill('#wars.lord_caocao.tuxi');
exports.lord_caocao.addSkill('#wars.lord_caocao.xiaoguo');
exports.lord_caocao.addSkill('#wars.lord_caocao.jieyue');
exports.lord_caocao.addSkill('#wars.lord_caocao.qiaobian');
exports.lord_caocao.addSkill('#wars.lord_caocao.duanliang');
exports.lord_caocao.addSkill(exports.huibian);
exports.lord_caocao.addSkill(exports.zongyu);
