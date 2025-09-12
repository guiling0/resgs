"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kurou_delay = exports.kurou = exports.huanggai = void 0;
const skill_types_1 = require("../../../../../core/skill/skill.types");
exports.huanggai = sgs.General({
    name: 'wars.huanggai',
    kingdom: 'wu',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.kurou = sgs.Skill({
    name: 'wars.huanggai.kurou',
});
exports.kurou.addEffect(sgs.TriggerEffect({
    auto_log: 1,
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
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `苦肉，你可以弃置一张牌，然后失去1点体力。摸三张牌，本回合可以多使用一张【杀】`,
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
        const { from } = context;
        await room.losehp({
            player: from,
            source: data,
            reason: this.name,
        });
        await room.drawCards({
            player: from,
            count: 3,
            source: data,
            reason: this.name,
        });
        const effect = await room.addEffect('kurou.delay', from);
        effect.setData('turn', room.currentTurn);
    },
}));
exports.kurou_delay = sgs.StateEffect({
    name: 'kurou.delay',
    [skill_types_1.StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') {
            return 1;
        }
    },
    lifecycle: [
        {
            trigger: "onObtain" /* EventTriggers.onObtain */,
            async on_exec(room, data) {
                this.player?.setMark(this.name, true, {
                    visible: true,
                });
            },
        },
        {
            trigger: "onLose" /* EventTriggers.onLose */,
            async on_exec(room, data) {
                this.player?.removeMark(this.name);
            },
        },
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('turn') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.huanggai.addSkill(exports.kurou);
sgs.loadTranslation({
    [exports.kurou_delay.name]: '苦肉',
});
