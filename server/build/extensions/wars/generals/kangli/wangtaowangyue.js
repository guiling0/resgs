"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huyi = exports.shuying = exports.wangtaowangyue = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.wangtaowangyue = sgs.General({
    name: 'xl.wangtaowangyue',
    kingdom: 'shu',
    hp: 2,
    gender: 2 /* Gender.Female */,
    isWars: true,
});
exports.shuying = sgs.Skill({
    name: 'xl.wangtaowangyue.shuying',
});
exports.shuying.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Regard_ArrayCondition](from, to, type) {
        if (type === 'quene' &&
            this.player &&
            this.isOwner(from) &&
            to === this.player) {
            return true;
        }
    },
    [skill_types_1.StateEffectType.Range_Correct](from) {
        if (this.isOwner(from)) {
            return 1;
        }
    },
    [skill_types_1.StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) {
            return 1;
        }
    },
}));
exports.huyi = sgs.Skill({
    name: 'xl.wangtaowangyue.huyi',
});
exports.huyi.addEffect(sgs.TriggerEffect({
    tag: [7 /* SkillTag.Array_Quene */],
    forced: 'cost',
    trigger: "UseCardEnd3" /* EventTriggers.UseCardEnd3 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.card && data.card.name === 'sha') {
            const quene = room.getQueue(player);
            if (quene.includes(data.from)) {
                room.sortPlayers(quene);
                const prev = quene.at(0).prev;
                const next = quene.at(-1).next;
                if (data.targets.includes(prev) ||
                    data.targets.includes(next)) {
                    const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
                    return uses.length < 1;
                }
            }
        }
    },
    context(room, player, data) {
        const quene = room.getQueue(player);
        const targets = [];
        if (quene.includes(data.from)) {
            room.sortPlayers(quene);
            const prev = quene.at(0).prev;
            const next = quene.at(-1).next;
            if (data.targets.includes(prev)) {
                targets.push(next);
            }
            if (data.targets.includes(next)) {
                targets.push(prev);
            }
        }
        return {
            targets: targets,
        };
    },
    getSelectors(room, context) {
        const targets = context.targets;
        return {
            target: () => {
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return selected.length === 0
                                    ? targets.includes(item)
                                    : true;
                            },
                            excluesCardTimesLimit: true,
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.needUseCard({
            from,
            cards: [{ name: 'sha' }],
            targetSelector: {
                selectorId: this.getSelectorName('target'),
                context,
            },
            reqOptions: {
                canCancle: true,
                prompt: `@huyi`,
                thinkPrompt: this.name,
            },
            source: data,
            reason: this.name,
        });
    },
}));
exports.wangtaowangyue.addSkill(exports.shuying);
exports.wangtaowangyue.addSkill(exports.huyi);
sgs.loadTranslation({
    ['@huyi']: '虎翼：你可以使用一张【杀】',
});
