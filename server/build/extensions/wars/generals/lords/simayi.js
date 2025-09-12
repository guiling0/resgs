"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lord_simayi_jianglue = exports.lord_simayi_yongjin = exports.lord_simayi_fengying = exports.lord_simayi_luanwu = exports.lord_simayi_shunfu = exports.bahuangsishiling = exports.shujuan = exports.guikuang = exports.jiaping = exports.lord_simayi = void 0;
const simayi_1 = require("../jin/simayi");
const cuiyanmaojie_1 = require("../power/cuiyanmaojie");
const lingtong_1 = require("../power/lingtong");
const wangping_1 = require("../power/wangping");
const jiaxu_1 = require("../standard/qun/jiaxu");
exports.lord_simayi = sgs.General({
    name: 'wars.lord_simayi',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    lord: true,
    enable: false,
    isWars: true,
});
exports.jiaping = sgs.Skill({
    name: 'wars.lord_simayi.jiaping',
});
exports.jiaping.addEffect(sgs.TriggerEffect({
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
            bg_url: 'resources/background/jin.png',
            bgm_url: 'resources/background/jin.mp3',
            bgm_loop: false,
        });
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                const skill = await room.addSkill('wars.lord_simayi.bahuangsishiling', this.player, {
                    source: `effect:${this.id}`,
                    showui: 'other',
                });
                this.setData('bahuang', skill);
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                await this.getData('bahuang').removeSelf();
            },
        },
    ],
}));
exports.guikuang = sgs.Skill({
    name: 'wars.lord_simayi.guikuang',
});
exports.guikuang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const self = context.effect;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 2,
                            filter(item, selected) {
                                if (selected.length === 0) {
                                    return item.canPindian([], self.name);
                                }
                                else {
                                    return (room.isOtherKingdom(selected[0], item) &&
                                        selected[0].canPindian([item], self.name));
                                }
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `诡诳，你可以选择两名玩家拼点`,
                        thinkPrompt: '诡诳',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        if (targets.length >= 2) {
            return await room.pindian({
                from: targets[0],
                targets: [targets[1]],
                source: data,
                reason: this.name,
            });
        }
    },
    async effect(room, data, context) {
        const pindian = context.cost;
        const reds = [...pindian.cards.keys()].filter((v) => {
            const card = pindian.cards.get(v);
            if (card && card.color === 1 /* CardColor.Red */)
                return true;
        });
        const loses = pindian.lose;
        room.sortResponse(reds);
        while (reds.length > 0) {
            const from = reds.shift();
            const targets = loses.slice();
            while (targets.length > 0) {
                const to = targets.shift();
                await room.damage({
                    from,
                    to,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.shujuan = sgs.Skill({
    name: 'wars.lord_simayi.shujuan',
});
exports.shujuan.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    tag: [1 /* SkillTag.Lock */],
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !this.getData(this.name) &&
            data.has_filter((d, c) => c.name === 'jilinqianyi' &&
                (d.toArea === room.discardArea ||
                    (d.toArea.type === 92 /* AreaType.Equip */ &&
                        d.toArea !== player.equipArea))));
    },
    async cost(room, data, context) {
        this.setData(this.name, true);
        return data.getCard((v, c) => c.name === 'jilinqianyi');
    },
    async effect(room, data, context) {
        const { from } = context;
        const jilinqianyi = context.cost;
        if (jilinqianyi) {
            await room.obtainCards({
                player: from,
                cards: [jilinqianyi],
                source: data,
                reason: this.name,
            });
            if (jilinqianyi.area === from.handArea) {
                await room.preUseCard({
                    from,
                    card: room.createVirtualCardByOne(jilinqianyi),
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
                this.removeData(this.name);
            },
        },
    ],
}));
exports.bahuangsishiling = sgs.Skill({
    name: 'wars.lord_simayi.bahuangsishiling',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});
exports.bahuangsishiling.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    audio: [],
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        if (room.sameAsKingdom(this.player, player) &&
            data.isOwner(player) &&
            !this.getData('times') &&
            player.hasDeputy()) {
            const start = room.currentTurn.getCircleStartTurn();
            return (start &&
                room.getHistorys(sgs.DataType.OpenEvent, (v) => v.player === player && v.dataId > start.dataId).length > 0);
        }
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const options = [
                    'wars.lord_simayi.shunfu',
                    'wars.lord_simayi.fengying',
                    'wars.lord_simayi.jianglue',
                    'wars.lord_simayi.yongjin',
                    'wars.lord_simayi.luanwu',
                ].map((v) => {
                    return effect.hasMark(v) ? `!${v}` : v;
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
                        prompt: '八荒死士令：你可以移除副将并发动一个技能',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.remove({
            player: from,
            general: from.deputy,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const skill_name = context.req_result.results.option.result.at(0);
        this.setMark(skill_name, true);
        this.setData('times', 1);
        const skill = await room.addSkill(skill_name, from, {
            source: this.name,
            showui: 'default',
        });
        if (skill) {
            const effect = skill.effects.at(0);
            if (effect) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('skill_cost'),
                        context,
                    },
                });
                await room.useskill({
                    use_skill: effect,
                    context: effect.getContext?.(data),
                    req,
                    source: data,
                    reason: 'useskill',
                });
                await skill.removeSelf();
            }
        }
    },
    lifecycle: [
        {
            trigger: "CircleEnd" /* EventTriggers.CircleEnd */,
            async on_exec(room, data) {
                this.removeData('times');
            },
        },
    ],
}));
exports.lord_simayi_shunfu = sgs.Skill(sgs.copy(simayi_1.shunfu, {
    name: 'wars.lord_simayi.shunfu',
    audio: ['lord_simayi/shunfu'],
}));
exports.lord_simayi_luanwu = sgs.Skill(sgs.copy(jiaxu_1.luanwu, {
    name: 'wars.lord_simayi.luanwu',
    audio: ['lord_simayi/luanwu'],
}));
exports.lord_simayi_fengying = sgs.Skill(sgs.copy(cuiyanmaojie_1.fengying, {
    name: 'wars.lord_simayi.fengying',
    audio: ['lord_simayi/fengying'],
}));
exports.lord_simayi_yongjin = sgs.Skill(sgs.copy(lingtong_1.yongjin, {
    name: 'wars.lord_simayi.yongjin',
    audio: ['lord_simayi/yongjin'],
}));
exports.lord_simayi_jianglue = sgs.Skill(sgs.copy(wangping_1.jianglue, {
    name: 'wars.lord_simayi.jianglue',
    audio: ['lord_simayi/jianglue'],
}));
exports.lord_simayi.addSkill(exports.jiaping);
exports.lord_simayi.addSkill('#wars.lord_simayi.bahuangsishiling');
exports.lord_simayi.addSkill('#wars.lord_simayi.shunfu');
exports.lord_simayi.addSkill('#wars.lord_simayi.fengying');
exports.lord_simayi.addSkill('#wars.lord_simayi.jianglue');
exports.lord_simayi.addSkill('#wars.lord_simayi.yongjin');
exports.lord_simayi.addSkill('#wars.lord_simayi.luanwu');
exports.lord_simayi.addSkill(exports.guikuang);
exports.lord_simayi.addSkill(exports.shujuan);
