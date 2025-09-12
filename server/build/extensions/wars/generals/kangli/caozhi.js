"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.luoying = exports.linlang_delay = exports.linlang = exports.caozhi = void 0;
exports.caozhi = sgs.General({
    name: 'xl.caozhi',
    kingdom: 'wei',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.linlang = sgs.Skill({
    name: 'xl.caozhi.linlang',
});
exports.linlang.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    trigger: "JudgeResulted2" /* EventTriggers.JudgeResulted2 */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.card &&
            data.card.type === 2 /* CardType.Scroll */);
    },
    getSelectors(room, context) {
        return {
            skill_cost: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: true,
                        prompt: '你可以发动技能琳琅，请选择一项',
                        showMainButtons: false,
                        thinkPrompt: '琳琅',
                    },
                };
            },
        };
    },
    context(room, player, data) {
        const handles = ['linlang.gain', 'linlang.move'];
        const cards = [];
        room.playerAlives.forEach((v) => {
            cards.push(...v.getEquipCards());
            cards.push(...v.getJudgeCards());
        });
        if (cards.filter((v) => v.color === data.card.color).length === 0) {
            handles[1] = '!' + handles[1];
        }
        return {
            handles,
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const result = context.req_result.results.option.result;
        if (result.includes('linlang.gain')) {
            const effect = await room.addEffect('linlang.delay', from);
            effect.setData('card', data.card);
            return true;
        }
        if (result.includes('linlang.move')) {
            let cards = [];
            room.playerAlives.forEach((v) => {
                cards.push(...v.getEquipCards());
                cards.push(...v.getJudgeCards());
            });
            cards = cards.filter((v) => v.color === data.card.color);
            return await room.moveFiled(from, 'ej', {
                canCancle: true,
                showMainButtons: true,
                prompt: this.name,
            }, data, this.name, cards);
        }
    },
}));
exports.linlang_delay = sgs.TriggerEffect({
    name: 'linlang.delay',
    trigger: "MoveCardAfter2" /* EventTriggers.MoveCardAfter2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.get(this.getData('card'));
    },
    async cost(room, data, context) {
        const { from } = context;
        const card = this.getData('card');
        await this.removeSelf();
        return await room.obtainCards({
            player: from,
            cards: [card],
            source: data,
            reason: this.name,
        });
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                await this.removeSelf();
            },
        },
    ],
});
exports.luoying = sgs.Skill({
    name: 'xl.caozhi.luoying',
});
exports.luoying.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    forced: 'cost',
    trigger: "StateChanged" /* EventTriggers.StateChanged */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            data.is(sgs.DataType.SkipEvent) &&
            data.player === player &&
            data.to_state === false);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.judge({
            player: from,
            isSucc(result) {
                return result.suit === 3 /* CardSuit.Club */;
            },
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        const judge = context.cost;
        if (judge.success) {
            await room.chooseYesOrNo(from, {
                prompt: `落英：是否于当前回合结束后执行一个只有出牌阶段的额外回合`,
                thinkPrompt: this.name,
            }, async () => {
                await room.executeExtraTurn(room.createEventData(sgs.DataType.TurnEvent, {
                    player: from,
                    isExtra: true,
                    phases: [{ phase: 4 /* Phase.Play */, isExtra: false }],
                    skipPhases: [],
                    source: undefined,
                    reason: this.name,
                }));
            });
        }
    },
}));
exports.luoying.addEffect(sgs.TriggerEffect({
    trigger: "InflictDamaged" /* EventTriggers.InflictDamaged */,
    forced: 'cost',
    auto_log: 1,
    can_trigger(room, player, data) {
        return (this.isOwner(player) && player === data.to && player.losshp > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        return await room.drawCards({
            player: from,
            count: from.losshp,
            source: data,
            reason: this.name,
        });
    },
    async effect(room, data, context) {
        const { from } = context;
        await room.skip({
            player: from,
            source: data,
            reason: this.name,
        });
    },
}));
exports.caozhi.addSkill(exports.linlang);
exports.caozhi.addSkill(exports.luoying);
sgs.loadTranslation({
    ['linlang.gain']: '判定结束后获得判定牌',
    ['linlang.move']: '移动场上的牌',
});
