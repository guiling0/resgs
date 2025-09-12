"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.muyang = exports.lvjin = exports.zhengfeng = exports.guansuo = void 0;
const rules_1 = require("../../rules");
exports.guansuo = sgs.General({
    name: 'xl.guansuo',
    kingdom: 'shu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.zhengfeng = sgs.Skill({
    name: 'xl.guansuo.zhengfeng',
});
exports.zhengfeng.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "ReadyPhaseStarted" /* EventTriggers.ReadyPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            room.sameAsKingdom(player, data.executor));
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.needUseCard({
            from,
            cards: [{ name: 'sha' }],
            source: data,
            reason: this.name,
        });
    },
}));
exports.lvjin = sgs.Skill({
    name: 'xl.guansuo.lvjin',
});
exports.lvjin.addEffect(sgs.TriggerEffect({
    tag: [2 /* SkillTag.Head */],
    trigger: "CauseDamaged" /* EventTriggers.CauseDamaged */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) &&
            data.reason === 'sha' &&
            player === data.from &&
            data.channel &&
            data.channel.hasSubCards()) {
            const uses = room.getHistorys(sgs.DataType.UseSkillEvent, (v) => v.use_skill === this, room.currentTurn);
            return uses.length < 1;
        }
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        player: room.createChoosePlayer({
                            step: 1,
                            count: 1,
                            filter(item, selected) {
                                return item !== from;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `旅进：你可以将你使用的【杀】交给一名其他角色`,
                        thinkPrompt: '旅进',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.giveCards({
            from,
            to: target,
            cards: data.channel.subcards,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        if (target.gender === 2 /* Gender.Female */) {
            room.broadcast({
                type: 'MsgPlayFaceAni',
                ani: 'yinyangyu',
                player: target.playerId,
            });
            await room.delay(2);
            await room.addSkill('wars.mark.yinyangyu', target, {
                source: this.name,
                showui: 'mark',
            });
        }
    },
}));
exports.muyang = sgs.Skill({
    name: 'xl.guansuo.muyang',
});
exports.muyang.addEffect(sgs.copy(rules_1.reduce_yinyangyu, { tag: [3 /* SkillTag.Deputy */, 9 /* SkillTag.Secret */] }));
exports.muyang.addEffect(sgs.TriggerEffect({
    tag: [3 /* SkillTag.Deputy */],
    auto_log: 1,
    forced: 'cost',
    trigger: "EndPhaseStarted" /* EventTriggers.EndPhaseStarted */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.isOwner(player);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = await room.getNCards(2);
        await room.flashCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        context.cards = cards;
        return cards;
    },
    async effect(room, data, context) {
        const { from } = context;
        const cards = context.cost.filter((v) => v.name === 'sha' || v.color === 1 /* CardColor.Red */);
        await room.obtainCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
    },
}));
exports.guansuo.addSkill(exports.zhengfeng);
exports.guansuo.addSkill(exports.lvjin);
exports.guansuo.addSkill(exports.muyang);
