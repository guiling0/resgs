"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yinghun_sunce = exports.yingzi_sunce = exports.hunshang = exports.yingyang_delay = exports.yingyang = exports.jiang = exports.sunce = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
const rules_1 = require("../../rules");
const sunjian_1 = require("../standard/wu/sunjian");
const zhouyu_1 = require("../standard/wu/zhouyu");
exports.sunce = sgs.General({
    name: 'wars.sunce',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.jiang = sgs.Skill({
    name: 'wars.sunce.jiang',
});
exports.jiang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "AssignTargeted" /* EventTriggers.AssignTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.from === player &&
            data.card &&
            ((data.card.name === 'sha' &&
                data.card.color === 1 /* CardColor.Red */) ||
                data.card.name === 'juedou') &&
            data.isFirstTarget);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.jiang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "BecomeTargeted" /* EventTriggers.BecomeTargeted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.current.target === player &&
            data.card &&
            ((data.card.name === 'sha' &&
                data.card.color === 1 /* CardColor.Red */) ||
                data.card.name === 'juedou'));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.yingyang = sgs.Skill({
    name: 'wars.sunce.yingyang',
});
exports.yingyang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "PindianShow" /* EventTriggers.PindianShow */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.cards.get(player);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: ['+3', '-3'],
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: false,
                        prompt: `是否发动鹰扬：修改你拼点牌的点数`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const result = context.req_result.results.option.result.at(0);
        const card = data.cards.get(from);
        if (result && card) {
            const effect = await room.addEffect('yingyang.delay', from);
            effect.setMark('card', card.id);
            effect.setMark('update', result);
            effect.setData('data', data);
        }
    },
}));
exports.yingyang_delay = sgs.StateEffect({
    name: 'yingyang.delay',
    [skill_types_1.StateEffectType.Regard_CardData](card, property, source) {
        if (property !== 'number')
            return;
        const id = this.getMark('card');
        if (card.id !== id)
            return;
        const update = this.getMark('update');
        if (update === '+3') {
            const change = source + 3;
            return change > 13 ? 13 : change;
        }
        if (update === '-3') {
            const change = source - 3;
            return change < 1 ? 1 : change;
        }
    },
    lifecycle: [
        {
            trigger: "PindianEnd" /* EventTriggers.PindianEnd */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.hunshang = sgs.Skill({
    name: 'wars.sunce.hunshang',
});
exports.hunshang.addEffect(sgs.copy(rules_1.reduce_yinyangyu, { tag: [3 /* SkillTag.Deputy */, 9 /* SkillTag.Secret */] }));
exports.hunshang.addEffect(sgs.TriggerEffect({
    tag: [3 /* SkillTag.Deputy */],
    auto_log: 1,
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && data.isOwner(player) && player.hp === 1);
    },
    async cost(room, data, context) {
        const { from } = context;
        const skills = [];
        skills.push(await room.addSkill('wars.sunce.yingzi', from, {
            source: this.name,
            showui: 'default',
        }));
        skills.push(await room.addSkill('wars.sunce.yinghun', from, {
            source: this.name,
            showui: 'default',
        }));
        this.setData('skills', skills);
        this.setData('data', room.currentTurn);
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    const skills = this.getData('skills');
                    if (skills) {
                        for (const skill of skills) {
                            if (skill) {
                                await skill.removeSelf();
                            }
                        }
                    }
                }
            },
        },
    ],
}));
exports.yingzi_sunce = sgs.Skill(sgs.copy(zhouyu_1.yingzi, { name: 'wars.sunce.yingzi' }));
exports.yinghun_sunce = sgs.Skill(sgs.copy(sunjian_1.yinghun, { name: 'wars.sunce.yinghun' }));
exports.sunce.addSkill(exports.jiang);
exports.sunce.addSkill(exports.yingyang);
exports.sunce.addSkill(exports.hunshang);
exports.sunce.addSkill('#wars.sunce.yingzi');
exports.sunce.addSkill('#wars.sunce.yinghun');
