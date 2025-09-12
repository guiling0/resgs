"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weimu = exports.luanwu = exports.wansha_delay = exports.wansha = exports.jiaxu = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.jiaxu = sgs.General({
    name: 'wars.jiaxu',
    kingdom: 'qun',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.wansha = sgs.Skill({
    name: 'wars.jiaxu.wansha',
});
exports.wansha.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "EntryDying" /* EventTriggers.EntryDying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && player.inturn;
    },
    async cost(room, data, context) {
        const { from } = context;
        from.setMark('wars.wansha', true);
        data.player.setMark('wars.wansha', true);
        const effect = await room.addEffect('wars.wansha.delay', from);
        effect.setData('data', data);
        return true;
    },
}));
exports.wansha_delay = sgs.StateEffect({
    name: 'wars.wansha.delay',
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        if (card.name === 'tao') {
            return !from.hasMark('wars.wansha');
        }
    },
    lifecycle: [
        {
            trigger: "DyingEnd" /* EventTriggers.DyingEnd */,
            priority: 'after',
            async on_exec(room, data) {
                if (data === this.getData('data')) {
                    room.players.forEach((v) => {
                        v.removeMark('wars.wansha');
                    });
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.luanwu = sgs.Skill({
    name: 'wars.jiaxu.luanwu',
});
exports.luanwu.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
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
                        player: room.createChoosePlayer({
                            step: 1,
                            count: [1, -1],
                            filter(item, selected) {
                                return item !== from;
                            },
                            auto: true,
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `乱武：你可以令所有其他角色依次对最近距离的角色使用【杀】，否则需要失去1点体力`,
                    },
                };
            },
            target_limit: () => {
                const from = context.from;
                const min = Math.min(...room.playerAlives
                    .filter((v) => v !== from)
                    .map((v) => from.distanceTo(v)));
                return {
                    selectors: {
                        target: room.createChoosePlayer({
                            filter(item, selected) {
                                return from.distanceTo(item) === min;
                            },
                        }),
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { targets } = context;
        while (targets.length > 0) {
            const to = targets.shift();
            const use = await room.needUseCard({
                from: to,
                cards: [{ name: 'sha' }],
                targetSelector: {
                    selectorId: this.getSelectorName('target_limit'),
                    context: {
                        from: to,
                    },
                },
                reqOptions: {
                    canCancle: true,
                    prompt: `@luanwu`,
                    thinkPrompt: this.name,
                },
                source: data,
                reason: this.name,
            });
            if (!use) {
                await room.losehp({
                    player: to,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.weimu = sgs.Skill({
    name: 'wars.jiaxu.weimu',
});
exports.weimu.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "BecomeTarget" /* EventTriggers.BecomeTarget */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.current.target &&
            data.card &&
            data.card.type === 2 /* CardType.Scroll */ &&
            data.card.color === 2 /* CardColor.Black */);
    },
    async cost(room, data, context) {
        await data.cancleCurrent();
        return true;
    },
}));
exports.weimu.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    trigger: "MoveCardBefore2" /* EventTriggers.MoveCardBefore2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.filter((d, c) => d.toArea === player.judgeArea &&
                c.vcard &&
                c.vcard.subtype === 22 /* CardSubType.DelayedScroll */ &&
                c.vcard.color === 2 /* CardColor.Black */).length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        data.update(data.getCards((d, c) => d.toArea === from.judgeArea &&
            c.vcard &&
            c.vcard.subtype === 22 /* CardSubType.DelayedScroll */ &&
            c.vcard.color === 2 /* CardColor.Black */), {
            toArea: room.discardArea,
        });
        return true;
    },
}));
exports.jiaxu.addSkill(exports.wansha);
exports.jiaxu.addSkill(exports.luanwu);
exports.jiaxu.addSkill(exports.weimu);
sgs.loadTranslation({
    [`@luanwu`]: '乱武：你需要对距离最近的一名角色使用【杀】',
});
