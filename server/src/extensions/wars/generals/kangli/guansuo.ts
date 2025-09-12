import { GameCard } from '../../../../core/card/card';
import { CardColor, CardSubType } from '../../../../core/card/card.types';
import { EventTriggers } from '../../../../core/event/triggers';
import { DamageEvent } from '../../../../core/event/types/event.damage';
import { PhaseEvent } from '../../../../core/event/types/event.turn';
import { Gender } from '../../../../core/general/general.type';
import { SkillTag } from '../../../../core/skill/skill.types';
import { reduce_yinyangyu } from '../../rules';

export const guansuo = sgs.General({
    name: 'xl.guansuo',
    kingdom: 'shu',
    hp: 2,
    gender: Gender.Male,
    isWars: true,
});

export const zhengfeng = sgs.Skill({
    name: 'xl.guansuo.zhengfeng',
});

zhengfeng.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.ReadyPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                room.sameAsKingdom(player, data.executor)
            );
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
    })
);

export const lvjin = sgs.Skill({
    name: 'xl.guansuo.lvjin',
});

lvjin.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Head],
        trigger: EventTriggers.CauseDamaged,
        can_trigger(room, player, data: DamageEvent) {
            if (
                this.isOwner(player) &&
                data.reason === 'sha' &&
                player === data.from &&
                data.channel &&
                data.channel.hasSubCards()
            ) {
                const uses = room.getHistorys(
                    sgs.DataType.UseSkillEvent,
                    (v) => v.use_skill === this,
                    room.currentTurn
                );
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
        async cost(room, data: DamageEvent, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.giveCards({
                from,
                to: target,
                cards: data.channel.subcards,
                source: data,
                reason: this.name,
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            if (target.gender === Gender.Female) {
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
    })
);

export const muyang = sgs.Skill({
    name: 'xl.guansuo.muyang',
});

muyang.addEffect(
    sgs.copy(reduce_yinyangyu, { tag: [SkillTag.Deputy, SkillTag.Secret] })
);

muyang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Deputy],
        auto_log: 1,
        forced: 'cost',
        trigger: EventTriggers.EndPhaseStarted,
        can_trigger(room, player, data: PhaseEvent) {
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
            const cards = (context.cost as GameCard[]).filter(
                (v) => v.name === 'sha' || v.color === CardColor.Red
            );
            await room.obtainCards({
                player: from,
                cards,
                source: data,
                reason: this.name,
            });
        },
    })
);

guansuo.addSkill(zhengfeng);
guansuo.addSkill(lvjin);
guansuo.addSkill(muyang);
