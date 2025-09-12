"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nijie = exports.zhaoxin = exports.daidi_delay = exports.daidi = exports.simazhao = void 0;
const skill_types_1 = require("../../../../core/skill/skill.types");
exports.simazhao = sgs.General({
    name: 'xl.simazhao',
    kingdom: 'jin',
    hp: 1.5,
    gender: 1 /* Gender.Male */,
    isWars: true,
});
exports.daidi = sgs.Skill({
    name: 'xl.simazhao.daidi',
});
exports.daidi.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    auto_directline: 1,
    forced: 'cost',
    trigger: "PlayPhaseStarted" /* EventTriggers.PlayPhaseStarted */,
    can_trigger(room, player, data) {
        return (this.isOwner(player) &&
            !data.isOwner(player) &&
            player.canPindian([data.executor], this.name));
    },
    context(room, player, data) {
        return {
            targets: [data.executor],
        };
    },
    getSelectors(room, context) {
        return {
            choose: () => {
                return {
                    selectors: {
                        option: room.createChooseOptions({
                            step: 1,
                            count: 1,
                            selectable: context.handles,
                        }),
                    },
                    options: {
                        canCancle: false,
                        prompt: '怠敌：请选择一项',
                        showMainButtons: false,
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from, targets: [target], } = context;
        return await room.pindian({
            from,
            targets: [target],
            source: data,
            reason: this.name,
            reqOptions: {
                prompt: `@daidi`,
                thinkPrompt: this.name,
            },
        });
    },
    async effect(room, data, context) {
        const { from, targets: [target], } = context;
        const pindian = context.cost;
        if (pindian.win === from) {
            this.setInvalids(this.name, true);
            const handles = ['daidi.damage'];
            const lose = room.createEventData(sgs.DataType.LoseHpEvent, {
                player: target,
                source: data,
                reason: this.name,
            });
            handles.push(lose.check() ? 'daidi.lose' : '!daidi.lose');
            context.handles = handles;
            const req = await room.doRequest({
                player: target,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'option').result;
            if (result.includes('daidi.damage')) {
                const effect = await room.addEffect('daidi.delay', target);
                effect.setData('data', room.currentTurn);
            }
            if (result.includes('daidi.lose')) {
                await room.losehp(lose);
            }
        }
    },
    lifecycle: [
        {
            trigger: "CircleStarted" /* EventTriggers.CircleStarted */,
            async on_exec(room, data) {
                this.setInvalids(this.name, false);
            },
        },
    ],
}));
exports.daidi_delay = sgs.TriggerEffect({
    name: 'daidi.delay',
    mark: ['mark.daidi'],
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.from === player;
    },
    async cost(room, data, context) {
        data.number--;
        return true;
    },
    lifecycle: [
        {
            trigger: "TurnEnded" /* EventTriggers.TurnEnded */,
            async on_exec(room, data) {
                if (this.getData('data') === data) {
                    await this.removeSelf();
                }
            },
        },
    ],
});
exports.zhaoxin = sgs.Skill({
    name: 'xl.simazhao.zhaoxin',
});
exports.zhaoxin.addEffect(sgs.TriggerEffect({
    tag: [5 /* SkillTag.Limit */],
    auto_log: 1,
    forced: 'cost',
    priorityType: 1 /* PriorityType.General */,
    trigger: "Dying" /* EventTriggers.Dying */,
    can_trigger(room, player, data) {
        return this.isOwner(player) && data.player === player;
    },
    async cost(room, data, context) {
        return true;
    },
    async effect(room, data, context) {
        const { from } = context;
        const count = 3 - from.getHandCards().length;
        await room.drawCards({
            player: from,
            count,
            source: data,
            reason: this.name,
        });
        await room.recoverTo({
            player: from,
            number: from.maxhp,
            source: data,
            reason: this.name,
        });
        await room.addSkill('xl.simazhao.nijie', from, {
            source: this.name,
            showui: 'default',
        });
    },
}));
exports.nijie = sgs.Skill({
    name: 'xl.simazhao.nijie',
});
exports.nijie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "CauseDamage2" /* EventTriggers.CauseDamage2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.from === player) {
            const damage = room.getHistorys(sgs.DataType.DamageEvent, (v) => v.from === player, room.currentTurn);
            return damage.length < 1;
        }
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
}));
exports.nijie.addEffect(sgs.TriggerEffect({
    auto_log: 1,
    priorityType: 1 /* PriorityType.General */,
    trigger: "InflictDamage2" /* EventTriggers.InflictDamage2 */,
    can_trigger(room, player, data) {
        if (this.isOwner(player) && data.to === player) {
            const damage = room.getHistorys(sgs.DataType.DamageEvent, (v) => v.to === player, room.currentTurn);
            return damage.length < 1;
        }
    },
    async cost(room, data, context) {
        data.number++;
        return true;
    },
}));
exports.nijie.addEffect(sgs.StateEffect({
    [skill_types_1.StateEffectType.Regard_CardData](card, property, source) {
        if (card.area === this.player.handArea && property === 'put') {
            return 1 /* CardPut.Up */;
        }
    },
}));
exports.simazhao.addSkill(exports.daidi);
exports.simazhao.addSkill(exports.zhaoxin);
exports.simazhao.addSkill(exports.nijie, true);
sgs.loadTranslation({
    ['@daidi']: '怠敌：请选择一张牌拼点',
    ['daidi.damage']: '本回合造成伤害-1',
    ['daidi.lose']: '失去1点体力',
    ['mark.daidi']: '怠敌',
});
