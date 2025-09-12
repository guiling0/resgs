"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fenxun = exports.duanbing = exports.dingfeng = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.dingfeng = sgs.General({
    name: 'wars.dingfeng',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.duanbing = sgs.Skill({
    name: 'wars.dingfeng.duanbing',
});
exports.duanbing.addEffect(sgs.TriggerEffect({
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
                                    from.distanceTo(item) === 1 &&
                                    from.canUseCard(sha, [item], skill.name, { excluesCardTimesLimit: true }));
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `短兵：你可以选择一名距离1的其他角色也成为【杀】的目标`,
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
}));
exports.fenxun = sgs.Skill({
    name: 'wars.dingfeng.fenxun',
});
exports.fenxun.addEffect(sgs.TriggerEffect({
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
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                        }),
                        player: room.createChoosePlayer({
                            step: 2,
                            count: 1,
                            filter(item, selected) {
                                return from !== item;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `奋迅：你可以弃置一张牌再选择一名其他角色，本回合你距离他的距离视为1`,
                        thinkPrompt: this.name,
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
        const { targets: [target], } = context;
        target.setMark('marks.fenxun', true, {
            visible: true,
        });
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (data.player === this.player) {
                    room.players.forEach((v) => {
                        v.removeMark('marks.fenxun');
                    });
                }
            },
        },
    ],
}));
exports.fenxun.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Distance_Fixed](from, to) {
        if (this.isOwner(from) && to.hasMark('marks.fenxun')) {
            return 1;
        }
    },
}));
exports.dingfeng.addSkill(exports.duanbing);
exports.dingfeng.addSkill(exports.fenxun);
sgs.loadTranslation({
    ['marks.fenxun']: '奋迅',
});
