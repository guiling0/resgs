"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhuwei_delay = exports.zhuwei = exports.keshou = exports.lukang = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.lukang = sgs.General({
    name: 'wars.lukang',
    kingdom: 'wu',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.keshou = sgs.Skill({
    name: 'wars.lukang.keshou',
});
exports.keshou.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            player === data.to &&
            player.hasCanDropCards('he', player, 2, this.name));
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                const from = context.from;
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: 2,
                            selectable: from.getSelfCards(),
                            filter(item, selected) {
                                if (selected.length === 0)
                                    return true;
                                return selected[0].color === item.color;
                            },
                        }),
                    },
                    options: {
                        canCancle: true,
                        showMainButtons: true,
                        prompt: `恪守：你可以弃置两张颜色相同的牌，令伤害值-1`,
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
        const { from, targets: [target], cards, } = context;
        data.number -= 1;
        const has = room.playerAlives.find((v) => v !== from && room.sameAsKingdom(v, from));
        if (!has) {
            const judge = await room.judge({
                player: from,
                isSucc(result) {
                    return result.color === 1 /* CardColor.Red */;
                },
                source: data,
                reason: this.name,
            });
            if (judge.success) {
                await room.drawCards({
                    player: from,
                    source: data,
                    reason: this.name,
                });
            }
        }
    },
}));
exports.zhuwei = sgs.Skill({
    name: 'wars.lukang.zhuwei',
});
exports.zhuwei.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "JudgeResulted2" /* EventTriggers.JudgeResulted2 */,
    forced: 'cost',
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.obtainCards({
            player: from,
            cards: [data.card],
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.chooseYesOrNo(from, {
            prompt: '@zhuwei',
            thinkPrompt: this.name,
        }, async () => {
            const current = room.currentTurn?.player;
            if (current) {
                const mark = current.getMark('mark.zhuwei') ?? 0;
                current.setMark('mark.zhuwei', mark + 1, {
                    visible: true,
                });
                let effect = room.effects.find((v) => v.data.name === 'zhuwei.delay' &&
                    v.player === current);
                if (!effect) {
                    effect = await room.addEffect('zhuwei.delay', current);
                }
                effect.setData('data', room.currentTurn);
            }
        });
    },
}));
exports.zhuwei_delay = sgs.StateEffect({
    name: 'zhuwei.delay',
    [skill_types_1.StateEffectType.MaxHand_Correct](from) {
        if (this.isOwner(from)) {
            return from.getMark('mark.zhuwei') ?? 0;
        }
    },
    [skill_types_1.StateEffectType.TargetMod_CorrectTime](from, card, target) {
        if (this.isOwner(from) && card.name === 'sha') {
            return from.getMark('mark.zhuwei') ?? 0;
        }
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    this.player.removeMark('mark.zhuwei');
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.lukang.addSkill(exports.keshou);
exports.lukang.addSkill(exports.zhuwei);
sgs.loadTranslation({
    ['@zhuwei']: '筑围：是否令当前回合角色使用【杀】的次数和手牌上限+1',
    ['mark.zhuwei']: '筑围',
});
