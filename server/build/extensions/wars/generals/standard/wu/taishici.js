"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tianyi_cantuse = exports.tianyi_target = exports.tianyi_states = exports.tianyi = exports.taishici = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.taishici = sgs.General({
    name: 'wars.taishici',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.tianyi = sgs.Skill({
    name: 'wars.taishici.tianyi',
});
exports.tianyi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return from.canPindian([item], skill.name);
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `天义：你可以与一名其他角色拼点`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.isOwner(player, 4 /* Phase.Play */) &&
            player.canPindian([], this.name));
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `tianyi_pindian`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            const effect1 = await room.addEffect('tianyi.states', from);
            // const effect3 = await room.addEffect('tianyi.targets', from);
            effect1.setData('turn', room.currentTurn);
            // effect3.setData('turn', room.currentTurn);
        }
        if (pindian.lose.includes(from)) {
            const effect1 = await room.addEffect('tianyi.cantuse', from);
            effect1.setData('turn', room.currentTurn);
        }
    },
}));
exports.tianyi_states = sgs.StateEffect({
    name: 'tianyi.states',
    [skill_types_1.StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') {
            return 1;
        }
    },
    [skill_types_1.StateEffectType.TargetMod_PassDistanceCheck](from, card, target) {
        return this.isOwner(from) && card.name === 'sha';
    },
    [skill_types_1.StateEffectType.TargetMod_CardLimit](from, card) {
        if (this.isOwner(from) && card.name === 'sha') {
            return [1, 2];
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                if (!this.player?.hasMark('marks.tianyi.win')) {
                    this.player?.setMark('marks.tianyi.win', true, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.win');
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.tianyi_target = sgs.TriggerEffect({
    name: 'tianyi.targets',
    auto_log: 1,
    auto_directline: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "ChooseTarget" /* EventTriggers.ChooseTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card.name === 'sha' &&
            data.from === player);
    },
    context(room, player, data) {
        return {
            sha: data.card.vdata,
            targets: data.targets,
        };
    },
    getSelectors(room, context) {
        const skill = this;
        return {
            skill_cost: () => {
                const from = context.from;
                const sha = context.sha;
                const targets = context.targets;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return (sha &&
                                    !targets.includes(item) &&
                                    from.canUseCard(sha, [item], skill.name, {
                                        excluesCardTimesLimit: true,
                                    }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `天义：你可以选择一名其他角色也成为【杀】的目标`,
                        thinkPrompt: this.name,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { targets } = context;
        return await data.becomTarget(targets);
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                if (!this.player?.hasMark('marks.tianyi.win')) {
                    this.player?.setMark('marks.tianyi.win', true, {
                        visible: true,
                    });
                }
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.win');
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.tianyi_cantuse = sgs.StateEffect({
    name: 'tianyi.cantuse',
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return this.isOwner(this.player) && card.name === 'sha';
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player?.setMark('marks.tianyi.lose', true, {
                    visible: true,
                });
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark('marks.tianyi.lose');
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            priority: 'after',
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.taishici.addSkill(exports.tianyi);
sgs.loadTranslation({
    ['tianyi_pindian']: '天义，请选择一张牌拼点',
    ['marks.tianyi.win']: '天义[赢]',
    ['marks.tianyi.lose']: '天义[没赢]',
});
