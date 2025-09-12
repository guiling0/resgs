import { CardSuit } from '../../../../../core/card/card.types';
import { EventTriggers } from '../../../../../core/event/triggers';
import { DamageEvent } from '../../../../../core/event/types/event.damage';
import { DieEvent } from '../../../../../core/event/types/event.die';
import { General } from '../../../../../core/general/general';
import { Gender } from '../../../../../core/general/general.type';
import { SkillTag } from '../../../../../core/skill/skill.types';

export const caiwenji = sgs.General({
    name: 'wars.caiwenji',
    kingdom: 'qun',
    hp: 1.5,
    gender: Gender.Female,
    isWars: true,
});

export const beige = sgs.Skill({
    name: 'wars.caiwenji.beige',
});

beige.addEffect(
    sgs.TriggerEffect({
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.InflictDamaged,
        can_trigger(room, player, data: DamageEvent) {
            return (
                this.isOwner(player) &&
                data.channel &&
                data.channel.name === 'sha' &&
                data.to &&
                data.to.alive &&
                player.hasCanDropCards('he', player, 1, this.name)
            );
        },
        context(room, player, data: DamageEvent) {
            return {
                targets: [data.to],
            };
        },
        getSelectors(room, context) {
            return {
                skill_cost: () => {
                    const from = context.from;
                    const to = context.targets[0];
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
                            prompt: `悲歌：你可以弃置一张牌，令${to.gameName}进行判定`,
                            thinkPrompt: this.name,
                        },
                    };
                },
                choose: () => {
                    const beige_target = room.getPlayer(context.beige_target);
                    return {
                        selectors: {
                            card: room.createDropCards(beige_target, {
                                step: 1,
                                count: 2,
                                selectable: beige_target.getSelfCards(),
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: true,
                            prompt: `悲歌：请弃置两张牌`,
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
        async effect(room, data: DamageEvent, context) {
            const {
                targets: [target],
            } = context;
            const judge = await room.judge({
                player: target,
                isSucc(result) {
                    return true;
                },
                source: data,
                reason: this.name,
            });
            if (judge && judge.success) {
                if (judge.result.suit === CardSuit.Spade) {
                    await room.skip({
                        player: data.from,
                        source: data,
                        reason: this.name,
                    });
                }
                if (judge.result.suit === CardSuit.Heart) {
                    await room.recoverhp({
                        player: target,
                        source: data,
                        reason: this.name,
                    });
                }
                if (judge.result.suit === CardSuit.Club) {
                    context.beige_target = data.from.playerId;
                    const req = await room.doRequest({
                        player: data.from,
                        get_selectors: {
                            selectorId: this.getSelectorName('choose'),
                            context,
                        },
                    });
                    const cards = room.getResultCards(req);
                    await room.dropCards({
                        player: data.from,
                        cards,
                        source: data,
                        reason: this.name,
                    });
                }
                if (judge.result.suit === CardSuit.Diamond) {
                    await room.drawCards({
                        player: target,
                        count: 2,
                        source: data,
                        reason: this.name,
                    });
                }
            }
        },
    })
);

export const duanchang = sgs.Skill({
    name: 'wars.caiwenji.duanchang',
});

duanchang.addEffect(
    sgs.TriggerEffect({
        tag: [SkillTag.Lock],
        auto_log: 1,
        auto_directline: 1,
        trigger: EventTriggers.Death,
        can_trigger(room, player, data: DieEvent) {
            return (
                this.isOwner(player) &&
                data.player === player &&
                data.killer &&
                data.killer !== player
            );
        },
        context(room, player, data: DieEvent) {
            return {
                targets: [data.killer],
            };
        },
        getSelectors(room, context) {
            return {
                choose: () => {
                    const target = context.targets[0];
                    const generals = target.getGenerls();
                    return {
                        selectors: {
                            general: room.createChooseGeneral({
                                step: 1,
                                count: 1,
                                selectable: generals,
                                selecte_type: 'win',
                                windowOptions: {
                                    title: '断肠',
                                    timebar: room.responseTime,
                                    prompt: '断肠：请选择一张武将牌，失去该武将牌上的所有技能',
                                },
                            }),
                        },
                        options: {
                            canCancle: false,
                            showMainButtons: false,
                            thinkPrompt: this.name,
                        },
                    };
                },
            };
        },
        async cost(room, data, context) {
            const {
                from,
                targets: [target],
            } = context;
            const req = await room.doRequest({
                player: from,
                get_selectors: {
                    selectorId: this.getSelectorName('choose'),
                    context,
                },
            });
            const result = room.getResult(req, 'general').result as General[];
            if (result && result[0]) {
                const general = result[0];
                const length = general.skills.length;
                for (let i = 0; i < length; i++) {
                    const skill = room.skills.find(
                        (s) =>
                            s.name === general.skills[i] &&
                            s.player === target &&
                            s.sourceGeneral === general
                    );
                    if (skill) {
                        await skill.removeSelf();
                    }
                }
                target.setMark(this.name, general.trueName, {
                    visible: true,
                });
            }
            return true;
        },
    })
);

caiwenji.addSkill(beige);
caiwenji.addSkill(duanchang);
