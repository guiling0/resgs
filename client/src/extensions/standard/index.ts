import { GameCard } from '../../core/card/card';
import { EventTriggers } from '../../core/event/triggers';
import { PhaseEvent } from '../../core/event/types/event.turn';
import { GamePlayer } from '../../core/player/player';
import { PriorityType } from '../../core/skill/skill.types';

/** 游戏开始时获得所有武将牌上的技能 */
export const gamerule_obtain_skill = sgs.TriggerEffect({
    name: 'gamerule_obtain_skill',
    trigger: EventTriggers.ChooseGeneralAfter,
    priorityType: PriorityType.GlobalRule,
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
export const gamerule_init_handcard = sgs.TriggerEffect({
    name: 'gamerule_init_handcard',
    trigger: EventTriggers.InitHandCard,
    priorityType: PriorityType.GlobalRule,
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
export const gamerule_judgephase = sgs.TriggerEffect({
    name: 'gamerule_judgephase',
    trigger: EventTriggers.JudgePhaseProceeding,
    priorityType: PriorityType.Rule,
    can_trigger(room, player, data: PhaseEvent) {
        return (
            data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            player.judgeCards.length > 0
        );
    },
    async cost(room, data: PhaseEvent, context) {
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
export const gamerule_drawphase = sgs.TriggerEffect({
    name: 'gamerule_drawphase',
    trigger: EventTriggers.DrawPhaseProceeding,
    priorityType: PriorityType.Rule,
    can_trigger(room, player, data: PhaseEvent) {
        return (
            data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            data.ratedDrawnum > 0
        );
    },
    async cost(room, data: PhaseEvent, context) {
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
export const gamerule_dropphase = sgs.TriggerEffect({
    name: 'gamerule_dropphase',
    trigger: EventTriggers.DropPhaseProceeding,
    priorityType: PriorityType.Rule,
    can_trigger(room, player, data: PhaseEvent) {
        return (
            data.is(sgs.DataType.PhaseEvent) &&
            data.executor === player &&
            player.getHandCards().length > player.maxhand
        );
    },
    getSelectors(room, context) {
        const from = context.from;
        const count = context.count as number;
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
    async cost(room, data: PhaseEvent, context) {
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
        const cards = req.result.results.card.result as GameCard[];
        await room.dropCards({
            player: from,
            cards,
            source: data,
            reason: this.name,
        });
        return true;
    },
});

export const gamerule_mvp = sgs.TriggerEffect({
    name: 'gamerule_mvp',
    trigger: [
        EventTriggers.Death, //记录击杀
        EventTriggers.InflictDamage3, //记录伤害
        EventTriggers.RecoverHpStart, //记录回复
    ],
    priorityType: PriorityType.GlobalRule,
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

export * from './selectors';
export * from './generals';
export * from './cards';

export * from './zuobi';
