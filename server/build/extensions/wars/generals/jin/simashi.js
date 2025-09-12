"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruilue = exports.yimie = exports.simashi = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.simashi = sgs.General({
    name: 'wars.simashi',
    kingdom: 'jin',
    hp: 2,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.yimie = sgs.Skill({
    name: 'wars.simashi.yimie',
    global(room, to) {
        return this.player !== to;
    },
});
//夷灭：配音
exports.yimie.addEffect(sgs.TriggerEffect({
    priorityType: 0 /* PriorityType.None */,
    trigger: "EntryDying" /* EventTriggers.EntryDying */,
    can_trigger(room, player, data) {
        return this.isOpen() && this.player.inturn;
    },
}));
exports.yimie.addEffect(sgs.StateEffect({
    tag: [1 /* SkillTag.Lock */],
    [skill_types_1.StateEffectType.Prohibit_UseCard](from, card, target, reason) {
        return (this.player?.inturn &&
            card &&
            card.name === 'tao' &&
            card.custom.method === 2 &&
            this.room.sameAsKingdom(from, target));
    },
}));
exports.yimie.addEffect(sgs.TriggerEffect({
    tag: [1 /* SkillTag.Lock */],
    auto_log: 1,
    audio: [],
    trigger: "NeedUseCard3" /* EventTriggers.NeedUseCard3 */,
    can_trigger(room, player, data) {
        return (player === data.from &&
            this.player?.inturn &&
            data.from === player &&
            data.has('tao', 2));
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                const tao = room.createVirtualCardByNone('tao', undefined, false);
                tao.custom.method = 2;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                return item.suit === 2 /* CardSuit.Heart */;
                            },
                            onChange(type, item) {
                                if (type === 'add')
                                    tao.addSubCard(item);
                                if (type === 'remove')
                                    tao.delSubCard(item);
                                tao.set();
                                this._use_or_play_vcard = tao;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: '夷灭：你可以将一张红桃牌当【桃】使用',
                    },
                };
            },
        };
    },
}));
exports.ruilue = sgs.Skill({
    name: 'wars.simashi.ruilue',
    global(room, to) {
        return this.player !== to && to.isNoneKingdom();
    },
});
exports.ruilue.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "PlayPhaseProceeding" /* EventTriggers.PlayPhaseProceeding */,
    can_trigger(room, player, data) {
        return (!this.isOwner(player) &&
            data.isOwner(player) &&
            player.isNoneKingdom() &&
            this.player);
    },
    context(room, player, data) {
        return {
            targets: [this.player],
        };
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const effect = context.effect;
                const from = context.from;
                return {
                    selectors: {
                        card: room.createChooseCard({
                            step: 1,
                            count: 1,
                            selectable: from.getHandCards(),
                            filter(item, selected) {
                                return item.isDamageCard();
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `睿略：你可以将一张伤害牌交给${effect.player.gameName}，然后摸一张牌`,
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
        await room.drawCards({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.simashi.addSkill(exports.yimie);
exports.simashi.addSkill(exports.ruilue);
