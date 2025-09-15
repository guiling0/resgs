import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { PindianEvent } from '../../../../../core/event/types/event.pindian';
import { PhaseEvent } from '../../../../../core/event/types/event.turn';
import { Gender } from '../../../../../core/general/general.type';
import { Phase } from '../../../../../core/player/player.types';
import { PriorityType } from '../../../../../core/skill/skill.types';

export const xunyu = sgs.General({
    name: 'wars.xunyu',
    kingdom: 'wei',
    hp: 1.5,
    gender: Gender.Male,
    isWars: true,
});

export const jieming = sgs.Skill({
    name: 'wars.xunyu.jieming',
});

jieming.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.InflictDamaged,
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `节命，你可以选择一名角色，令他将手牌补至体力上限`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: DamageEvent) {
            return this.isOwner(player) && data.to === player;
        },
        async cost(room, data, context) {
            const {
                targets: [target],
            } = context;
            const count = target.maxhp - target.getHandCards().length;
            return await room.drawCards({
                player: target,
                count,
                source: data,
                reason: this.name,
            });
        },
    })
);

export const quhu = sgs.Skill({
    name: 'wars.xunyu.quhu',
});

quhu.addEffect(
    sgs.TriggerEffect({
        auto_directline: 1,
        auto_log: 1,
        priorityType: PriorityType.General,
        trigger: EventTriggers.PlayPhaseProceeding,
        getSelectors(room, context) {
            const skill = this;
            return {
                skill_cost: () => {
                    const from = context.from;
                    return {
                        selectors: {
                            target: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return (
                                        item.hp > from.hp &&
                                        from.canPindian([item], skill.name)
                                    );
                                },
                            }),
                        },
                        options: {
                            canCancle: true,
                            showMainButtons: true,
                            prompt: `驱虎：你可以选择一名体力值大于你的角色，与他发起拼点`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const target = context.targets.at(0);
                    return {
                        selectors: {
                            player: room.createChoosePlayer({
                                step: 1,
                                count: 1,
                                filter(item, selected) {
                                    return target.rangeOf(item);
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `驱虎，请选择一名角色，受到${target.gameName}的一点伤害`,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        can_trigger(room, player, data: PhaseEvent) {
            return (
                this.isOwner(player) &&
                data.isOwner(player, Phase.Play) &&
                player.canPindian([], this.name)
            );
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            return await room.pindian({
                from,
                targets: [target],
                source: data,
                reason: this.name,
                reqOptions: {
                    prompt: `quhu_pindian`,
                    thinkPrompt: this.name,
                },
            });
        },
        async effect(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const pindian = context.cost as PindianEvent;
            if (
                pindian.win === from &&
                room.getPlayerByFilter((v) => target.rangeOf(v)).length > 0
            ) {
                const req = await room.doRequest({
                    player: from,
                    get_selectors: {
                        selectorId: this.getSelectorName('choose'),
                        context,
                    },
                });
                const to = room.getResultPlayers(req).at(0);
                await room.damage({
                    from: target,
                    to,
                    source: data,
                    reason: this.name,
                });
            }
            if (pindian.lose.includes(from)) {
                await room.damage({
                    from: target,
                    to: from,
                    source: data,
                    reason: this.name,
                });
            }
        },
    })
);

xunyu.addSkill(jieming);
xunyu.addSkill(quhu);

sgs.loadTranslation({
    ['quhu_pindian']: '驱虎，请选择一张牌拼点',
});
