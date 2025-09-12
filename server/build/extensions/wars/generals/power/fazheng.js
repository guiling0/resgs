"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fazheng_kuanggu = exports.fazheng_liegong = exports.fazheng_tieqi = exports.fazheng_longdan = exports.fazheng_paoxiao = exports.fazheng_wusheng = exports.xuanhuo_delay = exports.xuanhuo = exports.enyuan = exports.fazheng = void 0;
const guanyu_1 = require("../standard/shu/guanyu");
const huangzhong_1 = require("../standard/shu/huangzhong");
const machao_1 = require("../standard/shu/machao");
const weiyan_1 = require("../standard/shu/weiyan");
const zhangfei_1 = require("../standard/shu/zhangfei");
const zhaoyun_1 = require("../standard/shu/zhaoyun");
exports.fazheng = sgs.General({
    name: 'wars.fazheng',
    kingdom: 'shu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.enyuan = sgs.Skill({
    name: 'wars.fazheng.enyuan',
});
exports.enyuan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    auto_directline: 1,
    audio: ['fazheng/enyuan3', 'fazheng/enyuan4'],
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.from && data.to === player;
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                const effect = context.effect;
                const target = context.targets.at(0);
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: target.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `恩怨：你需要交给${sgs.getTranslation(this.player.gameName)}一张手牌，否则失去1点体力`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        if (target) {
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const give = await room.giveCards({
                from: target,
                to: from,
                cards,
                source: data,
                reason: this.name,
            });
            if (!give) {
                await room.losehp({
                    player: target,
                    source: data,
                    reason: this.name,
                });
            }
            return true;
        }
    },
}));
exports.enyuan.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    auto_directline: 1,
    audio: ['fazheng/enyuan1', 'fazheng/enyuan2'],
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from !== player &&
            data.current.target === player &&
            data.card &&
            data.card.name === 'tao');
    },
    context(room, player, data) {
        return {
            targets: [data.from],
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.drawCards({
            player: target,
            source: data,
            reason: this.name,
        });
    },
}));
exports.xuanhuo = sgs.Skill({
    name: 'wars.fazheng.xuanhuo',
    global(room, to) {
        return room.sameAsKingdom(this.player, to);
    },
});
exports.xuanhuo.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (this.player &&
            !this.isOwner(player) &&
            room.sameAsKingdom(this.player, player) &&
            data.isOwner(player));
    },
    context(room, player, data) {
        return {
            targets: [this.player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `眩惑：你可以将一张牌交给${this.player.gameName}`,
                    },
                };
            },
            choose: () => {
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
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `眩惑：你需要弃置一张牌`,
                        thinkPrompt: this.name,
                    },
                };
            },
            choose_skill: () => {
                const options = [
                    'wars.fazheng.wusheng',
                    'wars.fazheng.paoxiao',
                    'wars.fazheng.longdan',
                    'wars.fazheng.tieqi',
                    'wars.fazheng.liegong',
                    'wars.fazheng.kuanggu',
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
                        prompt: '眩惑：请选择一个技能获得',
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, cards } = context;
        return await room.giveCards({
            from,
            to: this.player,
            cards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        if (from.hasCardsInArea()) {
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const cards = room.getResultCards(req);
            const drop = await room.dropCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
            if (drop) {
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
                const effect = await room.addEffect('xuanhuo.delay', from);
                effect.setData('skill', skill);
                effect.setData('data', room.currentTurn);
                from.setMark('mark.xuanhuo', skill_name, {
                    visible: true,
                });
            }
        }
    },
}));
exports.xuanhuo_delay = sgs.TriggerEffect({
    name: 'xuanhuo.delay',
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    this.player.removeMark('mark.xuanhuo');
                    await this.getData('skill')?.removeSelf();
                    await this.removeSelf();
                }
            },
        },
        {
            trigger: "StateChanged" /* EventTriggers.StateChanged */,
            async on_exec(room, data) {
                if (data.is(sgs.DataType.OpenEvent)) {
                    const skill = this.getData('skill');
                    if (!skill)
                        return;
                    const has = room.skills.find((s) => s !== skill &&
                        s.isOpen() &&
                        s.trueName === skill.trueName);
                    if (has) {
                        this.player.removeMark('mark.xuanhuo');
                        await skill.removeSelf();
                        await this.removeSelf();
                    }
                }
            },
        },
    ],
});
exports.fazheng_wusheng = sgs.Skill(sgs.copy(guanyu_1.wusheng, {
    name: 'wars.fazheng.wusheng',
}));
exports.fazheng_paoxiao = sgs.Skill(sgs.copy(zhangfei_1.paoxiao, {
    name: 'wars.fazheng.paoxiao',
}));
exports.fazheng_longdan = sgs.Skill(sgs.copy(zhaoyun_1.longdan, {
    name: 'wars.fazheng.longdan',
}));
exports.fazheng_tieqi = sgs.Skill(sgs.copy(machao_1.tieqi, {
    name: 'wars.fazheng.tieqi',
}));
exports.fazheng_liegong = sgs.Skill(sgs.copy(huangzhong_1.liegong, {
    name: 'wars.fazheng.liegong',
}));
exports.fazheng_kuanggu = sgs.Skill(sgs.copy(weiyan_1.kuanggu, {
    name: 'wars.fazheng.kuanggu',
}));
exports.fazheng.addSkill(exports.enyuan);
exports.fazheng.addSkill(exports.xuanhuo);
exports.fazheng.addSkill('#wars.fazheng.wusheng');
exports.fazheng.addSkill('#wars.fazheng.paoxiao');
exports.fazheng.addSkill('#wars.fazheng.longdan');
exports.fazheng.addSkill('#wars.fazheng.tieqi');
exports.fazheng.addSkill('#wars.fazheng.liegong');
exports.fazheng.addSkill('#wars.fazheng.kuanggu');
sgs.loadTranslation({
    ['mark.xuanhuo']: '眩惑',
});
