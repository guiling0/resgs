"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamerule_mvp = exports.gamerule_dropphase = exports.gamerule_drawphase = exports.gamerule_judgephase = exports.gamerule_init_handcard = exports.gamerule_obtain_skill = void 0;
/** 游戏开始时获得所有武将牌上的技能 */
exports.gamerule_obtain_skill = sgs.TriggerEffect({
    name: 'gamerule_obtain_skill',
    trigger: "ChooseGeneralAfter" /* EventTriggers.ChooseGeneralAfter */,
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger() {
        return true;
    },
    async cost(room, data) {
        for (const player of room.playerAlives) {
            if (player.head) {
                for (const skill_name of player.head.skills) {
                    await room.addSkill(skill_name, player, {
                        source: 'head_general',
                        showui: 'default',
                        log: false,
                    });
                }
            }
            if (player.deputy) {
                for (const skill_name of player.deputy.skills) {
                    await room.addSkill(skill_name, player, {
                        source: 'deputy_general',
                        showui: 'default',
                        log: false,
                    });
                }
            }
            if (room.options.settings.zuobi) {
                await room.addSkill('debug.zuobi', player, {
                    source: 'debug',
                    showui: 'other',
                    log: false,
                });
            }
        }
        return true;
    },
});
/** 游戏开始时分发起始手牌 */
exports.gamerule_init_handcard = sgs.TriggerEffect({
    name: 'gamerule_init_handcard',
    trigger: "InitHandCard" /* EventTriggers.InitHandCard */,
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger() {
        return true;
    },
    async cost(room, data) {
        room.drawArea.shuffle();
        for (const player of room.players) {
            await room.drawCards({
                player,
                count: 4,
                source: data,
                reason: this.name,
                triggerNot: true,
            });
        }
        return true;
    },
});
/** 判定阶段 */
exports.gamerule_judgephase = sgs.TriggerEffect({
    name: 'gamerule_judgephase',
    trigger: "JudgePhaseProceeding" /* EventTriggers.JudgePhaseProceeding */,
    priorityType: 4 /* PriorityType.Rule */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            player.judgeCards.length > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        const cards = from.judgeCards.slice();
        while (cards.length > 0) {
            await room.usecardsp({
                targets: from,
                card: cards.pop(),
                source: data,
                reason: this.name,
            });
        }
        return true;
    },
});
/** 摸牌阶段 */
exports.gamerule_drawphase = sgs.TriggerEffect({
    name: 'gamerule_drawphase',
    trigger: "DrawPhaseProceeding" /* EventTriggers.DrawPhaseProceeding */,
    priorityType: 4 /* PriorityType.Rule */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            data.ratedDrawnum > 0);
    },
    async cost(room, data, context) {
        const { from } = context;
        await room.drawCards({
            player: from,
            count: data.ratedDrawnum,
            source: data,
            reason: this.name,
        });
        return true;
    },
});
/** 弃牌阶段 */
exports.gamerule_dropphase = sgs.TriggerEffect({
    name: 'gamerule_dropphase',
    trigger: "DropPhaseProceeding" /* EventTriggers.DropPhaseProceeding */,
    priorityType: 4 /* PriorityType.Rule */,
    can_trigger(room, player, data) {
        return (data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            player.getHandCards().length > player.maxhand);
    },
    getSelectors(room, context) {
        const from = context.from;
        const count = context.count;
        return {
            choose: () => {
                return {
                    selectors: {
                        card: room.createDropCards(from, {
                            step: 1,
                            count: count,
                            selectable: from.getHandCards(),
                        }),
                    },
                    options: {
                        canCancle: false,
                        showMainButtons: true,
                        prompt: `弃牌阶段：你需要弃置${count}张牌`,
                        thinkPrompt: '弃牌阶段',
                    },
                };
            },
        };
    },
    async cost(room, data, context) {
        const { from } = context;
        const count = from.handArea.count - from.maxhand;
        context.count = count;
        const req = await room.doRequest({
            player: from,
            get_selectors: {
                selectorId: this.getSelectorName('choose'),
                context,
            },
        });
        const cards = req.result.results.card.result;
        await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        return true;
    },
});
exports.gamerule_mvp = sgs.TriggerEffect({
    name: 'gamerule_mvp',
    trigger: [
        "Death" /* EventTriggers.Death */, //记录击杀
        "InflictDamage3" /* EventTriggers.InflictDamage3 */, //记录伤害
        "RecoverHpStart" /* EventTriggers.RecoverHpStart */, //记录回复
    ],
    priorityType: 5 /* PriorityType.GlobalRule */,
    can_trigger(room, player, data) {
        return true;
    },
    async effect(room, data, context) {
        if (data.is(sgs.DataType.DieEvent) && data.killer) {
            data.killer.mvp_score.kill_count++;
        }
        if (data.is(sgs.DataType.DamageEvent) && data.from) {
            data.from.mvp_score.damage_count += data.number;
        }
        if (data.is(sgs.DataType.RecoverHpEvent)) {
            data.player.mvp_score.recover_count += data.number;
        }
    },
});
__exportStar(require("./selectors"), exports);
__exportStar(require("./generals"), exports);
__exportStar(require("./cards"), exports);
__exportStar(require("./zuobi"), exports);
